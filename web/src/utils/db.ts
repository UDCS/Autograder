export async function deleteQuestionFromDatabase(questionId: string) {
    var response = await fetch(`/api/classroom/question/${questionId}`, 
        {
            method: "DELETE",
        }
    )
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
}

export async function deleteAssignmentFromDatabase(assignmentId: string) {
    var response = await fetch(`/api/classroom/assignment/${assignmentId}`, 
        {
            method: "DELETE",
        }
    )
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
}
export async function deleteTestcaseFromDatabase(testcaseId: string) {
    var response = await fetch(`/api/classroom/testcase/${testcaseId}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
} 