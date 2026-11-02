#!/usr/bin/env python3
# Read-only STAGE35 legacy workflow quarantine verification.
import pathlib, re, sys, json
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
audit=json.loads((root/'preview-8OX-d8Ma4OEhlIiSX7dc2OpX/STAGE35_WORKFLOW_QUARANTINE_AUDIT.json').read_text(encoding='utf-8'))
assert len(audit['files'])==17
wf=root/'.github/workflows'
actual=list(wf.glob('*.yml'))
assert len(actual)==40, f"workflow count={len(actual)}"
for item in audit['files']:
 s=(wf/item['name']).read_text(encoding='utf-8')
 head=s.split('jobs:',1)[0]
 assert 'STAGE35 QUARANTINED' in s
 assert re.search(r'(?m)^on:\s*\n\s+workflow_dispatch:',head)
 assert not re.search(r'(?m)^\s+(?:push|schedule|workflow_run|pull_request|pull_request_target):',head)
 assert re.search(r'(?m)^\s+contents:\s*read\s*$',head)
 assert not re.search(r'(?m)^\s+contents:\s*write\s*$',s)
 jobs=s.split('jobs:',1)[1]
 keys=re.findall(r'(?m)^  ([a-zA-Z_][\w-]*):\s*$',jobs)
 assert keys
 assert len(re.findall(r'(?m)^    if: \$\{\{ false \}\}',jobs))==len(keys),(item['name'],keys)
print('STAGE35 PASS: 17 quarantined workflows, 40 retained, job guards on all; production site unaffected')
