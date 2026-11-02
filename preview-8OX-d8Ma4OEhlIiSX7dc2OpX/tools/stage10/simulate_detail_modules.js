'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(process.argv[2]);const elems=new Map();
class E {constructor(tag='section'){this.tag=tag;this._id='';this.listeners={};this.innerHTML='';this.hidden=false;this.dataset={};this.classList={add:()=>{},remove:()=>{}}} set id(x){this._id=x;elems.set(x,this)} get id(){return this._id}
 addEventListener(kind,fn){(this.listeners[kind]??=[]).push(fn)} insertAdjacentElement(pos,node){if(node.id)elems.set(node.id,node)} prepend(node){if(node.id)elems.set(node.id,node)} appendChild(node){if(node.id)elems.set(node.id,node)} querySelector(){return null}}
for(const id of ['detailPokemonExtra','detailForms']){let e=new E();e.id=id}
const body=new E(),detailBody=new E();
const document={body,getElementById:id=>elems.get(id)||null,querySelector:sel=>sel==='.detail-body'?detailBody:null,createElement:tag=>new E(tag),addEventListener:()=>{}};
const window={};const ctx=vm.createContext({window,document,console,setTimeout,clearTimeout,Map,Set});
function load(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file,timeout:30000})}
body.appendChild=function(node){if(node.src){try{load(node.src.split('?')[0]);node.onload?.()}catch(e){node.onerror?.(e);throw e}}};
for(const f of ['stage6-legacy-maps-items.js','stage22-map-ko.js','stage26-item-names.js','stage19.js','stage20.js','stage21.js'])load(f);
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
const result={simulation:'Node VM mocked DOM (not Chromium)',checks:{}};
window.ER_STAGE19.show(1);for(let i=0;i<6;i++)await tick();let ab=elems.get('stage19SpeciesDetail');assert(ab&&ab.innerHTML.includes('이상해씨')===false);assert(ab.innerHTML.includes('특성'));assert(!ab.innerHTML.includes('불러오지 못했습니다'));result.checks.stage19={success:true,length:ab.innerHTML.length};
window.ER_STAGE20.show(1);for(let i=0;i<6;i++)await tick();let ev=elems.get('stage20EvolutionDetail');assert(ev&&ev.innerHTML.includes('Lv.16'));assert(!ev.innerHTML.includes('불러오지 못했습니다'));result.checks.stage20={success:true,has_level_16:true};
window.ER_STAGE21.show(263);for(let i=0;i<6;i++)await tick();let wild=elems.get('stage21EncounterDetail');assert(wild&&wild.innerHTML);if(wild.innerHTML.includes('확인된 야생 출현 정보 없음')){let d=window.ER_STAGE21_DATA;let row=d.species.find(s=>s[3].some(e=>e[1]===316));assert(row);window.ER_STAGE21.show(row[0]);await tick();} assert(wild.innerHTML.includes('101번도로'));assert(!wild.innerHTML.includes('불러오지 못했습니다'));result.checks.stage21={success:true,contains_ko_route_101:true};
assert(window.ER_STAGE6_LEGACY.maps===200);assert(window.ER_STAGE6_LEGACY.items===281);result.checks.legacy_ko_watchers={maps:200,items:281};result.status='PASS';console.log(JSON.stringify(result,null,2));if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n')})().catch(e=>{console.error(e.stack);process.exitCode=1});
