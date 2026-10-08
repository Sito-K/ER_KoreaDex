(async()=>{
  const b64=window.K_GZ||'';
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const ds=new DecompressionStream('gzip');
  const text=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();
  window.K=JSON.parse(text);
  const k=window.K||{s:[],m:[],a:[],i:[],t:[],ty:[]};
  window.KO_DATA={
    meta:{counts:{speciesNames:k.s.length,moves:k.m.length,abilities:k.a.length,items:k.i.length,trainers:k.t.length}},
    speciesFallback:[],dex:{},
    speciesByEn:Object.fromEntries(k.s.map(([id,en,ko])=>[en,{id,ko}])),
    moves:Object.fromEntries(k.m.map(([id,ko,short])=>[id,{id,ko,short}])),
    abilities:Object.fromEntries(k.a.map(([id,ko,short])=>[id,{id,ko,short}])),
    items:Object.fromEntries(k.i.map(([id,ko,desc])=>[id,{id,ko,desc}])),
    trainers:k.t.map(([id,ko])=>({id,ko})),
    types:k.ty,
    stats:['HP','공격','방어','특수공격','특수방어','스피드']
  };
  const s=document.createElement('script'); s.src='app.js'; document.body.appendChild(s);
})().catch(e=>{console.error(e);const t=document.getElementById('statusText');if(t)t.textContent='데이터 초기화 실패: '+e.message;});