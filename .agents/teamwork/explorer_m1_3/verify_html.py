import os
import re

cur_dir = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(cur_dir, 'proposed_index.html')
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

projects = len(re.findall(r'<article class="project-card\b', text))
achievements = len(re.findall(r'class="achievement-card\b', text))
certifications = len(re.findall(r'class="timeline-item\b', text))
skills = len(re.findall(r'class="skill-group-card\b', text))
typos = len(re.findall(r'devoleper', text, re.I))
ms = len(re.findall(r'MS (Word|Excel|Office|PowerPoint|Forms)', text, re.I))
phones = len(re.findall(r'(\+91|\b\d{10}\b)', text))
links = len(re.findall(r'class="btn btn-(?:primary|secondary) btn-sm"', text))

print(f"Projects count: {projects} (Expected: 7)")
print(f"Achievements count: {achievements} (Expected: 9)")
print(f"Certifications count: {certifications} (Expected: 8)")
print(f"Skill groups count: {skills} (Expected: 6)")
print(f"Devoleper typos count: {typos} (Expected: 0)")
print(f"MS Office tools count: {ms} (Expected: 0)")
print(f"Phone numbers count: {phones} (Expected: 0)")
print(f"Project link buttons count: {links} (Expected: 3)")
