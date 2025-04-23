document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('submissionForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        
        // Validate YouTube link
        const videoLink = formData.get('videoLink');
        if (!isValidYouTubeUrl(videoLink)) {
            alert('Please enter a valid YouTube video URL');
            return;
        }
        
        // Validate PDF file
        const pdfFile = formData.get('pdfFile');
        if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
            alert('PDF file size must be less than 10MB');
            return;
        }

        try {
            // Disable submit button during submission
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            // Create issue body with proper formatting
            const issueBody = [
                `## Student Submission Details`,
                ``,
                `- **Full Name:** ${formData.get('fullName')}`,
                `- **Student ID:** ${formData.get('studentId')}`,
                `- **Group:** ${formData.get('group')}`,
                `- **YouTube Link:** ${formData.get('videoLink')}`,
                `- **PDF Filename:** ${pdfFile.name}`,
                `- **Submission Date:** ${new Date().toISOString()}`,
                ``,
                `### PDF Content`,
                `_File will be processed by the workflow_`
            ].join('\n');

            // Create GitHub issue using the REST API
            const response = await fetch('https://api.github.com/repos/finebank/FIN546.2025/issues', {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${window.GITHUB_TOKEN}`, // This needs to be set in your HTML
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `[SUBMISSION] Student Submission - ${formData.get('fullName')}`,
                    body: issueBody,
                    labels: ['submission']
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API Error: ${errorData.message}`);
            }

            // Show success message
            alert('Submission successful! Your submission is being processed.');
            
            // Reset form
            form.reset();
        } catch (error) {
            alert(`Error submitting form: ${error.message}`);
            console.error('Submission error:', error);
        } finally {
            // Re-enable submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    });
    
    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    }
});
