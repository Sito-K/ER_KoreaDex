'use strict';
// Deterministic DOM callback smoke-test. NOT a real browser rendering test.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(process.argv[2]);
const elements=new Map();
class Element {
 constructor(id){this.id=id||'';this.dataset={};this.listeners={};this.innerHTML='';this.textContent='';this.hidden=false;this.value='';this.style={};this.classList={add:()=>{},remove:()=>{},toggle:()=>{}};}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
 insertAdjacentHTML(pos,html){this.innerHTML+=html}
 after(element){if(element.innerHTML.includes('id="loadMore"')){elements.set('loadMore',new Element('loadMore'));elements.set('loadState',new Element('loadState'))}}
 querySelectorAll(){return []} querySelector(){return null}
 focus(){} select(){} setAttribute(){} click(){for(const fn of this.listeners.click??[])fn({target:this})}
}
const ids=['q','grid','empty','count','countLabel','result','title','pokemonFilters','categoryFilters','typeFilters','resetFilters','sortPokemon','detailBackdrop','detailType','detailTitle','detailShort','detailLong','detailShortLabel','detailLongLabel','detailPokemonExtra','detailFormsSection','detailForms','detailClose'];
for(const id of ids)elements.set(id,new Element(id));
const tabs=['pokemon','moves','abilities'].map(v=>{let e=new Element('tab-'+v);e.dataset.view=v;return e});
const body=new Element('body');
const document={getElementById:id=>elements.get(id)||null,querySelectorAll:sel=>sel==='.tab'?tabs:[],createElement:tag=>new Element(tag),addEventListener:()=>{},body};
const window={scrollTo:()=>{}};
const ctx=vm.createContext({document,window,console,setTimeout,clearTimeout,Map,Set,HTMLImageElement:class{}});
function load(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file,timeout:12000})}
body.appendChild=function(s){if(s.src){try{load(s.src.split('?')[0]);s.onload?.()}catch(e){s.onerror?.(e);throw e}}};
for(const f of ['pokemon-data.js','move-meta.js','ability-meta.js','stage6-legacy-maps-items.js','stage5-bridge.js','stage11-source-gaps.js','app-stage13.js'])load(f);
const report={test_type:'JS DOM event callback simulation, not browser',checks:{}};
const get=id=>elements.get(id);
function check(key,fn){let res=fn();report.checks[key]=res||'PASS'}
function tick(){return new Promise(r=>setImmediate(r))}
(async()=>{
 check('initial_pokemon_count',()=>{assert(get('count').textContent.includes('1,938'));assert(get('grid').innerHTML.includes('assets/pokemon/1.png'));return get('count').textContent});
 check('search_bulbasaur',()=>{get('q').value='이상해씨';get('q').listeners.input[0]();assert(get('grid').innerHTML.includes('이상해씨'));assert(!get('grid').innerHTML.includes('파이리'));return 'results filtered'});
 check('pokemon_modal',()=>{const card={dataset:{kind:'pokemon',id:'1'}};get('grid').listeners.click[0]({target:{closest:s=>card}});assert(get('detailBackdrop').hidden===false);assert(get('detailTitle').textContent==='이상해씨');assert(get('detailPokemonExtra').innerHTML.includes('assets/pokemon/1.png'));get('detailClose').listeners.click[0]();return {title:'이상해씨',local_sprite:true}});
 tabs[1].listeners.click[0]();for(let i=0;i<8;i++)await tick();
 check('moves_tab_lazy_override',()=>{assert(get('count').textContent.includes('1,040'),get('count').textContent);assert(get('grid').innerHTML.includes('move-card'));return {count:get('count').textContent}});
 check('moves_modal',()=>{const card={dataset:{kind:'moves',id:'1'}};get('grid').listeners.click[0]({target:{closest:s=>card}});assert(get('detailTitle').textContent==='막치기');assert(get('detailShort').textContent.length>0);get('detailClose').listeners.click[0]();return {name:get('detailTitle').textContent}});
 check('move_1032_source_short_missing',()=>{const card={dataset:{kind:'moves',id:'1032'}};get('grid').listeners.click[0]({target:{closest:s=>card}});assert(get('detailTitle').textContent==='섬뜩한웃음');assert(get('detailShortLabel').textContent.includes('상세 설명으로 대체'));assert(get('detailShort').textContent===get('detailLong').textContent);get('detailClose').listeners.click[0]();return {name:'섬뜩한웃음',fallback_notified:true}});
 tabs[2].listeners.click[0]();for(let i=0;i<8;i++)await tick();
 check('abilities_tab_lazy_override',()=>{assert(get('count').textContent.includes('1,083'),get('count').textContent);assert(get('grid').innerHTML.includes('move-card'));return {count:get('count').textContent}});
 check('abilities_modal',()=>{const card={dataset:{kind:'abilities',id:'1'}};get('grid').listeners.click[0]({target:{closest:s=>card}});assert(get('detailTitle').textContent==='악취');assert(get('detailShort').textContent.length>0);get('detailClose').listeners.click[0]();return {name:get('detailTitle').textContent}});
 check('ability_81_source_long_missing',()=>{const card={dataset:{kind:'abilities',id:'81'}};get('grid').listeners.click[0]({target:{closest:s=>card}});assert(get('detailTitle').textContent==='눈숨기');assert(get('detailLongLabel').textContent.includes('요약 설명으로 대체'));assert(get('detailShort').textContent===get('detailLong').textContent);get('detailClose').listeners.click[0]();return {name:'눈숨기',fallback_notified:true}});
 check('ability_1_genuine_expanded',()=>{const card={dataset:{kind:'abilities',id:'1'}};get('grid').listeners.click[0]({target:{closest:s=>card}});assert(get('detailLongLabel').textContent==='상세 설명');assert(get('detailLong').textContent!==get('detailShort').textContent);get('detailClose').listeners.click[0]();return 'genuine long description distinguished'});
 report.status='PASS';console.log(JSON.stringify(report,null,2));if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
