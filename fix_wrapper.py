file_path = '/Users/houman/CascadeProjects/Fooodis/2/dashboard.html'

with open(file_path, 'r') as f:
    content = f.read()

old_div = '<div class="ticket-page-container" style="margin-left: 0 !important; max-width: 100% !important; padding: 0 !important; background: transparent !important; min-height: auto !important;">'
new_div = '<div class="ticket-page-container" style="background: transparent !important; min-height: auto !important;">'

if old_div in content:
    content = content.replace(old_div, new_div)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Successfully updated wrapper div styles.")
else:
    print("Could not find the specific wrapper div line to update.")
