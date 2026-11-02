#!/usr/bin/env python3
"""STAGE22 review-only preflight. NO GitHub API calls, NO publish, NO remote mutation."""
import argparse,json,re,hashlib,sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
p=argparse.ArgumentParser()
p.add_argument('site',type=Path)
p.add_argument('--report',type=Path)
a=p.parse_args();root=a.site.resolve()
results={};issues=[]
def check(label,ok,detail=''):
  results[label]={'pass':bool(ok),'detail':detail}
  if not ok:issues.append(label)
wf=root/'.github/workflows'
workflows=sorted(p.name for p in wf.glob('*.yml'))+sorted(p.name for p in wf.glob('*.yaml'))
check('single read-only candidate workflow',workflows==['verify-native-dex.yml'],workflows)
s=(wf/'verify-native-dex.yml').read_text(encoding='utf8') if (wf/'verify-native-dex.yml').exists() else ''
check('explicit read-only GitHub permissions',bool(re.search(r'(?m)^permissions:\s*\n\s+contents:\s*read\s*$',s)))
check('no operational workflow deploy/push commands',not re.search(r'(?im)\b(?:git\s+(?:push|commit|add)|gh\s+api|contents:\s*write|pages:\s*write|deployments:\s*write|peter-evans/create-pull-request|actions/deploy-pages)\b',s))
check('stage21 source validator wired','tools/stage21/verify_release.py' in s)
check('stage22 preflight wired','tools/stage22/verify_preflight.py' in s)
check('explicit non-deployment policy',(root/'STAGE22_RELEASE_POLICY.txt').is_file() and '운영 반영 없음' in (root/'STAGE22_RELEASE_POLICY.txt').read_text())
check('manual deployment playbook',(root/'STAGE22_DEPLOYMENT_CHECKLIST.md').is_file())
index=(root/'index.html').read_text(encoding='utf8')
class Parse(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=[];self.displays=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if d.get('id'):self.ids.append(d['id'])
  if tag=='script' and d.get('src'):self.refs.append(d['src'])
  if tag=='link' and d.get('rel')=='stylesheet' and d.get('href'):self.refs.append(d['href'])
  if d.get('role')=='dialog':self.displays.append(d)
parsed=Parse();parsed.feed(index)
local=[];external=[]
for ref in parsed.refs:
 parts=urlsplit(ref)
 if parts.scheme or parts.netloc or ref.startswith('//'):external.append(ref);continue
 path=(root/unquote(parts.path)).resolve()
 if not path.is_relative_to(root):external.append(ref)
 else:local.append((ref,path))
check('entrypoint no remote runtime assets',not external,external)
check('entrypoint assets resolve',all(p.is_file() for _,p in local),[ref for ref,p in local if not p.is_file()])
check('no duplicate IDs',len(parsed.ids)==len(set(parsed.ids)))
check('detail modal has accessible title',any(x.get('aria-modal')=='true' and x.get('aria-labelledby') for x in parsed.displays))
check('search control accessible',bool(re.search(r'<label[^>]*class="search"',index)) and 'type="search"' in index)
css=(root/'stage20-accessibility.css').read_text(encoding='utf8')
js=(root/'stage20-accessibility.js').read_text(encoding='utf8')
check('mobile tap target CSS',all(k in css for k in ['max-width:650px','min-height:44px','repeat(3,minmax(0,1fr))']))
check('focus trap and return script',all(k in js for k in ["e.key!=='Tab'",'launcher.focus()','background[i].inert']))
check('responsive viewport',bool(re.search(r'<meta\s+name="viewport"[^>]*width=device-width',index)))
check('policy explicitly describes pending manual QA','미검증' in (root/'STAGE22_DEPLOYMENT_CHECKLIST.md').read_text(encoding='utf8'))
summary={'stage':'STAGE22','status':'PASS_STATIC_NOT_BROWSER_NOT_DEPLOYED' if not issues else 'FAIL','checks':len(results),'failed':issues,'results':results,'runtime_refs':len(local),'browser_executed':False,'github_modified':False,'remote_workflows_cleaned':False,'deployment_authorized':False}
raw=json.dumps(summary,ensure_ascii=False,indent=2)+'\n'
if a.report:a.report.write_text(raw,encoding='utf8')
print(json.dumps({'stage':summary['stage'],'status':summary['status'],'checks':summary['checks'],'failed':issues},ensure_ascii=False))
sys.exit(bool(issues))
