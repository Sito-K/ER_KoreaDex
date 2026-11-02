'use strict';
// Isolated mock UI: checks Stage25 markup, not equivalent to a real browser.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(process.argv[2]||'.');
const elems=new Map();
class El {
  constructor(id=''){this.id=id;this.hidden=true;this.innerHTML='';this.textContent='';this.style={};this.dataset={};this.classList={add(){},remove(){}};this.listeners={};this.scrollTop=0;}
  querySelector(selector){const name=selector.slice(1);if(selector==='section.s25-reference-dialog')return this;if(selector==='.s25-reference-dialog')return this;if(!elems.has(name))elems.set(name,new El(name));return elems.get(name)}
  addEventListener(type,cb){this.listeners[type]=cb}
  focus(){}
}
const body=new El('body'),document={body,activeElement:new El('active'),getElementById(id){return elems.get(id)||null},querySelector(){return null},createElement(tag){return new El(tag)},addEventListener(){} };
body.appendChild=el=>{if(el.id)elems.set(el.id,el);if(el.src){try{load(el.src.split("?")[0]);el.onload?.()}catch(err){el.onerror?.(err);throw err}}};
const window={};const ctx=vm.createContext({window,document,console,Map,Set,Promise});
const load=name=>{let code=fs.readFileSync(path.join(root,name),'utf8');vm.runInContext(code,ctx,{filename:name,timeout:30000})};
for(const x of ['stage11-source-gaps.js','move-meta.js','ability-meta.js','stage25-detail-data.js','stage25.js'])load(x);
async function open(kind,id){window.ER_STAGE25_DETAIL.open(kind,id);for(let n=0;n<4;n++)await Promise.resolve();return elems.get('s25ReferenceBody').innerHTML}
(async()=>{
  let a=await open('moves',1032);assert(a.includes('요약 설명 (원문 공란 · 상세 설명으로 대체)'));
  assert(a.includes('섬뜩한 웃음'));
  let b=await open('abilities',81);assert(b.includes('상세 설명 (원문 공란 · 요약 설명으로 대체)'));
  let c=await open('abilities',1);assert(c.includes('<h3>상세 설명</h3>')&&!c.includes('상세 설명 (원문 공란'));
  const r={result:'PASS',test_type:'Node mock DOM, not real browser',cases:['move 1032 missing short source','ability 81 missing expanded source','ability 1 genuine expanded source']};
  console.log(JSON.stringify(r,null,2));if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(r,null,2)+'\n');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
