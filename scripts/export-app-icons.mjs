// Export sizes from the selected generated artwork; no runtime dependency.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let sharp;
try{sharp=require('sharp');}catch{sharp=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}
const output=path.resolve(import.meta.dirname,'../public/icons');
fs.mkdirSync(output,{recursive:true});
const source=path.join(output,'oracle-app-source.png');
for(const size of [16,32,48,180,192,512]){
  await sharp(source).resize(size,size,{fit:'contain',background:'#030b12'}).png().toFile(path.join(output,`oracle-${size}.png`));
}
await sharp(source).resize(400,400).extend({top:56,bottom:56,left:56,right:56,background:'#030b12'}).png().toFile(path.join(output,'oracle-maskable-512.png'));
const sizes=[16,32,48];
const pngs=await Promise.all(sizes.map(size=>fs.promises.readFile(path.join(output,`oracle-${size}.png`))));
const header=Buffer.alloc(6+16*sizes.length);
header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;
for(let i=0;i<sizes.length;i++){
  const entry=6+16*i;header[entry]=sizes[i];header[entry+1]=sizes[i];
  header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);
  header.writeUInt32LE(pngs[i].length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=pngs[i].length;
}
fs.writeFileSync(path.resolve(output,'../favicon.ico'),Buffer.concat([header,...pngs]));
console.log('Exported app icons, maskable icon and favicon.ico');
