#!/usr/bin/env python3
import json,hashlib,sys
from pathlib import Path
site=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
manifest=json.loads((site/'STAGE26_SOURCE_BASELINE.json').read_text(encoding='utf-8'))
missing=[];wrong=[]
for name,sha in manifest['dataSHA256'].items():
 p=site/name
 if not p.is_file():missing.append(name)
 elif hashlib.sha256(p.read_bytes()).hexdigest()!=sha:wrong.append(name)
assets=list((site/'assets/pokemon').glob('*.png'))
assert not missing and not wrong and len(assets)==manifest['spriteCount'],(missing,wrong,len(assets))
print('STAGE26 source baseline local PASS:',len(manifest['dataSHA256']),'data files;',len(assets),'sprites; pinned',manifest['sourceGameCommit'])
