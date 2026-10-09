const fs=require('fs');
const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
(async()=>{
  const res=await fetch(SOURCE); if(!res.ok) throw new Error(`HTTP ${res.status}`); const g=await res.json();
  const out={stage:'STAGE18_PROBE',generatedAt:new Date().toISOString(),topLevel:[],candidates:{}};
  for(const [k,v] of Object.entries(g)){
    const rec={key:k,type:Array.isArray(v)?'array':typeof v};
    if(Array.isArray(v)){
      rec.length=v.length;
      const s=v.find(x=>x!=null);
      rec.sample=s;
      if(s&&typeof s==='object'&&!Array.isArray(s)) rec.sampleKeys=Object.keys(s);
    } else if(v&&typeof v==='object') rec.keys=Object.keys(v).slice(0,30);
    out.topLevel.push(rec);
    if(/move|abil|type/i.test(k)) out.candidates[k]=rec;
  }
  fs.writeFileSync('stage18-probe.json',JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify(out.candidates,null,2));
})();
