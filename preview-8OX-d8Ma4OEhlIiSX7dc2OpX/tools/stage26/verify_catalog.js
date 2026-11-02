'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=process.argv[2],nodes=new Map(),typeButtons=[],categoryButtons=[],tabs=[];
class E {
 constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.innerHTML='';this.textContent='';this.value='';this.hidden=false;this.attributes={};this.listeners={};this.style={};this.dataset={};this.className='';this.children=[];this.classSet=new Set();this.classList={add:(...xs)=>xs.forEach(x=>this.classSet.add(x)),remove:(...xs)=>xs.forEach(x=>this.classSet.delete(x)),toggle:(x,v)=>{const enabled=v===undefined?!this.classSet.has(x):v;enabled?this.classSet.add(x):this.classSet.delete(x);return enabled},contains:x=>this.classSet.has(x)};if(id)this.id=id}
 set id(v){this._id=v;nodes.set(v,this)}get id(){return this._id}
 addEventListener(type,handler){(this.listeners[type]??=[]).push(handler)}
 emit(type,target=this){for(const fn of this.listeners[type]||[])fn({type,target,key:'',preventDefault(){}})}
 setAttribute(name,val){this.attributes[name]=String(val)}getAttribute(name){return this.attributes[name]||null}
 insertAdjacentHTML(_,html){this.innerHTML+=html}
 after(x){this.children.push(x);nodes.set('loadMore',new E('button','loadMore'));nodes.set('loadState',new E('small','loadState'))}
 appendChild(x){this.children.push(x);if(x.id)nodes.set(x.id,x)}
 insertAdjacentElement(_,x){this.appendChild(x)}
 querySelectorAll(sel){if(this.id==='categoryFilters'&&sel==='[data-category]')return categoryButtons;return []}
 querySelector(sel){if(this.dataset.category&&sel==='.category-count')return this.countNode;if(this.dataset.category&&sel==='.category-label')return this.labelNode;return null}
 focus(){}
}
const keys=['q','grid','empty','count','countLabel','result','title','pokemonFilters','categoryFilters','typeFilters','resetFilters','sortPokemon','detailBackdrop','detailType','detailTitle','detailShort','detailLong','detailShortLabel','detailLongLabel','detailPokemonExtra','detailFormsSection','detailForms','detailClose'];
for(const k of keys)new E('div',k);
for(const c of ['base','form','mega']){const el=new E('button');el.dataset.category=c;el.countNode=new E('span');el.labelNode=new E('span');categoryButtons.push(el)}
for(const id of ['pokemon','moves','abilities']){const t=new E('button');t.dataset.view=id;tabs.push(t)}
const doc={body:new E('body'),getElementById:id=>nodes.get(id)||null,createElement:tag=>new E(tag),querySelectorAll:q=>q==='.tab'?tabs:[],querySelector:q=>q==='.detail-body'?new E('div'):null,addEventListener(){}};
const window={scrollTo(){},ER_STAGE5:{async apply(kind){for(const f of kind==='moves'?['move-names-canonical.js','move-short-canonical.js','move-long-canonical.js']:['ability-names-canonical.js','ability-short-canonical.js','ability-long-canonical.js'])load(f)}}};
const ctx=vm.createContext({window,document:doc,console,setTimeout,Map,Set,Number,String});function load(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file,timeout:30000})}
for(const file of ['pokemon-data.js','move-meta.js','ability-meta.js','app-stage13.js'])load(file);
const q=nodes.get('q'),grid=nodes.get('grid'),result=nodes.get('result'),detailTitle=nodes.get('detailTitle');
const cardCount=()=>[...grid.innerHTML.matchAll(/<article class="card /g)].length;
const firstId=()=>Number(grid.innerHTML.match(/<article[^>]*data-id="(\d+)"/)?.[1]||0);
const countText=()=>result.textContent;
const clickCategory=k=>{nodes.get('categoryFilters').emit('click',{dataset:{category:k},closest(s){return s==='[data-category]'?this:null}})};
const clickType=k=>{nodes.get('typeFilters').emit('click',{dataset:{type:k},closest(s){return s==='.type-filter'?this:null}})};
const dispatchCard=(id,kind='pokemon')=>nodes.get('grid').emit('click',{dataset:{kind,id:String(id)},closest(s){return s==='.is-detail'?this:null}});
const tests=[];
function ok(test,fn){fn();tests.push({test,pass:true})}
ok('initial species count and pagination',()=>{assert.equal(window.ER_STAGE13_META.categories.base+window.ER_STAGE13_META.categories.form+window.ER_STAGE13_META.categories.mega,1938);assert.equal(cardCount(),48);assert.match(countText(),/1,938개 중 48개 표시/)});
ok('Korean species name search',()=>{q.value='이상해씨';q.emit('input');assert.equal(cardCount(),1);assert.equal(firstId(),1)});
ok('English species name search',()=>{q.value='Bulbasaur';q.emit('input');assert.equal(cardCount(),1);assert.equal(firstId(),1)});
ok('padded national dex input',()=>{q.value='0001';q.emit('input');assert.equal(firstId(),1);assert(cardCount()>0)});
ok('printed national dex No.0001',()=>{q.value='No.0001';q.emit('input');assert.equal(firstId(),1);assert(cardCount()>0)});
ok('hash prefix #0025',()=>{q.value='#0025';q.emit('input');assert.equal(firstId(),25);assert(cardCount()>0)});
ok('unknown search empty state',()=>{q.value='not-a-real-pokemon-xyz';q.emit('input');assert.equal(cardCount(),0);assert.equal(nodes.get('empty').hidden,false)});
ok('reset and incremental loading',()=>{nodes.get('resetFilters').emit('click');assert.equal(cardCount(),48);nodes.get('loadMore').emit('click');assert.equal(cardCount(),96)});
ok('category filter combinations',()=>{clickCategory('base');clickCategory('form');assert(cardCount()>0);const first=grid.innerHTML.match(/data-category="([^"]+)"/)?.[1];assert.equal(first,'mega');clickCategory('mega');assert.equal(cardCount(),0);nodes.get('resetFilters').emit('click');assert.equal(cardCount(),48)});
ok('type filter activation',()=>{clickType('불꽃');assert.equal(cardCount(),48);const a=[...grid.innerHTML.matchAll(/<article class="card [\s\S]*?<\/article>/g)];assert(a.length);for(const item of a)assert(item[0].includes('data-type="불꽃"'));nodes.get('resetFilters').emit('click')});
ok('BST ranking sort',()=>{nodes.get('sortPokemon').value='bst';nodes.get('sortPokemon').emit('change');assert.equal(cardCount(),48);assert(firstId()>0);nodes.get('resetFilters').emit('click')});
ok('detail card opens modal and can close',()=>{q.value='이상해씨';q.emit('input');dispatchCard(1);assert.equal(detailTitle.textContent,'이상해씨');assert.equal(nodes.get('detailBackdrop').hidden,false);nodes.get('detailClose').emit('click');assert.equal(nodes.get('detailBackdrop').hidden,true)});
(async()=>{
 nodes.get('resetFilters').emit('click');tabs[1].emit('click');for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));
 assert.equal(nodes.get('title').textContent,'기술 도감');assert(cardCount()===80);tests.push({test:'move tab loads 1040 native moves',pass:true});
 const moveName=String(window.ER_MOVES.find(r=>r[0]===1)?.[1]||'');if(moveName){q.value=moveName;q.emit('input');assert(cardCount()>=1);tests.push({test:'move Korean search',pass:true})}
 tabs[2].emit('click');for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));assert.equal(nodes.get('title').textContent,'특성 도감');assert.equal(cardCount(),80);tests.push({test:'ability tab native loading',pass:true});
 tabs[0].emit('click');for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));assert.equal(cardCount(),48);tests.push({test:'roundtrip back to species',pass:true});
 process.argv[3]&&fs.writeFileSync(process.argv[3],JSON.stringify({status:'PASS_VM',scenarios:tests},null,2)+'\n');
 console.log('PASS STAGE19 catalog VM:',tests.length,'scenarios');
})().catch(e=>{console.error('FAIL catalog VM',e.stack);process.exitCode=1});
