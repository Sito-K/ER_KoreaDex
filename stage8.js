(()=>{'use strict';
const icons={
'노말':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
'불꽃':'<svg viewBox="0 0 24 24"><path d="M13.6 3.5c.8 3.2-1.6 4.5-2.4 6.2-.7 1.5-.1 2.8 1.2 3.5-.1-1.6.7-2.9 2.4-4.1 1.4 2 2.2 3.9 2.2 5.7a5 5 0 1 1-10 0c0-3 2.1-5.4 6.6-11.3Z"/></svg>',
'물':'<svg viewBox="0 0 24 24"><path d="M12 3.5s5.5 6.1 5.5 10.3A5.5 5.5 0 0 1 6.5 13.8C6.5 9.6 12 3.5 12 3.5Z"/></svg>',
'풀':'<svg viewBox="0 0 24 24"><path d="M19 5C11 5.2 6 8.7 6 14.1c0 2.7 2.1 4.9 4.8 4.9C16.5 19 19 12.4 19 5Z"/><path d="M6 19c2-4.5 5.6-7.8 10.7-10.3"/></svg>',
'전기':'<svg viewBox="0 0 24 24"><path d="m13.2 2-7 11h5l-.9 9 7.5-12h-5.1l.5-8Z"/></svg>',
'얼음':'<svg viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M8.5 5.2 12 7l3.5-1.8M8.5 18.8 12 17l3.5 1.8"/></svg>',
'격투':'<svg viewBox="0 0 24 24"><path d="M6.5 11V7.2a1.7 1.7 0 0 1 3.4 0V10M9.9 10V5.8a1.7 1.7 0 0 1 3.4 0V10M13.3 10V6.7a1.7 1.7 0 0 1 3.4 0V11M16.7 11V9.2a1.7 1.7 0 0 1 3.3.4v4.8c0 4.2-2.8 6.6-6.8 6.6h-1.7C7.4 21 4 17.7 4 13.6v-1.1c0-1 .8-1.8 1.8-1.8h.7Z"/></svg>',
'독':'<svg viewBox="0 0 24 24"><path d="M5 9.5C5 6.5 8.1 4 12 4s7 2.5 7 5.5-3.1 5.5-7 5.5-7-2.5-7-5.5Z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M7 18c1.6-1.5 3.3-2.2 5-2.2s3.4.7 5 2.2"/></svg>',
'땅':'<svg viewBox="0 0 24 24"><path d="m3.5 18 5.2-10 3.3 6 2.8-4.5L20.5 18h-17Z"/><path d="M7 18h10"/></svg>',
'비행':'<svg viewBox="0 0 24 24"><path d="M4 14.5c5.8.2 10.3-2.6 14.5-9-1 7.4-4.8 12.1-10.2 13.3 2.6-1.8 4.4-3.8 5.6-5.8-3 1.6-6.3 2.1-9.9 1.5Z"/></svg>',
'에스퍼':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M8 12c1.2-1.5 2.5-2.2 4-2.2s2.8.7 4 2.2c-1.2 1.5-2.5 2.2-4 2.2S9.2 13.5 8 12Z"/><circle cx="12" cy="12" r="1.2"/></svg>',
'벌레':'<svg viewBox="0 0 24 24"><path d="M8 9c0-2.4 1.8-4 4-4s4 1.6 4 4v7c0 2-1.8 3.5-4 3.5S8 18 8 16V9Z"/><path d="M8 11H5M19 11h-3M7 16l-2 2M17 16l2 2M9 5 7 14M15 5 8 19"/></svg>',
'바위':'<svg viewBox="0 0 24 24"><path d="m5 17 2-8 5-4 6 3 1 8-5 4H8l-3-3Z"/><path d="m7 9 5 3 6-4M12 12l2 8"/></svg>',
'고스트':'<svg viewBox="0 0 24 24"><path d="M6 19V10a6 6 0 0 1 12 0v9l-3-2-3 2-3-2-3 2Z"/><circle cx="9.5" cy="11" r="1"/><circle cx="14.5" cy="11" r="1"/></svg>',
'드래곤':'<svg viewBox="0 0 24 24"><path d="M5 18c1-6 4.2-10.6 10.5-13l-.8 4.2 4.3 1.4-4.1 2.1c.2 3.7-2.1 6.3-6.9 7.3l1.3-3.8L5 18Z"/><circle cx="13.8" cy="9.2" r=".8"/></svg>',
'악':'<svg viewBox="0 0 24 24"><path d="M17.5 4.5A8 8 0 1 0 19.5 17 6.6 6.6 0 1 1 17.5 4.5Z"/></svg>',
'강철':'<svg viewBox="0 0 24 24"><path d="m7 4 10 0 5 8-5 8H7l-5-8 5-8Z"/><circle cx="12" cy="12" r="3.2"/></svg>',
'페어리':'<svg viewBox="0 0 24 24"><path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8-1.8 5.7-1.8-5.7-5.7-1.8L10.2 9 12 3.5Z"/><path d="m18.5 15 .7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z"/></svg>',
'스텔라':'<svg viewBox="0 0 24 24"><path d="m12 3 2.2 6.2L20 12l-5.8 2.8L12 21l-2.2-6.2L4 12l5.8-2.8L12 3Z"/><circle cx="12" cy="12" r="2.3"/></svg>'
};
function decorateIcons(root=document){root.querySelectorAll('.type-filter .type-dot:not([data-icon-ready])').forEach(el=>{const t=el.dataset.type||'';el.innerHTML=icons[t]||icons['노말'];el.dataset.iconReady='1'})}
function simplifyStats(root=document){root.querySelectorAll('.species-card .mini-stats:not([data-bst-ready])').forEach(el=>{const nums=[...el.querySelectorAll('b')].map(n=>Number(n.textContent)||0);if(nums.length!==6)return;const total=nums.reduce((a,b)=>a+b,0),box=document.createElement('div');box.className='bst-card';box.innerHTML=`<span>종족값 총합</span><strong>${total}</strong>`;el.replaceWith(box)})}
function decorate(root=document){decorateIcons(root);simplifyStats(root)}
const observer=new MutationObserver(()=>decorate(document));
const grid=document.getElementById('grid'),filters=document.getElementById('typeFilters');
if(grid)observer.observe(grid,{childList:true,subtree:true});if(filters)observer.observe(filters,{childList:true,subtree:true});
decorate(document);
})();
