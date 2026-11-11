// Exact pixel crops only: no generation, recoloring, sharpening or upscaling.
// Usage: node scripts/prepare-approved-art.mjs [--import-approved]
// Install sharp in the environment, or use the bundled Codex runtime (no game dependency).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); } catch {
  sharp = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
}
const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'public/assets/approved-20261028');
const archive = path.join(root, 'art/character-sheets/approved-20261028');
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(archive, { recursive: true });
const hash = b => createHash('sha256').update(b).digest('hex');
const specs = {
  seoYoonha: { upload:'cdd271a7-0291-4d9c-bcb1-2237014f1b41', portrait:[510,8,506,600], expressions:[[510,8,506,600],[260,1340,245,116],[700,770,295,147]] },
  hanJiwoo: { upload:'750d8723-020b-42ae-ac01-92994c2b6797', portrait:[440,5,360,470], expressions:[[440,5,360,470],[264,1344,240,108],[520,1344,237,108]] },
  ohHyejin: { upload:'9aaef9b9-ed47-4773-8208-ed29fe907c53', portrait:[500,5,420,510], expressions:[[500,5,420,510],[25,1360,222,110],[515,1360,235,110]] },
  // The clean state panel contains the complete rings. The tall hero region
  // overlaps the sheet's text and detail inset and cannot be a clean portrait.
  oracle: { upload:'95c90099-edd4-4fa2-a0b7-501341d0d683', portrait:[28,935,223,180], expressions:[[28,935,223,180],[518,935,220,180],[767,935,220,180]] },
  kangDohyun: { upload:'4657f4fd-14b5-408c-8975-fd9bbdadd46e', portrait:[440,4,350,273], expressions:[[440,4,350,273],[350,1246,150,122],[684,1246,150,122]] },
  baekSion: { upload:'e5ace11b-a556-4132-a6df-0433d0db8ec1', portrait:[480,2,420,298], expressions:[[480,2,420,298],[349,1185,154,119],[684,1185,152,119]] },
  council: { upload:'e2c8228a-8735-4fd5-88fb-7698bd065e7e', members:[[467,8,289,230],[768,8,266,230],[1045,8,271,230],[1332,8,282,230],[1631,8,403,230]], scenes:[[9,350,443,365],[467,8,289,230],[1045,8,271,230],[1332,8,282,230]] },
  citizen: { upload:'7d30fd40-6bf4-4198-b3d6-ac833ad646b8', members:[[336,8,211,182],[563,8,209,182],[788,8,210,182],[1015,8,210,182],[1241,8,210,182],[1468,8,210,182]], scenes:[[8,323,312,365],[1698,45,250,67],[1698,192,250,67],[1698,273,250,67]] },
};
if (process.argv.includes('--import-approved')) {
  const backup = path.join(archive, 'before-application');
  if (fs.existsSync(backup)) throw new Error('Backup already exists; rerun without --import-approved.');
  fs.mkdirSync(backup);
  const baseline = {};
  for (const dir of ['src', 'tests', 'public/assets']) {
    const walk = current => { for (const entry of fs.readdirSync(current, {withFileTypes:true})) {
      const full = path.join(current,entry.name);
      if (full.startsWith(output)) continue;
      if (entry.isDirectory()) walk(full);
      else {
        const rel = path.relative(root,full).replaceAll('\\','/');
        baseline[rel] = hash(fs.readFileSync(full));
        if (dir === 'public/assets' || /characterArt|CharacterPortrait|TitleScreen|index\.css|v03\.test/.test(rel)) {
          const target = path.join(backup,rel + (/\.(ts|tsx)$/.test(rel)?'.bak':'')); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.copyFileSync(full,target);
        }
      }
    }};
    walk(path.join(root,dir));
  }
  fs.writeFileSync(path.join(archive,'baseline-sha256.json'), JSON.stringify(baseline,null,2)+'\n');
}
if (process.argv.includes('--import-approved') || process.argv.includes('--copy-approved')) {
  const sourceIndex = process.argv.indexOf('--source-directory');
  const sourceDirectory = sourceIndex >= 0 ? process.argv[sourceIndex+1] : path.join(os.homedir(),'AppData/Local/Temp');
  for (const [id,spec] of Object.entries(specs)) {
    fs.copyFileSync(path.join(sourceDirectory,`codex-clipboard-${spec.upload}.png`),path.join(output,`${id}-sheet.png`));
  }
}
const manifest = { method:'Unmodified approved sheets; lossless native-pixel crops; group portraits assembled from approved member crops.', characters:{} };
for (const [id,spec] of Object.entries(specs)) {
  const source = path.join(output,`${id}-sheet.png`);
  const bytes = fs.readFileSync(source);
  const {width,height} = await sharp(bytes).metadata();
  const crops = {};
  const crop = async (rect,name) => {
    const [left,top,width,height] = rect;
    await sharp(bytes).extract({left,top,width,height}).png().toFile(path.join(output,name));
    crops[name] = {rect,width,height};
  };
  if (spec.members) {
    for (let i=0;i<spec.members.length;i++) await crop(spec.members[i],`${id}-speaker-${i}.png`);
    const tiles = await Promise.all(spec.members.map(async (r,i) => {
      const [left,top,width,height] = r;
      return { input:await sharp(bytes).extract({left,top,width,height}).resize(200,180,{fit:'cover',withoutEnlargement:true}).png().toBuffer(), left:(i%2)*200+(spec.members.length===5&&i===4?100:0), top:Math.floor(i/2)*180 };
    }));
    await sharp({create:{width:400,height:540,channels:3,background:'#07151d'}}).composite(tiles).png().toFile(path.join(output,`${id}-portrait.png`));
    for (let i=0;i<3;i++) fs.copyFileSync(path.join(output,`${id}-portrait.png`),path.join(output,`${id}-expression-${i}.png`));
    for (let i=0;i<spec.scenes.length;i++) await crop(spec.scenes[i],`${id}-scene-${i}.png`);
  } else {
    await crop(spec.portrait,`${id}-portrait.png`);
    for (let i=0;i<3;i++) await crop(spec.expressions[i],`${id}-expression-${i}.png`);
  }
  manifest.characters[id] = {sheet:`${id}-sheet.png`,sha256:hash(bytes),width,height,...spec,crops};
}
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.copyFileSync(path.join(output,'manifest.json'),path.join(archive,'manifest.json'));
console.log('Prepared 8 approved sheets, 8 portraits, 24 expressions and 8 group scenes without changing source pixels.');
