const fs=require('fs');
const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
(async()=>{
  const res=await fetch(SOURCE); if(!res.ok) throw Error(`NextDex HTTP ${res.status}`); const g=await res.json();
  const species=(Array.isArray(g.species)?g.species:[]).filter(s=>s&&Number(s.id)>0&&String(s.name||'').trim());
  const ids=new Set(species.map(s=>Number(s.id)));
  const fields=['land','water','fish','honey','rock','hidden'];
  const maps=Array.isArray(g.locations?.maps)?g.locations.maps:[];
  const naturalByField={}, naturalSpecies=new Set(), invalidNatural=[]; let naturalRows=0;
  const mapExamples=[];
  for(const [mi,m] of maps.entries()){
    if(!m) continue;
    const mapName=String(g.mapsT?.[m.id]||'');
    let rowsOnMap=0;
    for(const f of fields){
      const arr=Array.isArray(m[f])?m[f]:[]; naturalByField[f]=(naturalByField[f]||0)+arr.length;
      for(const row of arr){
        naturalRows++; rowsOnMap++;
        const sid=Number(row?.[2])||0; if(sid>0){naturalSpecies.add(sid); if(!ids.has(sid)) invalidNatural.push({mapIndex:mi,mapId:m.id,mapName,field:f,row});}
      }
    }
    if(rowsOnMap&&mapExamples.length<12)mapExamples.push({mapIndex:mi,mapId:m.id,mapName,rows:rowsOnMap,keys:Object.keys(m)});
  }
  const scriptedHowCounts={},scriptedSpecies=new Set(),scriptedExamples=[],invalidScripted=[];let scriptedRows=0;
  for(const s of species){
    for(const enc of (Array.isArray(s.SEnc)?s.SEnc:[])){
      scriptedRows++; scriptedSpecies.add(Number(s.id));
      const howId=Number(enc?.how), how=String(g.scriptedEncoutersHowT?.[howId]??`UNKNOWN_${howId}`), map=Number(enc?.map), mapName=String(g.mapsT?.[map]||'');
      scriptedHowCounts[how]=(scriptedHowCounts[how]||0)+1;
      if(!mapName)invalidScripted.push({speciesId:s.id,species:s.name,enc,how});
      if(scriptedExamples.length<24)scriptedExamples.push({speciesId:s.id,species:s.name,howId,how,map,mapName,enc});
    }
  }
  const samples={};
  for(const id of [1,25,133,144,150,384,493,1026]){
    const s=species.find(x=>Number(x.id)===id); if(s)samples[id]={name:s.name,SEnc:s.SEnc||[]};
  }
  const report={stage:'STAGE21_PROBE',source:SOURCE,generatedAt:new Date().toISOString(),counts:{species:species.length,maps:maps.filter(Boolean).length,naturalRows,naturalSpecies:naturalSpecies.size,scriptedRows,scriptedSpecies:scriptedSpecies.size,invalidNatural:invalidNatural.length,invalidScripted:invalidScripted.length},naturalByField,scriptedHowCounts,scriptedHowTable:g.scriptedEncoutersHowT||[],mapExamples,scriptedExamples,samples,invalidNatural:invalidNatural.slice(0,30),invalidScripted:invalidScripted.slice(0,30)};
  fs.writeFileSync('stage21-probe.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.counts,null,2)); console.log(JSON.stringify(naturalByField,null,2)); console.log(JSON.stringify(scriptedHowCounts,null,2));
})();
