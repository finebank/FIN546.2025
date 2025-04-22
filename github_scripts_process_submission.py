import os
import json
import csv
import datetime
import re
from github import Github

def sanitize_filename(filename):
    """Sanitize filename to be safe for filesystem."""
    return re.sub(r'[^\w\-_.]', '_', filename)

def extract_submission_data(body):
    """Extract submission data from issue body."""
    lines = body.split('\n')
    data = {}
    
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            data[key.strip()] = value.strip()
    
    return data

def update_csv(data):
    """Update submissions.csv with new entry."""
    csv_path = 'submissions.csv'
    timestamp = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    
    # Create file if it doesn't exist
    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Timestamp', 'Full Name', 'Student ID', 'Group', 'YouTube Link', 'PDF Filename'])
    
    # Append new submission
    with open(csv_path, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            timestamp,
            data.get('Full Name', ''),
            data.get('Student ID', ''),
            data.get('Group', ''),
            data.get('YouTube Link', ''),
            data.get('PDF Filename', '')
        ])

def main():
    # Get issue information
    issue_body = os.environ['ISSUE_BODY']
    issue_number = os.environ['ISSUE_NUMBER']
    
    # Process submission data
    data = extract_submission_data(issue_body)
    
    try:
        # Update CSV
        update_csv(data)
        
        # Connect to GitHub
        g = Github(os.environ['GITHUB_TOKEN'])
        repo = g.get_repo(os.environ['GITHUB_REPOSITORY'])
        issue = repo.get_issue(number=int(issue_number))
        
        # Add success comment
        issue.create_comment(f"✅ Submission processed successfully!\n\nTimestamp (UTC): {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}")
        issue.edit(state='closed')
        
    except Exception as e:
        # Log error and add error comment to issue
        print(f"Error processing submission: {str(e)}")
        issue.create_comment(f"❌ Error processing submission: {str(e)}")

if __name__ == "__main__":
    main()