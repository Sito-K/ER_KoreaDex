#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(process.argv[2]||'.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'STAGE30_NAME_DISAMBIGUATION_AUDIT.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=['pokemon-data.js','species-name-overrides-v01.js','stage30-name-disambiguation.js'];
const pos=n=>html.indexOf('src="'+n);
if(scripts.some(n=>pos(n)<0)||pos('app-stage13.js')<0||!(pos(scripts[0])<pos(scripts[1])&&pos(scripts[1])<pos(scripts[2])&&pos(scripts[2])<pos('app-stage13.js')))throw Error('script ordering');
const content=scripts.map(n=>fs.readFileSync(path.join(root,n),'utf8'));
function run(count){const errors=[];const ctx={window:{},console:{error:(...args)=>errors.push(args.map(String).join(' ')),log:()=>{}}};vm.createContext(ctx);for(let i=0;i<count;i++)vm.runInContext(content[i],ctx,{filename:scripts[i]});return {ctx,errors}}
function countCollisions(rows){const m=new Map();for(const r of rows)m.set(r[2],(m.get(r[2])||0)+1);const g=[...m].filter(x=>x[1]>1);return [g.length,g.reduce((a,x)=>a+x[1],0)]}
const base=run(2),baseRows=base.ctx.window.ER_POKEMON_DATA;
if(baseRows.length!==1938||JSON.stringify(countCollisions(baseRows))!=='[10,22]')throw Error('stage29 baseline drift');
const current=run(3),rows=current.ctx.window.ER_POKEMON_DATA;
if(current.errors.length||rows.length!==1938||JSON.stringify(countCollisions(rows))!=='[0,0]')throw Error('unresolved name collisions');
const oldById=new Map(baseRows.map(r=>[r[0],r]));let namesOnlyChanges=0;
for(const r of rows){const old=oldById.get(r[0]);if(!old||r.length!==old.length)throw Error('species identity changed');for(let j=0;j<r.length;j++)if(r[j]!==old[j]){if(j!==2)throw Error('source field was modified at '+r[0]);namesOnlyChanges++;}}
if(namesOnlyChanges!==12)throw Error('wrong number of edited names '+namesOnlyChanges);
for(const item of manifest.rows){const r=rows.find(r=>r[0]===item.id);if(!r||r[2]!==item.newName||r[4]!==item.expectedSymbol||oldById.get(r[0])[2]!==item.expectedName||current.ctx.window.ER_SPECIES_NAME_OVERRIDES?.[r[0]]!==r[2])throw Error('name override conflict '+item.id);}
const corrupt=run(2),bad=corrupt.ctx.window.ER_POKEMON_DATA.find(r=>r[0]===1740);bad[4]='TAMPER_BAD_SYMBOL';const snapshot=JSON.stringify(corrupt.ctx.window.ER_POKEMON_DATA);vm.runInContext(content[2],corrupt.ctx);
if(!corrupt.errors.some(x=>x.includes('source-id/name mismatch'))||snapshot!==JSON.stringify(corrupt.ctx.window.ER_POKEMON_DATA))throw Error('tamper check not atomic');
console.log('STAGE30 PASS: 1938 species, 12 display-only overrides, zero duplicates, fields unchanged; source tamper is atomically rejected');
