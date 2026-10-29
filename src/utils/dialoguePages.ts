/** Break long dialogue into small reading units without changing its wording. */
export function dialoguePages(text:string,limit=100):string[] {
  const normalized=text.replace(/\s+/gu,' ').trim();
  if(!normalized)return [''];
  const units:string[]=[];
  for(const sentence of normalized.split(/(?<=[.!?])\s+/u)) {
    let rest=sentence;
    while(rest.length>limit){
      const space=rest.lastIndexOf(' ',limit);
      const nextSpace=rest.indexOf(' ',limit);
      if(space<=limit/3&&nextSpace<0)break;
      const cut=space>limit/3?space:nextSpace;
      units.push(rest.slice(0,cut));rest=rest.slice(cut).trimStart();
    }
    if(rest)units.push(rest);
  }
  const pages:string[]=[];let page='';let sentences=0;
  for(const unit of units){
    if(page && (page.length+unit.length+2>limit || sentences===2)) {pages.push(page);page='';sentences=0;}
    page+= (page?'\n\n':'')+unit;sentences++;
  }
  if(page)pages.push(page);
  return pages;
}
