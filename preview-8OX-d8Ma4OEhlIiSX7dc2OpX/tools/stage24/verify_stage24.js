#!/usr/bin/env node
'use strict';
// STAGE 24 source padding and rendering regression gate.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(process.argv[2]||'.');
const script=fs.readFileSync(path.join(root,'stage19.js'),'utf8');
const dataset=fs.readFileSync(path.join(root,'stage19-data.js'),'utf8');
const ctx={window:{},console,setTimeout,Map,Promise,Number,Array,String};
vm.createContext(ctx);vm.runInContext(dataset,ctx);
const box={id:'stage19SpeciesDetail',hidden:false,innerHTML:''};
ctx.document={querySelector:s=>s==='.detail-body'?{}:null,getElementById:id=>id==='stage19SpeciesDetail'?box:id==='detailBackdrop'?{hidden:false}:id==='detailType'?{textContent:'포켓몬'}:null,addEventListener(){},createElement:()=>({dataset:{}}),body:{appendChild(s){setImmediate(()=>s.onload?.())}}};
vm.runInContext(script,ctx);
const padded=ctx.window.ER_STAGE19_DATA.species.filter(r=>r[1].includes(0)||r[2].includes(0));
(async()=>{if(padded.length!==32)throw Error('unexpected padded species: '+padded.length);
for(const r of padded){ctx.window.ER_STAGE19.show(r[0]);await new Promise(t=>setTimeout(t,12));if(/data-detail-id="0"|특성 #0|#0000/.test(box.innerHTML))throw Error('invalid placeholder '+r[0]);}
const m=ctx.window.ER_STAGE19_DATA.species.find(r=>r[0]===1501);ctx.window.ER_STAGE19.show(1501);await new Promise(t=>setTimeout(t,12));
const n=m[1].length+m[2].length;if(!box.innerHTML.includes('<span>'+n+'</span>'))throw Error('lost legitimate duplicate slots');
console.log('STAGE24 PASS 32 padded records; valid duplicate slots preserved')})().catch(e=>{console.error(e);process.exitCode=1});
