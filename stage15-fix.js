const fs = require('fs');
const vm = require('vm');

function loadJs(path) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path, 'utf8'), ctx, { filename: path });
  return ctx.window;
}

function writeForms(meta, rows) {
  const nextMeta = { ...meta, generatedAt: new Date().toISOString(), displayStage: 'STAGE15_FORM_AUDIT' };
  fs.writeFileSync('forms.js', `window.ER_FORM_META=${JSON.stringify(nextMeta)};\nwindow.ER_OFFICIAL_SPECIES=${JSON.stringify(rows)};\n`);
}

function writePokemon(meta, rows) {
  const nextMeta = { ...meta, generatedAt: new Date().toISOString(), displayStage: 'STAGE15_FORM_AUDIT' };
  fs.writeFileSync('pokemon-data.js', `window.ER_POKEMON_META=${JSON.stringify(nextMeta)};\nwindow.ER_POKEMON_DATA=${JSON.stringify(rows)};\n`);
}

const formsWin = loadJs('forms.js');
const pokemonWin = loadJs('pokemon-data.js');
const forms = formsWin.ER_OFFICIAL_SPECIES || [];
const pokemon = pokemonWin.ER_POKEMON_DATA || [];

const changes = [];

function changeForm(id, expectedEn, ko, token) {
  const row = forms.find(r => Number(r[0]) === id);
  if (!row) throw new Error(`forms.js: missing id ${id}`);
  if (String(row[1]) !== expectedEn) throw new Error(`forms.js: id ${id} expected ${expectedEn}, got ${row[1]}`);
  const before = [...row];
  row[2] = ko;
  row[4] = token ? 1 : 0;
  row[5] = token;
  changes.push({ file: 'forms.js', id, before, after: [...row] });
}

function changePokemon(id, expectedEn, ko, token) {
  const row = pokemon.find(r => Number(r[0]) === id);
  if (!row) throw new Error(`pokemon-data.js: missing id ${id}`);
  if (String(row[3]) !== expectedEn) throw new Error(`pokemon-data.js: id ${id} expected ${expectedEn}, got ${row[3]}`);
  const before = [...row];
  row[2] = ko;
  row[13] = token ? 1 : 0;
  row[14] = token;
  changes.push({ file: 'pokemon-data.js', id, before, after: [...row] });
}

// STAGE15 confirmed correction: Duraludon Mega is a normal Mega form.
// 2.65.4's internal suffix currently contains PARTNER_MEGA, but that suffix must
// not leak into the Korean display name/classification for Duraludon.
changeForm(2211, 'Duraludon Mega', '메가두랄루돈', 'MEGA');
changePokemon(2211, 'Duraludon Mega', '메가두랄루돈', 'MEGA');

const formsById = new Map(forms.map(r => [Number(r[0]), r]));
const pokemonById = new Map(pokemon.map(r => [Number(r[0]), r]));
const crossMismatches = [];
for (const [id, f] of formsById) {
  const p = pokemonById.get(id);
  if (!p) { crossMismatches.push({ id, kind: 'missing_pokemon_data' }); continue; }
  if (String(f[2]) !== String(p[2]) || Number(f[4]) !== Number(p[13]) || String(f[5] || '') !== String(p[14] || '')) {
    crossMismatches.push({ id, form: { ko: f[2], isForm: f[4], token: f[5] }, pokemon: { ko: p[2], isForm: p[13], token: p[14] } });
  }
}

const partnerMega = forms.filter(r => String(r[5]) === 'PARTNER_MEGA').map(r => ({ id: r[0], en: r[1], ko: r[2], dex: r[3] }));
const allowedPartnerMega = new Set(['Pikachu Mega', 'Eevee Mega', 'Meowth Mega']);
const unexpectedPartnerMega = partnerMega.filter(r => !allowedPartnerMega.has(r.en));
const duraludon = forms.find(r => Number(r[0]) === 2211);

const specialForm = forms.filter(r => String(r[2]).includes('특수폼 #')).map(r => ({ id: r[0], en: r[1], ko: r[2], dex: r[3], token: r[5] }));
const genericGender = forms.filter(r => ['F', 'M'].includes(String(r[5]))).map(r => ({ id: r[0], en: r[1], ko: r[2], dex: r[3], token: r[5] }));
const awkwardLabel = forms.filter(r => /SEA폼|메가 가라르의 모습폼|\(10폼\)|\(PH D폼\)/.test(String(r[2]))).map(r => ({ id: r[0], en: r[1], ko: r[2], dex: r[3], token: r[5] }));
const megaNameReview = forms.filter(r => /\bMega(?:\s+[XYZ])?\b/i.test(String(r[1])) && !String(r[2]).startsWith('메가') && !String(r[2]).startsWith('원시')).map(r => ({ id: r[0], en: r[1], ko: r[2], dex: r[3], token: r[5] }));

if (!duraludon || duraludon[2] !== '메가두랄루돈' || duraludon[5] !== 'MEGA') throw new Error('Duraludon Mega correction failed');
if (unexpectedPartnerMega.length) throw new Error(`Unexpected PARTNER_MEGA rows remain: ${JSON.stringify(unexpectedPartnerMega)}`);
if (crossMismatches.length) throw new Error(`forms/pokemon-data mismatch: ${JSON.stringify(crossMismatches.slice(0, 10))}`);

const audit = {
  stage: 'STAGE15',
  generatedAt: new Date().toISOString(),
  scope: 'STAGE14 baseline + Duraludon Mega correction + full form-name anomaly inventory',
  counts: {
    forms: forms.length,
    pokemonData: pokemon.length,
    partnerMegaRemaining: partnerMega.length,
    specialFormReview: specialForm.length,
    genericGenderReview: genericGender.length,
    awkwardLabelReview: awkwardLabel.length,
    megaNameReview: megaNameReview.length,
    crossMismatches: crossMismatches.length
  },
  confirmedFix: {
    id: 2211,
    en: duraludon[1],
    ko: duraludon[2],
    dex: duraludon[3],
    token: duraludon[5]
  },
  partnerMegaRemaining: partnerMega,
  reviewQueues: {
    specialForm,
    genericGender,
    awkwardLabel,
    megaNameReview
  },
  changes
};

writeForms(formsWin.ER_FORM_META || {}, forms);
writePokemon(pokemonWin.ER_POKEMON_META || {}, pokemon);
fs.writeFileSync('stage15-form-audit.json', JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify(audit.counts, null, 2));
console.log('STAGE15 Duraludon Mega:', JSON.stringify(audit.confirmedFix));
