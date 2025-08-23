export type TestCaseType = "text" | "bash";

export type TextInputOutput = {
    inputs?: string;
    outputs?: string;
    hidden?: boolean;
}

export type TextTestCaseBody = {
    testCases?: TextInputOutput[];
}

export type File = {
    id: string;
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

export type TestCaseResults = {
    name: string;
    maxPoints: number;
    points: number;
    consoleOutput?: string;
}