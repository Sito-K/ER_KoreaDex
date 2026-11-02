#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(process.argv[2]||'.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'STAGE31_CUSTOM_NAME_AUDIT.json'),'utf8'));
const errors=[],context={window:{},console:{error:(...xs)=>errors.push(xs.join(' ')),log:()=>{}}};vm.createContext(context);
for(const f of ['pokemon-data.js','species-name-overrides-v01.js','stage30-name-disambiguation.js','stage20-data.js','stage21-data.js']){
 vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
}
const catalog=context.window.ER_POKEMON_DATA,evolution=context.window.ER_STAGE20_DATA.species,acquisition=context.window.ER_STAGE21_DATA.species;
const [a,b,c]=[catalog,evolution,acquisition].map(x=>new Map(x.map(r=>[Number(r[0]),r])));
function assert(x,m){if(!x)throw Error(m)}
assert(!errors.length,'stage30 runtime errors: '+errors);
assert(catalog.length===1938&&evolution.length===1938&&acquisition.length===1938,'species count drift');
assert(a.size===1938&&b.size===1938&&c.size===1938,'duplicate species ID');
assert(manifest.rows.length===8,'review item count');
const app=fs.readFileSync(path.join(root,'app-stage13.js'),'utf8');
assert(app.includes('x.ko.toLocaleLowerCase')&&app.includes('x.en.toLowerCase().includes(term)'),'Korean/English search support changed');
for(const rec of manifest.rows){
 const [base,evo,enc]=[a.get(rec.id),b.get(rec.id),c.get(rec.id)];
 assert(base&&evo&&enc,'missing species row '+rec.id);
 assert(base[13]===0,'unexpected form flag '+rec.id);
 assert('SPECIES_'+base[4]===rec.symbol&&enc[2]===rec.symbol,'symbol mismatch '+rec.id);
 assert(base[2]===rec.korean&&evo[1]===rec.korean&&enc[1]===rec.korean,'Korean display mismatch '+rec.id);
 assert(base[3]===rec.english&&evo[2]===rec.english,'English name mismatch '+rec.id);
 assert(!Object.hasOwn(context.window.ER_SPECIES_NAME_OVERRIDES||{},rec.id),'unexpected name override '+rec.id);
}
const counts=new Map();for(const row of catalog)counts.set(row[2],(counts.get(row[2])||0)+1);
assert([...counts.values()].every(n=>n===1),'duplicate final labels after STAGE30');
const target=a.get(2334),backup=target[2];target[2]='STAGE31_TAMPER';let rejected=false;
try{assert(target[2]===manifest.rows.find(x=>x.id===2334).korean,'tamper check')}catch(e){rejected=true}finally{target[2]=backup}
assert(rejected,'negative test failed');
console.log('STAGE31 PASS: 8/8 labels and English names aligned in three 1938-row datasets; no duplicate rendered names; tamper test PASS');
