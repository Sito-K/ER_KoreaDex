#!/usr/bin/env python3
"""STAGE23 self-contained static+HTTP review gate. No browsing or GitHub writes."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
from urllib.error import HTTPError
from socket import socket
from subprocess import Popen,PIPE
import argparse,json,time,sys,re,hashlib

class Sources(HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.links=[];self.ids=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get('id'):self.ids.append(d['id'])
        if tag=='script' and d.get('src'):self.refs.append((tag,d['src']))
        if tag=='link' and d.get('rel')=='stylesheet' and d.get('href'):self.refs.append((tag,d['href']))
        if tag=='link' and d.get('rel')=='icon' and d.get('href'):self.refs.append((tag,d['href']))
        if tag=='a' and d.get('href'):self.links.append(d['href'])

def main():
    p=argparse.ArgumentParser();p.add_argument('site',type=Path);p.add_argument('--report',type=Path);a=p.parse_args()
    root=a.site.resolve(); checks={};fail=[]
    def mark(name,good,detail=''):
        checks[name]={'pass':bool(good),'detail':detail}
        if not good:fail.append(name)
    index=root/'index.html'; mark('index exists',index.is_file());
    if not index.is_file():return 1
    phtml=Sources();phtml.feed(index.read_text(encoding='utf-8'))
    mark('index tag id uniqueness',len(set(phtml.ids))==len(phtml.ids),f'{len(phtml.ids)} IDs')
    mark('runtime asset references found',len(phtml.refs)>=35,f'{len(phtml.refs)}')
    local=[];remote=[];unsafe=[]
    for kind,ref in phtml.refs:
        parsed=urlsplit(ref)
        if parsed.scheme or parsed.netloc or ref.startswith('//'):
            remote.append(ref);continue
        path=(root/unquote(parsed.path)).resolve()
        if not path.is_relative_to(root):unsafe.append(ref)
        else:local.append((kind,ref,path))
    mark('no external runtime dependencies',not remote,remote)
    mark('no unsafe reference paths',not unsafe,unsafe)
    mark('entrypoint all referenced assets present',all(x[2].is_file() for x in local),[x[1] for x in local if not x[2].is_file()])
    mark('entrypoint script reference order preserved',len([x for x in local if x[0]=='script'])>=15)
    mark('no external links injected into HTML',all(not re.search(r'(?i)^javascript:',s) for s in phtml.links))
    imgs=sorted((root/'assets/pokemon').glob('*.png'))
    mark('1938 native sprite files',len(imgs)==1938,len(imgs))
    bad=[]
    for img in imgs:
        with img.open('rb') as f:
            head=f.read(24)
        if len(head)<24 or head[:8]!=b'\x89PNG\r\n\x1a\n' or head[12:16]!=b'IHDR' or int.from_bytes(head[16:20],'big')<1 or int.from_bytes(head[20:24],'big')<1:
            bad.append(img.name)
    mark('all PNG headers/geometry valid',not bad,bad[:10])
    expected={'pokemon-data.js','stage20.js','stage21.js','stage20-accessibility.js','stage20-accessibility.css'}
    mark('critical site runtime files preserved',all((root/x).is_file() for x in expected))
    marker=(root/'STAGE23_PREVIEW_POLICY.txt')
    mark('preview not released policy',marker.is_file() and '미배포' in marker.read_text(encoding='utf-8'))
    wf=root/'.github/workflows'
    wfs=sorted(x.name for x in wf.iterdir() if x.suffix in {'.yml','.yaml'})
    mark('single read-only CI workflow',wfs==['verify-native-dex.yml'],wfs)
    # Integration smoke: local HTTP runtime only; browsers/screenreaders are expressly NOT run.
    src=root/'tools/stage23/preview_server.py'
    mark('preview server exists',src.is_file())
    proc=None;port=None
    if src.is_file():
        with socket() as sk:sk.bind(('127.0.0.1',0));port=sk.getsockname()[1]
        proc=Popen([sys.executable,str(src),str(root),'--port',str(port)],stdout=PIPE,stderr=PIPE,text=True)
        try:
            for _ in range(30):
                if proc.poll() is not None:break
                try:
                    with urlopen(f'http://127.0.0.1:{port}/',timeout=.5) as f:
                        if f.status==200:break
                except Exception:time.sleep(.10)
            def req(path,expected_status=200,ct=None):
                try:
                    with urlopen(f'http://127.0.0.1:{port}{path}',timeout=2.5) as f:
                        status=f.status;content_type=f.headers.get('Content-Type','');control=f.headers.get('Cache-Control','');nosniff=f.headers.get('X-Content-Type-Options');data=f.read()
                except HTTPError as e:
                    status=e.code;content_type=e.headers.get('Content-Type','');control=e.headers.get('Cache-Control','');nosniff=e.headers.get('X-Content-Type-Options');data=b''
                return status==expected_status and (ct is None or ct in content_type) and 'no-store' in control and nosniff=='nosniff',{'path':path,'status':status,'content_type':content_type,'bytes':len(data)}
            tests=[('/',200,'text/html'),('/index.html?x=1',200,'text/html'),('/pokemon-data.js?v=review',200,'javascript'),('/stage20-accessibility.css',200,'text/css'),('/assets/pokemon/1.png',200,'image/png'),('/not-here.js',404,None),('/tools/stage23/preview_server.py',403,None),('/.github/workflows/verify-native-dex.yml',403,None),('/assets/pokemon/',403,None),('/STAGE23_PREVIEW_POLICY.txt',403,None)]
            outputs=[]
            for path,code,ct in tests:
                try:ok,details=req(path,code,ct)
                except Exception as e:ok=False;details={'path':path,'error':str(e)}
                outputs.append((ok,details))
            mark('HTTP smoke 10 statuses/content-types/headers',all(ok for ok,_ in outputs),[d for _,d in outputs])
            # Hit all entrypoint assets over local HTTP, not only their presence on disk.
            failures=[]
            for kind,ref,pth in local:
                try:ok,details=req('/'+pth.relative_to(root).as_posix()+'?verify=1',200,'javascript' if kind=='script' else 'text/css' if pth.suffix=='.css' else None)
                except Exception as e:ok=False;details={'path':ref,'error':str(e)}
                if not ok:failures.append(details)
            mark('all entrypoint runtime assets HTTP 200',not failures,{'refs':len(local),'failures':failures[:10]})
        finally:
            if proc is not None:
                proc.terminate()
                try:proc.communicate(timeout=3)
                except Exception:proc.kill();proc.communicate(timeout=2)
    else:
        mark('HTTP smoke 10 statuses/content-types/headers',False,'server script missing')
        mark('all entrypoint runtime assets HTTP 200',False,'server script missing')
    result={'stage':'STAGE23','status':'PASS_LOCAL_PREVIEW_STATIC_HTTP_NO_BROWSER' if not fail else 'FAIL','checks':len(checks),'failed':fail,'results':checks,'browser_executed':False,'device_qa_executed':False,'github_modified':False,'deploy_performed':False}
    if a.report:a.report.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'status':result['status'],'checks':result['checks'],'failed':fail},ensure_ascii=False))
    return 1 if fail else 0
if __name__=='__main__':sys.exit(main())
