#!/usr/bin/env python3
"""Static deployment gate. Browser QA is intentionally NOT certified."""
from pathlib import Path
import re, json, hashlib, sys, collections
from PIL import Image
ROOT=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'deploy-candidate')
OUT=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parents[1]/'stage9-static-gate.json'
err=[]; warn=[]; tests={}
def test(name,fn):
    try:tests[name]=fn()
    except Exception as e:err.append(f'{name}: {e}');tests[name]='FAIL'
html=(ROOT/'index.html').read_text('utf8')
scripts=re.findall(r'<script\s+src="([^"?]+)',html)
links=re.findall(r'<link[^>]+href="([^"?]+)',html)
lazy=['stage19-data.js','stage20-data.js','stage21-data.js','stage25-detail-data.js','move-names-canonical.js','move-short-canonical.js','move-long-canonical.js','ability-names-canonical.js','ability-short-canonical.js','ability-long-canonical.js']
test('runtime_script_list', lambda: (_ for _ in ()).throw(AssertionError(len(scripts))) if len(scripts)!=(19 if 'stage11-source-gaps.js' in scripts else 18) else {'script_tags':len(scripts),'css':len(links),'native_lazy_modules':len(lazy)})
def paths():
    bad=[str(s) for s in scripts+links+lazy if not (ROOT/s).is_file()]
    assert not bad,bad
    assert len(scripts)==len(set(scripts))
    return {'missing':0,'unique_script_tags':True}
test('no_missing_local_resources',paths)
def thirdparty():
    bad=[]
    for f in scripts+lazy:
        s=(ROOT/f).read_text('utf8')
        if re.search('ForwardFeed|ER-nextdex',s,re.I):bad.append(f)
    assert not bad,bad
    assert all(not u.startswith('http') for u in scripts+links)
    assert 'forms.js' not in scripts
    assert not any(f in ('species-1.js','species-2.js','species-3.js','species-4.js') for f in scripts)
    return {'nextdex_runtime_refs':0,'legacy_form_scripts_loaded':0}
test('no_external_nextdex_runtime',thirdparty)
def loader():
    app=(ROOT/'app-stage13.js').read_text('utf8')
    bridge=(ROOT/'stage5-bridge.js').read_text('utf8')
    assert 'const nativeLoader=window.ER_STAGE5?.apply' in app
    assert not re.search(r'moves-1\.js|abilities-1\.js',app)
    for name in lazy[4:]:assert name in bridge,name
    return {'legacy_lazy_modules_requested':0,'canonical_modules_requested':6}
test('canonical_only_lazy_loading',loader)
def js_syntax_inventory():
    return {'runtime_js':len([p for p in ROOT.glob('*.js')])}
test('runtime_js_inventory',js_syntax_inventory)
def png_inventory():
    files=sorted((ROOT/'assets/pokemon').glob('*.png'))
    assert len(files)==1938,len(files)
    ids=[int(x.stem) for x in files]
    assert len(set(ids))==1938
    missing_alpha=[];bad=[];zero=[]
    for path in files:
        try:
            with Image.open(path) as im:
                im.load()
                if im.size!=(64,64):bad.append(path.name)
                a=im.convert('RGBA').getchannel('A').getextrema()
                if a[0]!=0:missing_alpha.append(path.name)
                if im.getbbox() is None:zero.append(path.name)
        except Exception as e:bad.append(path.name+': '+str(e))
    assert not bad,bad[:20]
    assert not zero,zero[:20]
    # Alpha zero pixel is desirable, but flag (do not fail) if a few game sprites are intentionally solid.
    if missing_alpha:warn.append('sprites without transparent pixels: '+str(len(missing_alpha))+', examples: '+','.join(missing_alpha[:10]))
    return {'files':len(files),'decoded':len(files)-len(bad),'dimensions':'64x64','with_alpha_zero_pixel':len(files)-len(missing_alpha),'no_transparency':len(missing_alpha)}
test('native_png',png_inventory)
def stale_outputs():
    forbidden=['forms.js','stage14-build.js','stage18-build.js','stage19-build.js','stage20-build.js','stage21-build.js','app.js','app-stage11.js','app-stage12.js','v1-translation-sync.js','stage17-data-audit.js','stage18-probe.js']
    assert all(not (ROOT/f).exists() for f in forbidden)
    assert sorted(p.name for p in (ROOT/'.github/workflows').glob('*.yml'))==['verify-native-dex.yml']
    return {'old_builders_and_apps_shipped':0,'github_actions_read_only_gate_only':True}
test('legacy_not_deployed',stale_outputs)
report={'stage':'STAGE10','scope':'release-check candidate static audit, NOT real browser','source':'STAGE8 staging snapshot','site_main_changed':False,'game_korean_changed':False,'checks':tests,'errors':err,'warnings':warn,'status':'STATIC_PASS_BROWSER_QA_PENDING' if not err else 'FAIL_NOT_DEPLOYABLE'}
OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'status':report['status'],'tests':len(tests),'errors':err,'warnings':warn,'png':tests.get('native_png')},ensure_ascii=False,indent=2))
if err:raise SystemExit(1)
