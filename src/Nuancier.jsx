// Generated once from the "Nuancier" design (Claude Design canvas), then edited by hand.
import { Component, Fragment } from 'react';
import DebarrasDemo from './demos/Debarras.jsx';
import AstrolabeDemo from './demos/Astrolabe.jsx';

// "a: b; c: d" -> { a: 'b', c: 'd' }, so the design's inline styles stay readable.
const css = (s) => {
  const o = {};
  for (const decl of s.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!k || !val) continue;
    o[k.startsWith('--') ? k : k.replace(/^-(webkit|moz|ms)-/, (_, p) => p[0].toUpperCase() + p.slice(1) + '-').replace(/-(\w)/g, (_, c) => c.toUpperCase())] = val;
  }
  return o;
};

// Séances réelles de Zoned (src/data/workouts) — profil aplati en [zone, secondes]
const SESSIONS = [{"id":"END-001","cat":"endurance","fr":"Endurance fondamentale","en":"Base Endurance","dfr":"Course continue en Zone 2 pour développer l'endurance de base. Allure confortable permettant de tenir une conversation.","den":"Continuous run in Zone 2 to develop base endurance. Comfortable pace allowing conversation.","dur":[45,55],"lvl":"beginner","z":2,"b":[[1,300],[2,2400],[1,300]]},{"id":"END-002","cat":"endurance","fr":"Endurance progressive","en":"Progressive Endurance","dfr":"Course continue avec augmentation progressive de l'intensité. Commence en Z1, termine en Z2 haut.","den":"Continuous run with progressive intensity increase. Starts in Z1, finishes in upper Z2.","dur":[60,70],"lvl":"intermediate","z":2,"b":[[1,600],[2,2700],[1,600]]},{"id":"REC-001","cat":"recovery","fr":"Footing récupération","en":"Recovery Jog","dfr":"Footing très lent en Zone 1 pour favoriser la récupération active. Rythme conversationnel facile, respiration nasale possible.","den":"Very slow jog in Zone 1 to promote active recovery. Easy conversational pace, nasal breathing should be possible.","dur":[25,35],"lvl":"beginner","z":1,"b":[[1,1800]]},{"id":"REC-002","cat":"recovery","fr":"Récup marche-course","en":"Walk-Run Recovery","dfr":"Alternance marche rapide et footing très léger. Idéal pour les débutants ou après une course/compétition.","den":"Alternating brisk walking and very light jogging. Ideal for beginners or after a race/competition.","dur":[25,35],"lvl":"beginner","z":1,"b":[[0,300],[1,1200],[0,300]]},{"id":"RP-001","cat":"race_pace","fr":"Allure marathon","en":"Marathon Pace","dfr":"Séance à allure spécifique marathon. Habitue le corps à l'allure de course visée.","den":"Marathon-specific pace session. Acclimates the body to target race pace.","dur":[60,75],"lvl":"advanced","z":3,"b":[[2,900],[3,1200],[1,180],[3,900],[1,900]]},{"id":"RP-002","cat":"race_pace","fr":"Allure 10K","en":"10K Pace","dfr":"Séance à allure spécifique 10km. Travail au seuil lactique.","den":"10K-specific pace session. Lactate threshold training.","dur":[60,75],"lvl":"intermediate","z":4,"b":[[2,900],[0,300],[4,520],[1,165],[4,520],[1,165],[4,520],[1,600]]},{"id":"FAR-001","cat":"fartlek","fr":"Fartlek libre","en":"Free Fartlek","dfr":"Jeu de vitesse non structuré basé sur les sensations. Alternez librement entre efforts et récup.","den":"Unstructured speed play based on feel. Freely alternate between efforts and recovery.","dur":[40,50],"lvl":"beginner","z":4,"b":[[2,600],[4,1500],[1,600]]},{"id":"FAR-002","cat":"fartlek","fr":"Fartlek suédois","en":"Swedish Fartlek","dfr":"Fartlek original style suédois : efforts et récupérations variés selon le terrain.","den":"Original Swedish-style fartlek: varied efforts and recoveries based on terrain.","dur":[50,60],"lvl":"intermediate","z":5,"b":[[2,600],[5,2100],[1,600]]},{"id":"VMA-001","cat":"vma_intervals","fr":"30/30 classique","en":"Classic 30/30","dfr":"Séance VMA en intervalles courts 30 secondes vite / 30 secondes lent. Format de base pour développer la VO2max.","den":"VO2max session with short intervals: 30 seconds fast / 30 seconds slow. Foundational format for developing VO2max.","dur":[50,60],"lvl":"intermediate","z":5,"b":[[2,900],[0,300],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,180],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,30],[5,30],[1,600]]},{"id":"VMA-002","cat":"vma_intervals","fr":"400m piste","en":"400m track repeats","dfr":"Répétitions de 400m à allure VMA sur piste. Format idéal pour la régularité d'allure.","den":"400m repeats at VO2max pace on track. Ideal format for pace consistency.","dur":[55,70],"lvl":"intermediate","z":5,"b":[[2,900],[0,600],[5,92],[1,66],[5,92],[1,66],[5,92],[1,66],[5,92],[1,66],[5,92],[1,66],[5,92],[1,66],[5,92],[1,66],[5,92],[1,66],[5,92],[1,66],[5,92],[1,600]]},{"id":"MIX-001","cat":"mixed","fr":"Combiné tempo-VMA","en":"Tempo-VO2max Combo","dfr":"Bloc tempo suivi d'intervalles VMA. Développe plusieurs qualités en une séance.","den":"Tempo block followed by VO2max intervals. Develops multiple qualities in one session.","dur":[50,60],"lvl":"advanced","z":5,"b":[[2,900],[0,300],[3,900],[1,300],[5,60],[1,30],[5,60],[1,30],[5,60],[1,30],[5,60],[1,30],[5,60],[1,30],[5,60],[1,30],[5,60],[1,30],[5,60],[1,30],[5,60],[1,30],[5,60],[1,600]]},{"id":"MIX-002","cat":"mixed","fr":"Endurance + côtes","en":"Endurance with Hills","dfr":"Sortie endurance avec séquence de côtes intégrée.","den":"Endurance run with integrated hill sequence.","dur":[55,65],"lvl":"intermediate","z":2,"b":[[2,1800],[0,60],[1,60],[0,60],[1,60],[0,60],[1,60],[0,60],[1,60],[0,60],[1,60],[0,60],[2,900],[1,600]]},{"id":"THR-001","cat":"threshold","fr":"Seuil continu","en":"Continuous Threshold","dfr":"Course à allure seuil (Z4) pendant 15-20 minutes continues. Travail au seuil lactique.","den":"Running at threshold pace (Z4) for 15-20 continuous minutes. Lactate threshold training.","dur":[50,60],"lvl":"advanced","z":4,"b":[[2,900],[0,300],[4,1200],[1,900]]},{"id":"THR-002","cat":"threshold","fr":"Seuil fractionné","en":"Interval Threshold","dfr":"Intervalles longs au seuil avec récupération courte. Format 3x8min ou 4x6min.","den":"Long threshold intervals with short recovery. Format 3x8min or 4x6min.","dur":[50,65],"lvl":"intermediate","z":4,"b":[[2,900],[0,300],[4,480],[1,120],[4,480],[1,120],[4,480],[1,600]]},{"id":"TRL-001","cat":"trail","fr":"Sprints en côte","en":"Hill Sprints","dfr":"Sprints alactiques courts (15s) sur pente raide 8-12%. Développe la puissance neuromusculaire spécifique à la relance en montée et l'économie de course en côte.","den":"Short alactic sprints (15s) on a steep 8-12% gradient. Builds neuromuscular power for trail climbs and improves uphill running economy.","dur":[40,50],"lvl":"intermediate","z":6,"b":[[2,900],[0,300],[6,15],[1,120],[6,15],[1,120],[6,15],[1,120],[6,15],[1,120],[6,15],[1,120],[6,15],[1,120],[6,15],[1,120],[6,15],[1,600]]},{"id":"TRL-002","cat":"trail","fr":"VMA en côte","en":"VO2max Hills","dfr":"Intervalles VMA courts (60s) sur pente modérée 5-8%. Cible la puissance aérobie spécifique trail avec un stress musculaire élevé proche des conditions de course.","den":"Short VO2max intervals (60s) on a moderate 5-8% gradient. Targets trail-specific aerobic power with race-like muscular load.","dur":[40,50],"lvl":"intermediate","z":5,"b":[[2,900],[0,300],[5,60],[1,60],[5,60],[1,60],[5,60],[1,60],[5,60],[1,60],[5,60],[1,60],[5,60],[1,60],[5,60],[1,60],[5,60],[1,600]]},{"id":"HIL-001","cat":"hills","fr":"Côtes courtes","en":"Short Hill Repeats","dfr":"Répétitions de côtes courtes (80-120m) à effort maximal. Développe la puissance musculaire.","den":"Short hill repeats (80-120m) at maximum effort. Develops muscular power.","dur":[45,55],"lvl":"intermediate","z":2,"b":[[2,900],[0,333],[1,120],[0,33],[1,120],[0,33],[1,120],[0,33],[1,120],[0,33],[1,120],[0,33],[1,120],[0,33],[1,120],[0,33],[1,600]]},{"id":"HIL-002","cat":"hills","fr":"Côtes moyennes","en":"Medium Hill Repeats","dfr":"Répétitions de côtes de 200-300m. Compromis entre puissance et endurance.","den":"Hill repeats of 200-300m. Balance between power and endurance.","dur":[40,45],"lvl":"intermediate","z":5,"b":[[2,900],[0,300],[5,57],[1,60],[5,57],[1,60],[5,57],[1,60],[5,57],[1,60],[5,57],[1,60],[5,57],[1,600]]},{"id":"LR-013","cat":"long_run","fr":"Sortie longue débutant","en":"Beginner Long Run","dfr":"Sortie longue accessible pour les débutants. 50 à 60 minutes en Z2 continue pour construire progressivement la base aérobie.","den":"Accessible long run for beginners. 50 to 60 minutes of continuous Z2 to progressively build aerobic base.","dur":[60,70],"lvl":"beginner","z":2,"b":[[1,600],[2,2700],[1,600]]},{"id":"LR-014","cat":"long_run","fr":"Sortie longue courte","en":"Short Long Run","dfr":"Version réduite de la sortie longue pour les semaines de taper ou de récupération. 40 à 50 minutes en Z2.","den":"Reduced version of the long run for taper or recovery weeks. 40 to 50 minutes in Z2.","dur":[40,50],"lvl":"beginner","z":2,"b":[[1,300],[2,2100],[1,300]]},{"id":"TMP-001","cat":"tempo","fr":"Tempo classique","en":"Classic Tempo","dfr":"Course continue à allure tempo (Z3/seuil aérobie). Effort soutenu mais contrôlé, environ 80-85% FCmax.","den":"Continuous run at tempo pace (Z3/aerobic threshold). Sustained but controlled effort, approximately 80-85% HRmax.","dur":[50,60],"lvl":"intermediate","z":3,"b":[[2,900],[0,300],[3,1500],[1,600]]},{"id":"TMP-002","cat":"tempo","fr":"Tempo court","en":"Short Tempo","dfr":"Version courte du tempo pour débutants ou semaines de récupération. 15 minutes à allure tempo.","den":"Short version of tempo for beginners or recovery weeks. 15 minutes at tempo pace.","dur":[35,45],"lvl":"beginner","z":3,"b":[[2,900],[3,900],[1,600]]}];

// Identité de chaque app, relevée dans son dépôt (tokens CSS, polices)
const PROJ = {
  zoned: { href: 'https://zoned.run', font: "'Bricolage Grotesque', sans-serif",
    light: { bg: '#F6F5F2', ink: '#171614', accent: '#E8452A' }, dark: { bg: '#171614', ink: '#F6F5F2', accent: '#F2694F' } },
  bref: { href: 'https://github.com/alarboulletmarin/bref', font: "'IBM Plex Serif', serif",
    light: { bg: '#FBFAF8', ink: '#1E1E1E', accent: '#9B4824' }, dark: { bg: '#1B1A19', ink: '#E8E6E3', accent: '#D58B62' } },
  spot: { href: 'https://github.com/alarboulletmarin/spot', font: "'Inter', sans-serif", wash: true,
    light: { bg: '#2A2A52', ink: '#FFFFFF', accent: '#FFFFFF' }, dark: { bg: '#2A2A52', ink: '#FFFFFF', accent: '#FFFFFF' } },
  aplat: { href: 'https://aplat.vercel.app', font: "'Anton', sans-serif", upper: true,
    light: { bg: '#F2EDDD', ink: '#17243F', accent: '#3B4CA8' }, dark: { bg: '#0E1729', ink: '#F7F3E6', accent: '#DFF478' } },
  dada: { href: 'https://dada-kohl.vercel.app', font: "'Baloo 2', sans-serif",
    light: { bg: '#FBF2DF', ink: '#3B2A1E', accent: '#C0392B' }, dark: { bg: '#1E1712', ink: '#F2E6D2', accent: '#F4C43C' } }
};
const ORDER = ['zoned', 'bref', 'spot', 'aplat', 'dada'];
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// Horaires du balayage de Zoned (lib/scanSchedule.ts) : écarts géométriques, freinage final
function scanSchedule(total, gap0, growth) {
  const times = [];
  let at = 0, gap = gap0;
  while (at < total) { times.push(at); at += gap; gap *= growth; }
  return times;
}

// Zoned : rampe d'encre des zones (zone.css)
const ZONE_H = ['16%', '30%', '44%', '58%', '72%', '86%', '100%'];
const zoneFill = (z, dark) => {
  if (z === 6) return dark ? '#EDEBE7' : '#171614';
  const a = [0, 0.14, 0.30, 0.46, 0.62, 0.80][z] || 0;
  return z === 0 ? 'transparent' : 'rgba(' + (dark ? '237, 235, 231' : '23, 22, 20') + ', ' + a + ')';
};

// Aplat : la galerie de la vitrine (tools/vitrine.mjs) — même famille, même palette, graine 7314
const APLAT = [
  ['47230d9b0c1aaa87f58cbc3fdd5be682', 'cernes', 'corail', 'Cernes', 'Growth rings'],
  ['2ca43c3ef3f33d114eebde2abbe5eee0', 'vagues', 'lime', 'Vagues', 'Waves'],
  ['c4dd21f22ca61be73b4f5bc3798c5498', 'constellations', 'orage', 'Constellations', 'Constellations'],
  ['a7c552650202f720a8b9f349f5553998', 'penrose', 'menthe', 'Penrose', 'Penrose'],
  ['b8fbe60f3c510559b5937260c361c953', 'cubes', 'ardoise', 'Cubes', 'Blocks'],
  ['01c535d666d097c5d8de271d796d5b60', 'demilunes', 'soleil', 'Demi-lunes', 'Half-moons'],
  ['2343f569ec5abbd6d1dd68f20911cb95', 'kintsugi', 'argile', 'Kintsugi', 'Kintsugi'],
  ['5cb57e9511ac1d2e2aeda8aeb92d2147', 'dunes', 'ciel', 'Dunes', 'Dunes'],
  ['5a57fc063b8363851a16a95997838b59', 'moire', 'encre', 'Moiré', 'Moiré'],
  ['e9e6673d2fa08ba1d8978b8d97f9a005', 'rubans', 'nuit', 'Rubans', 'Ribbons']
];

// spot : tous les projets publics, puis de quoi jouer
const GH = 'https://github.com/alarboulletmarin/';
const PROJECTS = [
  ['zoned', 'https://zoned.run', "Entraînement d'endurance par zones, dans le navigateur", 'Zone-based endurance training, in the browser', '#E8452A', 'z'],
  ['bref', GH + 'bref', 'Notes Markdown rapides, sur de simples fichiers', 'Fast Markdown notes on plain files', '#9B4824', 'B'],
  ['spot', GH + 'spot', "Lanceur d'apps et de fichiers pour GNOME", 'App and file launcher for GNOME', '#3584E4', 's'],
  ['aplat', 'https://aplat.vercel.app', "Fonds d'écran génératifs", 'Generative wallpapers', '#17243F', 'A'],
  ['dada', 'https://dada-kohl.vercel.app', 'Les petits chevaux, entre amis', 'Ludo, among friends', '#E9564B', 'D'],
  ['tout-compte-fait', 'https://toutcomptefait.xyz', 'Les comptes du foyer', 'Household finances', '#5E5C64', 'T'],
  ['revoir', 'https://revoir-eight.vercel.app', 'Planifier ses révisions espacées', 'Spaced-repetition planner', '#5E5C64', 'R'],
  ['sept-mers', 'https://sept-mers.vercel.app', 'Compteur de points pour Skull King', 'Score keeper for Skull King', '#5E5C64', '7'],
  ['rempart', GH + 'rempart', 'Un jeu de plateau de quatre minutes, de 2 à 4', 'A four-minute board game for 2 to 4', '#5E5C64', 'R'],
  ['debarras', GH + 'debarras', 'Voir ce qui prend la place sur le disque', 'See what is filling your disk', '#5E5C64', 'd'],
  ['pomodoro', GH + 'pomodoro', 'Un minuteur, sans notifications ni badges', 'A work timer, no notifications, no badges', '#5E5C64', 'p'],
  ['airplay-linux', GH + 'airplay-linux', 'Recopier le bureau Linux sur une Apple TV', 'Mirror a Linux desktop to an Apple TV', '#5E5C64', 'a'],
  ['herdr-github', GH + 'herdr-github', 'Panneau GitHub pour le terminal Herdr', 'GitHub panel for the Herdr terminal', '#5E5C64', 'h'],
  ['trced', 'https://github.com/trced/trced', 'La vitrine de la famille « . »', 'Showcase of the “.” family of apps', '#17181A', '.']
];
const DESKTOP = [
  { k: 'app', t: 'Calculator', fr: 'Effectuer des calculs arithmétiques, scientifiques ou financiers', en: 'Perform arithmetic, scientific or financial calculations', tint: '#77767B', g: '=' },
  { k: 'app', t: 'Files', fr: 'Accéder aux fichiers et les organiser', en: 'Access and organize files', tint: '#3584E4', g: 'F' },
  { k: 'app', t: 'Firefox', fr: 'Naviguer sur le Web', en: 'Browse the Web', tint: '#E66100', g: 'f' },
  { k: 'app', t: 'Terminal', fr: 'Utiliser la ligne de commande', en: 'Use the command line', tint: '#3D3846', g: '>' },
  { k: 'app', t: 'Settings', fr: 'Configurer le bureau GNOME', en: 'Configure the GNOME desktop', tint: '#9A9996', g: '*' },
  { k: 'folder', t: 'Calculs', fr: '~/Documents/Calculs', en: '~/Documents/Calculs', tint: '#62A0EA', g: '' },
  { k: 'file', t: 'calculate.rs', fr: '~/projects/spot/calculate.rs', en: '~/projects/spot/calculate.rs', tint: '#C64600', g: 'rs' },
  { k: 'file', t: 'Calcul des impôts.txt', fr: '~/Documents/Calcul des impôts.txt', en: '~/Documents/Calcul des impôts.txt', tint: '#9A9996', g: 'txt' },
  { k: 'file', t: 'budget-calcul.ods', fr: '~/Documents/budget-calcul.ods', en: '~/Documents/budget-calcul.ods', tint: '#2EC27E', g: 'ods' }
];

// Petite calculatrice, sans eval : + - * / ^ ( ) et la virgule
function calc(src) {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.').replace(/\s+/g, '');
  if (!/^[\d.+\-*/^()]+$/.test(s) || !/\d[+\-*/^]/.test(s)) return null;
  let i = 0;
  const num = () => { const m = /^\d+(\.\d+)?/.exec(s.slice(i)); if (!m) throw 0; i += m[0].length; return parseFloat(m[0]); };
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    if (s[i] === '(') { i++; const v = expr(); if (s[i] !== ')') throw 0; i++; return v; }
    return num();
  };
  const pow = () => { const b = atom(); if (s[i] === '^') { i++; return Math.pow(b, pow()); } return b; };
  const term = () => { let v = pow(); while (s[i] === '*' || s[i] === '/') { const o = s[i++]; const r = pow(); v = o === '*' ? v * r : v / r; } return v; };
  const expr = () => { let v = term(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; const r = term(); v = o === '+' ? v + r : v - r; } return v; };
  try { const v = expr(); if (i !== s.length || !isFinite(v)) return null; return Math.round(v * 1e10) / 1e10; } catch (e) { return null; }
}

// Bref : la note de démonstration du README
const NOTE = {
  fr: ['# Voyage à Lisbonne', 'Trois jours en **mai**, arrivée un *jeudi*. Le budget et les réservations sont dans [[Budget 2026]], les idées portent le tag #voyage.', '> [!TIP] Réserver le train pour Sintra la ==veille==.', '## À réserver', '- [x] Vols', '- [ ] Hôtel près de l’Alfama', '- [ ] Excursion à Sintra', ''],
  en: ['# Trip to Lisbon', 'Three days in **May**, flying in on a *Thursday*. Budget and bookings live in [[Budget 2026]], ideas are tagged #travel.', '> [!TIP] Book the Sintra train the ==evening before==.', '## To book', '- [x] Flights', '- [ ] Hotel near Alfama', '- [ ] Day trip to Sintra', '']
};
const INLINE = /(\*\*[^*]+\*\*|~~[^~]+~~|==[^=]+==|\*[^*\s][^*]*\*|`[^`]+`|\[\[[^\]]+\]\]|(?:^|(?<=\s))#[\p{L}\p{N}_-]+)/gu;
function inlineTokens(text) {
  const out = [];
  let last = 0, m;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push({ k: 'text', text: text.slice(last, m.index) });
    const w = m[0];
    const pair = (o, kind) => { out.push({ k: 'mark', text: o }); out.push({ k: kind, text: w.slice(o.length, w.length - (kind === 'link' ? 2 : o.length)) }); out.push({ k: 'mark', text: kind === 'link' ? ']]' : o }); };
    if (w.startsWith('**')) pair('**', 'bold');
    else if (w.startsWith('~~')) pair('~~', 'strike');
    else if (w.startsWith('==')) pair('==', 'hl');
    else if (w.startsWith('`')) pair('`', 'code');
    else if (w.startsWith('[[')) pair('[[', 'link');
    else if (w.startsWith('#')) out.push({ k: 'tag', text: w });
    else pair('*', 'ital');
    last = m.index + w.length;
  }
  if (last < text.length) out.push({ k: 'text', text: text.slice(last) });
  return out;
}
function blockOf(raw) {
  let m;
  if ((m = /^(#{1,3}) (.*)$/.exec(raw))) return { kind: 'h' + m[1].length, prefix: m[1] + ' ', body: m[2] };
  if ((m = /^- \[([ xX])\] ?(.*)$/.exec(raw))) return { kind: 'task', done: m[1] !== ' ', prefix: '', body: m[2] };
  if ((m = /^> \[!(\w+)\] ?(.*)$/.exec(raw))) return { kind: 'callout', prefix: '> [!' + m[1] + '] ', body: m[2] };
  if ((m = /^> ?(.*)$/.exec(raw))) return { kind: 'quote', prefix: '> ', body: m[1] };
  if ((m = /^- (.*)$/.exec(raw))) return { kind: 'li', prefix: '- ', body: m[1] };
  return { kind: 'p', prefix: '', body: raw };
}
const LINE_STYLE = {
  h1: { font: "'IBM Plex Serif', serif", weight: 600, sizeM: '26px', size: '24px', lh: '1.25', margin: '4px 0 6px' },
  h2: { font: "'IBM Plex Serif', serif", weight: 600, sizeM: '20px', size: '18px', lh: '1.3', margin: '12px 0 2px' },
  h3: { font: "'IBM Plex Serif', serif", weight: 600, sizeM: '18px', size: '16px', lh: '1.35', margin: '10px 0 2px' },
  p: { font: "'IBM Plex Sans', sans-serif", weight: 400, sizeM: '16px', size: '14px', lh: '1.6', margin: '1px 0' }
};

// Dada : les faces du dé (grille 3 × 3)
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

const T = {
  fr: {
    bio: "Ingénieur logiciel à Nice, côté IA appliquée. À côté, je fais de petites apps qui tournent chez vous : pas de compte, pas de pistage, hors ligne. Et je fais du triathlon.",
    apps: 'apps', more: "et d'autres sur github", langLabel: 'Langue', themeLabel: 'Thème', previewLabel: 'Aperçu', back: 'retour', othersPitch: 'D’autres projets, plus petits ou plus spécialisés — tous publics, tous sur GitHub.',
    clockPre: 'il est ', clockPost: ' à nice', open: 'ouvrir', offline: 'hors ligne',
    hintMouse: '← survole une app', hintTouch: '← touche une app',
    themes: { system: 'auto', light: 'clair', dark: 'sombre' },
    p: {
      zoned: "s'entraîner en endurance, par zones",
      bref: 'des notes en Markdown, de simples fichiers',
      spot: "lanceur d'apps et de fichiers pour Linux",
      aplat: "des fonds d'écran génératifs",
      dada: 'les petits chevaux, entre amis'
    },
    tag: {
      zoned: "267 séances, 10 plans d'entraînement et 10 calculateurs, autour de 6 zones d'intensité.",
      bref: 'Les notes se mettent en forme pendant la frappe, les marqueurs restent visibles mais atténués. Essayez : écrivez.',
      spot: 'Tous mes projets sont dedans. Cherchez — et essayez quelques mots au hasard.',
      aplat: "Des fonds d'écran génératifs, calculés dans le navigateur et exportés à la résolution de votre écran."
    },
    draw: 'Tirer une séance', redraw: 'Re-tirer', scanning: 'Scan du catalogue…', sessions: 'séances au tirage', openSession: 'Ouvrir la séance dans Zoned',
    cats: { endurance: 'Endurance', recovery: 'Récup', race_pace: 'Allure course', fartlek: 'Fartlek', vma_intervals: 'VMA', mixed: 'Mixte', threshold: 'Seuil', trail: 'Trail', hills: 'Côtes', long_run: 'Sortie longue', tempo: 'Tempo' },
    lvls: { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', elite: 'Élite' },
    profile: 'Profil de la séance par zone',
    editLine: 'Ligne en cours d’édition', taskLabel: 'Cocher ou décocher',
    tools: { b: 'Gras', i: 'Italique', s: 'Barré', h: 'Surligné', c: 'Code', l: 'Lien', t: 'Case à cocher' },
    words: 'mots', chars: 'caractères',
    searchLabel: 'Rechercher', searchPh: 'Rechercher…', noResult: 'Aucun résultat',
    kinds: { app: 'Application', folder: 'Dossier', file: 'Fichier', project: 'Projet', calc: 'Calcul', system: 'Système', clock: 'Horloge', contact: 'Contact', fact: 'Défi' },
    eggs: {
      lock: ['Verrouiller l’écran', 'Session de démonstration'], sudo: ['Bien essayé.', 'Ce n’est pas un vrai terminal.'], rm: ['Non.', 'Rien ne sera effacé ici.'],
      me: ['Andréa', 'C’est moi — github.com/alarboulletmarin'], tri: ['3,8 km · 180 km · 42,2 km', 'Nager, rouler, courir. Dans cet ordre.'],
      nice: ['à Nice', 'Promenade des Anglais'], answer: ['La réponse.', 'À la grande question sur la vie, l’univers et le reste'], spot: ['Vous y êtes déjà.', 'C’est spot, ici même']
    },
    unlock: 'Cliquez pour déverrouiller', aplatHint: 'Cliquez un fond pour l’ouvrir dans Aplat, avec les mêmes réglages.',
    dadaTagline: 'le jeu des petits chevaux, entre amis', roll: 'Lancer le dé', rollIdle: 'Trois secondes et le dé roule.', six: '6 ! Un cheval entre en piste.', rolled: '{n} : on avance.',
    dadaButtons: [['Créer une partie', 'Vous hébergez, vos amis vous rejoignent avec un code ou un QR'], ['Rejoindre avec un code', 'Un ami a déjà créé la partie'], ['Un seul téléphone', 'Un seul appareil qu’on se passe, aucun réseau']]
  },
  en: {
    bio: 'Software engineer in Nice, working on applied AI. On the side, I make small apps that run on your machine: no account, no tracking, offline. And I do triathlon.',
    apps: 'apps', more: 'more on github', langLabel: 'Language', themeLabel: 'Theme', previewLabel: 'Preview', back: 'back', othersPitch: 'Other projects, smaller or more niche — all public, all on GitHub.',
    clockPre: '', clockPost: ' in nice', open: 'open', offline: 'offline',
    hintMouse: '← hover an app', hintTouch: '← tap an app',
    themes: { system: 'auto', light: 'light', dark: 'dark' },
    p: {
      zoned: 'endurance training, by zones',
      bref: 'Markdown notes, plain files',
      spot: 'app and file launcher for Linux',
      aplat: 'generative wallpapers',
      dada: 'Ludo, among friends'
    },
    tag: {
      zoned: '267 sessions, 10 training plans and 10 calculators, built on 6 intensity zones.',
      bref: 'Notes are styled as you type; markers stay visible but dimmed. Go ahead: write.',
      spot: 'All my projects are in here. Search — and try a few random words.',
      aplat: 'Generative wallpapers, computed in the browser and exported at your screen’s resolution.'
    },
    draw: 'Draw a session', redraw: 'Re-draw', scanning: 'Scanning the catalogue…', sessions: 'sessions in the draw', openSession: 'Open the session in Zoned',
    cats: { endurance: 'Endurance', recovery: 'Recovery', race_pace: 'Race Pace', fartlek: 'Fartlek', vma_intervals: 'VO2max', mixed: 'Mixed', threshold: 'Threshold', trail: 'Trail', hills: 'Hills', long_run: 'Long Run', tempo: 'Tempo' },
    lvls: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', elite: 'Elite' },
    profile: 'Session profile by zone',
    editLine: 'Line being edited', taskLabel: 'Toggle the task',
    tools: { b: 'Bold', i: 'Italic', s: 'Strikethrough', h: 'Highlight', c: 'Code', l: 'Link', t: 'Checkbox' },
    words: 'words', chars: 'characters',
    searchLabel: 'Search', searchPh: 'Search…', noResult: 'No results',
    kinds: { app: 'Application', folder: 'Folder', file: 'File', project: 'Project', calc: 'Calculation', system: 'System', clock: 'Clock', contact: 'Contact', fact: 'Challenge' },
    eggs: {
      lock: ['Lock the screen', 'Demo session'], sudo: ['Nice try.', 'This is not a real terminal.'], rm: ['No.', 'Nothing gets deleted here.'],
      me: ['Andréa', 'That’s me — github.com/alarboulletmarin'], tri: ['3.8 km · 180 km · 42.2 km', 'Swim, bike, run. In that order.'],
      nice: ['in Nice', 'Promenade des Anglais'], answer: ['The answer.', 'To the ultimate question of life, the universe and everything'], spot: ['You’re already here.', 'This is spot, right here']
    },
    unlock: 'Click to unlock', aplatHint: 'Click a wallpaper to open it in Aplat, with the same settings.',
    dadaTagline: 'the game of little horses, among friends', roll: 'Roll the die', rollIdle: 'Three seconds and the die rolls.', six: '6! A horse enters the track.', rolled: '{n}: move along.',
    dadaButtons: [['Create a game', 'You host; your friends join with a code or a QR'], ['Join with a code', 'A friend has already created the game'], ['One phone only', 'One device passed around, no network at all']]
  }
};

// Ce que chaque bande raconte, relevé dans les dépôts
const BIO_SHORT = { fr: 'Ingénieur logiciel à Nice. Je fais de petites apps qui tournent chez vous. Et du triathlon.', en: 'Software engineer in Nice. I make small apps that run on your machine. And triathlon.' };
const INFO = {
  zoned: { text: "'Space Grotesk', sans-serif", weight: 700, track: '-0.04em',
    short: { fr: "s'entraîner par zones", en: 'training by zones' },
    pitch: { fr: "S'entraîner en endurance, par zones. Une séance tirée au hasard, un plan jusqu'au jour J.", en: 'Endurance training, by zones. A session drawn at random, a plan all the way to race day.' },
    facts: { fr: ['267 séances', '10 plans', '10 calculateurs', '6 zones', 'PWA · React · TypeScript'], en: ['267 sessions', '10 plans', '10 calculators', '6 zones', 'PWA · React · TypeScript'] },
    features: { fr: [['Tirage', 'une séance au hasard, filtrée par zone, durée et niveau'], ['Plans', 'semaines générées jusqu’à la course'], ['Calculateurs', 'VMA, allures, tapis, équivalences']],
      en: [['Draw', 'a random session, filtered by zone, length and level'], ['Plans', 'weeks generated up to race day'], ['Calculators', 'VO2max, paces, treadmill, equivalences']] },
    links: [['le site', 'website', 'https://zoned.run'], ['le code', 'source', 'https://github.com/alarboulletmarin/zoned']] },
  bref: { text: "'IBM Plex Sans', sans-serif", weight: 600, track: '-0.01em',
    short: { fr: 'des notes en Markdown', en: 'Markdown notes' },
    pitch: { fr: 'Des notes Markdown sur de simples fichiers, mises en forme pendant la frappe. Écrivez ci-dessous.', en: 'Markdown notes on plain files, styled as you type. Write below.' },
    facts: { fr: ['Rust · GPUI', 'Linux · macOS · Windows', '75 ms au lancement', 'MIT'], en: ['Rust · GPUI', 'Linux · macOS · Windows', '75 ms to open', 'MIT'] },
    features: { fr: [['Liens', '[[liens]], rétroliens, tags et graphe'], ['Tableaux', 'qui calculent, =sum(above)'], ['Agents', 'bref mcp lit, écrit et dessine dans le coffre']],
      en: [['Links', '[[links]], backlinks, tags and a graph'], ['Tables', 'that compute, =sum(above)'], ['Agents', 'bref mcp reads, writes and draws in the vault']] },
    links: [['le site', 'website', 'https://alarboulletmarin.github.io/bref/'], ['le code', 'source', 'https://github.com/alarboulletmarin/bref']] },
  spot: { text: "'Inter', sans-serif", weight: 600, track: '-0.03em',
    short: { fr: "lanceur d'apps pour Linux", en: 'app launcher for Linux' },
    pitch: { fr: "Lanceur d'applications et de fichiers pour GNOME. Tous mes projets sont dedans — cherchez.", en: 'App and file launcher for GNOME. All my projects are in there — search.' },
    facts: { fr: ['Python · GTK4 · libadwaita', 'GNOME · Wayland / X11', 'FR / EN'], en: ['Python · GTK4 · libadwaita', 'GNOME · Wayland / X11', 'FR / EN'] },
    features: { fr: [['Apps et fichiers', 'recherche plocate dans le dossier perso'], ['GNOME', 'calculatrice, réglages, fichiers Nautilus'], ['Actions', 'verrouiller, veille, redémarrer']],
      en: [['Apps and files', 'plocate search across your home'], ['GNOME', 'calculator, settings, Nautilus files'], ['Actions', 'lock, suspend, restart']] },
    links: [['le code', 'source', 'https://github.com/alarboulletmarin/spot']] },
  aplat: { text: "'Archivo', sans-serif", weight: 400, track: '0.01em',
    short: { fr: "fonds d'écran génératifs", en: 'generative wallpapers' },
    pitch: { fr: "Des fonds d'écran génératifs, calculés dans le navigateur à la résolution de l'écran.", en: 'Generative wallpapers, computed in the browser at your screen’s resolution.' },
    facts: { fr: ['77 motifs', '47 palettes', 'PWA · TypeScript', 'AGPL-3.0', 'hors ligne'], en: ['77 motifs', '47 palettes', 'PWA · TypeScript', 'AGPL-3.0', 'offline'] },
    features: { fr: [['Graine', 'un lien suffit à retrouver la même image'], ['Résolution', 'détectée, du téléphone à la 4K'], ['Lisibilité', 'une sonde vérifie les libellés posés dessus']],
      en: [['Seed', 'a link is enough to get the same image back'], ['Resolution', 'detected, from phone to 4K'], ['Legibility', 'a probe checks the labels on top']] },
    links: [['ouvrir l’app', 'open the app', 'https://aplat.vercel.app', 'open'], ['le code', 'source', 'https://github.com/alarboulletmarin/aplat']] },
  dada: { text: "'Nunito', sans-serif", weight: 800, track: '0',
    short: { fr: 'les petits chevaux', en: 'Ludo, among friends' },
    pitch: { fr: 'Les petits chevaux entre amis, de téléphone à téléphone. Sans compte, sans pub, sans serveur.', en: 'Ludo among friends, phone to phone. No account, no ads, no server.' },
    facts: { fr: ['pair-à-pair', '4 règles', 'jusqu’à 4 joueurs', '770 tests', 'AGPL-3.0'], en: ['peer-to-peer', '4 rule sets', 'up to 4 players', '770 tests', 'AGPL-3.0'] },
    features: { fr: [['Variantes', 'petits chevaux, ludo, rapide, équipes'], ['Ordinateurs', 'trois niveaux, siège par siège'], ['Plateaux', 'croix, carré, cercle, serpent']],
      en: [['Variants', 'little horses, Ludo, quick, teams'], ['Bots', 'three levels, seat by seat'], ['Boards', 'cross, square, circle, serpent']] },
    links: [['jouer', 'play', 'https://dada-kohl.vercel.app', 'play'], ['le code', 'source', 'https://github.com/alarboulletmarin/dada']] },
  trced: { text: "'JetBrains Mono', monospace", weight: 400, track: '-0.02em',
    short: { fr: 'la famille « . »', en: 'the “.” family' },
    pitch: { fr: 'Une famille de micro-applications. Chacune fait une seule chose. Sans compte, sans traceur, hors ligne.', en: 'A family of micro-apps. Each does one thing. No account, no tracker, offline.' },
    facts: { fr: ['4 apps publiées', 'un seul design system', '1,4 Ko de JavaScript', 'FR / EN'], en: ['4 apps published', 'one design system', '1.4 KB of JavaScript', 'FR / EN'] },
    features: { fr: [['Une chose', 'ce qui n’est pas essentiel n’est pas construit'], ['Aucun compte', 'on ouvre, on utilise'], ['Hors ligne', 'données locales, exportables, réimportables']],
      en: [['One thing', 'what isn’t essential isn’t built'], ['No account', 'open it, use it'], ['Offline', 'local data, exportable, re-importable']] },
    links: [['le code', 'source', 'https://github.com/trced/trced']] },
  debarras: { text: "'IBM Plex Mono', monospace", weight: 600, track: '-0.01em',
    short: { fr: 'ce qui encombre le disque', en: 'what fills your disk' },
    pitch: { fr: 'Voir ce qui remplit le disque, et libérer ce qui peut partir. Un dossier dessiné comme un plan d’architecte.', en: 'See what fills your disk, and free what can go. A folder drawn as an architect’s plan.' },
    facts: { fr: ['Rust · GPUI', 'Linux · macOS · Windows', 'aucun réseau', 'MIT'], en: ['Rust · GPUI', 'Linux · macOS · Windows', 'no network', 'MIT'] },
    features: { fr: [['Le plan', 'une parcelle par élément, son aire est sa taille'], ['Hachures', 'ce qui se reconstruit : node_modules, target, caches'], ['Rien dans votre dos', 'on coche, on relit, puis la corbeille']],
      en: [['The plan', 'one plot per item, its area is its size'], ['Hatching', 'what rebuilds itself: node_modules, target, caches'], ['Nothing behind your back', 'tick, review, then the trash']] },
    links: [['le site', 'website', 'https://alarboulletmarin.github.io/debarras/'], ['le code', 'source', 'https://github.com/alarboulletmarin/debarras']] },
  astrolabe: { text: "'IBM Plex Sans', sans-serif", weight: 600, track: '-0.02em',
    short: { fr: 'un carnet pour Garmin', en: 'a journal for Garmin' },
    pitch: { fr: 'Le journal de vos activités Garmin, gardé sur votre machine. Où vous en êtes — jamais quoi faire.', en: 'A journal of your Garmin activities, kept on your machine. Where you stand — never what to do.' },
    facts: { fr: ['Rust · GPUI', 'Garmin', 'données locales', 'Linux · macOS · Windows', 'MIT'], en: ['Rust · GPUI', 'Garmin', 'local data', 'Linux · macOS · Windows', 'MIT'] },
    features: { fr: [['Aujourd’hui', 'la semaine face à votre semaine médiane'], ['Boucles', 'des parcours à la distance voulue, sur OpenStreetMap, en GPX'], ['Forme', 'charge, fatigue, fraîcheur : des chiffres, pas des conseils']],
      en: [['Today', 'this week against your median week'], ['Loops', 'routes of the distance you ask for, on OpenStreetMap, as GPX'], ['Form', 'load, fatigue, freshness: figures, not advice']] },
    links: [['le site', 'website', 'https://alarboulletmarin.github.io/astrolabe/'], ['le code', 'source', 'https://github.com/alarboulletmarin/astrolabe']] }
};
// Les trois apps hors de l'ancienne page : leur identité, relevée dans leurs dépôts
const EXTRA = {
  trced: { href: 'https://github.com/trced/trced', font: "'JetBrains Mono', monospace",
    light: { bg: '#F2F3F2', ink: '#17181A', accent: '#17181A' }, dark: { bg: '#121311', ink: '#ECEBE6', accent: '#ECEBE6' } },
  debarras: { href: 'https://alarboulletmarin.github.io/debarras/', font: "'IBM Plex Sans', sans-serif",
    light: { bg: '#F6F3EC', ink: '#1F1E1B', accent: '#6E5B45' }, dark: { bg: '#1A1917', ink: '#E9E5DC', accent: '#C9B48F' } },
  astrolabe: { href: 'https://alarboulletmarin.github.io/astrolabe/', font: "'IBM Plex Sans', sans-serif",
    light: { bg: '#FBFAF8', ink: '#1E1E1E', accent: '#BF6C49' }, dark: { bg: '#1B1A19', ink: '#E8E6E3', accent: '#D0967C' } }
};
const circ = (x, y, r) => 'M' + (x - r) + ' ' + y + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0';
// icônes dessinées pour le site (ni Material ni Lucide) ; d = trait, f = aplat
const ICON = {
  branch: { d: circ(6, 6, 2) + circ(6, 18, 2) + circ(18, 8, 2) + 'M6 8v8M18 10c0 4-4 5-10 6', f: '' },
  mail: { d: 'M4 6h16v12H4zM4 7l8 6 8-6', f: '' },
  person: { d: circ(12, 8, 3.5) + 'M5 20c1-4 4-6 7-6s6 2 7 6', f: '' },
  code: { d: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16', f: '' },
  globe: { d: circ(12, 12, 9) + 'M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18', f: '' },
  open: { d: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', f: '' },
  play: { d: 'M8 5l11 7-11 7z', f: '' },
  auto: { d: circ(12, 12, 8), f: 'M12 4a8 8 0 0 1 0 16z' },
  sun: { d: circ(12, 12, 4) + 'M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4', f: '' },
  moon: { d: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', f: '' }
};
const NAMES = { trced: 'trced.', debarras: 'débarras', astrolabe: 'Astrolabe' };
const TRCED = {
  fr: { tagline: 'Une chose, bien faite.', apps: [['habit.', 'une semaine, une grille', 'v0.1.1'], ['journal.', 'une année, un jour à la fois', 'v0.1.0'], ['race.', 'toutes vos courses, une ligne chacune', 'v0.1.2'], ['urge.', 'une envie, trente jours, une question', 'v0.1.0']],
    principles: ['Une chose à la fois. Ce qui n’est pas essentiel n’est pas construit.', 'Aucun compte. On ouvre, on utilise.', 'Aucun traceur, aucune publicité, aucune collecte.'] },
  en: { tagline: 'One thing, done well.', apps: [['habit.', 'one week, one grid', 'v0.1.1'], ['journal.', 'one year, one day at a time', 'v0.1.0'], ['race.', 'all your races, one line each', 'v0.1.2'], ['urge.', 'one urge, thirty days, one question', 'v0.1.0']],
    principles: ['One thing at a time. What isn’t essential isn’t built.', 'No account. Open it, use it.', 'No tracker, no ads, no collection.'] }
};
const ASTRO = [
  ['eeb6ce2d7e6bc2866aa9a24fd1da20fc', 'Aujourd’hui', 'Today'],
  ['46cae7011ef6b80c62d467b4201421aa', 'Boucles', 'Loops'],
  ['3ad9ee7ffcb4600eb7e01b1ffd4af9ce', 'Carte de chaleur', 'Heatmap'],
  ['415c1b74dc5573a6d6f91a655becbb35', 'Activité', 'Activity']
];

export default class Nuancier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: null, theme: 'system', sysLang: 'fr', sysDark: false, active: -1, sheet: -1, band: -1, wide: true, touch: false, now: new Date(),
      zi: 4, zScan: -1, zDrawing: false, zDrawn: false,
      blines: null,
      query: '', sel: 0, locked: false,
      face: 4, rolling: false, rolled: 0
    };
    this.timers = [];
    this.focusIn = false;
    this.bActive = null;
  }
  componentDidMount() {
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'fr';
    const sysLang = nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    const mm = (q) => (window.matchMedia ? window.matchMedia(q) : null);
    this.mq = mm('(prefers-color-scheme: dark)');
    this.mw = mm('(min-width: 960px)');
    this.mt = mm('(hover: none)');
    this.sync = () => this.setState({
      sysDark: !!(this.mq && this.mq.matches),
      wide: this.mw ? this.mw.matches : true,
      touch: !!(this.mt && this.mt.matches)
    });
    [this.mq, this.mw, this.mt].forEach((q) => q && q.addEventListener && q.addEventListener('change', this.sync));
    this.setState({ sysLang });
    this.sync();
    this.tick = setInterval(() => this.setState({ now: new Date() }), 1000);
  }
  componentWillUnmount() {
    [this.mq, this.mw, this.mt].forEach((q) => q && q.removeEventListener && q.removeEventListener('change', this.sync));
    clearInterval(this.tick);
    this.timers.forEach(clearTimeout);
  }
  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); }
  openSheet(i) {
    this.opener = document.activeElement;
    this.setState({ active: i, sheet: i });
    this.later(() => { const b = document.getElementById('sheet-close'); if (b) b.focus({ preventScroll: true }); }, 60);
  }
  closeSheet() {
    this.focusIn = false;
    this.setState({ active: -1 });
    if (this.opener && this.opener.focus) this.opener.focus({ preventScroll: true });
  }

  // ---------- Zoned : le tirage, comme DrawSessionPage
  draw() {
    if (this.state.zDrawing) return;
    let final = this.state.zi;
    while (final === this.state.zi) final = Math.floor(Math.random() * SESSIONS.length);
    if (reduced()) { this.setState({ zi: final, zDrawn: true }); return; }
    const times = scanSchedule(1500, 45, 1.14);
    this.setState({ zDrawing: true, zScan: Math.floor(Math.random() * SESSIONS.length) });
    times.forEach((at, i) => this.later(() => {
      if (i === times.length - 1) this.setState({ zDrawing: false, zScan: -1, zi: final, zDrawn: true });
      else this.setState({ zScan: Math.floor(Math.random() * SESSIONS.length) });
    }, at));
  }

  // ---------- Dada : le dé
  roll() {
    if (this.state.rolling) return;
    const final = 1 + Math.floor(Math.random() * 6);
    if (reduced()) { this.setState({ face: final, rolled: final }); return; }
    const times = scanSchedule(700, 40, 1.2);
    this.setState({ rolling: true });
    times.forEach((at, i) => this.later(() => {
      if (i === times.length - 1) this.setState({ rolling: false, face: final, rolled: final });
      else this.setState({ face: 1 + Math.floor(Math.random() * 6) });
    }, at));
  }

  // ---------- Bref : chaque ligne est une seule surface — le rendu dessous, la saisie transparente dessus
  lines(lang) { return this.state.blines ? this.state.blines.slice() : NOTE[lang].slice(); }
  taskOf(raw) { const m = /^- \[([ xX])\] ?/.exec(raw); return m ? { prefix: m[0], done: m[1] !== ' ' } : null; }
  textOf(raw) { const tk = this.taskOf(raw); return tk ? raw.slice(tk.prefix.length) : raw; }
  withText(raw, text) { const tk = this.taskOf(raw); return tk ? (tk.done ? '- [x] ' : '- [ ] ') + text : text; }
  field(i) { return document.querySelectorAll('.bref-saisie')[i] || null; }
  focusLine(i, a, b) {
    this.bActive = i;
    requestAnimationFrame(() => {
      const el = this.field(i);
      if (!el) return;
      el.focus();
      const len = el.value.length;
      const x = a == null ? len : Math.min(a, len);
      el.setSelectionRange(x, b == null ? x : Math.min(b, len));
    });
  }
  setLines(lines, focus) {
    this.setState({ blines: lines });
    if (focus) this.focusLine(focus[0], focus[1], focus[2]);
  }
  change(lang, i, value) {
    const lines = this.lines(lang);
    const parts = value.split('\n');
    lines[i] = this.withText(lines[i], parts[0]);
    // un collage sur plusieurs lignes devient plusieurs lignes
    if (parts.length > 1) { lines.splice(i + 1, 0, ...parts.slice(1)); this.setLines(lines, [i + parts.length - 1]); }
    else this.setState({ blines: lines });
  }
  wrap(lang, open, close) {
    const lines = this.lines(lang);
    let i = this.bActive == null ? lines.length - 1 : this.bActive;
    if (i >= lines.length) i = lines.length - 1;
    const el = this.field(i);
    const text = this.textOf(lines[i]);
    const a = el ? el.selectionStart : text.length, b = el ? el.selectionEnd : text.length;
    close = close == null ? open : close;
    lines[i] = this.withText(lines[i], text.slice(0, a) + open + text.slice(a, b) + close + text.slice(b));
    this.setLines(lines, a === b ? [i, a + open.length] : [i, a + open.length, b + open.length]);
  }
  toggleTask(lang, i) {
    const lines = this.lines(lang);
    const tk = this.taskOf(lines[i]);
    if (!tk) return;
    lines[i] = (tk.done ? '- [ ] ' : '- [x] ') + this.textOf(lines[i]);
    this.setState({ blines: lines });
  }
  makeTask(lang) {
    const lines = this.lines(lang);
    let i = this.bActive == null ? lines.length - 1 : Math.min(this.bActive, lines.length - 1);
    const el = this.field(i);
    const pos = el ? el.selectionStart : 0;
    const raw = lines[i];
    if (this.taskOf(raw)) { lines[i] = this.textOf(raw); this.setLines(lines, [i, pos]); }
    else { const body = raw.replace(/^- /, ''); lines[i] = '- [ ] ' + body; this.setLines(lines, [i, Math.max(0, pos - (raw.length - body.length))]); }
  }
  key(lang, i, e) {
    const el = e.target, v = el.value, a = el.selectionStart, b = el.selectionEnd;
    const lines = this.lines(lang);
    const raw = lines[i], tk = this.taskOf(raw);
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'Enter' && tk) { e.preventDefault(); this.toggleTask(lang, i); return; }
    if (mod && ['b', 'i', 'e', 'h'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      const k = e.key.toLowerCase();
      this.wrap(lang, k === 'b' ? '**' : k === 'i' ? '*' : k === 'e' ? '`' : '==');
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tk) {
        // une case vide + Entrée : on sort de la liste
        if (!v) { lines[i] = ''; this.setLines(lines, [i, 0]); return; }
        lines[i] = this.withText(raw, v.slice(0, a));
        lines.splice(i + 1, 0, '- [ ] ' + v.slice(b));
        this.setLines(lines, [i + 1, 0]);
        return;
      }
      const m = /^(- |> )/.exec(v);
      if (m && v === m[1]) { lines[i] = ''; this.setLines(lines, [i, 0]); return; }
      const prefix = m ? m[1] : '';
      lines[i] = v.slice(0, a);
      lines.splice(i + 1, 0, prefix + v.slice(b));
      this.setLines(lines, [i + 1, prefix.length]);
    } else if (e.key === 'Backspace' && a === 0 && b === 0) {
      if (tk) { e.preventDefault(); lines[i] = v; this.setLines(lines, [i, 0]); return; }
      if (i === 0) return;
      e.preventDefault();
      const prevText = this.textOf(lines[i - 1]);
      lines[i - 1] = this.withText(lines[i - 1], prevText + v);
      lines.splice(i, 1);
      this.setLines(lines, [i - 1, prevText.length]);
    } else if (e.key === 'Delete' && a === v.length && b === a && i < lines.length - 1) {
      e.preventDefault();
      lines[i] = this.withText(raw, v + this.textOf(lines[i + 1]));
      lines.splice(i + 1, 1);
      this.setLines(lines, [i, a]);
    } else if (e.key === 'ArrowUp' && i > 0) {
      if (a === 0 && b === 0) { e.preventDefault(); this.focusLine(i - 1); return; }
      // sur la première ligne visuelle, le navigateur ramène le curseur au début : on monte d'une ligne
      requestAnimationFrame(() => { if (el.selectionStart === 0 && a !== 0) this.focusLine(i - 1); });
    } else if (e.key === 'ArrowDown' && i < lines.length - 1) {
      if (a === v.length) { e.preventDefault(); this.focusLine(i + 1, 0); return; }
      requestAnimationFrame(() => { if (el.selectionStart === el.value.length && a !== el.value.length) this.focusLine(i + 1, 0); });
    } else if (e.key === 'Escape') {
      e.preventDefault(); el.blur();
    }
  }

  // ---------- spot
  spotResults(lang, t) {
    const raw = this.state.query.trim();
    const q = raw.toLowerCase();
    const E = t.eggs, out = [];
    const egg = (kind, pair, extra) => out.push(Object.assign({ kind, title: pair[0], sub: pair[1], tint: '#3D3846', g: '!' }, extra || {}));
    if (q) {
      const v = calc(raw);
      if (q === '42') egg('calc', E.answer, { g: '=' });
      else if (v !== null) egg('calc', ['= ' + String(v).replace('.', lang === 'fr' ? ',' : '.'), raw], { tint: '#77767B', g: '=' });
      if (['lock', 'verrouiller', 'verrou', 'verrouillage'].some((w) => w.startsWith(q) && q.length >= 3)) egg('system', E.lock, { action: 'lock', g: '◐' });
      if (q.startsWith('sudo')) egg('system', E.sudo, { g: '#' });
      if (q.startsWith('rm -rf') || q === 'rm -r') egg('system', E.rm, { g: '×' });
      if (['andrea', 'andréa', 'moi'].includes(q)) egg('contact', E.me, { href: 'https://github.com/alarboulletmarin', g: 'a', tint: '#1C1C1A' });
      if ('triathlon'.startsWith(q) && q.length >= 4) egg('fact', E.tri, { href: 'https://zoned.run', g: '3', tint: '#E8452A' });
      if (q === 'nice') egg('clock', ['', E.nice[1]], { clock: true, g: '◷', tint: '#3584E4' });
      if (q === 'spot') egg('system', E.spot, { g: 's', tint: '#3584E4' });
    }
    const match = (txt) => !q || txt.toLowerCase().includes(q);
    const rank = (name) => (q && name.toLowerCase().startsWith(q) ? 0 : 1);
    const projs = PROJECTS.filter((p) => match(p[0]) || (q && match(lang === 'fr' ? p[2] : p[3])))
      .sort((x, y) => rank(x[0]) - rank(y[0]))
      .map((p) => ({ kind: 'project', title: p[0], sub: lang === 'fr' ? p[2] : p[3], href: p[1], tint: p[4], g: p[5] }));
    const desk = q ? DESKTOP.filter((d) => match(d.t) || match(d[lang]))
      .sort((x, y) => rank(x.t) - rank(y.t) || (x.k === 'app' ? 0 : 1) - (y.k === 'app' ? 0 : 1))
      .map((d) => ({ kind: d.k, title: d.t, sub: d[lang], tint: d.tint, g: d.g })) : [];
    return out.concat(projs, desk).slice(0, 14);
  }
  reveal(i) {
    requestAnimationFrame(() => {
      const el = document.getElementById('spot-r-' + i);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    });
  }
  activateAt(i, r) {
    const el = document.getElementById('spot-r-' + i);
    if (r && r.href && el) el.click();
    else if (r) this.activate(r);
  }
  activate(r) {
    if (r.action === 'lock') this.setState({ locked: true });
    else if (r.href) window.open(r.href, '_blank', 'noopener');
  }

  appVals() {
    const s = this.state;
    const lang = s.lang || s.sysLang;
    const dark = s.theme === 'dark' || (s.theme === 'system' && s.sysDark);
    const t = T[lang];
    const mode = dark ? 'dark' : 'light';
    const P = this.props;
    const activeKey = s.active >= 0 ? ORDER[s.active] : null;
    const A = activeKey ? PROJ[activeKey][mode] : null;
    const setActive = (i) => this.setState({ active: i });

    const projects = ORDER.map((key, i) => {
      const pr = PROJ[key], c = pr[mode];
      const on = s.active === i;
      return {
        name: key, href: pr.href, desc: t.p[key],
        op: s.active === -1 || on ? 1 : 0.32,
        arrowOp: on ? 1 : 0, arrowX: on ? '0px' : '-6px',
        font: on ? pr.font : 'inherit',
        tt: on && pr.upper ? 'uppercase' : 'none',
        ls: on && pr.upper ? '0.02em' : 'normal',
        accent: on ? c.accent : 'currentColor',
        enter: () => { if (!s.touch) setActive(i); },
        click: (e) => {
          if (!s.wide) { e.preventDefault(); this.openSheet(i); }
          else if (s.touch && s.active !== i) { e.preventDefault(); setActive(i); }
        }
      };
    });
    const pv = {};
    ORDER.forEach((key, i) => {
      const on = s.wide ? s.active === i : s.sheet === i;
      pv[key] = { op: on ? 1 : 0, ty: on || !s.wide ? '0px' : '14px', vis: on ? 'visible' : 'hidden', vdelay: on ? '0s' : '0.45s',
        hidden: on ? 'false' : 'true', display: s.wide || on ? 'flex' : 'none' };
    });
    const sheetKeyName = s.sheet >= 0 ? ORDER[s.sheet] : null;
    const SH = sheetKeyName ? PROJ[sheetKeyName][mode] : null;
    const sheetOpen = !s.wide && s.active >= 0;

    // --- Zoned
    const zc = dark
      ? { ink: '#F6F5F2', card: '#211F1D', muted: '#C9C6BF', faint: '#9C9891', divider: 'rgba(237, 235, 231, 0.18)', accent: '#E8452A', accentSoft: '#3A1A12' }
      : { ink: '#171614', card: '#FFFFFF', muted: '#55524C', faint: '#6F6C65', divider: 'rgba(23, 22, 20, 0.18)', accent: '#E8452A', accentSoft: '#FBE3DA' };
    const S = SESSIONS[s.zi];
    const zs = {
      id: S.id, z: S.z, cat: t.cats[S.cat] || S.cat, lvl: t.lvls[S.lvl] || S.lvl,
      name: lang === 'fr' ? S.fr : S.en, desc: lang === 'fr' ? S.dfr : S.den,
      dur: S.dur[0] + '–' + S.dur[1] + ' min', profileLabel: t.profile,
      href: 'https://zoned.run/workout/' + S.id, openLabel: t.openSession + ' : ' + (lang === 'fr' ? S.fr : S.en),
      blocks: S.b.map(([z, sec]) => ({ f: sec, h: ZONE_H[z], fill: zoneFill(z, dark) }))
    };
    const SC = s.zScan >= 0 ? SESSIONS[s.zScan] : null;
    const zd = {
      drawing: s.zDrawing, btnOp: s.zDrawing ? 0.7 : 1,
      label: s.zDrawing ? t.scanning : s.zDrawn ? t.redraw : t.draw,
      count: SESSIONS.length + ' ' + t.sessions,
      scanning: !!SC, showResult: !SC,
      scanName: SC ? (lang === 'fr' ? SC.fr : SC.en) : '', scanDesc: SC ? (lang === 'fr' ? SC.dfr : SC.den) : '',
      scanEdge: SC ? zoneFill(Math.max(1, SC.z), dark) : 'transparent'
    };

    // Le coureur : il sprinte pendant le balayage, puis prend l'allure de la zone tirée
    const zSpeed = s.zDrawing ? 'scan' : 'z' + Math.min(6, Math.max(1, S.z));
    const zr = {
      cls: 'rc-' + zSpeed, w: 64,
      title: s.zDrawing ? t.scanning : (lang === 'fr' ? 'Allure de la séance : Z' : 'Session pace: Z') + S.z
    };

    // --- Bref
    const bc = dark
      ? { chrome: '#1B1A19', paper: '#242321', ink: '#E8E6E3', faint: '#7C776F', accent: '#D58B62', callout: '#1F2B21', hl: '#5A4A1C', edge: 'rgba(255, 255, 255, 0.08)' }
      : { chrome: '#EDE9E0', paper: '#FBFAF8', ink: '#2B2A28', faint: '#A39E95', accent: '#9B4824', callout: '#E4EFE1', hl: '#F3E3A0', edge: 'rgba(0, 0, 0, 0.07)' };
    const L = this.lines(lang);
    // Le rendu garde exactement les chasses de la saisie : gras par contour, italique synthétisé, code sans changer de police
    const tokStyle = (k) => ({
      color: k === 'mark' ? bc.faint : (k === 'link' || k === 'tag') ? bc.accent : 'inherit',
      stroke: k === 'bold' ? '0.5px currentColor' : '0', style: k === 'ital' ? 'italic' : 'inherit',
      deco: k === 'strike' ? 'line-through' : 'none',
      bg: k === 'hl' ? bc.hl : k === 'code' ? 'rgba(127, 127, 127, 0.16)' : 'transparent'
    });
    const brefLines = L.map((raw, i) => {
      const tk = this.taskOf(raw);
      const text = this.textOf(raw);
      const bl = tk ? { kind: 'task', prefix: '', body: text } : blockOf(raw);
      const st = LINE_STYLE[bl.kind] || LINE_STYLE.p;
      let toks = [];
      if (bl.prefix) toks.push({ k: 'mark', text: bl.prefix });
      toks = toks.concat(inlineTokens(bl.body));
      if (tk && tk.done) toks = toks.map((x) => (x.k === 'text' ? { k: 'strike', text: x.text } : x));
      // un caractère invisible garde la hauteur d'une ligne vide, et celle d'une fin de ligne en espace
      toks.push({ k: 'text', text: '​' });
      return {
        text, isTask: !!tk, done: tk && tk.done ? 'true' : 'false', mark: tk && tk.done ? 'x' : ' ', taskLabel: t.taskLabel,
        op: tk && tk.done ? 0.6 : 1,
        font: st.font, weight: st.weight, size: s.wide ? st.size : st.sizeM, lh: st.lh, margin: st.margin,
        bg: bl.kind === 'callout' ? bc.callout : 'transparent', pad: bl.kind === 'callout' ? '3px 10px' : '0',
        label: t.editLine + ' ' + (i + 1),
        tokens: toks.map((x) => Object.assign({ text: x.text }, tokStyle(x.k))),
        onChange: (e) => this.change(lang, i, e.target.value),
        onKey: (e) => this.key(lang, i, e),
        onFocus: () => { this.bActive = i; },
        toggle: () => this.toggleTask(lang, i)
      };
    });
    const tool = (glyph, label, run, extra) => Object.assign({ glyph, label, run, color: bc.ink, font: "'IBM Plex Sans', sans-serif", weight: 400, style: 'normal', deco: 'none' }, extra || {});
    const bref = {
      lines: brefLines,
      rail: s.wide ? 'flex' : 'none', paperMargin: s.wide ? '0 10px 10px 0' : '0 8px 8px 8px',
      h: s.wide ? '300px' : 'auto', winFlex: s.wide ? 'none' : '1 1 0', areaFlex: s.wide ? 'none' : '1 1 0', pad: s.wide ? '18px 22px 10px' : '16px 16px 10px', toolSize: s.wide ? '28px' : '40px',
      count: L.join(' ').split(/\s+/).filter(Boolean).length + ' ' + t.words + ' · ' + L.join('\n').length + ' ' + t.chars,
      keepFocus: (e) => e.preventDefault(),
      tools: [
        tool('B', t.tools.b, () => this.wrap(lang, '**'), { weight: 700 }),
        tool('I', t.tools.i, () => this.wrap(lang, '*'), { style: 'italic' }),
        tool('S', t.tools.s, () => this.wrap(lang, '~~'), { deco: 'line-through' }),
        tool('H', t.tools.h, () => this.wrap(lang, '=='), { color: bc.accent, weight: 700 }),
        tool('<>', t.tools.c, () => this.wrap(lang, '`'), { font: "'IBM Plex Mono', monospace" }),
        tool('[[ ]]', t.tools.l, () => this.wrap(lang, '[[', ']]'), { font: "'IBM Plex Mono', monospace" }),
        tool('[x]', t.tools.t, () => this.makeTask(lang), { font: "'IBM Plex Mono', monospace", color: bc.accent })
      ]
    };

    // --- spot
    const sc = Object.assign(dark ? { card: '#242424', ink: '#FFFFFF', rule: 'rgba(255, 255, 255, 0.1)', pill: 'rgba(255, 255, 255, 0.12)' }
                    : { card: '#FAFAFA', ink: '#1E1E1E', rule: 'rgba(0, 0, 0, 0.08)', pill: 'rgba(0, 0, 0, 0.07)' }, { listH: s.wide ? '300px' : 'auto', listFlex: s.wide ? 'none' : '1 1 0', flex: s.wide ? 'none' : '1 1 0' });
    const found = this.spotResults(lang, t);
    const sel = Math.min(s.sel, Math.max(0, found.length - 1));
    const hhmm = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).format(s.now);
    const results = found.map((r, i) => {
      const on = i === sel;
      return {
        title: r.clock ? hhmm + ' ' + t.eggs.nice[0] : r.title, sub: r.sub, kindLabel: t.kinds[r.kind] || r.kind,
        tint: r.kind === 'folder' ? '#62A0EA' : r.tint, glyph: r.g, iconRadius: r.kind === 'project' || r.kind === 'app' ? '8px' : '4px',
        isLink: !!r.href, isButton: !r.href, href: r.href || '#',
        bg: on ? '#3584E4' : 'transparent', fg: on ? '#FFFFFF' : 'inherit',
        pillBg: on ? 'rgba(255, 255, 255, 0.9)' : sc.pill, pillFg: on ? '#1C5BAA' : 'inherit',
        id: 'spot-r-' + i, on: on ? 'true' : 'false',
        pick: () => { if (s.sel !== i) this.setState({ sel: i }); },
        activate: () => { this.setState({ sel: i }); this.activate(r); }
      };
    });

    // --- Aplat
    const shot = ([id, m, p, fr, en]) => ({
      src: '/img/' + id + '.webp', label: lang === 'fr' ? fr : en,
      href: 'https://aplat.vercel.app/app?m=' + m + '&p=' + p + '&d=1&s=7314',
      aria: (lang === 'fr' ? 'Ouvrir ' : 'Open ') + (lang === 'fr' ? fr : en) + (lang === 'fr' ? ' dans Aplat' : ' in Aplat')
    });
    const shots = APLAT.map(shot);
    const aplatShots = shots.map((x) => Object.assign({ tab: '0' }, x)).concat(shots.map((x) => Object.assign({}, x, { tab: '-1' })));
    const ac = Object.assign(dark ? { frame: '#22314F', shadow: 'rgba(247, 243, 230, 0.14)' } : { frame: '#17243F', shadow: 'rgba(23, 36, 63, 0.13)' },
      s.wide ? { w: '150px', h: '325px' } : { w: 'calc(min(420px, 56dvh) * 0.4615)', h: 'min(420px, 56dvh)' });

    // --- Dada
    const di = dark ? { ink: '#F2E6D2', shade: '#0B0806', card: '#2A211A' } : { ink: '#3B2A1E', shade: '#3B2A1E', card: '#FFFDF5' };
    const cream = '#FFF7E6';
    const dd = {
      dir: s.wide ? 'row' : 'column', gap: s.wide ? '28px' : '10px',
      die: s.wide ? '112px' : 'min(96px, 12dvh)', msgH: s.wide ? '44px' : '0', btnH: s.wide ? '64px' : 'min(58px, 8dvh)',
      ink: di.ink, shade: di.shade, dieBg: di.card,
      dieClass: s.rolling ? 'dada-roule' : '',
      pips: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ op: PIPS[s.face].includes(k) ? 1 : 0 })),
      msg: s.rolled ? (s.rolled === 6 ? t.six : t.rolled.replace('{n}', s.rolled)) : t.rollIdle,
      roll: () => this.roll(),
      logo: [['D', '#E9564B', cream, '-2deg'], ['A', '#57B26A', cream, '1.5deg'], ['D', '#4C93D8', cream, '-1.5deg'], ['A', '#F4C43C', '#2A1E16', '2deg']].map(([c, bg, fg, rot]) => ({ c, bg, fg, rot })),
      buttons: t.dadaButtons.map(([label, hint], i) => ({ label, hint, bg: ['#E9564B', '#4C93D8', di.card][i], fg: i < 2 ? cream : di.ink }))
    };

    const opt = (on, label, pick) => ({ on: on ? 'true' : 'false', deco: on ? 'underline' : 'none', op: on ? 1 : 0.55, label, pick });
    const langs = ['fr', 'en'].map((l) => opt(lang === l, l, () => this.setState({ lang: l })));
    const themes = ['system', 'light', 'dark'].map((k) => opt(s.theme === k, t.themes[k], () => this.setState({ theme: k })));
    const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(s.now);
    const get = (type) => (parts.find((x) => x.type === type) || {}).value || '00';

    return {
      t, lang, projects, langs, themes, pv,
      spotActive: found.length ? 'spot-r-' + sel : '',
      zc, zs, zd, zr, bc, bref, sc, results, noResult: results.length === 0, query: s.query, locked: s.locked,
      aplatShots, ac, dd,
      drawSession: () => this.draw(),
      onQuery: (e) => this.setState({ query: e.target.value, sel: 0, locked: false }),
      onQueryKey: (e) => {
        const n = found.length;
        if (!n) return;
        const go = (i) => { this.setState({ sel: i }); this.reveal(i); };
        if (e.key === 'ArrowDown') { e.preventDefault(); go((sel + 1) % n); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); go((sel - 1 + n) % n); }
        else if (e.key === 'PageDown') { e.preventDefault(); go(Math.min(sel + 5, n - 1)); }
        else if (e.key === 'PageUp') { e.preventDefault(); go(Math.max(sel - 5, 0)); }
        else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); go(0); }
        else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); go(n - 1); }
        else if (e.key === 'Enter') { e.preventDefault(); this.activateAt(sel, found[sel]); }
        else if (e.key === 'Escape') { e.preventDefault(); this.setState({ query: '', sel: 0 }); }
      },
      unlock: () => this.setState({ locked: false, query: '' }),
      panelFocus: () => { this.focusIn = true; },
      panelBlur: () => { this.focusIn = false; },
      gridCols: s.wide ? 'minmax(0, 480px) minmax(0, 1fr)' : 'minmax(0, 1fr)',
      padTop: s.wide ? '112px' : '56px',
      footRow: '2',
      panelCol: s.wide ? '2' : '1',
      panelRow: s.wide ? '1 / span 2' : '3',
      narrow: !s.wide,
      blockPos: s.wide ? 'absolute' : 'relative',
      panelPos: s.wide ? 'sticky' : 'fixed',
      panelTop: s.wide ? '72px' : '0',
      panelL: s.wide ? 'auto' : '0', panelR: s.wide ? 'auto' : '0', panelB: s.wide ? 'auto' : '0',
      panelH: s.wide ? '700px' : 'auto',
      panelZ: s.wide ? 'auto' : '50',
      panelOv: s.wide ? 'visible' : 'hidden',
      panelPad: s.wide ? '0' : '0 20px max(16px, env(safe-area-inset-bottom))',
      panelDisp: s.wide ? 'block' : 'flex',
      blockFlex: s.wide ? 'none' : '1 1 0',
      gap: s.wide ? '18px' : '12px',
      tagSize: s.wide ? '16px' : '14px',
      sheetBg: s.wide || !SH ? 'transparent' : (PROJ[sheetKeyName].wash ? 'linear-gradient(160deg, #2a2a52 0%, #4b3870 60%, #8f5a86 100%)' : SH.bg),
      sheetBarBg: s.wide || !SH ? 'transparent' : SH.bg,
      sheetInk: s.wide || !SH ? 'inherit' : SH.ink,
      sheetY: s.wide ? '0' : sheetOpen ? '0' : '100%',
      sheetVis: s.wide || sheetOpen ? 'visible' : 'hidden',
      sheetVd: s.wide || sheetOpen ? '0s' : '0.45s',
      sheetRole: s.wide ? 'region' : 'dialog',
      sheetModal: sheetOpen ? 'true' : 'false',
      closeSheet: () => this.closeSheet(),
      sheetKey: (e) => { if (!s.wide && e.key === 'Escape') { e.preventDefault(); this.closeSheet(); } },
      activeHref: sheetKeyName ? PROJ[sheetKeyName].href : activeKey ? PROJ[activeKey].href : '#',
      activeName: sheetKeyName || activeKey || '',
      // une seule chaîne : le moteur de gabarit avale l'espace seul entre deux valeurs
      openLabel: t.open + '\u00a0' + (sheetKeyName || activeKey || '') + '\u00a0↗',
      washOp: activeKey && PROJ[activeKey].wash ? 1 : 0,
      hh: get('hour'), mm: get('minute'),
      colonOp: s.now.getSeconds() % 2 ? 0.15 : 1,
      leaveAll: () => { if (!s.touch && !this.focusIn) setActive(-1); },
      ink: A ? A.ink : dark ? (P.darkInk ?? '#E6E5E0') : (P.lightInk ?? '#1C1C1A'),
      bg: A ? A.bg : dark ? (P.darkPaper ?? '#141413') : (P.lightPaper ?? '#F5F5F2')
    };
  }

  // ---------- le nuancier : une bande par app, celle qu'on choisit s'ouvre
  openBand(i) {
    clearTimeout(this.hoverT);
    this.setState({ band: i });
  }
  renderVals() {
    const v = this.appVals();
    const s = this.state;
    const lang = v.lang, t = v.t;
    const dark = s.theme === 'dark' || (s.theme === 'system' && s.sysDark);
    const mode = dark ? 'dark' : 'light';
    const W = s.wide, any = s.band !== -1;
    const base = dark ? { bg: '#141413', ink: '#E6E5E0' } : { bg: '#F5F5F2', ink: '#1C1C1A' };
    const L = (fr, en) => (lang === 'fr' ? fr : en);
    const list = ORDER.concat(['trced', 'debarras', 'astrolabe']);
    const bands = list.map((key, i) => {
      const on = s.band === i, P = PROJ[key] || EXTRA[key], I = INFO[key];
      const c = P ? P[mode] : null;
      const name = NAMES[key] || key;
      let flex = '1 1 0', disp = 'flex';
      if (any) {
        if (W) flex = on ? '1 1 0' : '0 0 56px';
        else { flex = on ? '1 1 0' : '0 0 0'; disp = on ? 'flex' : 'none'; }
      }
      return {
        n: '0' + (i + 1), name, short: I.short[lang], label: name + ' — ' + I.short[lang],
        idxOp: !any || on ? 1 : 0.4,
        bg: P ? (P.wash ? 'linear-gradient(160deg, #2a2a52 0%, #4b3870 60%, #8f5a86 100%)' : c.bg) : (dark ? '#1E1E1C' : '#E9E8E3'),
        ink: P ? c.ink : base.ink,
        font: P ? P.font : "'Iosevka', monospace", text: I.text, weight: I.weight, track: I.track, tt: P && P.upper ? 'uppercase' : 'none',
        flex, disp, closed: !on, isOpen: on,
        wm: W ? 'vertical-rl' : 'horizontal-tb', nameRot: W ? 'rotate(180deg)' : 'none',
        nameLeft: W ? (on ? 'auto' : '12px') : '20px', nameBottom: W ? '24px' : 'auto', nameTop: W ? 'auto' : '50%',
        nameSize: W ? (on ? '0px' : any ? '34px' : 'clamp(36px, 4.4vw, 76px)') : 'clamp(26px, 7.4vw, 34px)',
        nameOp: on ? 0 : 1,
        isApp: !!P, isOthers: !P,
        isTrced: key === 'trced', isDebarras: key === 'debarras', isAstrolabe: key === 'astrolabe',
        isZoned: key === 'zoned', isBref: key === 'bref', isSpot: key === 'spot', isAplat: key === 'aplat', isDada: key === 'dada',
        pitch: I.pitch ? I.pitch[lang] : '',
        facts: I.facts ? I.facts[lang].map((x) => ({ t: x })) : [],
        features: I.features ? I.features[lang].map(([title, body]) => ({ title, body })) : [],
        links: I.links ? I.links.map(([fr, en, href, ic]) => Object.assign({ label: name + ' — ' + L(fr, en), href }, ICON[ic || (/github\.com/.test(href) ? 'code' : 'globe')])) : [],
        // survol : une courte intention avant d'ouvrir, pour traverser les bandes sans les déclencher
        enter: () => {
          if (s.touch || !W || s.band === i) return;
          clearTimeout(this.hoverT);
          this.hoverT = setTimeout(() => this.setState({ band: i }), any ? 140 : 60);
        },
        open: () => this.openBand(i),
        close: () => this.setState({ band: -1 })
      };
    });
    return Object.assign(v, {
      bands, base, dark, wide: W, narrow: !W, narrowFoot: !W && !any,
      bio: W ? t.bio : BIO_SHORT[lang],
      bioMax: W ? '34ch' : 'none',
      dir: W ? 'row' : 'column', minH: W ? '640px' : '0',
      headDisp: !W && any ? 'none' : 'flex',
      asideFlex: W ? '0 0 clamp(300px, 25vw, 360px)' : 'none', asidePad: W ? '56px 36px 36px' : '22px 20px 14px',
      cPad: W ? '48px 36px 28px 40px' : '8px 20px max(16px, env(safe-area-inset-bottom))',
      cGap: W ? '18px' : '12px', pitchSize: W ? '22px' : '17px',
      factsDisp: W ? 'flex' : 'none', featDisp: W ? 'grid' : 'none',
      featCols: W ? 'repeat(3, minmax(0, 1fr))' : 'minmax(0, 1fr)', featGap: W ? '20px' : '4px', featMinW: W ? '320px' : '0',
      featSize: W ? '13px' : '12px', featDir: W ? 'column' : 'row',
      imgFit: W ? 'contain' : 'cover', imgH: W ? 'auto' : '100%', imgFlex: W ? 'none' : '1 1 0',
      social: [['github', 'https://github.com/alarboulletmarin', 'branch'], ['X (@andddrealm)', 'https://x.com/andddrealm', 'person']]
        .map(([label, href, i]) => Object.assign({ label, href }, ICON[i])),
      langs: v.langs.map((o) => Object.assign({}, o, { ring: o.on === 'true' ? 'currentColor' : 'transparent', op2: o.on === 'true' ? 1 : 0.6, aria: o.label === 'fr' ? 'Français' : 'English' })),
      themeIcons: v.themes.map((o, k) => Object.assign({}, o, ICON[['auto', 'sun', 'moon'][k]], { ring: o.on === 'true' ? 'currentColor' : 'transparent', op: o.on === 'true' ? 1 : 0.6 })),
      tr: { tagline: TRCED[lang].tagline, rule: dark ? 'rgba(236, 235, 230, 0.18)' : 'rgba(23, 24, 26, 0.16)',
        apps: TRCED[lang].apps.map(([name, desc, status]) => ({ name, desc, status })),
        principles: TRCED[lang].principles.map((text, k) => ({ n: '0' + (k + 1), text })) },
      deb: { img: dark ? '/img/17c3279f79ea203dbd70a4f263f043f9.webp' : '/img/2b24f2501602ded8453d998b123eb763.webp', alt: L('Débarras : un dossier dessiné comme un plan, chaque parcelle à sa taille', 'Débarras: a folder drawn as a plan, each plot sized by what it takes') },
      astro: (() => {
        const k = s.astroTab || 0, ac = EXTRA.astrolabe[mode];
        return {
          img: '/img/' + ASTRO[k][0] + '.webp', alt: 'Astrolabe — ' + L(ASTRO[k][1], ASTRO[k][2]) + L(' (données inventées)', ' (made-up data)'),
          tabs: ASTRO.map(([id, fr, en], j) => ({ label: L(fr, en), on: j === k ? 'true' : 'false',
            bg: j === k ? ac.accent : 'transparent', fg: j === k ? (dark ? '#1B1A19' : '#FFFFFF') : 'inherit', border: j === k ? ac.accent : 'currentColor',
            pick: () => this.setState({ astroTab: j }) }))
        };
      })(),
      leave: () => { if (!s.touch) { clearTimeout(this.hoverT); } },
      leaveNav: () => { clearTimeout(this.hoverT); if (!s.touch && W && !this.focusIn) this.setState({ band: -1 }); },
      navFocus: () => { this.focusIn = true; },
      navBlur: () => { this.focusIn = false; }
    });
  }

  render() {
    const v = this.renderVals();
    return (
<main lang={v.lang} style={css(`display: flex; flex-direction: ${v.dir}; height: 100vh; height: 100dvh; min-height: ${v.minH}; overflow: hidden; background: ${v.base.bg}; color: ${v.base.ink}; font-family: 'Iosevka', ui-monospace, monospace; font-size: 15px; line-height: 1.7`)}>

<header style={css(`display: ${v.headDisp}; flex: ${v.asideFlex}; box-sizing: border-box; padding: ${v.asidePad}; flex-direction: column; justify-content: space-between; gap: 18px; min-width: 0`)}>
<div style={css(`display: flex; flex-direction: column; gap: 14px`)}>
<h1 style={css(`margin: 0; font-size: 15px; font-weight: 700`)}>andréa</h1>
<p style={css(`margin: 0; max-width: ${v.bioMax}`)}>{v.bio}</p>
</div>
{v.wide ? (<>
<ol onMouseLeave={v.leave} style={css(`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column`)}>
{(v.bands).map((bd, bd_i) => (<Fragment key={bd_i}>
<li className="index-ligne" onMouseEnter={bd.enter} style={css(`opacity: ${bd.idxOp}`)}><span><span style={css(`font-weight: 700`)}>{bd.name}</span><span style={css(`opacity: 0.7`)}> — {bd.short}</span></span></li>
</Fragment>))}
</ol>
<div style={css(`display: flex; flex-direction: column; gap: 2px`)}>
<div style={css(`display: flex; gap: 2px; margin-left: -12px`)}>{(v.social).map((m, m_i) => (<Fragment key={m_i}><a href={m.href} aria-label={m.label} title={m.label} style={css(`display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 999px; color: inherit; text-decoration: none`)}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={css(`display: block`)}><path d={m.d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path><path d={m.f} fill="currentColor"></path></svg></a></Fragment>))}</div>
<span style={css(`font-variant-numeric: tabular-nums; opacity: 0.7`)}>{v.clock}</span>
</div>
</>) : null}
</header>

<nav aria-label="apps" onMouseLeave={v.leaveNav} onFocus={v.navFocus} onBlur={v.navBlur} style={css(`flex: 1 1 0; min-width: 0; min-height: 0; display: flex; flex-direction: ${v.dir}`)}>
{(v.bands).map((bd, bd_i) => (<Fragment key={bd_i}>
<section className="bande" onMouseEnter={bd.enter} aria-label={bd.label} style={css(`position: relative; flex: ${bd.flex}; display: ${bd.disp}; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; background: ${bd.bg}; color: ${bd.ink}`)}>

<span className="bande-nom" aria-hidden="true" style={css(`position: absolute; left: ${bd.nameLeft}; bottom: ${bd.nameBottom}; top: ${bd.nameTop}; writing-mode: ${bd.wm}; transform: ${bd.nameRot}; font-family: ${bd.font}; font-weight: ${bd.weight}; letter-spacing: ${bd.track}; text-transform: ${bd.tt}; font-size: ${bd.nameSize}; opacity: ${bd.nameOp}; line-height: 0.9; white-space: nowrap`)}>{bd.name}</span>

{bd.closed ? (<>
<button type="button" onFocus={bd.enter} onClick={bd.open} aria-expanded="false" aria-label={bd.label} style={css(`position: absolute; inset: 0; z-index: 1; border: 0; padding: 0; background: transparent; cursor: pointer`)}></button>
</>) : null}

{bd.isOpen ? (<>
{v.narrow ? (<>
<div style={css(`flex: none; position: relative; z-index: 3; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: max(6px, env(safe-area-inset-top)) 20px 0; font-family: 'Iosevka', monospace; font-size: 14px`)}>
<button type="button" onClick={bd.close} style={css(`min-height: 44px; padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: pointer`)}>← {v.t.back}</button>
<span style={css(`font-family: ${bd.font}; font-weight: ${bd.weight}; text-transform: ${bd.tt}; font-size: 22px`)}>{bd.name}</span>
</div>
</>) : null}
<div className="bande-contenu" style={css(`position: relative; z-index: 2; flex: 1; min-height: 0; box-sizing: border-box; padding: ${v.cPad}; display: flex; flex-direction: column; gap: ${v.cGap}`)}>
{bd.isApp ? (<>
<p style={css(`margin: 0; font-family: ${bd.text}; font-size: ${v.pitchSize}; line-height: 1.35; max-width: 36ch`)}>{bd.pitch}</p>
<ul style={css(`list-style: none; margin: 0; padding: 0; display: ${v.factsDisp}; flex-wrap: wrap; gap: 6px; font-family: 'Iosevka', monospace; font-size: 12px`)}>
{(bd.facts).map((f, f_i) => (<Fragment key={f_i}><li style={css(`padding: 2px 10px; border: 1px solid currentColor; border-radius: 999px; opacity: 0.8`)}>{f.t}</li></Fragment>))}
</ul>
<div style={css(`flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; gap: 16px`)}>
{bd.isZoned ? (<><div style={css(`display: flex; flex-direction: column; gap: 20px; padding: 24px; background: ${v.zc.card}; border: 1px solid ${v.zc.ink}; border-radius: 26px; color: ${v.zc.ink}`)}>
<div style={css(`display: flex; align-items: center; gap: 16px; flex-wrap: wrap`)}>
<button type="button" onClick={v.drawSession} disabled={v.zd.drawing} style={css(`display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 22px; border: 0; border-radius: 999px; background: ${v.zc.accent}; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 15px; cursor: pointer; opacity: ${v.zd.btnOp}`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="12" height="12" rx="2"></rect><path d="M7 7l3-4.5a2 2 0 0 1 2.7-.6l7 4.1a2 2 0 0 1 .7 2.7L17 15"></path><circle cx="5.5" cy="10.5" r="0.6" fill="currentColor"></circle><circle cx="10.5" cy="15.5" r="0.6" fill="currentColor"></circle></svg>{v.zd.label}</button>
<span style={css(`font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${v.zc.faint}`)}>{v.zd.count}</span>
<span style={css(`margin-left: auto`)}><span className={v.zr.cls} title={v.zr.title} style={css(`display: block; border-bottom: 2px solid currentColor; padding: 0 6px; margin-bottom: 6px`)}><svg aria-hidden="true" focusable="false" width={v.zr.w} style={css(`display: block; height: auto; color: currentColor`)} viewBox="34.0 61.6 218.6 301.2" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <g className="rc-f rc-f--1"> <path d="M 155.5 318.6C144.8 315.9 100.8 315.2 91.1 302.3C81.3 289.4 95.9 252.1 96.8 241.1C97.8 230 93.9 243.5 96.5 236.1C99.1 228.7 108.6 209.6 112.7 196.6C116.8 183.6 117.4 166.6 121.2 158.1C124.9 149.6 136.1 138.2 135.2 145.8C134.3 153.4 123.4 188.1 115.7 203.7C108.1 219.3 94.8 232.5 89.3 239.6C83.8 246.8 85.1 246.1 82.5 246.7C79.9 247.3 75.1 243.2 73.7 243C72.2 242.8 73.7 244.8 74 245.6C74.4 246.3 74.9 247.1 75.6 247.6C76.2 248.1 77.1 248.5 78 248.6C78.8 248.7 81.1 249.6 80.5 248.2C80 246.9 74.9 243.2 74.7 240.6C74.5 238 74.3 241.2 79.4 232.6C84.6 224.1 98.5 205.4 105.7 189.4C112.8 173.4 115.8 147.2 122.2 136.4C128.5 125.6 140.1 127.8 143.9 124.5C147.7 121.3 145.6 118.9 145 116.7C144.5 114.6 141.8 113.6 140.7 111.8C139.5 109.9 138.6 107.8 138.1 105.8C137.6 103.7 137.4 101.4 137.6 99.2C137.7 97.1 138.2 94.8 139 92.8C139.8 90.7 141 88.8 142.4 87.2C143.8 85.5 145.5 84 147.4 82.8C149.2 81.7 151.3 80.7 153.4 80.2C155.5 79.7 157.7 79.6 159.9 79.7C162.1 79.9 164.4 80.3 166.4 81.1C168.4 82 170.3 83.2 172 84.6C173.6 86 175.2 87.7 176.3 89.5C177.5 91.3 178.4 93.4 178.9 95.5C179.4 97.6 179.5 99.9 179.4 102.1C179.2 104.2 178.8 106.5 178 108.5C177.2 110.5 176 112.5 174.6 114.1C173.2 115.8 171.5 117.4 169.6 118.5C167.8 119.5 164.6 118.4 163.5 120.5C162.4 122.6 162.1 126.6 162.8 131.1C163.5 135.6 166.9 136.8 167.7 147.4C168.4 158 169.4 176.9 167.4 194.6C165.4 212.2 158.8 242 155.7 253.1C152.7 264.2 151.8 260.3 149.2 261.1C146.5 261.9 141.5 257.9 140 257.8C138.6 257.7 140.1 259.6 140.5 260.4C140.9 261.2 141.5 261.9 142.2 262.4C142.9 262.9 143.7 263.2 144.6 263.2C145.4 263.3 147.8 264 147.1 262.7C146.5 261.4 141.2 257.9 140.8 255.4C140.4 253 142.3 254.4 144.7 248.2C147 242 153.1 231.1 154.8 218.1C156.6 205 158 172 155.3 169.9C152.5 167.8 142.8 193.1 138.2 205.5C133.6 217.8 132.7 227.5 127.5 243.9C122.3 260.3 105.5 287.5 107 303.9C108.5 320.2 129.6 334.6 136.8 342.1C143.9 349.6 145.1 347.9 149.8 349.1C154.5 350.2 162.3 348.2 165.2 349.1C168.1 349.9 166.9 353.7 167.4 354.4C168 355.1 168.2 353.6 168.4 353.1C168.6 352.7 168.6 352.1 168.5 351.6C168.5 351.1 168.3 350.6 168 350.2C167.7 349.8 167 348.4 166.7 349.2C166.4 350 169 353.3 166 355" /> <path stroke="#E8452A" d="M 166 355C163 356.7 154.5 359.4 148.7 359.4C142.8 359.4 139.8 366.5 130.8 354.9" /> <path d="M 130.8 354.9C121.8 343.3 97.7 308.1 94.8 289.9C91.9 271.7 109.9 253.6 113.3 245.7C116.7 237.8 115.9 232.4 115 242.3C114.1 252.2 101.1 294.3 107.9 305.1C114.7 315.9 146.8 308.4 155.6 307C164.3 305.7 156.2 300.6 160.5 296.9C164.8 293.2 177 286.4 181.4 284.7C185.8 283.1 185.9 286.9 186.7 287C187.6 287.1 186.8 285.9 186.6 285.4C186.4 285 186 284.5 185.6 284.2C185.2 283.9 184.7 283.7 184.2 283.7C183.7 283.6 182.9 283.8 182.6 283.8" /> <path d="M 182.6 283.8C183.3 284 186.3 284.4 186.9 285.3C187.5 286.2 187.9 286.1 186.2 289.3C184.6 292.5 180.2 300 177.1 304.5C174 309 170.3 313.3 167.6 316.1C164.9 318.9 162.9 321 160.8 321.4C158.8 321.8 156.4 319.1 155.5 318.6" /> </g> <g className="rc-f rc-f--2"> <path d="M 198.1 312.9C186.5 310.7 145.3 311 128.9 299.8C112.4 288.6 104.8 256.3 99.4 245.7C94 235.1 94.3 244.3 96.5 236.1C98.7 227.9 108.6 209.6 112.7 196.6C116.8 183.6 117.4 166.6 121.2 158.1C124.9 149.6 139.5 139.5 135.2 145.8C130.9 152 107.6 182.7 95.1 195.5C82.6 208.3 67.6 217.2 60.4 222.6C53.2 227.9 54.6 227.7 51.9 227.5C49.2 227.3 45.7 222.1 44.4 221.5C43.1 220.9 44 223.3 44.1 224.1C44.2 224.9 44.5 225.8 45 226.4C45.5 227.1 46.2 227.8 47 228.1C47.8 228.4 49.7 229.9 49.6 228.4C49.4 227 45.5 222 46 219.5C46.6 216.9 45.4 219.9 52.8 213.1C60.2 206.3 79 191.4 90.5 178.6C102.1 165.8 113.3 145.4 122.2 136.4C131.1 127.4 140.1 127.8 143.9 124.5C147.7 121.3 145.6 118.9 145 116.7C144.5 114.6 141.8 113.6 140.7 111.8C139.5 109.9 138.6 107.8 138.1 105.8C137.6 103.7 137.4 101.4 137.6 99.2C137.7 97.1 138.2 94.8 139 92.8C139.8 90.7 141 88.8 142.4 87.2C143.8 85.5 145.5 84 147.4 82.8C149.2 81.7 151.3 80.7 153.4 80.2C155.5 79.7 157.7 79.6 159.9 79.7C162.1 79.9 164.4 80.3 166.4 81.1C168.4 82 170.3 83.2 172 84.6C173.6 86 175.2 87.7 176.3 89.5C177.5 91.3 178.4 93.4 178.9 95.5C179.4 97.6 179.5 99.9 179.4 102.1C179.2 104.2 178.8 106.5 178 108.5C177.2 110.5 176 112.5 174.6 114.1C173.2 115.8 171.5 117.4 169.6 118.5C167.8 119.5 164.6 118.4 163.5 120.5C162.4 122.6 162.1 126.6 162.8 131.1C163.5 135.6 163.7 138.4 167.7 147.4C171.6 156.4 179.2 169.8 186.4 185.1C193.6 200.5 207 228.6 211 239.4C215 250.1 212 247.5 210.3 249.7C208.7 251.9 202.3 251.7 201 252.4C199.8 253.2 202.2 253.8 202.9 254.2C203.7 254.6 204.7 254.9 205.5 254.9C206.3 254.9 207.2 254.6 207.9 254.1C208.6 253.7 211 252.9 209.7 252.2C208.4 251.6 202 251.8 200.3 250C198.5 248.3 201 248.3 199.1 241.9C197.3 235.5 196.5 223.6 189.2 211.6C181.9 199.6 163.8 170.9 155.3 169.9C146.8 168.9 142.8 193.1 138.2 205.5C133.6 217.8 130.3 227.3 127.5 243.9C124.7 260.5 127.8 287.2 121.6 305.4C115.4 323.5 94 345.1 90.3 352.7C86.5 360.2 95.1 351.6 99.1 350.8C103.1 350.1 111.2 347.9 114.3 348.3C117.3 348.7 116.7 352.6 117.4 353.2C118 353.8 118 352.3 118.1 351.8C118.2 351.3 118.2 350.7 118 350.3C117.9 349.8 117.6 349.3 117.2 348.9C116.9 348.6 116 347.3 115.8 348.2C115.6 349 118.7 351.8 116 354" /> <path stroke="#E8452A" d="M 116 354C113.3 356.2 106.3 361.4 99.7 361.2C93.1 361.1 75 364.3 76.1 353.2" /> <path d="M 76.1 353.2C77.2 342.2 100.2 312.7 106.4 294.8C112.6 276.8 111.9 254.4 113.3 245.7C114.7 237 109.8 234.5 115 242.3C120.2 250.1 131.4 283.1 144.4 292.6C157.4 302.2 183.9 300 192.7 299.5C201.6 299 195.6 294.2 197.6 289.4C199.7 284.6 202.9 274 205.1 270.9C207.3 267.7 210 270.7 210.8 270.4C211.6 270.1 210.3 269.4 209.9 269.1C209.6 268.7 209 268.5 208.5 268.4C208 268.4 207.4 268.5 207 268.6C206.5 268.8 205.9 269.3 205.7 269.5" /> <path d="M 205.7 269.5C206.4 269.4 209.2 268.3 210.2 268.8C211.2 269.3 211.4 269 211.4 272.6C211.5 276.2 211.2 284.9 210.5 290.3C209.9 295.7 208.7 301.3 207.6 305.1C206.5 308.8 205.7 311.6 204.1 312.9C202.5 314.2 199.1 312.9 198.1 312.9" /> </g> <g className="rc-f rc-f--3"> <path d="M 201.2 308.1C190.2 304.2 151.9 297.3 135.1 285C118.2 272.7 106.6 244.5 100.1 234.4C93.7 224.2 94.4 232.4 96.5 224.1C98.6 215.8 108.6 197.6 112.7 184.6C116.8 171.6 117.4 154.6 121.2 146.1C124.9 137.6 140.2 127.9 135.2 133.8C130.2 139.6 104.4 168.7 91.4 181C78.4 193.4 64.4 202.6 57.3 208C50.2 213.3 51.5 213.1 48.8 212.9C46.1 212.7 42.6 207.5 41.3 206.9C40 206.3 40.8 208.6 40.9 209.5C41 210.3 41.4 211.1 41.9 211.8C42.3 212.5 43.1 213.1 43.9 213.5C44.6 213.8 46.6 215.2 46.4 213.8C46.3 212.4 42.4 207.4 42.9 204.9C43.5 202.3 42.2 205.4 49.7 198.5C57.2 191.7 75.9 176.2 88 163.9C100.1 151.5 112.9 132.9 122.2 124.4C131.5 115.8 140.1 115.8 143.9 112.5C147.7 109.3 145.6 106.9 145 104.7C144.5 102.6 141.8 101.6 140.7 99.8C139.5 97.9 138.6 95.8 138.1 93.8C137.6 91.7 137.4 89.4 137.6 87.2C137.7 85.1 138.2 82.8 139 80.8C139.8 78.7 141 76.8 142.4 75.2C143.8 73.5 145.5 72 147.4 70.8C149.2 69.7 151.3 68.7 153.4 68.2C155.5 67.7 157.7 67.6 159.9 67.7C162.1 67.9 164.4 68.3 166.4 69.1C168.4 70 170.3 71.2 172 72.6C173.6 74 175.2 75.7 176.3 77.5C177.5 79.3 178.4 81.4 178.9 83.5C179.4 85.6 179.5 87.9 179.4 90.1C179.2 92.2 178.8 94.5 178 96.5C177.2 98.5 176 100.5 174.6 102.1C173.2 103.8 171.5 105.4 169.6 106.5C167.8 107.5 164.6 106.4 163.5 108.5C162.4 110.6 162.1 114.6 162.8 119.1C163.5 123.6 163.3 126.9 167.7 135.4C172.1 143.9 179.8 156.5 189.1 170.4C198.3 184.3 217.1 208.9 223 218.7C228.9 228.5 225.7 226.4 224.5 228.9C223.4 231.4 217 232.5 216 233.5C214.9 234.5 217.4 234.7 218.2 234.9C219 235.1 220.1 235.2 220.9 235C221.7 234.8 222.5 234.3 223.1 233.8C223.7 233.2 225.8 232 224.4 231.5C223 231.1 216.8 232.7 214.8 231.3C212.7 230 215.3 229.4 212 223.6C208.6 217.8 204 207.4 194.6 196.4C185.1 185.5 164.7 158.4 155.3 157.9C145.9 157.4 142.8 181.1 138.2 193.5C133.6 205.8 125.9 216.3 127.5 231.9C129.1 247.5 153.9 272.7 147.7 286.8C141.5 301 99.3 310.4 90.3 317C81.3 323.6 91.5 322.8 93.7 326.4C95.9 330 102.1 335.6 103.3 338.5C104.4 341.3 100.6 342.7 100.4 343.5C100.2 344.4 101.5 343.6 102 343.5C102.5 343.3 102.9 343 103.3 342.7C103.6 342.3 104 341.8 104.1 341.3C104.2 340.9 104.9 339.5 104 339.7C103.2 340 102.3 344 99.1 342.7C95.9 341.4 88.4 337.4 84.9 331.9C81.4 326.4 70.7 317.9 78.1 309.9C85.5 301.9 123.6 296.6 129.4 283.9C135.3 271.2 115.7 242.6 113.3 233.7C110.9 224.8 108.9 223.2 115 230.3C121.1 237.4 136.1 265.7 149.8 276.3C163.5 286.9 188.1 292.3 197.1 293.6C206.1 295 201.3 289.1 203.7 284.5C206 280 208.9 269.6 211.1 266.6C213.3 263.6 216.1 266.7 216.9 266.5C217.7 266.2 216.5 265.5 216.1 265.1C215.8 264.8 215.3 264.5 214.8 264.4C214.3 264.3 213.7 264.3 213.2 264.5C212.7 264.6 212.1 265.1 211.8 265.2" /> <path d="M 211.8 265.2C212.6 265.2 215.5 264.3 216.4 264.9C217.3 265.5 217.6 265.2 217.4 268.8C217.2 272.4 216.2 281 215.2 286.4C214.2 291.7 212.6 297.2 211.3 300.9C210 304.5 208.9 307.2 207.2 308.4C205.6 309.6 202.2 308.1 201.2 308.1" /> </g> <g className="rc-f rc-f--4"> <path d="M 137.8 354.1C131.7 345.7 108.2 322.5 101.5 303.9C94.7 285.3 98.1 253.8 97.3 242.5C96.4 231.2 93.9 243.8 96.5 236.1C99.1 228.4 108.6 209.6 112.7 196.6C116.8 183.6 117.4 166.6 121.2 158.1C124.9 149.6 139.9 139.7 135.2 145.8C130.5 151.8 106 181.7 93.2 194.3C80.5 206.9 65.9 216 58.8 221.3C51.6 226.6 53 226.4 50.3 226.2C47.7 226 44.1 220.8 42.8 220.2C41.5 219.7 42.4 222 42.5 222.8C42.6 223.6 42.9 224.5 43.4 225.2C43.9 225.8 44.6 226.5 45.4 226.8C46.2 227.1 48.1 228.6 48 227.1C47.8 225.7 43.9 220.8 44.5 218.2C45 215.7 43.8 218.7 51.2 211.8C58.7 205 77.4 189.8 89.2 177.3C101.1 164.7 113.1 145.2 122.2 136.4C131.3 127.6 140.1 127.8 143.9 124.5C147.7 121.3 145.6 118.9 145 116.7C144.5 114.6 141.8 113.6 140.7 111.8C139.5 109.9 138.6 107.8 138.1 105.8C137.6 103.7 137.4 101.4 137.6 99.2C137.7 97.1 138.2 94.8 139 92.8C139.8 90.7 141 88.8 142.4 87.2C143.8 85.5 145.5 84 147.4 82.8C149.2 81.7 151.3 80.7 153.4 80.2C155.5 79.7 157.7 79.6 159.9 79.7C162.1 79.9 164.4 80.3 166.4 81.1C168.4 82 170.3 83.2 172 84.6C173.6 86 175.2 87.7 176.3 89.5C177.5 91.3 178.4 93.4 178.9 95.5C179.4 97.6 179.5 99.9 179.4 102.1C179.2 104.2 178.8 106.5 178 108.5C177.2 110.5 176 112.5 174.6 114.1C173.2 115.8 171.5 117.4 169.6 118.5C167.8 119.5 164.6 118.4 163.5 120.5C162.4 122.6 162.1 126.6 162.8 131.1C163.5 135.6 163.2 139 167.7 147.4C172.2 155.8 179.9 168.3 189.9 181.4C199.9 194.5 221 217 227.8 226.2C234.5 235.3 231.3 233.6 230.4 236.2C229.5 238.7 223.3 240.6 222.4 241.7C221.4 242.8 223.9 242.6 224.7 242.8C225.6 242.9 226.6 242.9 227.4 242.6C228.1 242.3 228.9 241.8 229.4 241.1C229.9 240.5 232 239.1 230.5 238.8C229.1 238.5 223.1 240.7 220.9 239.6C218.7 238.5 221.4 237.6 217.3 232.2C213.2 226.8 206.6 217.6 196.3 207.2C186 196.9 165 170.2 155.3 169.9C145.6 169.6 142.8 193.1 138.2 205.5C133.6 217.8 122.2 231.5 127.5 243.9C132.8 256.3 168.9 264.8 169.9 279.7C170.9 294.6 138.1 323.7 133.4 333.3C128.7 342.9 137.9 336.1 141.8 337.4C145.6 338.6 154.1 339.4 156.7 341C159.4 342.6 157.2 346 157.6 346.7C158 347.5 158.5 346.1 158.8 345.7C159.1 345.3 159.3 344.8 159.3 344.3C159.4 343.8 159.4 343.2 159.2 342.7C159 342.3 158.6 340.8 158.1 341.5C157.6 342.2 159.4 346 156 346.9C152.7 347.9 144.3 349.5 138.2 347.1C132.1 344.8 116.9 343 119.2 332.7C121.6 322.5 153.4 300.2 152.4 285.7C151.4 271.2 119.5 252.9 113.3 245.7C107.1 238.5 114.1 232.6 115 242.3C115.9 252 113.2 286.6 118.5 303.9C123.9 321.2 140.6 339.7 147.1 346.1C153.6 352.5 152.2 341.7 157.7 342.5C163.3 343.3 176.3 348.6 180.3 350.9C184.4 353.2 181.7 355.6 182.2 356.4C182.7 357.1 183 355.7 183.3 355.2C183.5 354.8 183.6 354.2 183.5 353.7C183.5 353.2 183.3 352.7 183 352.2C182.7 351.8 182 351.3 181.8 351.2" /> <path stroke="#E8452A" d="M 181.8 351.2C182.1 351.9 183.9 354.4 183.6 355.4C183.3 356.5 183.6 356.6 180.1 357.5C176.7 358.4 168.1 360.2 162.7 360.8C157.3 361.5 151.6 361.6 147.7 361.5C143.8 361.3 140.9 361.2 139.3 359.9C137.6 358.7 138.1 355 137.8 354.1" /> </g> <g className="rc-f rc-f--5"> <path d="M 88 354.4C84.4 343.8 64.8 310.2 66.3 290.7C67.8 271.2 91.8 246.4 96.9 237.3C101.9 228.3 93.9 243 96.5 236.2C99.1 229.4 108.6 209.7 112.7 196.7C116.8 183.7 117.4 166.7 121.2 158.2C124.9 149.7 136.8 138.4 135.2 145.9C133.6 153.3 120.2 187.6 111.4 202.7C102.6 217.9 88.6 230 82.5 236.7C76.5 243.5 77.9 243 75.3 243.3C72.6 243.7 68.1 239.3 66.7 239C65.3 238.7 66.6 240.8 66.9 241.6C67.1 242.4 67.7 243.2 68.3 243.7C68.9 244.3 69.8 244.8 70.6 244.9C71.4 245.1 73.6 246.1 73.2 244.7C72.7 243.3 67.9 239.3 67.9 236.7C67.9 234.1 67.4 237.2 73.2 229.1C78.9 220.9 94.2 203.2 102.3 187.8C110.5 172.3 115.2 147 122.2 136.5C129.1 126 140.1 127.9 143.9 124.6C147.7 121.4 145.6 119 145 116.8C144.5 114.7 141.8 113.7 140.7 111.9C139.5 110 138.6 107.9 138.1 105.9C137.6 103.8 137.4 101.5 137.6 99.3C137.7 97.2 138.2 94.9 139 92.9C139.8 90.8 141 88.9 142.4 87.3C143.8 85.6 145.5 84.1 147.4 82.9C149.2 81.8 151.3 80.8 153.4 80.3C155.5 79.8 157.7 79.7 159.9 79.8C162.1 80 164.4 80.4 166.4 81.2C168.4 82.1 170.3 83.3 172 84.7C173.6 86.1 175.2 87.8 176.3 89.6C177.5 91.4 178.4 93.5 178.9 95.6C179.4 97.7 179.5 100 179.4 102.2C179.2 104.3 178.8 106.6 178 108.6C177.2 110.6 176 112.6 174.6 114.2C173.2 115.9 171.5 117.5 169.6 118.6C167.8 119.6 164.6 118.5 163.5 120.6C162.4 122.7 162.1 126.7 162.8 131.2C163.5 135.7 166.3 137.1 167.7 147.5C169.1 157.9 170.3 176.3 171.1 193.8C171.8 211.4 172.7 241.5 172.2 252.9C171.6 264.3 170.1 260.8 167.8 262.2C165.4 263.6 159.5 261 158.1 261.3C156.7 261.5 158.6 263 159.2 263.6C159.7 264.3 160.5 264.9 161.3 265.2C162.1 265.5 163 265.6 163.8 265.4C164.6 265.3 167.1 265.4 166.2 264.3C165.3 263.2 159.3 261 158.3 258.8C157.3 256.5 159.8 257.5 160.3 250.8C160.8 244.1 161.9 232 161.1 218.5C160.3 205.1 159.1 172.2 155.3 170C151.5 167.8 142.8 193.2 138.2 205.6C133.6 217.9 120.4 238.6 127.5 244C134.6 249.4 168.3 228.7 180.5 237.7C192.7 246.7 195.4 287.4 200.6 298C205.9 308.6 207.7 301.2 212.1 301.2C216.6 301.3 224.2 298.1 227.3 298.5C230.3 298.8 229.8 302.8 230.4 303.4C231.1 303.9 231 302.4 231.1 301.9C231.2 301.4 231.2 300.9 231 300.4C230.9 299.9 230.6 299.4 230.2 299.1C229.9 298.7 229 297.5 228.8 298.4C228.6 299.2 231.7 302 229.1 304.2C226.4 306.4 219.1 310.8 212.9 311.6C206.7 312.4 198.8 318.7 191.9 309.1C185 299.5 184.6 264.5 171.5 253.9C158.4 243.3 122.7 247.7 113.3 245.8C103.9 243.9 120.5 233.3 115 242.4C109.5 251.5 83.3 283 80.5 300.2C77.7 317.5 93.3 338.5 98.1 346C102.9 353.5 103.9 344.6 109.3 345.3C114.7 346 126.6 348.5 130.5 350.2C134.3 351.9 132 354.9 132.5 355.6C133 356.3 133.3 354.9 133.5 354.4C133.7 354 133.8 353.4 133.7 352.9C133.7 352.4 133.4 351.9 133.1 351.4C132.8 351 132.2 350.6 132 350.4" /> <path stroke="#E8452A" d="M 132 350.4C132.3 351.1 134.1 353.5 133.8 354.6C133.6 355.7 133.9 355.8 130.4 356.8C127 357.8 118.5 359.8 113.1 360.6C107.7 361.3 102 361.6 98.1 361.6C94.2 361.5 91.3 361.4 89.7 360.2C88 359 88.3 355.4 88 354.4" /> </g> <g className="rc-f rc-f--6"> <path d="M 102.6 344.7C97.3 334.2 71.3 301.3 70.4 281.5C69.4 261.7 92.4 235.5 96.7 225.9C101.1 216.4 93.8 231 96.5 224.1C99.2 217.2 108.6 197.6 112.7 184.6C116.8 171.6 117.4 154.6 121.2 146.1C124.9 137.6 135.7 126.1 135.2 133.8C134.7 141.4 125.5 176.5 117.9 192.1C110.4 207.7 95.6 220.4 89.8 227.4C83.9 234.5 85.4 233.8 82.7 234.3C80.1 234.8 75.4 230.5 74 230.3C72.6 230.1 74 232.1 74.3 232.9C74.6 233.6 75.1 234.4 75.8 234.9C76.4 235.5 77.3 235.9 78.1 236C78.9 236.2 81.2 237.1 80.7 235.7C80.2 234.4 75.2 230.5 75.1 227.9C75 225.3 74.8 228.4 80.2 220.1C85.5 211.8 100.4 194.1 107.4 178.2C114.4 162.2 116.1 135.3 122.2 124.4C128.3 113.5 140.1 115.8 143.9 112.5C147.7 109.3 145.6 106.9 145 104.7C144.5 102.6 141.8 101.6 140.7 99.8C139.5 97.9 138.6 95.8 138.1 93.8C137.6 91.7 137.4 89.4 137.6 87.2C137.7 85.1 138.2 82.8 139 80.8C139.8 78.7 141 76.8 142.4 75.2C143.8 73.5 145.5 72 147.4 70.8C149.2 69.7 151.3 68.7 153.4 68.2C155.5 67.7 157.7 67.6 159.9 67.7C162.1 67.9 164.4 68.3 166.4 69.1C168.4 70 170.3 71.2 172 72.6C173.6 74 175.2 75.7 176.3 77.5C177.5 79.3 178.4 81.4 178.9 83.5C179.4 85.6 179.5 87.9 179.4 90.1C179.2 92.2 178.8 94.5 178 96.5C177.2 98.5 176 100.5 174.6 102.1C173.2 103.8 171.5 105.4 169.6 106.5C167.8 107.5 164.6 106.4 163.5 108.5C162.4 110.6 162.1 114.6 162.8 119.1C163.5 123.6 167.1 124.8 167.7 135.4C168.2 146 168.1 165.1 166.1 182.7C164.1 200.4 158.5 230.1 155.7 241.2C152.9 252.3 152 248.5 149.4 249.4C146.8 250.3 141.6 246.5 140.2 246.5C138.7 246.4 140.3 248.3 140.7 249C141.1 249.8 141.8 250.6 142.5 251C143.2 251.5 144.1 251.7 144.9 251.7C145.7 251.8 148.1 252.4 147.4 251.2C146.8 249.9 141.4 246.5 140.9 244.1C140.4 241.7 142.5 243.1 144.5 236.7C146.5 230.3 151 218.9 152.8 205.8C154.6 192.7 157.7 160 155.3 157.9C152.8 155.8 142.8 181.1 138.2 193.5C133.6 205.8 120.4 225.8 127.5 231.9C134.6 238 166.2 221.9 180.9 229.8C195.5 237.8 207.6 271.3 215.4 279.6C223.1 287.9 223.2 280.8 227.5 279.7C231.9 278.5 238.3 273.3 241.3 272.8C244.4 272.3 244.9 276.3 245.7 276.7C246.5 277 246 275.6 246 275.1C245.9 274.6 245.7 274.1 245.5 273.7C245.2 273.2 244.8 272.8 244.3 272.6C243.9 272.4 242.7 271.4 242.7 272.3C242.8 273.2 246.6 274.9 244.6 277.8C242.7 280.6 236.8 286.9 231.1 289.4C225.4 291.9 220.5 300.2 210.5 292.9C200.4 285.5 187 255.2 170.8 245.3C154.6 235.5 122.6 236.2 113.3 233.7C104 231.2 119.7 220.9 115 230.3C110.3 239.7 86.1 272.9 85.2 289.9C84.4 306.8 103.8 325.3 109.7 331.9C115.6 338.5 115.8 331 120.7 329.6C125.6 328.1 135.6 323.5 139.4 323.1C143.2 322.7 142.7 326.7 143.5 327.1C144.2 327.6 143.9 326.1 143.9 325.6C143.9 325.1 143.7 324.6 143.5 324.2C143.2 323.7 142.8 323.3 142.3 323.1C141.9 322.8 141.1 322.7 140.8 322.6" /> <path d="M 140.8 322.6C141.4 323.1 144.1 324.6 144.3 325.7C144.5 326.7 144.8 326.7 142.1 329.1C139.4 331.4 132.5 336.8 128 339.8C123.4 342.8 118.4 345.4 114.8 347C111.3 348.6 108.6 349.7 106.6 349.3C104.5 349 103.3 345.5 102.6 344.7" /> </g> </svg></span></span>
</div>
<div aria-live="polite" style={css(`min-height: 214px; display: flex; flex-direction: column`)}>
{v.zd.scanning ? (<>
<div aria-hidden="true" style={css(`position: relative; overflow: hidden; padding: 20px; border-radius: 18px; background: ${v.zc.card}; border: 1px solid ${v.zc.ink}; box-shadow: inset 0 0 0 2px ${v.zd.scanEdge}`)}>
<span className="zoned-sweep" style={css(`position: absolute; top: 0; bottom: 0; left: 0; width: 33%; background: ${v.zc.accentSoft}; pointer-events: none`)}></span>
<p style={css(`position: relative; margin: 0; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600; font-size: 22px; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)}>{v.zd.scanName}</p>
<p style={css(`position: relative; margin: 8px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${v.zc.muted}; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden`)}>{v.zd.scanDesc}</p>
</div>
</>) : null}
{v.zd.showResult ? (<>
<a className="zoned-lien zoned-pose" href={v.zs.href} target="_blank" rel="noopener" aria-label={v.zs.openLabel} style={css(`display: block; text-decoration: none; color: inherit`)}>
<article className="zoned-carte" style={css(`box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; padding: 20px; background-color: ${v.zc.card}; border: 1px solid ${v.zc.ink}; border-radius: 22px`)}>
<div style={css(`display: flex; justify-content: space-between; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: ${v.zc.faint}`)}><span>{v.zs.cat} · {v.zs.lvl}</span><span aria-hidden="true">↗</span></div>
<h3 style={css(`margin: 0; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600; font-size: 28px; line-height: 1.05; letter-spacing: -0.02em`)}>{v.zs.name}</h3>
<p style={css(`margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.5; color: ${v.zc.muted}; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden`)}>{v.zs.desc}</p>
<div role="img" aria-label={v.zs.profileLabel} style={css(`box-sizing: border-box; display: flex; align-items: flex-end; gap: 2px; height: 40px; padding: 0 3px; background: ${v.zc.card}; border: 1px solid ${v.zc.ink}; border-radius: 6px; overflow: hidden`)}>
{(v.zs.blocks).map((b, b_i) => (<Fragment key={b_i}>
<div style={css(`flex: ${b.f} 1 0; min-width: 2px; box-sizing: border-box; height: ${b.h}; background: ${b.fill}; border: 1px solid ${v.zc.ink}; border-bottom: none; border-radius: 2px 2px 0 0`)}></div>
</Fragment>))}
</div>
<div style={css(`display: flex; align-items: center; gap: 14px; padding-top: 10px; border-top: 1px solid ${v.zc.divider}; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-variant-numeric: tabular-nums`)}>
<b>Z{v.zs.z}</b><span>{v.zs.dur}</span><span style={css(`margin-left: auto; color: ${v.zc.accent}`)}>{v.zs.id}</span>
</div>
</article>
</a>
</>) : null}
</div>
</div></>) : null}
{bd.isBref ? (<><div style={css(`flex: ${v.bref.winFlex}; min-height: 0; display: flex; flex-direction: column; border-radius: 12px; background: ${v.bc.chrome}; border: 1px solid ${v.bc.edge}; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.16); overflow: hidden; color: ${v.bc.ink}`)}>
<div aria-hidden="true" style={css(`display: flex; justify-content: flex-end; align-items: center; gap: 16px; height: 32px; padding: 0 14px; color: ${v.bc.faint}`)}>
<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 5h8"></path></svg>
<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="1" width="8" height="8"></rect></svg>
<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 1l8 8M9 1l-8 8"></path></svg>
</div>
<div style={css(`display: flex; flex: ${v.bref.winFlex}; min-height: 0`)}>
<div aria-hidden="true" style={css(`width: 40px; flex: none; display: ${v.bref.rail}; flex-direction: column; align-items: center; gap: 16px; padding-top: 10px; color: ${v.bc.faint}`)}>
<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 2h7l3 3v9H3z"></path></svg>
<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="5.5"></circle><path d="M8 5v3l2 2"></path></svg>
<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="4" cy="12" r="1.6"></circle><circle cx="12" cy="4" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><path d="M5.4 11l5.2-5.6M5.6 12h4.8"></path></svg>
<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 2L4.5 14M11.5 2L10 14M2.5 5.5h11M2 10.5h11"></path></svg>
<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7" cy="7" r="4.5"></circle><path d="M10.5 10.5L14 14"></path></svg>
</div>
<div style={css(`flex: 1; min-width: 0; min-height: 0; margin: ${v.bref.paperMargin}; border-radius: 10px; background: ${v.bc.paper}; display: flex; flex-direction: column`)}>
<div style={css(`flex: ${v.bref.areaFlex}; height: ${v.bref.h}; min-height: 0; overflow-y: auto; padding: ${v.bref.pad}; font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; line-height: 1.6; cursor: text`)}>
{(v.bref.lines).map((l, l_i) => (<Fragment key={l_i}>
<div style={css(`display: flex; align-items: baseline; gap: 6px; margin: ${l.margin}; padding: ${l.pad}; border-radius: 6px; background: ${l.bg}`)}>
{l.isTask ? (<>
<button type="button" aria-pressed={l.done} aria-label={l.taskLabel} onClick={l.toggle} onMouseDown={v.bref.keepFocus} style={css(`flex: none; padding: 0 2px; border: 0; background: none; color: ${v.bc.accent}; font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 13px; line-height: 1.6; cursor: pointer`)}>[{l.mark}]</button>
</>) : null}
<div style={css(`position: relative; flex: 1; min-width: 0; font-family: ${l.font}; font-weight: ${l.weight}; font-size: ${l.size}; line-height: ${l.lh}`)}>
<div aria-hidden="true" style={css(`white-space: pre-wrap; overflow-wrap: anywhere; pointer-events: none; opacity: ${l.op}`)}>{(l.tokens).map((k, k_i) => (<Fragment key={k_i}><span style={css(`color: ${k.color}; -webkit-text-stroke: ${k.stroke}; font-style: ${k.style}; text-decoration-line: ${k.deco}; background: ${k.bg}; border-radius: 3px`)}>{k.text}</span></Fragment>))}</div>
<textarea className="bref-saisie" rows="1" value={l.text} onChange={l.onChange} onKeyDown={l.onKey} onFocus={l.onFocus} aria-label={l.label} spellCheck="false" style={css(`position: absolute; inset: 0; width: 100%; height: 100%; box-sizing: border-box; margin: 0; padding: 0; border: 0; outline: none; resize: none; overflow: hidden; background: transparent; color: transparent; caret-color: ${v.bc.accent}; font: inherit; letter-spacing: inherit; white-space: pre-wrap; overflow-wrap: anywhere`)}></textarea>
</div>
</div>
</Fragment>))}
</div>
<div style={css(`display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 6px 10px; border-top: 1px solid ${v.bc.edge}`)}>
{(v.bref.tools).map((o, o_i) => (<Fragment key={o_i}>
<button type="button" className="bref-outil" aria-label={o.label} title={o.label} onMouseDown={v.bref.keepFocus} onClick={o.run} style={css(`min-width: ${v.bref.toolSize}; height: ${v.bref.toolSize}; padding: 0 6px; border: 0; border-radius: 6px; background-color: transparent; color: ${o.color}; font-family: ${o.font}; font-weight: ${o.weight}; font-style: ${o.style}; text-decoration-line: ${o.deco}; font-size: 13px; cursor: pointer`)}>{o.glyph}</button>
</Fragment>))}
<span style={css(`margin-left: auto; font-size: 11px; color: ${v.bc.faint}; font-variant-numeric: tabular-nums`)}>{v.bref.count}</span>
</div>
</div>
</div>
</div></>) : null}
{bd.isSpot ? (<><div style={css(`position: relative; flex: ${v.sc.flex}; min-height: 0; display: flex; flex-direction: column; margin-top: 8px; border-radius: 16px; background: ${v.sc.card}; color: ${v.sc.ink}; box-shadow: 0 30px 70px rgba(10, 6, 30, 0.45); overflow: hidden; font-family: 'Inter', sans-serif`)}>
<div style={css(`display: flex; align-items: center; gap: 12px; padding: 14px 18px`)}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={css(`opacity: 0.6`)}><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>
<input type="text" role="combobox" aria-expanded="true" aria-controls="spot-resultats" aria-activedescendant={v.spotActive} aria-autocomplete="list" aria-label={v.t.searchLabel} value={v.query} onChange={v.onQuery} onKeyDown={v.onQueryKey} placeholder={v.t.searchPh} autoComplete="off" spellCheck="false" style={css(`flex: 1; min-width: 0; border: 0; outline: none; background: transparent; color: inherit; font-family: 'Inter', sans-serif; font-size: 20px; padding: 6px 0`)} />
</div>
<div style={css(`height: 1px; background: ${v.sc.rule}`)}></div>
<div id="spot-resultats" role="listbox" aria-label={v.t.searchLabel} style={css(`display: flex; flex-direction: column; gap: 2px; padding: 6px; flex: ${v.sc.listFlex}; min-height: 0; height: ${v.sc.listH}; overflow-y: auto`)}>
{(v.results).map((r, r_i) => (<Fragment key={r_i}>
{r.isLink ? (<>
<a className="spot-ligne" href={r.href} target="_blank" rel="noopener" onMouseMove={r.pick} id={r.id} data-on={r.on} aria-selected={r.on} role="option" tabIndex="-1" style={css(`display: flex; align-items: center; gap: 12px; padding: 7px 10px; border-radius: 8px; background-color: ${r.bg}; color: ${r.fg}; text-decoration: none`)}>
<span aria-hidden="true" style={css(`flex: none; width: 28px; height: 28px; border-radius: ${r.iconRadius}; background: ${r.tint}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px`)}>{r.glyph}</span>
<span style={css(`display: flex; flex-direction: column; min-width: 0; flex: 1`)}><span style={css(`font-size: 14px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)}>{r.title}</span><span style={css(`font-size: 11px; line-height: 1.3; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)}>{r.sub}</span></span>
<span style={css(`flex: none; font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 999px; background: ${r.pillBg}; color: ${r.pillFg}`)}>{r.kindLabel}</span>
</a>
</>) : null}
{r.isButton ? (<>
<button type="button" className="spot-ligne" onClick={r.activate} onMouseMove={r.pick} id={r.id} data-on={r.on} aria-selected={r.on} role="option" tabIndex="-1" style={css(`display: flex; align-items: center; gap: 12px; width: 100%; padding: 7px 10px; border: 0; border-radius: 8px; background-color: ${r.bg}; color: ${r.fg}; font: inherit; text-align: left; cursor: pointer`)}>
<span aria-hidden="true" style={css(`flex: none; width: 28px; height: 28px; border-radius: ${r.iconRadius}; background: ${r.tint}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px`)}>{r.glyph}</span>
<span style={css(`display: flex; flex-direction: column; min-width: 0; flex: 1`)}><span style={css(`font-size: 14px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)}>{r.title}</span><span style={css(`font-size: 11px; line-height: 1.3; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`)}>{r.sub}</span></span>
<span style={css(`flex: none; font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 999px; background: ${r.pillBg}; color: ${r.pillFg}`)}>{r.kindLabel}</span>
</button>
</>) : null}
</Fragment>))}
{v.noResult ? (<><p style={css(`margin: 0; padding: 18px 10px; font-size: 14px; opacity: 0.6`)}>{v.t.noResult}</p></>) : null}
</div>
{v.locked ? (<>
<button type="button" onClick={v.unlock} style={css(`position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 0; background: linear-gradient(160deg, #303059, #8f5a86); color: #FFFFFF; font-family: 'Inter', sans-serif; cursor: pointer`)}>
<span style={css(`font-size: 64px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums`)}>{v.hh}:{v.mm}</span>
<span style={css(`font-size: 15px; opacity: 0.85`)}>{v.t.lockDate}</span>
<span style={css(`margin-top: 24px; font-size: 13px; opacity: 0.7`)}>{v.t.unlock}</span>
</button>
</>) : null}
</div></>) : null}
{bd.isAplat ? (<><div style={css(`margin-top: 8px; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)`)}>
<div className="aplat-piste" style={css(`display: flex; width: max-content; padding: 10px 0 12px`)}>
{(v.aplatShots).map((s, s_i) => (<Fragment key={s_i}>
<a className="aplat-tuile" href={s.href} target="_blank" rel="noopener" tabIndex={s.tab} aria-label={s.aria} style={css(`margin: 0 20px 0 0; display: flex; flex-direction: column; align-items: center; gap: 10px; color: inherit; text-decoration: none`)}>
<img src={s.src} alt="" style={css(`display: block; width: ${v.ac.w}; height: ${v.ac.h}; object-fit: cover; border-radius: 24px; border: 5px solid ${v.ac.frame}; box-shadow: 8px 8px 0 ${v.ac.shadow}`)} />
<span style={css(`font-family: 'Archivo', sans-serif; font-weight: 500; font-size: 13px`)}>{s.label}</span>
</a>
</Fragment>))}
</div>
</div>
<p style={css(`margin: 0; font-family: 'Archivo', sans-serif; font-size: 13px; opacity: 0.65`)}>{v.t.aplatHint}</p></>) : null}
{bd.isTrced ? (<>
<div style={css(`display: flex; flex-direction: column; gap: 22px; font-family: 'JetBrains Mono', monospace`)}>
<p style={css(`margin: 0; font-size: 20px; font-weight: 700`)}>{v.tr.tagline}</p>
<ul style={css(`list-style: none; margin: 0; padding: 0; border-top: 1px solid currentColor`)}>
{(v.tr.apps).map((y, y_i) => (<Fragment key={y_i}><li style={css(`display: grid; grid-template-columns: minmax(0, 8rem) minmax(0, 1fr) auto; gap: 16px; align-items: baseline; padding: 10px 0; border-bottom: 1px solid ${v.tr.rule}; font-size: 14px`)}><span style={css(`font-weight: 700`)}>{y.name}</span><span style={css(`opacity: 0.75`)}>{y.desc}</span><span style={css(`opacity: 0.55; font-variant-numeric: tabular-nums`)}>{y.status}</span></li></Fragment>))}
</ul>
<ol style={css(`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13px`)}>
{(v.tr.principles).map((y, y_i) => (<Fragment key={y_i}><li style={css(`display: grid; grid-template-columns: 2.4rem minmax(0, 1fr); gap: 8px`)}><span style={css(`opacity: 0.55`)}>{y.n}</span><span>{y.text}</span></li></Fragment>))}
</ol>
</div>
</>) : null}
{bd.isDebarras ? <DebarrasDemo dark={v.dark} wide={v.wide} lang={v.lang} /> : null}
{bd.isAstrolabe ? <AstrolabeDemo dark={v.dark} wide={v.wide} lang={v.lang} /> : null}
{bd.isDada ? (<><div aria-label="Dada" role="img" style={css(`display: flex; gap: 8px; padding-top: 6px`)}>
{(v.dd.logo).map((g, g_i) => (<Fragment key={g_i}>
<span style={css(`display: grid; place-items: center; width: clamp(46px, 12vw, 58px); height: clamp(54px, 14vw, 68px); box-sizing: border-box; border: 4px solid ${v.dd.ink}; border-radius: 18px; box-shadow: 0 5px 0 ${v.dd.shade}; background: ${g.bg}; color: ${g.fg}; font-family: 'Baloo 2', sans-serif; font-weight: 800; font-size: clamp(30px, 8vw, 40px); line-height: 1; transform: rotate(${g.rot})`)}>{g.c}</span>
</Fragment>))}
</div>
<p style={css(`margin: 0; font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 18px; opacity: 0.8`)}>{v.t.dadaTagline}</p>
<div style={css(`display: flex; flex-direction: ${v.dd.dir}; gap: ${v.dd.gap}; align-items: center`)}>
<div style={css(`display: flex; flex-direction: column; align-items: center; gap: 8px; width: 150px`)}>
<button type="button" className="dada-btn" onClick={v.dd.roll} aria-label={v.t.roll} style={css(`width: ${v.dd.die}; height: ${v.dd.die}; box-sizing: border-box; padding: 14px; border: 4px solid ${v.dd.ink}; border-radius: 26px; background: ${v.dd.dieBg}; box-shadow: 0 6px 0 ${v.dd.shade}; cursor: pointer`)}>
<span className={v.dd.dieClass} style={css(`display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(3, minmax(0, 1fr)); width: 100%; height: 100%`)}>
{(v.dd.pips).map((q, q_i) => (<Fragment key={q_i}><span style={css(`display: grid; place-items: center`)}><span style={css(`width: 16px; height: 16px; border-radius: 50%; background: ${v.dd.ink}; opacity: ${q.op}`)}></span></span></Fragment>))}
</span>
</button>
<p aria-live="polite" style={css(`margin: 0; min-height: ${v.dd.msgH}; text-align: center; font-weight: 700; font-size: 14px; line-height: 1.3`)}>{v.dd.msg}</p>
</div>
<div style={css(`flex: 1; align-self: stretch; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 14px`)}>
{(v.dd.buttons).map((b, b_i) => (<Fragment key={b_i}>
<a className="dada-btn" href="https://dada-kohl.vercel.app" target="_blank" rel="noopener" style={css(`display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: ${v.dd.btnH}; padding: 6px 18px; box-sizing: border-box; border: 4px solid ${v.dd.ink}; border-radius: 24px; background: ${b.bg}; color: ${b.fg}; box-shadow: 0 6px 0 ${v.dd.shade}; text-decoration: none; text-align: center`)}>
<span style={css(`font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 20px; line-height: 1.1`)}>{b.label}</span>
<span style={css(`font-weight: 700; font-size: 12px; line-height: 1.2; opacity: 0.8`)}>{b.hint}</span>
</a>
</Fragment>))}
</div>
</div></>) : null}
</div>
<div style={css(`display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px 28px`)}>
<ul style={css(`list-style: none; margin: 0; padding: 0; display: ${v.featDisp}; grid-template-columns: ${v.featCols}; gap: ${v.featGap}; flex: 1; min-width: ${v.featMinW}; font-size: ${v.featSize}; line-height: 1.4`)}>
{(bd.features).map((x, x_i) => (<Fragment key={x_i}><li style={css(`display: flex; flex-direction: ${v.featDir}; gap: 2px 8px`)}><span style={css(`font-family: ${bd.text}; font-weight: 600; flex: none`)}>{x.title}</span><span style={css(`opacity: 0.75`)}>{x.body}</span></li></Fragment>))}
</ul>
<div style={css(`display: flex; gap: 6px; margin-left: auto`)}>{(bd.links).map((k, k_i) => (<Fragment key={k_i}><a href={k.href} target="_blank" rel="noopener" aria-label={k.label} title={k.label} style={css(`display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 999px; color: inherit; text-decoration: none`)}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={css(`display: block`)}><path d={k.d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path><path d={k.f} fill="currentColor"></path></svg></a></Fragment>))}</div>
</div>
</>) : null}

</div>
</>) : null}
</section>
</Fragment>))}
</nav>

{v.narrowFoot ? (<>
<footer style={css(`flex: none; padding: 4px 20px max(6px, env(safe-area-inset-bottom)); display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 13px`)}>
<div style={css(`display: flex; gap: 2px; margin-left: -12px`)}>{(v.social).map((m, m_i) => (<Fragment key={m_i}><a href={m.href} aria-label={m.label} title={m.label} style={css(`display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 999px; color: inherit; text-decoration: none`)}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={css(`display: block`)}><path d={m.d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path><path d={m.f} fill="currentColor"></path></svg></a></Fragment>))}</div>
</footer>
</>) : null}
</main>
    );
  }
}
