import psycopg

dsn = "postgres://postgres:postgres@localhost:5432/autograder?sslmode=disable"
with psycopg.connect(dsn) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT now()")
        print(cur.fetchone())