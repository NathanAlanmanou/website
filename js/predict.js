document.getElementById('salaryForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Collect the input values
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const education = document.getElementById('education').value;
    const jobTitle = document.getElementById('jobTitle').value;
    const experience = document.getElementById('experience').value;

    // Create the payload for the API
    const payload = {
        age: parseFloat(age),
        gender: gender,
        education: education,
        job_title: jobTitle,
        years_of_experience: parseFloat(experience)
    };

    // Call the API endpoint
    const response = await fetch('https://adb-3879714843825281.1.azuredatabricks.net/serving-endpoints/salary15/invocations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    // Get the result from the response
    const result = await response.json();

    // Display the predicted salary
    document.getElementById('result').textContent = `Predicted Salary: ${result.salary}`;
});

function showSection(sectionId) {
    document.querySelectorAll('#content section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}
