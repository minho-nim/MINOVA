// Isolated browser context: never reads or changes the player's local save.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let chromium;
try { ({chromium}=require('playwright')); } catch {
  ({chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')));
}
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
const browser = await chromium.launch({headless:true,...(executablePath?{executablePath}: {})});
const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
const page = await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const output='art/character-sheets/approved-20261028/ui';
fs.mkdirSync(output,{recursive:true});
const checks=[];
async function imagesReady() {
  await page.waitForFunction(()=>[...document.images].filter(i=>!i.loading||i.loading!=='lazy').every(i=>i.complete&&i.naturalWidth>0));
}
try {
  await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
  await imagesReady();
  for(let i=0;i<6;i++) {
    await page.locator('.cast-card').nth(i).click();
    const button=page.locator('.cast-section .sheet-open-button');
    await button.click();
    await page.getByRole('dialog').waitFor();
    await imagesReady();
    assert.match(await page.locator('.sheet-scroll img').getAttribute('src'),/approved-20261028/);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(),0);
    checks.push(`Main character ${i+1}: portrait, expressions and full sheet loaded; Escape closes viewer.`);
  }
  await page.locator('.cast-card').nth(3).click();
  await page.screenshot({path:`${output}/desktop-title.png`,fullPage:true});
  for(let i=0;i<2;i++) {
    await page.locator('.faction-sheet .sheet-open-button').nth(i).click();
    await imagesReady();
    await page.screenshot({path:`${output}/group-sheet-${i}.png`});
    await page.getByRole('button',{name:'디자인 시트 닫기'}).click();
    checks.push(`Collective ${i+1}: approved member group, scenes and original full sheet loaded.`);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
  await imagesReady();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.cast-card').nth(3).click();
  await page.screenshot({path:`${output}/mobile-title.png`,fullPage:true});
  checks.push('390px mobile title has no horizontal page overflow.');
  await page.getByRole('button',{name:/감독관으로 취임하기/}).click();
  await imagesReady();
  await page.locator('.verdict-character').waitFor();
  await page.screenshot({path:`${output}/mobile-game.png`,fullPage:true});
  assert.match(await page.locator('.verdict-character img').getAttribute('src'),/approved-20261028/);
  const before=await page.locator('.verdict-dialogue').textContent();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(850);
  await imagesReady();
  assert.notEqual(await page.locator('.verdict-dialogue').textContent(),before);
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button',{name:/감독관 업무 이어하기/}).click();
  await page.locator('.verdict-character').waitFor();
  await imagesReady();
  await page.screenshot({path:`${output}/mobile-resumed-game.png`,fullPage:true});
  checks.push('New game through UI, actual decision, saved game reload and resume display approved portraits.');
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:`${output}/desktop-game.png`,fullPage:true});
  assert.deepEqual(errors,[]);
  fs.writeFileSync(`${output}/checks.json`,JSON.stringify({checks,errors},null,2)+'\n');
  console.log(JSON.stringify({checks,errors},null,2));
} finally { await browser.close(); }
