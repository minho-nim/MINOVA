import { ALL_CARDS } from '../src/data/cards';
import { createInitialGameState, resolveCardDialogue } from '../src/engine/gameEngine';
const state=createInitialGameState();
for(const c of ALL_CARDS.slice(Number(process.argv[2]||0),Number(process.argv[3]||159))) console.log(JSON.stringify({id:c.id,speaker:c.characterId,dialogue:resolveCardDialogue(c,state.storyFlags,state.resources),dynamic:typeof c.dialogue==='function'}));
