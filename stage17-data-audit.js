const fs=require('fs'),vm=require('vm');

const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
const TYPE_KO={NORMAL:'노말',FIRE:'불꽃',WATER:'물',GRASS:'풀',ELECTRIC:'전기',ICE:'얼음',FIGHTING:'격투',POISON:'독',GROUND:'땅',FLYING:'비행',PSYCHIC:'에스퍼',BUG:'벌레',ROCK:'바위',GHOST:'고스트',DRAGON:'드래곤',DARK:'악',STEEL:'강철',FAIRY:'페어리',STELLAR:'스텔라',MYSTERY:'???',NONE:''};
function load(path){const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path,'utf8'),c,{filename:path});return c.window;}
function typeKo(v){const k=String(v??'').replace(/^TYPE_/,'').trim().toUpperCase().replace(/[ -]+/g,'_');return TYPE_KO[k]??String(v??'');}
function appMega(row){const token=String(row[14]||''),sprite=String(row[4]||'');return /^MEGA(?:_[XY])?$/.test(token)||/_MEGA(?:_[XY])?$/.test(sprite);}
function officialMega(m){const name=String(m.name||''),sprite=String(m.NAME||'').replace(/^SPECIES_/,'');return /(?:^|\s)Mega(?:\s|$)/i.test(name)||/(?:^|_)MEGA(?:_|$)/.test(sprite);}
function canonTypes(m,typeTable){const raw=Array.isArray(m?.stats?.types)?m.stats.types:[];return [...new Set(raw.map(v=>typeof v==='number'?typeTable[v]:v).map(typeKo).filter(Boolean))];}
function canonStats(m){const base=Array.isArray(m?.stats?.base)?m.stats.base.slice(0,6).map(v=>Number(v)||0):[];return base.length===6?base:[];}

(async()=>{
  const w=load('pokemon-data.js'),rows=w.ER_POKEMON_DATA||[];
  if(rows.length!==1922)throw Error(`expected 1922 current rows, got ${rows.length}`);
  const res=await fetch(SOURCE);if(!res.ok)throw Error(`NextDex HTTP ${res.status}`);const g=await res.json();
  const typeTable=Array.isArray(g.typeT)?g.typeT:[];
  const mons=(Array.isArray(g.species)?g.species:[]).filter(m=>m&&m.name&&Number(m?.dex?.id)>0&&Number(m.id)>0);
  if(mons.length!==1922)throw Error(`expected 1922 official rows, got ${mons.length}`);
  const cur=new Map(rows.map(r=>[Number(r[0]),r])),off=new Map(mons.map(m=>[Number(m.id),m]));
  const duplicateCurrent=rows.filter((r,i,a)=>a.findIndex(x=>Number(x[0])===Number(r[0]))!==i).map(r=>Number(r[0]));
  const missingCurrent=mons.filter(m=>!cur.has(Number(m.id))).map(m=>({id:+m.id,name:m.name,NAME:m.NAME,dex:+m.dex.id}));
  const extraCurrent=rows.filter(r=>!off.has(Number(r[0]))).map(r=>({id:+r[0],en:r[3],sprite:r[4],dex:+r[1]}));
  const identity=[],types=[],stats=[],megaClass=[],formInvariant=[],officialIncomplete=[];
  for(const m of mons){
    const id=Number(m.id),r=cur.get(id);if(!r)continue;
    const expectedSprite=String(m.NAME||'').replace(/^SPECIES_/,'');
    const identityDiff={};
    if(Number(r[1])!==Number(m.dex.id))identityDiff.dex={current:Number(r[1]),official:Number(m.dex.id)};
    if(String(r[3])!==String(m.name||''))identityDiff.en={current:String(r[3]),official:String(m.name||'')};
    if(String(r[4])!==expectedSprite)identityDiff.sprite={current:String(r[4]),official:expectedSprite};
    if(Object.keys(identityDiff).length)identity.push({id,...identityDiff});
    const ot=canonTypes(m,typeTable),ct=[String(r[5]||''),String(r[6]||'')].filter(Boolean);
    if(!ot.length)officialIncomplete.push({id,name:m.name,kind:'types',raw:m?.stats?.types??null});
    else if(JSON.stringify(ct)!==JSON.stringify(ot))types.push({id,name:m.name,current:ct,official:ot,raw:m.stats.types});
    const os=canonStats(m),cs=[7,8,9,10,11,12].map(i=>Number(r[i])||0);
    if(os.length<6||os.some(v=>v<=0))officialIncomplete.push({id,name:m.name,kind:'stats',raw:m?.stats?.base??null});
    else if(JSON.stringify(cs)!==JSON.stringify(os))stats.push({id,name:m.name,current:cs,official:os});
    const om=officialMega(m),cm=appMega(r);
    if(om!==cm)megaClass.push({id,name:m.name,sprite:expectedSprite,token:String(r[14]||''),currentCategory:cm?'mega':(r[13]?'form':'base'),officialMega:om});
    const token=String(r[14]||'');
    if(Boolean(r[13])!==Boolean(token))formInvariant.push({id,name:m.name,isForm:Boolean(r[13]),token});
  }
  const counts={current:rows.length,official:mons.length,duplicateCurrent:duplicateCurrent.length,missingCurrent:missingCurrent.length,extraCurrent:extraCurrent.length,identityMismatch:identity.length,typeMismatch:types.length,statMismatch:stats.length,megaClassMismatch:megaClass.length,formInvariantMismatch:formInvariant.length,officialIncomplete:officialIncomplete.length};
  const audit={stage:'STAGE17_AUDIT',generatedAt:new Date().toISOString(),baseline:'STAGE16 user-confirmed normal',source:SOURCE,counts,duplicateCurrent,missingCurrent,extraCurrent,identity,types,stats,megaClass,formInvariant,officialIncomplete};
  fs.writeFileSync('stage17-data-audit.json',JSON.stringify(audit,null,2)+'\n');
  console.log(JSON.stringify(counts,null,2));
  if(megaClass.length)console.log('megaClass',JSON.stringify(megaClass,null,2));
  if(officialIncomplete.length)console.log('officialIncomplete',JSON.stringify(officialIncomplete,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
