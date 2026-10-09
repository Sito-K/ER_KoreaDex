const fs=require('fs');
const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
(async()=>{
  const res=await fetch(SOURCE);if(!res.ok)throw Error(`NextDex HTTP ${res.status}`);const g=await res.json();
  const species=(Array.isArray(g.species)?g.species:[]).filter(x=>x&&Number(x.id)>0&&String(x.name||'').trim());
  const kindCounts={}, reasonsByKind={}, examplesByKind={};
  let total=0, withEvos=0, invalidTarget=0;
  const ids=new Set(species.map(s=>Number(s.id)));
  for(const s of species){
    const evos=Array.isArray(s.evolutions)?s.evolutions:[];
    if(evos.length)withEvos++;
    for(const e of evos){
      total++;
      const kd=Number(e.kd), kind=String(g.evoKindT?.[kd]||`UNKNOWN_${kd}`), rs=String(e.rs??''), into=Number(e.in);
      kindCounts[kind]=(kindCounts[kind]||0)+1;
      (reasonsByKind[kind]??=new Set()).add(rs);
      (examplesByKind[kind]??=[]).push({fromId:Number(s.id),from:s.name,reason:rs,intoId:into,into:g.species?.[into]?.name||''});
      if(into>0&&!ids.has(into))invalidTarget++;
    }
  }
  const report={stage:'STAGE20_PROBE',source:SOURCE,generatedAt:new Date().toISOString(),counts:{species:species.length,withEvos,totalEvolutions:total,invalidTarget,kindCount:Object.keys(kindCounts).length},kindCounts:Object.fromEntries(Object.entries(kindCounts).sort()),reasonsByKind:Object.fromEntries(Object.entries(reasonsByKind).sort().map(([k,v])=>[k,[...v].sort()])),examplesByKind:Object.fromEntries(Object.entries(examplesByKind).sort().map(([k,v])=>[k,v.slice(0,8)]))};
  fs.writeFileSync('stage20-probe.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.counts,null,2));
  console.log(JSON.stringify(report.kindCounts,null,2));
})();
