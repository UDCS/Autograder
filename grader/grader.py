#!/usr/bin/env python3
"""
Autograder worker (single-shot).
- Reads SUBMISSION_ID and DB_DSN from environment.
- Loads submission + testcases, marks status=running.
- Runs student code in a sandbox (nsjail) per testcase.
- Computes score, writes status/feedback/results back to Postgres.

Tables expected (names/columns can be adjusted in the SQL below):
  assignments(id, time_limit_ms, memory_limit_mb, ...)
  submissions(id, assignment_id, language, source_code, status, score, feedback, results, updated_at, ...)
  assignment_testcases(assignment_id, ordinal, input_text, expected_output, ...)

Environment:
  SUBMISSION_ID (required)
  DB_DSN        (required) e.g. postgres://user:pass@host:5432/autograder?sslmode=disable
  NSJAIL        (optional) default "1". Set "0" to disable nsjail for local dev.
  PY_TIMEOUT_MS (optional) per-test override if you don’t store per-assignment limits
  PY_MEMORY_MB  (optional) per-test override if you don’t store per-assignment limits
  MAX_OUTPUT_BYTES (optional) default 1_000_000. Output is truncated past this.
"""

import os
import sys
import json
import time
import shlex
import shutil
import tempfile
import subprocess
from typing import Dict, Any, List
import traceback

# ---- Optional: psycopg 3
try:
    import psycopg
    from psycopg.types.json import Json
except Exception as e:
    traceback.print_exc()
    print("FATAL: psycopg package not installed. Add 'psycopg[binary]' to requirements.txt.", file=sys.stderr)
    raise

# ----------------------------
# Config / environment
# ----------------------------
# RUN_MODE selects what we grade:
#   "submission" (default) -> a student's submission, keyed by SUBMISSION_ID
#   "solution"             -> an instructor's solution code, keyed by RUN_ID/QUESTION_ID
RUN_MODE = os.environ.get("RUN_MODE", "submission").strip().lower()
SUBMISSION_ID = os.environ.get("SUBMISSION_ID", "").strip()
RUN_ID = os.environ.get("RUN_ID", "").strip()
QUESTION_ID = os.environ.get("QUESTION_ID", "").strip()
TESTCASE_ID = os.environ.get("TESTCASE_ID", "").strip()  # optional: run a single testcase
DB_DSN = os.environ.get("DB_DSN", "").strip()
USE_NSJAIL = False#os.environ.get("NSJAIL", "0").strip() != "0"

DEFAULT_TIME_LIMIT_MS = int(os.environ.get("PY_TIMEOUT_MS", "2000"))
DEFAULT_MEMORY_MB = int(os.environ.get("PY_MEMORY_MB", "256"))
MAX_OUTPUT_BYTES = int(os.environ.get("MAX_OUTPUT_BYTES", str(1_000_000)))  # 1 MB

if not DB_DSN:
    print("FATAL: DB_DSN is required in the environment.", file=sys.stderr)
    sys.exit(2)
if RUN_MODE == "solution":
    if not RUN_ID or not QUESTION_ID:
        print("FATAL: RUN_ID and QUESTION_ID are required in solution mode.", file=sys.stderr)
        sys.exit(2)
elif not SUBMISSION_ID:
    print("FATAL: SUBMISSION_ID is required in the environment.", file=sys.stderr)
    sys.exit(2)

# ----------------------------
# DB helpers
# ----------------------------

def db_connect():
    return psycopg.connect(DB_DSN)

def fetch_submission_and_limits(conn) -> Dict[str, Any]:
    """
    Returns:
      {
        'assignment_id': str,
        'language': 'python' | ...,
        'code': str,
        'tlim': int(ms),
        'mlim': int(MB),
      }
    """
    with conn.cursor() as cur:
        # cur.execute("""
        #     SELECT s.assignment_id, s.language, s.source_code,
        #            COALESCE(a.time_limit_ms, %s) as tlim,
        #            COALESCE(a.memory_limit_mb, %s) as mlim
        #       FROM submissions s
        #       JOIN assignments a ON a.id = s.assignment_id
        #      WHERE s.id = %s
        # """, (DEFAULT_TIME_LIMIT_MS, DEFAULT_MEMORY_MB, SUBMISSION_ID))
        cur.execute("""
            SELECT s.id, q.prog_lang, s.code, q.id
            FROM student_submissions s
            JOIN questions q ON q.id = s.question_id
            WHERE s.id = %s
        """, (SUBMISSION_ID,))
        row = cur.fetchone()
        if not row:
            raise RuntimeError("Submission not found: " + SUBMISSION_ID)
        return {
            "id": row[0],
            "language": row[1],
            "code": row[2],
            "question_id": row[3]
        }

def fetch_text_testcases(conn, question_id: str, testcase_id: str = None) -> List[Dict[str, Any]]:
    with conn.cursor() as cur:
        if testcase_id:
            cur.execute("""
                SELECT t.id, t.name, tt.inputs, tt.outputs, t.question_id, t.points, t.timeout_seconds
                FROM testcases t
                JOIN text_testcases tt ON tt.testcase_id = t.id
                WHERE t.question_id = %s AND t.type='text' AND t.id = %s
            """, (question_id, testcase_id))
        else:
            cur.execute("""
                SELECT t.id, t.name, tt.inputs, tt.outputs, t.question_id, t.points, t.timeout_seconds
                FROM testcases t
                JOIN text_testcases tt ON tt.testcase_id = t.id
                WHERE t.question_id = %s AND t.type='text'
            """, (question_id,))
        out = []
        for (id, name, inputs, outputs, question_id, points, timeout_seconds) in cur.fetchall():
            out.append({
                "id": id,
                "name": name if name is not None else "",
                "inputs": inputs if inputs is not None else "",
                "outputs": outputs if outputs is not None else "",
                "question_id": question_id,
                "points": int(points),
                "timeout_ms": int(timeout_seconds) * 1000 if timeout_seconds is not None else DEFAULT_TIME_LIMIT_MS * 1000,
                "memory_limit_mb": DEFAULT_MEMORY_MB
            })
        return out
    
def get_user_id(conn):
    user_id = ""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT user_id FROM student_submissions WHERE id=%s
        """, (SUBMISSION_ID,))
        user_id = cur.fetchone()[0]
    return user_id


def set_status(conn, status: str):
    with conn.cursor() as cur:
        cur.execute("UPDATE student_submissions SET status=%s, updated_at=now() WHERE id=%s", (status, SUBMISSION_ID))
    conn.commit()

def update_testcase_grade(conn, tc_id, user_id, grade):
    with conn.cursor() as cur:
        cur.execute(f"""
            INSERT INTO testcase_grades (testcase_id, student_id, score, updated_at) VALUES ('{tc_id}', '{user_id}', {grade}, now()) ON CONFLICT (student_id, testcase_id) DO UPDATE SET score={grade};
        """)
    conn.commit()

def finalize(conn, status: str, feedback: str):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE student_submissions
               SET status=%s, feedback=%s, updated_at=now()
             WHERE id=%s
        """, (status, feedback, SUBMISSION_ID))
    conn.commit()

# ---- Solution test run helpers (RUN_MODE == "solution") ----

def fetch_solution(conn, question_id: str) -> Dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute("SELECT prog_lang, solution_code FROM questions WHERE id=%s", (question_id,))
        row = cur.fetchone()
        if not row:
            raise RuntimeError("Question not found: " + str(question_id))
        return {"language": row[0], "code": row[1] if row[1] is not None else ""}

def set_solution_run_status(conn, status: str):
    with conn.cursor() as cur:
        cur.execute("UPDATE solution_test_runs SET status=%s, updated_at=now() WHERE id=%s", (status, RUN_ID))
    conn.commit()

def finalize_solution_run(conn, status: str, results: List[Dict[str, Any]]):
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE solution_test_runs SET status=%s, results=%s, updated_at=now() WHERE id=%s",
            (status, Json(results), RUN_ID),
        )
    conn.commit()

# ----------------------------
# Execution utilities
# ----------------------------

def _normalize(s: str) -> str:
    """
    Normalize output for comparison:
      - convert CRLF to LF
      - strip trailing whitespace on each line
      - preserve internal newlines
    """
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    lines = s.split("\n")
    lines = [ln.rstrip() for ln in lines]
    return "\n".join(lines).strip() + ("\n" if s.endswith("\n") else "").strip()

def _truncate_bytes(s: bytes, max_bytes: int) -> bytes:
    if len(s) <= max_bytes:
        return s
    return s[:max_bytes]

def _run_cmd(cmd, input_bytes, timeout_sec, cwd=None):
    start = time.time()
    try:
        p = subprocess.run(
            cmd,
            input=input_bytes,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=max(1, timeout_sec),
            cwd=cwd,                     # <— ensure we run in work_dir
        )
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "returncode": p.returncode,
            "stdout": _truncate_bytes(p.stdout, MAX_OUTPUT_BYTES),
            "stderr": _truncate_bytes(p.stderr, MAX_OUTPUT_BYTES),
            "timeout": False,
            "elapsed_ms": elapsed_ms,
        }
    except subprocess.TimeoutExpired as te:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "returncode": 124,
            "stdout": _truncate_bytes(te.stdout or b"", MAX_OUTPUT_BYTES),
            "stderr": _truncate_bytes(te.stderr or b"TIMEOUT", MAX_OUTPUT_BYTES),
            "timeout": True,
            "elapsed_ms": elapsed_ms,
        }
def _nsjail_cmd(argv: list[str], time_limit_sec: int, mem_bytes: int) -> list[str]:
    """
    Wrap a command in nsjail if enabled; otherwise just return argv.
    """
    if not USE_NSJAIL:
        return argv
    return [
        "nsjail",
        "--quiet",
        "--iface_no_lo",
        "--time_limit", str(max(1, time_limit_sec)),
        "--rlimit_as", str(max(32 * 1024 * 1024, mem_bytes)),
        "--bindmount_ro", "/bin",
        "--",
        *argv
    ]


# ----------------------------
# Python
# ----------------------------
def run_student_python(code, input_str, time_limit_ms, memory_limit_mb, work_dir):
    student_path = os.path.join(work_dir, "student.py")
    with open(student_path, "w") as f:
        f.write(code)

    sec = max(1, (time_limit_ms + 999) // 1000)
    mem_bytes = memory_limit_mb * 1024 * 1024

    cmd = _nsjail_cmd(["python3", "student.py"], sec, mem_bytes)
    result = _run_cmd(cmd, input_str.encode("utf-8"), sec, cwd=work_dir) 
    return {
        "ok": (result["returncode"] == 0) and (not result["timeout"]),
        "stdout": result["stdout"].decode("utf-8", "replace"),
        "stderr": result["stderr"].decode("utf-8", "replace"),
        "time_ms": result["elapsed_ms"],
        "code": result["returncode"],
        "timeout": result["timeout"],
    }


# ----------------------------
# Java (expects a public class Main with main(String[]))
# ----------------------------
def run_student_java(code: str, input_str: str, time_limit_ms: int, memory_limit_mb: int, work_dir: str) -> dict:
    # We expect assignments to require class Main
    main_java = os.path.join(work_dir, "Main.java")
    with open(main_java, "w") as f:
        f.write(code)

    sec = max(1, (time_limit_ms + 999) // 1000)
    mem_bytes = memory_limit_mb * 1024 * 1024
    # Give the JVM an explicit heap cap below our rlimit_as to avoid OOM kills by the kernel first
    xmx = max(32, memory_limit_mb - 32)  # leave headroom for JVM itself

    # 1) Compile
    # We also set a compile timeout at 2x run limit (bounded)
    compile_sec = min(30, max(2, 2 * sec))
    javac_cmd = _nsjail_cmd(["javac", "Main.java"], compile_sec, mem_bytes)
    comp = _run_cmd(javac_cmd, b"", compile_sec, cwd=work_dir)  
    if comp["returncode"] != 0 or comp["timeout"]:
        return {
            "ok": False,
            "stdout": "",
            "stderr": ("Compile timeout" if comp["timeout"] else comp["stderr"].decode("utf-8","replace")),
            "time_ms": comp["elapsed_ms"],
            "code": comp["returncode"],
            "timeout": comp["timeout"],
        }

    # 2) Run
    run_cmd = _nsjail_cmd(["java", f"-Xmx{xmx}m", "Main"], sec, mem_bytes)
    res = _run_cmd(run_cmd, input_str.encode("utf-8"), sec, cwd=work_dir) 
    return {
        "ok": (res["returncode"] == 0) and (not res["timeout"]),
        "stdout": res["stdout"].decode("utf-8", "replace"),
        "stderr": res["stderr"].decode("utf-8", "replace"),
        "time_ms": res["elapsed_ms"],
        "code": res["returncode"],
        "timeout": res["timeout"],
    }


# ----------------------------
# Rust (expects complete program; we build with rustc)
# ----------------------------
def run_student_rust(code: str, input_str: str, time_limit_ms: int, memory_limit_mb: int, work_dir: str) -> dict:
    main_rs = os.path.join(work_dir, "main.rs")
    with open(main_rs, "w") as f:
        f.write(code)

    sec = max(1, (time_limit_ms + 999) // 1000)
    mem_bytes = memory_limit_mb * 1024 * 1024

    # 1) Compile
    compile_sec = min(60, max(3, 3 * sec))  # give rustc a bit more time
    rustc_cmd = _nsjail_cmd(
        ["rustc", "-O", "-C", "opt-level=2", "-C", "debuginfo=0", "-o", "main", "main.rs"],
        compile_sec, mem_bytes
    )
    comp = _run_cmd(rustc_cmd, b"", compile_sec, cwd=work_dir) 
    if comp["returncode"] != 0 or comp["timeout"]:
        return {
            "ok": False,
            "stdout": "",
            "stderr": ("Compile timeout" if comp["timeout"] else comp["stderr"].decode("utf-8","replace")),
            "time_ms": comp["elapsed_ms"],
            "code": comp["returncode"],
            "timeout": comp["timeout"],
        }

    # 2) Run
    run_cmd = _nsjail_cmd(["./main"], sec, mem_bytes)
    res = _run_cmd(run_cmd, input_str.encode("utf-8"), sec, cwd=work_dir)
    return {
        "ok": (res["returncode"] == 0) and (not res["timeout"]),
        "stdout": res["stdout"].decode("utf-8", "replace"),
        "stderr": res["stderr"].decode("utf-8", "replace"),
        "time_ms": res["elapsed_ms"],
        "code": res["returncode"],
        "timeout": res["timeout"],
    }


# ----------------------------
# C (expects a complete program with main(); built with gcc)
# ----------------------------
def run_student_c(code: str, input_str: str, time_limit_ms: int, memory_limit_mb: int, work_dir: str) -> dict:
    main_c = os.path.join(work_dir, "main.c")
    with open(main_c, "w") as f:
        f.write(code)

    sec = max(1, (time_limit_ms + 999) // 1000)
    mem_bytes = memory_limit_mb * 1024 * 1024

    # 1) Compile (`-lm` links the math library, which student code often needs)
    compile_sec = min(60, max(3, 3 * sec))
    gcc_cmd = _nsjail_cmd(
        ["gcc", "-O2", "-o", "main", "main.c", "-lm"],
        compile_sec, mem_bytes
    )
    comp = _run_cmd(gcc_cmd, b"", compile_sec, cwd=work_dir)
    if comp["returncode"] != 0 or comp["timeout"]:
        return {
            "ok": False,
            "stdout": "",
            "stderr": ("Compile timeout" if comp["timeout"] else comp["stderr"].decode("utf-8", "replace")),
            "time_ms": comp["elapsed_ms"],
            "code": comp["returncode"],
            "timeout": comp["timeout"],
        }

    # 2) Run
    run_cmd = _nsjail_cmd(["./main"], sec, mem_bytes)
    res = _run_cmd(run_cmd, input_str.encode("utf-8"), sec, cwd=work_dir)
    return {
        "ok": (res["returncode"] == 0) and (not res["timeout"]),
        "stdout": res["stdout"].decode("utf-8", "replace"),
        "stderr": res["stderr"].decode("utf-8", "replace"),
        "time_ms": res["elapsed_ms"],
        "code": res["returncode"],
        "timeout": res["timeout"],
    }


# ----------------------------
# Racket (expects #lang racket script reading stdin)
# ----------------------------
def run_student_racket(code: str, input_str: str, time_limit_ms: int, memory_limit_mb: int, work_dir: str) -> dict:
    # Racket runs files as modules and requires a `#lang` line as the first
    # non-whitespace content. If the student omitted it, default to `#lang racket`.
    if not code.lstrip().startswith("#lang"):
        code = "#lang racket\n" + code

    student_rkt = os.path.join(work_dir, "student.rkt")
    with open(student_rkt, "w") as f:
        f.write(code)

    sec = max(1, (time_limit_ms + 999) // 1000)
    mem_bytes = memory_limit_mb * 1024 * 1024

    # Racket is interpreted here (you can also `raco make` if desired)
    cmd = _nsjail_cmd(["racket", "student.rkt"], sec, mem_bytes)
    res = _run_cmd(cmd, input_str.encode("utf-8"), sec, cwd=work_dir) 
    return {
        "ok": (res["returncode"] == 0) and (not res["timeout"]),
        "stdout": res["stdout"].decode("utf-8", "replace"),
        "stderr": res["stderr"].decode("utf-8", "replace"),
        "time_ms": res["elapsed_ms"],
        "code": res["returncode"],
        "timeout": res["timeout"],
    }


# ----------------------------
# Dispatcher
# ----------------------------
def run_solution(language: str, code: str, input_str: str, tlim_ms: int, mlim_mb: int, work_dir: str) -> dict:
    lang = (language or "").strip().lower()
    if lang == "python":
        return run_student_python(code, input_str, tlim_ms, mlim_mb, work_dir)
    if lang == "java":
        return run_student_java(code, input_str, tlim_ms, mlim_mb, work_dir)
    if lang == "rust":
        return run_student_rust(code, input_str, tlim_ms, mlim_mb, work_dir)
    if lang == "c":
        return run_student_c(code, input_str, tlim_ms, mlim_mb, work_dir)
    if lang in ("racket", "scheme"):
        return run_student_racket(code, input_str, tlim_ms, mlim_mb, work_dir)
    return {
        "ok": False, "stdout": "", "stderr": f"Unsupported language: {language}",
        "time_ms": 0, "code": 2, "timeout": False
    }

# ----------------------------
# Per-testcase runner (shared by submission and solution modes)
# ----------------------------
def run_single_testcase(language: str, code: str, tc: Dict[str, Any], work_dir: str):
    """Run one testcase and judge it. Returns (run_result, ok, message)."""
    r = run_solution(
        language=language,
        code=code,
        input_str=tc["inputs"],
        tlim_ms=tc["timeout_ms"],
        mlim_mb=tc["memory_limit_mb"],
        work_dir=work_dir,
    )

    norm_got = _normalize(r["stdout"])
    norm_exp = _normalize(tc["outputs"])
    ok = (r["ok"] and norm_got == norm_exp)

    msg = None
    if not ok:
        if r["timeout"]:
            msg = "Timeout"
        elif r["ok"]:
            msg = "Wrong answer"
        else:
            # include only the first 500 chars of stderr
            msg = (r["stderr"] or "Runtime error")[:500]
    return r, ok, msg


# ----------------------------
# Main grading flow
# ----------------------------

def main() -> int:
    try:
        with db_connect() as conn:
            user_id = get_user_id(conn)
            sub = fetch_submission_and_limits(conn)
            tcs = fetch_text_testcases(conn, sub["question_id"])

            # Early validations
            if not tcs:
                print("No testcases found.", file=sys.stderr)
                finalize(conn, "error", "No testcases found for assignment.")
                return 1

            # Set status=running (idempotent)
            set_status(conn, "running")

            passed_points = 0
            cases_out: List[Dict[str, Any]] = []

            total_tcs = len(tcs)
            passed_tcs = 0

            # Work from a clean temp dir (removed automatically)
            with tempfile.TemporaryDirectory(prefix="grader_") as work_dir:
                # Iterate testcases
                for tc in tcs:
                    r, ok, msg = run_single_testcase(sub["language"], sub["code"], tc, work_dir)

                    points_earned = 0
                    if ok:
                        points_earned = tc["points"]
                        passed_tcs += 1
                        passed_points += points_earned

                    update_testcase_grade(conn, tc["id"], user_id, points_earned)

                    cases_out.append({
                        "input": tc["inputs"],
                        "expected": tc["outputs"],
                        "got": r["stdout"],
                        "ok": ok,
                        "time_ms": r["time_ms"],
                        **({"message": msg} if msg else {})
                    })


            status = "passed" if passed_tcs == total_tcs else "failed" if passed_tcs == 0 else "partial"
            feedback = f"Passed {passed_tcs}/{total_tcs} testcases."

            with db_connect() as conn2:
                finalize(conn2, status, feedback)

            # print(f"Grading completed: {status} ({passed}/{total})")
            return 0

    except Exception as e:
        # Best effort to mark error in DB
        traceback.print_exc()
        try:
            with db_connect() as conn3:
                finalize(conn3, "error", f"Internal grader error: {e}")
        except Exception as e2:
            traceback.print_exc()
            print(f"FATAL (while finalizing error): {e2}", file=sys.stderr)
        print(f"FATAL: {e}", file=sys.stderr)
        return 2


# ----------------------------
# Solution test run flow (RUN_MODE == "solution")
# ----------------------------

def main_solution() -> int:
    try:
        with db_connect() as conn:
            sol = fetch_solution(conn, QUESTION_ID)
            tcs = fetch_text_testcases(conn, QUESTION_ID, TESTCASE_ID or None)

            if not tcs:
                print("No testcases found.", file=sys.stderr)
                finalize_solution_run(conn, "error", [])
                return 1

            set_solution_run_status(conn, "running")

            total_tcs = len(tcs)
            passed_tcs = 0
            results: List[Dict[str, Any]] = []

            with tempfile.TemporaryDirectory(prefix="grader_") as work_dir:
                for tc in tcs:
                    r, ok, msg = run_single_testcase(sol["language"], sol["code"], tc, work_dir)

                    if ok:
                        passed_tcs += 1

                    # console output the professor sees: program stdout, plus the
                    # failure reason appended when it didn't pass
                    console = r["stdout"]
                    if msg:
                        console = (console + "\n" + msg) if console else msg

                    results.append({
                        "name": tc["name"],
                        "maxPoints": tc["points"],
                        "points": tc["points"] if ok else 0,
                        "consoleOutput": console,
                    })

            status = "passed" if passed_tcs == total_tcs else "failed" if passed_tcs == 0 else "partial"

            with db_connect() as conn2:
                finalize_solution_run(conn2, status, results)

            return 0

    except Exception as e:
        traceback.print_exc()
        try:
            with db_connect() as conn3:
                finalize_solution_run(conn3, "error", [])
        except Exception as e2:
            traceback.print_exc()
            print(f"FATAL (while finalizing solution error): {e2}", file=sys.stderr)
        print(f"FATAL: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    if RUN_MODE == "solution":
        sys.exit(main_solution())
    sys.exit(main())