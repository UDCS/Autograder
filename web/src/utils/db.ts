import fetchWithAuth from './fetcher';

export async function deteleStudentFromDatabase(UUID: string) {
    var response = await fetchWithAuth(`/api/classroom/question/${UUID}`, 
        {
            method: "DELETE",
        }
    )
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
}

export async function deleteQuestionFromDatabase(questionId: string) {
    var response = await fetchWithAuth(`/api/classroom/question/${questionId}`, 
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
    var response = await fetchWithAuth(`/api/classroom/assignment/${assignmentId}`, 
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
    var response = await fetchWithAuth(`/api/classroom/testcase/${testcaseId}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        var errorText = await response.text();
        throw new Error(errorText);
    }
} 