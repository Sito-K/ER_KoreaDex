const fs=require('fs');
const p='app-stage13.js';
let s=fs.readFileSync(p,'utf8');
const from="'ability-long-3b.js','ability-long-4.js']";
const to="'ability-long-3b.js','ability-long-4.js','ability-stage18.js']";
if(s.includes(to)){console.log('Stage 18 ability loader already patched');process.exit(0)}
const hits=s.split(from).length-1;
if(hits!==1)throw new Error(`Expected exactly one ability loader anchor, found ${hits}`);
s=s.replace(from,to);
fs.writeFileSync(p,s);
console.log('Patched ability-stage18.js as final lazy ability source');
