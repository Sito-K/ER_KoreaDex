(async()=>{
  'use strict';
  const status=(msg)=>{const t=document.getElementById('statusText');if(t)t.textContent=msg;};
  const K=window.KO_DATA||{};
  const normEn=(s='')=>String(s).normalize('NFKD').toLowerCase().replace(/♀/g,' female ').replace(/♂/g,' male ').replace(/[^a-z0-9]+/g,'');
  async function unpack(b64){
    if(!b64)return [];
    const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    if(typeof DecompressionStream!=='function')throw new Error('이 브라우저는 gzip 데이터 해제를 지원하지 않습니다.');
    const text=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    return JSON.parse(text);
  }
  function safeMap(rows){
    const out={}, bad=new Set();
    for(const [en,ko] of rows||[]){
      const key=normEn(en); if(!key||!ko||bad.has(key))continue;
      if(out[key]&&out[key].ko!==ko){delete out[key];bad.add(key);continue;}
      out[key]={en,ko};
    }
    return out;
  }
  async function getGameData(){
    const urls=[
      'https://cdn.jsdelivr.net/gh/ForwardFeed/ER-nextdex@main/static/js/data/gameDataV2.65beta.json',
      'https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65beta.json'
    ];
    let last;
    for(const u of urls){try{const r=await fetch(u,{cache:'force-cache'});if(r.ok)return await r.json();last=new Error(`${r.status}`);}catch(e){last=e;}}
    throw last||new Error('NextDex 데이터를 불러오지 못했습니다.');
  }
  function remap(external, names){
    const out={}; let matched=0;
    for(const x of external||[]){
      const hit=names[normEn(x?.name||x?.en||'')];
      if(!hit)continue;
      out[Number(x.id)]={id:Number(x.id),en:x.name||x.en||hit.en,ko:hit.ko}; matched++;
    }
    return [out,matched];
  }
  try{
    const packs=window.ER_NAME_PACKS||{};
    const [mr,ar,ir,g]=await Promise.all([unpack(packs.moves),unpack(packs.abilities),unpack(packs.items),getGameData()]);
    const mm=safeMap(mr), am=safeMap(ar), im=safeMap(ir);
    const [moves,mc]=remap(g.moves,mm), [abilities,ac]=remap(g.abilities,am), [items,ic]=remap(g.items,im);
    K.moves=moves; K.abilities=abilities; K.items=items; K.normEn=normEn;
    K.nameFix={moves:{source:mr.length,matched:mc},abilities:{source:ar.length,matched:ac},items:{source:ir.length,matched:ic}};
    window.KO_DATA=K;
    status(`STAGE433 교차검증 완료 · 기술 ${mc}/${mr.length} · 특성 ${ac}/${ar.length} · 도구 ${ic}/${ir.length}`);
  }catch(e){
    console.error('STAGE433 safe remap failed',e);
    K.moves={}; K.abilities={}; K.items={}; window.KO_DATA=K;
    status('교차검증 데이터 로드 실패 · 잘못된 한국어명 방지를 위해 기술/특성/도구는 원문명으로 표시합니다.');
  }
  const s=document.createElement('script');s.src='app.js?v=20261008-namefix3';document.body.appendChild(s);
})();
