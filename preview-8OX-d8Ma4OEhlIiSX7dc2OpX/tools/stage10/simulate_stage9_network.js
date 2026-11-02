'use strict';
// Deterministic network-graph test: staged HTML all scripts and lazy loader requests.
// This is NOT a real browser test.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..','deploy-candidate'));
const loaded=[],dynamic=[];
class E {
 constructor(){this.listeners={};this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.hidden=false;this.innerHTML='';this.textContent='';this.value='';this.style={}}
 addEventListener(t,f){(this.listeners[t]??=[]).push(f)}
 insertAdjacentHTML(_,s){this.innerHTML+=s}
 querySelectorAll(){return []}
 querySelector(){return null}
 after(element){if(element.innerHTML.includes('id="loadMore"')){elems.set('loadMore',new E());elems.set('loadState',new E());}}
 focus(){}setAttribute(){}
}
const names=['q','grid','empty','count','countLabel','result','title','pokemonFilters','categoryFilters','typeFilters','resetFilters','sortPokemon','detailBackdrop','detailType','detailTitle','detailShort','detailLong','detailShortLabel','detailLongLabel','detailPokemonExtra','detailFormsSection','detailForms','detailClose'];
const elems=new Map(names.map(n=>[n,new E()]));
const tabs=['pokemon','moves','abilities'].map(n=>{const x=new E();x.dataset.view=n;return x});
const body=new E(),doc={body,getElementById:n=>elems.get(n)||null,querySelectorAll:s=>s==='.tab'?tabs:[],createElement:()=>new E(),addEventListener(){}};
const w={scrollTo(){}};
const context=vm.createContext({window:w,document:doc,console,setTimeout,clearTimeout,Map,Set,HTMLImageElement:class{}});
function load(f){assert(fs.existsSync(path.join(root,f)),f+' missing');vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f,timeout:10000});loaded.push(f)}
body.appendChild=s=>{if(s.src){const f=s.src.split('?')[0];dynamic.push(f);try{load(f);s.onload?.()}catch(e){s.onerror?.(e);throw e}}};
// The application uses a specific dependency order. External old species/form files are intentionally absent.
for(const f of ['pokemon-data.js','move-meta.js','ability-meta.js','stage6-legacy-maps-items.js','stage5-bridge.js','app-stage13.js'])load(f);
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 assert(elems.get('count').textContent.includes('1,938'));
 tabs[1].listeners.click[0]();for(let i=0;i<10;i++)await tick();
 assert(elems.get('count').textContent.includes('1,040'));
 tabs[2].listeners.click[0]();for(let i=0;i<10;i++)await tick();
 assert(elems.get('count').textContent.includes('1,083'));
 const expected=['move-names-canonical.js','move-short-canonical.js','move-long-canonical.js','ability-names-canonical.js','ability-short-canonical.js','ability-long-canonical.js'];
 assert.deepStrictEqual(dynamic,expected,'unexpected legacy JS requested');
 const result={stage:'STAGE9',kind:'Node DOM/mock network requests (not real browser)',initial_pokemon:1938,moves:1040,abilities:1083,dynamic_requests:dynamic,noncanonical_requests:0,status:'PASS'};
 console.log(JSON.stringify(result,null,2));
 fs.writeFileSync(path.join(__dirname,'..','stage9-network-audit.json'),JSON.stringify(result,null,2)+'\n');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
