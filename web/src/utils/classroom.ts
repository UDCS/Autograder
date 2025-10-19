import { Assignment, Question } from "../models/classroom";

export const parseDateString = (dateString: string) => {
  const parts = dateString.split("-").map((p, i) => Number(p) - Number(i == 1));
  return new Date(parts[0], parts[1], parts[2]);
};
export const dateToString = (date: Date) => {
  if (typeof date !== "object") date = new Date(date);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${date.getFullYear()}-${month <= 9 ? "0" : ""}${month}-${
    day <= 9 ? "0" : ""
  }${day}`;
};
export const createBlankQuestion = (assignmentId: string): Question => {
  const questionId = crypto.randomUUID();
  const questionPoints = 10;
  const testcaseId = crypto.randomUUID();
  const testcaseTimeout = 10;
  const testcasePoints = 10;
  return {
    id: questionId,
    assignment_id: assignmentId,
    header: "",
    body: "",
    points: questionPoints,
    sort_index: 0,
    default_code: "",
    solution_code: "",
    prog_lang: "python",
    test_cases: [
      {
        id: testcaseId,
        name: "Test case 1",
        timeoutSeconds: testcaseTimeout,
        type: "text",
        points: testcasePoints,
        body: {
          inputs: "",
          outputs: "",
          hidden: true,
        },
      },
    ],
  };
};
export const createBlankAssignment = (classroomId: string): Assignment => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const assignmentId = crypto.randomUUID();
  return {
    id: assignmentId,
    classroom_id: classroomId,
    name: "",
    description: "",
    assignment_mode: "draft",
    due_at: nextWeek,
    created_at: today,
    updated_at: today,
    sort_index: 0,
    questions: [createBlankQuestion(assignmentId)],
  };
};
