export type TestCaseType = "text" | "bash";

export type TextInputOutput = {
    inputs?: string;
    outputs?: string;
    hidden?: boolean;
}

export type TextTestCaseBody = {
    testCases: TextInputOutput[];
}

export type File = {
    name: string;
    suffix: string;
    body: string;
}

export type BashTestCaseBody = {
    primaryBashFile: File;
    otherFiles?: File[];
}

export type TestCaseBody = TextTestCaseBody | BashTestCaseBody;

export type TestCase = {
    id: string;
    name: string;
    points: number;
    timeoutSeconds: number;
    type: TestCaseType;
    body: TestCaseBody;
}