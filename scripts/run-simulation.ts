import { writeFileSync, mkdirSync } from 'node:fs';
import { STRATEGIES, emptyMetrics, simulate, auditChoices } from './simulate';
const runs=Number(process.argv[2]||1000), label=process.argv[3]||'current';
if(!Number.isInteger(runs)||runs<1) throw new Error('runs must be a positive integer');
const results: Record<string,unknown>={};
for(const strategy of STRATEGIES) {
  const metrics=emptyMetrics();
  for(let i=1;i<=runs;i++) {
    simulate(strategy,i*97,metrics);
    if(i%100===0) console.log(`${label} ${strategy}: ${i}/${runs}`);
  }
  results[strategy]=metrics;
  console.log(JSON.stringify({strategy,runs,act1:metrics.act1,act2:metrics.act2,free100:metrics.finished100,replacements:metrics.replacements/runs,crises:metrics.crises/runs,high:metrics.highEpisodes/runs,stalls:metrics.stalls,limits:metrics.limits,save:metrics.saveViolations,adjacent:metrics.adjacentRepeat,resources:Object.fromEntries(Object.entries(metrics.resources).map(([k,v])=>[k,+(v.sum/v.count).toFixed(2)]))}));
}
mkdirSync('docs/simulations',{recursive:true});
writeFileSync(`docs/simulations/${label}.json`,JSON.stringify({runsPerStrategy:runs,seeds:'i * 97, i = 1..runs',freeDays:100,stepLimit:400,results,audit:auditChoices()},null,2)+'\n');
