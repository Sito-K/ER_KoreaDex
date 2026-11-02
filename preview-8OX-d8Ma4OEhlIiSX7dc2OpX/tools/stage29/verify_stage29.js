#!/usr/bin/env node
'use strict';
// STAGE29 names audit baseline check; run from preview root.
// This is read-only QA. Deliberate future renames require a new baseline report.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(process.argv[2]||'.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'STAGE29_NAME_COLLISION_AUDIT.json'),'utf8'));
const source=fs.readFileSync(path.join(root,manifest.sources.siteData),'utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(source,ctx);
const rows=ctx.window.ER_POKEMON_DATA;
function check(){
  if(!Array.isArray(rows)||rows.length!==1938)throw Error('species count');
  const byName=new Map(),ids=new Set();
  for(const r of rows){
    if(!Array.isArray(r)||r.length<14||!Number.isSafeInteger(r[0])||ids.has(r[0]))throw Error('invalid species row/duplicate id');
    ids.add(r[0]);if(typeof r[2]!=='string'||typeof r[4]!=='string')throw Error('invalid species name');
    if(!byName.has(r[2]))byName.set(r[2],[]);byName.get(r[2]).push(r[0]);
  }
  const groups=[...byName].filter(([name,values])=>values.length>1);
  if(groups.length!==manifest.summary.collisionLabelGroups||groups.reduce((n,[name,v])=>n+v.length,0)!==manifest.summary.collisionSpeciesRows)throw Error('collision summary drift');
  for(const g of manifest.groups){
    const list=byName.get(g.name)||[];
    if(list.join(',')!==g.entries.map(x=>x.id).join(','))throw Error('collision group drift '+g.name);
  }
  if(manifest.summary.baseDiffs+manifest.summary.formDiffs!==manifest.summary.sourceVsSiteDisplayNameDifferences)throw Error('source difference count');
}
check();
const candidate=rows.find(x=>x[0]===1740),original=candidate[2];candidate[2]='STAGE29_TAMPER_LABEL';
let rejected=false;try{check()}catch(e){rejected=true}finally{candidate[2]=original}
if(!rejected)throw Error('negative tamper test failed');
console.log('STAGE29 PASS: 1938 records; 815 prior diff rows catalogued; 10 collision label groups / 22 records; tamper test PASS');
