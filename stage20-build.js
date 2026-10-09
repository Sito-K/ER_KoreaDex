const fs=require('fs'),vm=require('vm');
const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
const MOVE_FILES=['moves-1.js','moves-2.js','moves-3.js'];
function load(files){const c={window:{}};vm.createContext(c);for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});return c.window}
function valid(s){s=String(s||'').trim();return !!s&&s!=="'-"&&s!=='-'&&s!=='-------'}
(async()=>{
  const kw=load([...MOVE_FILES,'pokemon-data.js']);
  const web=Array.isArray(kw.ER_POKEMON_DATA)?kw.ER_POKEMON_DATA.filter(r=>Array.isArray(r)&&Number(r[0])>0):[];
  const webBy=new Map(web.map(r=>[Number(r[0]),r]));
  const moveKo=new Map((Array.isArray(kw.ER_MOVES)?kw.ER_MOVES:[]).filter(r=>Array.isArray(r)&&Number(r[0])>0&&valid(r[1])).map(r=>[Number(r[0]),String(r[1]).trim()]));
  const res=await fetch(SOURCE);if(!res.ok)throw Error(`NextDex HTTP ${res.status}`);const g=await res.json();
  const rawSpecies=Array.isArray(g.species)?g.species:[];
  const species=rawSpecies.filter(s=>s&&Number(s.id)>0&&String(s.name||'').trim());
  const moveByToken=new Map((Array.isArray(g.moves)?g.moves:[]).filter(m=>m&&Number(m.id)>0).map(m=>[String(m.NAME||''),Number(m.id)]));
  const ordinaryKinds=new Set(['EVO_LEVEL','EVO_LEVEL_FEMALE','EVO_LEVEL_MALE']);
  const specialKinds=new Set(['EVO_MEGA_EVOLUTION','EVO_MOVE_MEGA_EVOLUTION','EVO_PRIMAL_REVERSION']);
  const rows=new Map(web.map(r=>[Number(r[0]),{id:Number(r[0]),ko:String(r[2]||''),en:String(r[3]||''),ordinaryOut:[],ordinaryIn:[],specialOut:[],specialIn:[]} ]));
  const unknownKinds=[],unresolvedTargets=[],missingSource=[],relations=[];
  let rawRelations=0,ordinaryRelations=0,specialRelations=0,indexToIdRemaps=0;
  for(const s of species){
    const fromId=Number(s.id),fromWeb=webBy.get(fromId);
    if(!fromWeb){missingSource.push({id:fromId,name:s.name});continue}
    const evos=Array.isArray(s.evolutions)?s.evolutions:[];
    for(const e of evos){
      rawRelations++;
      const rawIndex=Number(e.in),targetObj=rawSpecies[rawIndex],targetId=Number(targetObj?.id)||0;
      const kind=String(g.evoKindT?.[Number(e.kd)]||`UNKNOWN_${Number(e.kd)}`),reason=String(e.rs??'');
      if(!targetObj||targetId<=0||!webBy.has(targetId)){
        unresolvedTargets.push({fromId,from:s.name,rawIndex,targetId,targetName:String(targetObj?.name||''),kind,reason});
        continue;
      }
      if(rawIndex!==targetId)indexToIdRemaps++;
      let bucket='';
      if(ordinaryKinds.has(kind)){bucket='ordinary';ordinaryRelations++}
      else if(specialKinds.has(kind)){bucket='special';specialRelations++}
      else {unknownKinds.push({fromId,rawIndex,targetId,kind,reason});continue}
      let reasonKo='';
      if(kind==='EVO_MOVE_MEGA_EVOLUTION'){
        const mid=moveByToken.get(reason)||0;reasonKo=moveKo.get(mid)||'';
      }
      const rel=[targetId,kind,reason,reasonKo];
      const rev=[fromId,kind,reason,reasonKo];
      rows.get(fromId)[bucket+'Out'].push(rel);
      rows.get(targetId)[bucket+'In'].push(rev);
      relations.push([fromId,targetId,kind,reason,reasonKo,rawIndex]);
    }
  }
  const sortRel=a=>a.sort((x,y)=>Number(x[0])-Number(y[0])||String(x[1]).localeCompare(String(y[1]))||String(x[2]).localeCompare(String(y[2])));
  const payloadRows=[...rows.values()].sort((a,b)=>a.id-b.id).map(r=>[r.id,r.ko,r.en,sortRel(r.ordinaryOut),sortRel(r.ordinaryIn),sortRel(r.specialOut),sortRel(r.specialIn)]);
  const withOrdinary=payloadRows.filter(r=>r[3].length||r[4].length).length;
  const withSpecial=payloadRows.filter(r=>r[5].length||r[6].length).length;
  const fatal=missingSource.length||unresolvedTargets.length||unknownKinds.length||payloadRows.length!==web.length||species.length!==web.length;
  const payload={meta:{stage:'STAGE20',source:SOURCE,species:payloadRows.length,rawRelations,ordinaryRelations,specialRelations},species:payloadRows};
  fs.writeFileSync('stage20-data.js',`window.ER_STAGE20_DATA=${JSON.stringify(payload)};\n`);
  const report={stage:'STAGE20',generatedAt:new Date().toISOString(),baseline:'STAGE19 user-confirmed normal',source:SOURCE,counts:{officialSpecies:species.length,webSpecies:web.length,payloadSpecies:payloadRows.length,rawRelations,displayRelations:relations.length,ordinaryRelations,specialRelations,indexToIdRemaps,withOrdinary,withSpecial,missingSource:missingSource.length,unresolvedTargets:unresolvedTargets.length,unknownKinds:unknownKinds.length},ordinaryKinds:[...ordinaryKinds],specialKinds:[...specialKinds],missingSource,unresolvedTargets,unknownKinds,samples:{bulbasaur:relations.filter(r=>r[0]===1),snorunt:relations.filter(r=>r[0]===361),blastoise:relations.filter(r=>r[0]===9),rayquaza:relations.filter(r=>r[0]===384),kyogre:relations.filter(r=>r[0]===382)}};
  fs.writeFileSync('stage20-audit.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.counts,null,2));
  console.log(JSON.stringify(report.samples,null,2));
  if(unresolvedTargets.length)console.log('UNRESOLVED',JSON.stringify(unresolvedTargets,null,2));
  if(unknownKinds.length)console.log('UNKNOWN',JSON.stringify(unknownKinds,null,2));
  if(fatal)throw Error('STAGE20 evolution audit has unresolved mappings');
})();
