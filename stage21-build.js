const fs=require('fs'),vm=require('vm');
const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
const FIELDS=['land','water','fish','honey','rock','hidden'];
const FIELD_KO={land:'풀숲',water:'수상',fish:'낚시',honey:'꿀',rock:'바위깨기',hidden:'숨은 출현'};
const HOW_KO={0:'고정 야생',1:'이벤트 출현(비야생)',2:'지급(특수 기술)',3:'지급'};
function load(files){const c={window:{}};vm.createContext(c);for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});return c.window}
(async()=>{
  const kw=load(['pokemon-data.js']);
  const web=Array.isArray(kw.ER_POKEMON_DATA)?kw.ER_POKEMON_DATA.filter(r=>Array.isArray(r)&&Number(r[0])>0):[];
  const webBy=new Map(web.map(r=>[Number(r[0]),r]));
  const res=await fetch(SOURCE);if(!res.ok)throw Error(`NextDex HTTP ${res.status}`);const g=await res.json();
  const rawSpecies=Array.isArray(g.species)?g.species:[];
  const species=rawSpecies.filter(s=>s&&Number(s.id)>0&&String(s.name||'').trim());
  const rows=new Map(web.map(r=>[Number(r[0]),{id:Number(r[0]),ko:String(r[2]||''),en:String(r[3]||''),natural:new Map(),scripted:new Map()}]));
  const maps=Array.isArray(g.locations?.maps)?g.locations.maps:[];
  const unresolvedNatural=[],missingMapNames=[],invalidScriptedHow=[],missingSource=[];
  let rawNaturalSlots=0,naturalIndexToIdRemaps=0;
  const rawByField=Object.fromEntries(FIELDS.map(f=>[f,0]));
  for(const [mapIndex,map] of maps.entries()){
    if(!map)continue;
    const mapId=Number(map.id),mapName=String(g.mapsT?.[mapId]||'').trim();
    if(!mapName)missingMapNames.push({mapIndex,mapId});
    for(const field of FIELDS){
      const arr=Array.isArray(map[field])?map[field]:[];
      for(const slot of arr){
        rawNaturalSlots++;rawByField[field]++;
        const minLv=Number(slot?.[0])||0,maxLv=Number(slot?.[1])||0,rawIndex=Number(slot?.[2]);
        const targetObj=rawSpecies[rawIndex],targetId=Number(targetObj?.id)||0;
        if(!targetObj||targetId<=0||!webBy.has(targetId)){
          unresolvedNatural.push({mapIndex,mapId,mapName,field,slot,rawIndex,targetId,targetName:String(targetObj?.name||'')});
          continue;
        }
        if(rawIndex!==targetId)naturalIndexToIdRemaps++;
        const row=rows.get(targetId);if(!row){missingSource.push({kind:'natural',targetId,mapName,field});continue}
        const key=`${mapIndex}|${field}`;
        const old=row.natural.get(key);
        if(old){old[4]=Math.min(old[4],minLv);old[5]=Math.max(old[5],maxLv);old[6]++}
        else row.natural.set(key,[mapIndex,mapId,mapName,field,minLv,maxLv,1]);
      }
    }
  }
  let rawScriptedRows=0,scriptedDuplicates=0;
  const rawHowCounts={};
  for(const s of species){
    const sid=Number(s.id),row=rows.get(sid);
    if(!row){missingSource.push({kind:'scripted',targetId:sid,name:s.name});continue}
    for(const enc of (Array.isArray(s.SEnc)?s.SEnc:[])){
      rawScriptedRows++;
      const howId=Number(enc?.how),how=String(g.scriptedEncoutersHowT?.[howId]??''),howKo=HOW_KO[howId]||'';
      rawHowCounts[how]=(rawHowCounts[how]||0)+1;
      if(!howKo)invalidScriptedHow.push({speciesId:sid,species:s.name,howId,how,enc});
      const mapId=Number(enc?.map),mapName=String(g.mapsT?.[mapId]||'').trim();
      if(!mapName)missingMapNames.push({speciesId:sid,mapId,howId});
      const key=`${mapId}|${howId}`;
      const old=row.scripted.get(key);
      if(old){old[5]++;scriptedDuplicates++}
      else row.scripted.set(key,[mapId,mapName,howId,how,howKo,1]);
    }
  }
  const sortNatural=a=>a.sort((x,y)=>String(x[2]).localeCompare(String(y[2]))||String(x[3]).localeCompare(String(y[3]))||x[4]-y[4]);
  const sortScripted=a=>a.sort((x,y)=>String(x[1]).localeCompare(String(y[1]))||x[2]-y[2]);
  const payloadRows=[...rows.values()].sort((a,b)=>a.id-b.id).map(r=>[r.id,r.ko,r.en,sortNatural([...r.natural.values()]),sortScripted([...r.scripted.values()])]);
  const displayNaturalGroups=payloadRows.reduce((n,r)=>n+r[3].length,0),displayScriptedGroups=payloadRows.reduce((n,r)=>n+r[4].length,0);
  const withNatural=payloadRows.filter(r=>r[3].length).length,withScripted=payloadRows.filter(r=>r[4].length).length,withAny=payloadRows.filter(r=>r[3].length||r[4].length).length;
  const payload={meta:{stage:'STAGE21',source:SOURCE,species:payloadRows.length,fieldKo:FIELD_KO,howKo:HOW_KO},species:payloadRows};
  fs.writeFileSync('stage21-data.js',`window.ER_STAGE21_DATA=${JSON.stringify(payload)};\n`);
  const report={stage:'STAGE21',generatedAt:new Date().toISOString(),baseline:'STAGE20 user-confirmed normal',source:SOURCE,counts:{officialSpecies:species.length,webSpecies:web.length,payloadSpecies:payloadRows.length,maps:maps.filter(Boolean).length,rawNaturalSlots,displayNaturalGroups,naturalIndexToIdRemaps,rawScriptedRows,displayScriptedGroups,scriptedDuplicates,withNatural,withScripted,withAny,unresolvedNatural:unresolvedNatural.length,missingMapNames:missingMapNames.length,invalidScriptedHow:invalidScriptedHow.length,missingSource:missingSource.length},rawByField,rawHowCounts,fieldKo:FIELD_KO,howKo:HOW_KO,unresolvedNatural:unresolvedNatural.slice(0,50),missingMapNames:missingMapNames.slice(0,50),invalidScriptedHow,missingSource:missingSource.slice(0,50),samples:{bulbasaur:payloadRows.find(r=>r[0]===1),pikachu:payloadRows.find(r=>r[0]===25),articuno:payloadRows.find(r=>r[0]===144),mewtwo:payloadRows.find(r=>r[0]===150),rayquaza:payloadRows.find(r=>r[0]===384)}};
  fs.writeFileSync('stage21-audit.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.counts,null,2));console.log(JSON.stringify(rawByField,null,2));console.log(JSON.stringify(rawHowCounts,null,2));
  if(species.length!==web.length||payloadRows.length!==web.length||unresolvedNatural.length||missingMapNames.length||invalidScriptedHow.length||missingSource.length)throw Error('STAGE21 encounter audit has unresolved mappings');
})();
