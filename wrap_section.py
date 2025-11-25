import re

file_path = '/Users/houman/CascadeProjects/Fooodis/2/dashboard.html'

with open(file_path, 'r') as f:
    content = f.read()

# Update CSS link
content = content.replace('href="css/support-tickets.css"', 'href="css/support-tickets.css?v=2"')

# Wrap support tickets section content
pattern = r'(<section class="dashboard-section" id="support-tickets-section">)(.*?)(</section>)'
replacement = r'\1\n    <div class="ticket-page-container" style="margin-left: 0 !important; max-width: 100% !important; padding: 0 !important; background: transparent !important; min-height: auto !important;">\2\n    </div>\n\3'

# Use dotall to match newlines
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

if new_content != content:
    with open(file_path, 'w') as f:
        f.write(new_content)
    print("Successfully wrapped support tickets section and updated CSS link.")
else:
    print("Could not find section to wrap or content already updated.")
