#!/usr/bin/env python3
"""STAGE21 native Korean Dex release candidate static and data gate.
Never mutates original data. Static/mock checks only, NOT real browser or game QA.
"""
import argparse, json, hashlib, pathlib, re, sys
from collections import Counter
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('site',type=pathlib.Path)
parser.add_argument('--report',type=pathlib.Path)
a=parser.parse_args()
site=a.site.resolve()
checks={};failures=[]
def check(label, condition, detail=''):
    ok=bool(condition)
    checks[label]={'ok':ok,'detail':detail}
    if not ok:failures.append(label)
def data(name):
    raw=(site/name).read_text(encoding='utf-8-sig').strip()
    head,sep,body=raw.partition('=')
    if not sep or not head.strip().startswith('window.'):
        raise ValueError(f'{name}: not a JSON assignment')
    return json.loads(body.rstrip('; \r\n'))
class Assets(HTMLParser):
 def __init__(self):super().__init__();self.resources=[];self.ids=[];self.external=[];self.widgets=[]
 def handle_starttag(self,tag,attrs):
    at=dict(attrs)
    if 'id' in at:self.ids.append(at['id'])
    if tag=='script' and 'src' in at: self.resources.append(('script',at['src']))
    if tag=='link' and at.get('rel')=='stylesheet' and 'href' in at:self.resources.append(('link',at['href']))
    if tag=='button':self.widgets.append(at)
html=(site/'index.html').read_text(encoding='utf8');doc=Assets();doc.feed(html)
refs=[]
for tag,url in doc.resources:
  parsed=urlsplit(url)
  if parsed.scheme or parsed.netloc or url.startswith('//'):
    doc.external.append(url);continue
  rel=unquote(parsed.path)
  ref=(site/rel).resolve()
  if not ref.is_relative_to(site):doc.external.append(url);continue
  refs.append((tag,rel,ref))
check('runtime resources local',not doc.external,doc.external)
check('runtime resource files exist',all(p.is_file() for _,_,p in refs),[rel for _,rel,p in refs if not p.is_file()])
check('runtime references unique',len(refs)==len(set(r[1] for r in refs)),str(len(refs)))
check('no duplicate HTML ids',len(doc.ids)==len(set(doc.ids)),[x for x,n in Counter(doc.ids).items() if n>1])
check('current entrypoint modules loaded',all(any(r[1]==x for r in refs) for x in ['app-stage13.js','stage20.js','stage21.js','stage25.js','stage20-accessibility.js']))
check('read-only GH workflow present',(site/'.github/workflows/verify-native-dex.yml').is_file())
files=[p for p in (site/'assets/pokemon').glob('*.png')]
check('native sprite count',len(files)==1938,len(files))
invalid=[]
for p in files:
 try:
  with Image.open(p) as im:
   if im.size!=(64,64) or im.format!='PNG' or 'A' not in im.mode:invalid.append(p.name)
 except Exception:invalid.append(p.name)
check('sprite format and alpha',not invalid,invalid[:20])
known={}
for name in ['pokemon-data.js','stage19-data.js','stage20-data.js','stage17-data.js','stage21-data.js','stage25-detail-data.js','move-meta.js','ability-meta.js']:
 try:known[name]=data(name)
 except Exception as e:failures.append(name);checks[name]={'ok':False,'detail':str(e)}
if len(known)==8:
 species=known['pokemon-data.js'];idlist=[int(r[0]) for r in species];ids=set(idlist)
 check('Pokemon 1938 unique',len(species)==1938 and len(ids)==1938,len(species))
 check('Pokemon local sprites',all((site/f'assets/pokemon/{i}.png').is_file() for i in ids))
 ev=known['stage20-data.js'];evrows=ev['species'];evids={int(r[0]) for r in evrows}
 check('evolution all species',len(evrows)==1938 and evids==ids,len(evrows))
 check('ordinary evolution 749',sum(len(r[3]) for r in evrows)==749)
 check('special evolution 304',sum(len(r[5]) for r in evrows)==304)
 check('evolution link targets',all(int(v[0]) in ids for r in evrows for idx in (3,4,5,6) for v in r[idx]))
 forms=known['stage17-data.js'];f=forms['formShifts'];deev=forms['deevLinks']
 check('form links 113',len(f)==113)
 check('gendered forms 9',sum(x[2] in ('MALE','FEMALE') for x in f)==9)
 check('de-evolution links 10',len(deev)==10)
 check('form and de-evolution IDs',all(int(x[0]) in ids and int(x[1]) in ids for x in f+deev))
 wild=known['stage21-data.js'];wrows=wild['species'];ws={int(r[0]) for r in wrows}
 check('encounter all species',len(wrows)==1938 and ws==ids)
 check('wild relationships 2572',sum(len(r[3]) for r in wrows)==2572)
 check('script/shop events 215',sum(len(r[4]) for r in wrows)==215)
 check('script/shop species 184',sum(bool(r[4]) for r in wrows)==184)
 check('wild and event row map slots',all(isinstance(x[1],int) for r in wrows for x in r[3]) and all(isinstance(x[0],int) for r in wrows for x in r[4]))
 check('stage21 provenance fixed',wild['meta'].get('source_game_commit')=='888d826064ba45d9febfa3a64d8a2b9d34503360')
 detail=known['stage25-detail-data.js'];check('move descriptions 1040',len(detail['moves'])==1040)
 check('ability descriptions 1083',len(detail['abilities'])==1083)
 check('move and ability meta',len(known['move-meta.js'])==1040 and len(known['ability-meta.js'])==1083)
 check('stage19 cross-refs',len(known['stage19-data.js']['species'])==1938)
for name in ['stage20-data.js','stage17-data.js','stage21-data.js','stage25-detail-data.js','pokemon-data.js']:
 check(f'local source {name}',(site/name).is_file())
result={'stage':'STAGE21','status':'PASS_STATIC_NOT_BROWSER' if not failures else 'FAIL','total_checks':len(checks),'checks':checks,'failed':failures,'assets':len(refs),'javascript':sum(tag=='script' for tag,_,_ in refs),'css':sum(tag=='link' for tag,_,_ in refs),'sprites':len(files),'browser_tested':False,'gameplay_tested':False,'github_deployed':False}
text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
print(text)
if a.report:a.report.write_text(text,encoding='utf8')
sys.exit(bool(failures))
