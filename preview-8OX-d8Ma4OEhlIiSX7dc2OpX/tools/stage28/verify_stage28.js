#!/usr/bin/env node
'use strict';
// STAGE28 regression gate, supersedes STAGE27's two false exceptions.
// Run in isolated preview root: node tools/stage28/verify_stage28.js .
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(process.argv[2]||'.');
const report=JSON.parse(fs.readFileSync(path.join(root,'STAGE28_SOURCE_SYNC_AUDIT.json'),'utf8'));
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,report.site.dataset),'utf8'),ctx);
const data=ctx.window.ER_STAGE25_DETAIL_DATA;
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h.toString(16).padStart(8,'0')};
function check(kind){
 const rows=data[kind];const expected=report.fnv32Groups[kind];const groups={};const ids=new Set();
 for(const r of rows){
  if(r.length!==4||!Number.isSafeInteger(r[0])||r[0]<=0||ids.has(r[0])||r.slice(1).some(x=>typeof x!=='string'))throw Error(kind+' row malformed or duplicate');
  ids.add(r[0]);(groups[String(Math.floor(r[0]/50))]??=[]).push(r);
 }
 if(Object.keys(expected).length!==Object.keys(groups).length)throw Error(kind+' group count mismatch');
 for(const [id,rs] of Object.entries(groups)){
  const x=expected[id];if(!x||x.count!==rs.length||x.fnv32!==hash(rs.sort((a,b)=>a[0]-b[0]).map(r=>r.join(':')).join('|')))throw Error(kind+' group mismatch: '+id);
 }
 return rows.length;
}
if(check('abilities')!==1083||check('moves')!==1040)throw Error('dataset count mismatch');
for(const item of report.correctedFalsePositives){
 const row=data.abilities.find(r=>r[0]===item.id);if(!row||row[1]!==item.name||!row[2]||!row[3])throw Error('false-positive regression '+item.id);
 const old=row[2];row[2]='STAGE28_FORCED_TAMPER';let failed=false;
 try{check('abilities')}catch(e){failed=true}finally{row[2]=old}
 if(!failed)throw Error('negative test failed '+item.id);
}
console.log('STAGE28 PASS: 1040 moves, 1083 abilities; zero source text exceptions; two negative tests PASS');
