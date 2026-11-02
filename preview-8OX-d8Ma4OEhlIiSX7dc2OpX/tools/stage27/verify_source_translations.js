#!/usr/bin/env node
'use strict';
// Offline source-vs-site consistency gate. Source hashes were verified against
// the pinned code via the connected GitHub API, not via dynamic untrusted URLs.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(process.argv[2]||'.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'STAGE27_SOURCE_SYNC_AUDIT.json'),'utf8'));
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,manifest.canonicalDataset),'utf8'),ctx);
const db=ctx.window.ER_STAGE25_DETAIL_DATA;
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h.toString(16).padStart(8,'0')}
function checkRows(kind){
 const data=db[kind],expected=manifest.sourceVsSite[kind],exceptions=new Set(expected.exceptions.map(x=>x.id));
 if(data.length!==expected.siteRecords)throw Error(kind+' record count '+data.length+' != '+expected.siteRecords);
 const ids=new Set(),groups=new Map();let compared=0;
 for(const row of data){
  if(row.length!==4||!Number.isSafeInteger(row[0])||row[0]<=0)throw Error(kind+' invalid row');
  if(ids.has(row[0]))throw Error(kind+' duplicate id '+row[0]);ids.add(row[0]);
  if(row.slice(1).some(x=>typeof x!=='string'))throw Error(kind+' invalid fields '+row[0]);
  if(exceptions.has(row[0]))continue;
  const group=String(Math.floor(row[0]/50));if(!groups.has(group))groups.set(group,[]);
  groups.get(group).push(row);compared++;
 }
 for(const item of expected.exceptions){const row=data.find(x=>x[0]===item.id);if(!row||row[1]!==item.siteName||row.slice(2).some(s=>!s.trim()))throw Error(kind+' intentional exception changed '+item.id)}
 if(compared!==expected.exactNameShortLongMatches)throw Error(kind+' compared count mismatch');
 const expectedHashes=manifest.fnv32Groups[kind];if(groups.size!==Object.keys(expectedHashes).length)throw Error(kind+' group count changed');
 for(const [group,rows] of groups){rows.sort((a,b)=>a[0]-b[0]);const actual=hash(rows.map(r=>r.join(':')).join('|'));
  if(actual!==expectedHashes[group]?.fnv32||rows.length!==expectedHashes[group]?.count)throw Error(kind+' source drift group '+group+' actual='+actual+' expected='+expectedHashes[group]?.fnv32);
 }
 return {records:data.length,sourceMatched:compared,exceptions:[...exceptions],buckets:groups.size};
}
const result={moves:checkRows('moves'),abilities:checkRows('abilities')};
if(!process.argv.includes('--no-negative-test')){
 const keep=db.moves[0][1];db.moves[0][1]='FORCED_TAMPER';let rejected=false;
 try{checkRows('moves')}catch(e){rejected=/source drift group/.test(e.message)}finally{db.moves[0][1]=keep}
 if(!rejected)throw Error('negative-test failure: corrupted site text was not detected');
 result.negativeTest='PASS';
}
console.log('STAGE27 pinned source sync PASS '+JSON.stringify(result));
