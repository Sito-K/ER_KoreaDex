const fs=require('fs'),vm=require('vm');
const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
const MOVE_FILES=['moves-1.js','moves-2.js','moves-3.js'];
const ABI_FILES=['abilities-1.js','abilities-2.js','abilities-3.js','ability-stage18.js'];
function load(files){const c={window:{}};vm.createContext(c);for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});return c.window}
function rowsMap(a){return new Map((Array.isArray(a)?a:[]).filter(r=>Array.isArray(r)&&Number(r[0])>0).map(r=>[Number(r[0]),String(r[1]||'').trim()]))}
function valid(s){s=String(s||'').trim();return !!s&&s!=="'-"&&s!=='-'&&s!=='-------'}
function uniq(a){return [...new Set(a)]}
(async()=>{
  const kw=load([...MOVE_FILES,...ABI_FILES,'pokemon-data.js']);
  const moveKo=rowsMap(kw.ER_MOVES),abilityKo=rowsMap(kw.ER_ABILITIES);
  const webRows=Array.isArray(kw.ER_POKEMON_DATA)?kw.ER_POKEMON_DATA:[];
  const webBy=new Map(webRows.filter(r=>Array.isArray(r)&&Number(r[0])>0).map(r=>[Number(r[0]),r]));
  const res=await fetch(SOURCE);if(!res.ok)throw Error(`NextDex HTTP ${res.status}`);const g=await res.json();
  const moves=(Array.isArray(g.moves)?g.moves:[]).filter(x=>x&&Number(x.id)>0&&String(x.name||'').trim()&&String(x.NAME||'')!=='MOVE_NONE');
  const abilities=(Array.isArray(g.abilities)?g.abilities:[]).filter(x=>x&&Number(x.id)>0&&String(x.name||'').trim()&&String(x.name||'').trim()!=='-------');
  const species=(Array.isArray(g.species)?g.species:[]).filter(x=>x&&Number(x.id)>0&&String(x.name||'').trim());
  const moveBy=new Map(moves.map(x=>[Number(x.id),x])),abilityBy=new Map(abilities.map(x=>[Number(x.id),x]));
  const offBy=new Map(species.map(x=>[Number(x.id),x]));
  const missingSpecies=species.filter(x=>!webBy.has(Number(x.id))).map(x=>({id:Number(x.id),name:x.name,NAME:x.NAME||''}));
  const extraSpecies=[...webBy.keys()].filter(id=>!offBy.has(id)).map(id=>({id,ko:String(webBy.get(id)?.[2]||''),en:String(webBy.get(id)?.[3]||'')}));
  const usedMove=new Set(),usedAbility=new Set();
  const data=[];
  let withAbilities=0,withInnates=0,withLevelUp=0,withTMHM=0,withTutor=0,withEgg=0;
  let abilityRefs=0,innateRefs=0,levelRefs=0,tmhmRefs=0,tutorRefs=0,eggRefs=0;
  for(const s of species){
    const st=s.stats||{};
    const abis=uniq((Array.isArray(st.abis)?st.abis:[]).map(Number).filter(x=>x>0));
    const inns=uniq((Array.isArray(st.inns)?st.inns:[]).map(Number).filter(x=>x>0));
    const level=(Array.isArray(s.levelUpMoves)?s.levelUpMoves:[]).map(x=>[Number(x.lv)||0,Number(x.id)||0]).filter(x=>x[1]>0);
    const tmhm=uniq((Array.isArray(s.TMHMMoves)?s.TMHMMoves:[]).map(Number).filter(x=>x>0));
    const tutor=uniq((Array.isArray(s.tutor)?s.tutor:[]).map(Number).filter(x=>x>0));
    const egg=uniq((Array.isArray(s.eggMoves)?s.eggMoves:[]).map(Number).filter(x=>x>0));
    abis.forEach(x=>usedAbility.add(x));inns.forEach(x=>usedAbility.add(x));
    level.forEach(x=>usedMove.add(x[1]));tmhm.forEach(x=>usedMove.add(x));tutor.forEach(x=>usedMove.add(x));egg.forEach(x=>usedMove.add(x));
    if(abis.length)withAbilities++;if(inns.length)withInnates++;if(level.length)withLevelUp++;if(tmhm.length)withTMHM++;if(tutor.length)withTutor++;if(egg.length)withEgg++;
    abilityRefs+=abis.length;innateRefs+=inns.length;levelRefs+=level.length;tmhmRefs+=tmhm.length;tutorRefs+=tutor.length;eggRefs+=egg.length;
    data.push([Number(s.id),abis,inns,level,tmhm,tutor,egg]);
  }
  const moveMissingOfficial=[...usedMove].filter(id=>!moveBy.has(id)).sort((a,b)=>a-b);
  const moveMissingKorean=[...usedMove].filter(id=>!valid(moveKo.get(id))).sort((a,b)=>a-b);
  const abilityMissingOfficial=[...usedAbility].filter(id=>!abilityBy.has(id)).sort((a,b)=>a-b);
  const abilityMissingKorean=[...usedAbility].filter(id=>!valid(abilityKo.get(id))).sort((a,b)=>a-b);
  const fatal=missingSpecies.length||extraSpecies.length||moveMissingOfficial.length||moveMissingKorean.length||abilityMissingOfficial.length||abilityMissingKorean.length;
  const payload={meta:{stage:'STAGE19',source:SOURCE,species:data.length,moves:moveKo.size,abilities:abilityKo.size},moveNames:[...moveKo].filter(([id,n])=>id>0&&valid(n)).sort((a,b)=>a[0]-b[0]),abilityNames:[...abilityKo].filter(([id,n])=>id>0&&valid(n)).sort((a,b)=>a[0]-b[0]),species:data};
  fs.writeFileSync('stage19-data.js',`window.ER_STAGE19_DATA=${JSON.stringify(payload)};\n`);
  const report={stage:'STAGE19',generatedAt:new Date().toISOString(),baseline:'STAGE18 user-confirmed normal',source:SOURCE,counts:{officialSpecies:species.length,webSpecies:webBy.size,matchedSpecies:species.length-missingSpecies.length,missingSpecies:missingSpecies.length,extraSpecies:extraSpecies.length,usedMoveIds:usedMove.size,usedAbilityIds:usedAbility.size,moveMissingOfficial:moveMissingOfficial.length,moveMissingKorean:moveMissingKorean.length,abilityMissingOfficial:abilityMissingOfficial.length,abilityMissingKorean:abilityMissingKorean.length,withAbilities,withInnates,withLevelUp,withTMHM,withTutor,withEgg,abilityRefs,innateRefs,levelRefs,tmhmRefs,tutorRefs,eggRefs},missingSpecies,extraSpecies,moveMissingOfficial,moveMissingKorean,abilityMissingOfficial,abilityMissingKorean};
  fs.writeFileSync('stage19-audit.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.counts,null,2));
  if(fatal)throw Error('STAGE19 audit has unresolved references');
})();
