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

            // Create issue body
            const issueBody = `
Full Name: ${formData.get('fullName')}
Student ID: ${formData.get('studentId')}
Group: ${formData.get('group')}
YouTube Link: ${formData.get('videoLink')}
PDF Filename: ${pdfFile.name}
Submission Date: ${new Date().toISOString()}
            `.trim();

            // Create GitHub issue
            const response = await fetch('https://api.github.com/repos/finebank/FIN546.2025/issues', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: '[SUBMISSION] New Student Submission',
                    body: issueBody,
                    labels: ['submission']
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            // Show success message
            alert('Submission successful! Your submission is being processed.');
            
            // Reset form
            form.reset();
        } catch (error) {
            alert('Error submitting form. Please try again.');
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