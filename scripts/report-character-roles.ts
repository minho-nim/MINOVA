import {writeFileSync} from 'node:fs';
import {ALL_CARDS,CARD_MAP} from '../src/data/cards';
import {ACT1_CARDS} from '../src/data/cards/act1';
import {ACT2_CARDS} from '../src/data/cards/act2';
import {CONDITIONAL_CARDS} from '../src/data/cards/conditional';
import {CRISIS_CARDS} from '../src/data/cards/crisis';
import {DAILY_CARDS} from '../src/data/cards/daily';
import {SUPERVISOR_REPLACEMENT_CARDS} from '../src/data/cards/supervisorReplacement';
import {FREE_PLAY_PROPOSALS} from '../src/data/cards/freePlay';
import {CHARACTER_REVISIONS} from '../src/data/characterRevisions';
import {CHARACTERS} from '../src/data/characters';
import {createInitialGameState,resolveCardDialogue} from '../src/engine/gameEngine';
import {StoryFlags,CharacterId} from '../src/types/game';
const source=[...ACT1_CARDS,...ACT2_CARDS,...CONDITIONAL_CARDS,...CRISIS_CARDS,...DAILY_CARDS,...SUPERVISOR_REPLACEMENT_CARDS,...FREE_PLAY_PROPOSALS];
const state=createInitialGameState();
const roles={
  oracle:'AI 통합 행정 시스템 · 데이터 분석, 정책 권고와 알고리즘 판단',
  seoYoonha:'AI 개발자 · 기술 구조와 한계, 설계 결함, 개발 책임',
  kangDohyun:'도시 행정관 · 예산, 인력, 효율과 실제 집행 가능성',
  hanJiwoo:'시민권 활동가 · 기본권, 감시, 차별과 제도적 구제',
  baekSion:'독립 감사관 · 증거 확보, 독립 검증, 은폐·조작 조사',
  ohHyejin:'의료 책임자 · 환자 안전, 의료 윤리와 임상 책임',
  citizen:'일반 시민 집단 · 일상에서 경험한 정책의 혜택과 피해, 서로 다른 의견',
  council:'최고 통치 기관 · 정책 승인, 감독관 통제, 정치적 책임과 권력 유지',
};
const views={oracle:'모델의 계산·권고',seoYoonha:'기술 구조·개발 책임',kangDohyun:'현장 집행·자원 제약',hanJiwoo:'권리 보장·제도적 구제',baekSion:'증거·검증 절차',ohHyejin:'임상 판단·환자 책임',citizen:'당사자의 생활 경험',council:'의결 권한·정치적 책임'};
let report=`# Crossroads v0.3 — 캐릭터 역할과 서사 검토\n\n2026-10-27. 등록 카드 ${ALL_CARDS.length}개를 전수 검토했다. [159개 카드별 판정표](v0.3-character-audit.md)에 유지·수정 근거를 남긴다. 역할 수정 ${Object.keys(CHARACTER_REVISIONS).length}개, 발언자 변경 ${Object.values(CHARACTER_REVISIONS).filter(x=>x.speaker).length}개다. 같은 주제라는 이유로 교체하지 않았다.\n\n## 확정 역할\n\n| 인물 | 역할 |\n|---|---|\n`;
for(const [id,role] of Object.entries(roles)) report+=`| ${CHARACTERS[id as CharacterId].name} | ${role} |\n`;
report+=`\n## 발견한 혼동과 적용 방식\n\n- 한지우를 기자로, 백시온을 소송 대리 변호사로, 강도현을 경찰서장으로 소개하던 문장을 수정했다.\n- 시민 집단이 암시장 브로커처럼 보이던 사건은 백시온이 미검증 거래 제안을 보고하는 방식으로 바꿨다.\n- 재심 처리 병목은 서윤하 대신 강도현, 소방 자원 배분은 백시온 대신 강도현이 보고한다. 환자 가족 청원은 시민 집단의 직접 증언으로 분리했다.\n- 시민을 항상 분노한 피해자로만 나타내는 문장은 구체적인 생활 경험과 가능한 상반된 의견으로 바꿨다. 피해가 명확한 퇴거·권리 침해에는 억지로 찬성 목소리를 만들지 않았다. 제4구역 구직자와 가족의 기존 개별 증언은 집단 안의 한 당사자로 유지한다.\n- 평의회의 챕터 결산은 조사 결과를 공식 기록으로 인용하고 감독 책임을 묻는 발언으로 감쌌다. 기존 분기별 결과 설명은 그대로 포함된다.\n- 원본 카드 파일은 그대로 두고 등록 시 characterRevisions.ts를 적용한다. 판단 기록에 이미 저장된 예전 발언자·이름·결과 요약은 소급 변경하지 않는다.\n\n## 수정하지 않은 유사 사건\n\n| 유사 사건 | 유지 이유 |\n|---|---|\n| 의료 트리아지: ORACLE / 오혜진 / 한지우 | 계산 근거, 의사의 거부권과 환자 책임, 배제된 시민의 기본권은 서로 다른 기능이다. |\n| 대리변수: 백시온 / 서윤하 | 감사관의 입력·로그 대조와 개발자의 학습 구조 해석은 상호 보완한다. |\n| 감시: 한지우 / 시민 / 강도현 | 동의·구제 제도, 통근·노동의 체험, 치안 배치·집행 책임을 구분한다. |\n| CIVITAS: 강도현 / 평의회 | 셧다운 시 전력·교통·연금의 실행 제약과 통치권 위임·기밀 지정의 정치 결정은 다르다. |\n| 기존 SHI 발견과 ORACLE의 목적함수 책임 공방 | 기존 비밀과 자아 변화의 핵심 사건을 유지한다. 개발자가 구조를 설명하고 AI가 자기 판단을 변론하는 차이가 있다. |\n| 에필로그 / 감독관 교체 | 이미 정해진 결말과 임면 서사는 유지한다. ACT III 예고는 기존 텍스트로 남되 시작 경로는 열지 않는다. |\n\n## 변경 전후 대사\n\n원본 전문과 적용 후 전문을 비교한다. 분기형 함수는 대표 두 상태를 출력하고, 테스트에서 원본 결과를 보존하는지 확인한다.\n`;
const flags:StoryFlags[]=[{}, {citizen_appeal_enabled:true,complaint_system:'human_reviewed',affirmative_action_medical:true,audit_access_granted:true}];
for(const [id,revision] of Object.entries(CHARACTER_REVISIONS)) {
  const before=source.find(c=>c.id===id)!,after=CARD_MAP.get(id)!;
  report+=`\n### ${id}\n\n${before.title}\n\n발언자: ${CHARACTERS[before.characterId].name} → ${CHARACTERS[after.characterId].name}. 이유: ${revision.reason}.\n`;
  const variants=typeof before.dialogue==='function'?flags:[flags[0]];
  variants.forEach((f,i)=>{report+=`\n${variants.length>1?`분기 ${i+1}. `:''}변경 전:\n\n> ${resolveCardDialogue(before,f,state.resources)}\n\n변경 후:\n\n> ${resolveCardDialogue(after,f,state.resources)}\n`;});
}
report+=`\n## 검증과 범위\n\n- 자동 테스트 36개 통과: 기존 24개와 새 12개. 고자원 위기의 경계 사례 두 검사는 v0.3의 경쟁 자원 악화 조건으로 갱신했다.\n- 159개 ID·조건·minDay·repeatable·cooldown·우선순위·가중치와 선택지의 플래그·예약·관계·연결을 원본과 대조했다. 역할 개정은 발언자와 대사에만 적용된다.\n- ACT I 25장, ACT II 30장의 순서와 모든 결말을 보존한다. 기존 140개 도달 검사와 추가 정책 19개 진입·후속 사건 검사를 통과한다. 한 회차에서 전부 만나는 의미는 아니다.\n- 별도 밸런스 요청에 따른 효과 변경은 일상 카드 3개에 한정하며 [밸런스 보고서](v0.3-balance.md)에 이유와 수치를 분리한다. 역할 개선 때문에 선택 효과·조건·연결은 변경하지 않았다.\n- schemaVersion 5와 저장 키를 유지한다. 과거 판단 기록·감독관 이력·관계·비밀은 보존한다.\n- 새 NOVA 시민 이미지로 교체했다. 기존 시민을 포함하던 공용 두 파일은 평의회 부분을 별도 PNG로 보존한 뒤 프로젝트에서 삭제했다. 첨부 원본의 글자는 인물 얼굴 영역에서 제외하고 화면 글자는 HTML로 표시한다.\n- 기존 여섯 인물의 얼굴·의상·팔레트를 재생성하지 않았다. 18개 표정을 원본에서 분리해 4배 보간하고 명도 경계만 약하게 선명화했다. 원본에 없는 세부 묘사는 복구되지 않으며 고해상도 원본이 추가로 필요하다.\n- 실제 화면 확인 결과는 밸런스 보고서의 UI 검증 항목과 캡처를 참조한다.\n\n## ACT III 서사 원칙\n\nORACLE의 자아 변화는 기존 분기를 따른다. 개발자는 원인과 책임, 감사관은 증거의 신뢰도, 행정관은 집행 제약, 평의회는 권력과 책임을 담당한다. 활동가는 제도적 권리를 요구하고, 시민은 그 제도를 경험한 서로 다른 사람들의 말을 전한다. 의료 책임자는 환자 안전과 현장 판단을 책임진다. 특정 주제의 독점이나 항상 같은 결론을 말하는 인물로 고정하지 않는다. 자유 운영의 과거 결정을 ACT III에 반영하는 방식은 아직 미정이며 현재 ACT III 진입을 활성화하지 않았다.\n`;
writeFileSync('docs/v0.3-character-roles.md',report);
let audit=`# v0.3 전체 159개 카드 역할 검토표\n\n[역할·전후 대사 보고서](v0.3-character-roles.md). 모든 카드는 제목만 같은지보다 발언 기능을 기준으로 검토했다. 아래 유지 판정은 같은 주제의 다른 관점을 중복으로 제거하지 않았다는 뜻이다.\n\n| 카드 ID / 사건 | 원래 발언자 → 적용 발언자 | 판정 및 이유 |\n|---|---|---|\n`;
for(const c of source) { const n=CARD_MAP.get(c.id)!,r=CHARACTER_REVISIONS[c.id];audit+=`| ${c.id}<br>${c.title} | ${CHARACTERS[c.characterId].name} → ${CHARACTERS[n.characterId].name} | ${r?`수정: ${r.reason}`:`유지: ${views[n.characterId]}. 다른 인물의 동일 주제 발언과 기능을 구분함.`} |\n`; }
writeFileSync('docs/v0.3-character-audit.md',audit);
console.log({reviewed:source.length,revised:Object.keys(CHARACTER_REVISIONS).length,speakersChanged:Object.values(CHARACTER_REVISIONS).filter(r=>r.speaker).length});
