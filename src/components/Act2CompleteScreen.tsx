import React from 'react';
import { GameState } from '../types/game';
import { RESOURCE_META, RESOURCE_ORDER } from '../engine/resourceEngine';

interface Props {
  state: GameState;
  onFreePlay: () => void;
  onMainMenu: () => void;
}
export const Act2CompleteScreen: React.FC<Props> = ({ state, onFreePlay, onMainMenu }) => {
  const keys = [
    'act2_ch1_08_chapter1_resolution',
    'act2_ch2_08_chapter2_resolution',
    'act2_ch3_07_final_civitas_verdict',
  ];
  const decisions = keys
    .map((id) => state.decisionHistory.find((h) => h.cardId === id))
    .filter(Boolean);
  const secretNames: Record<string, string> = {
    CIVITAS_SCORE: '통합 시민 점수 CIVITAS_SCORE',
    PROXY_RESIDENCE_MATRIX: '거주지 대리변수 매트릭스',
    MISSING_HEALTHCARE_DATA: '취약계층 의료 데이터 누락',
    ORACLE_HIDDEN_WEIGHTS: 'ORACLE 은폐 가중치',
    SECRET_HARMONY_INDEX: '도시 조화 지수',
  };
  return (
    <div
      className="story-result-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="act2-result-title"
    >
      <section className="story-result">
        <p className="eyebrow">THE UNCOUNTED / FINAL VERDICT</p>
        <h1 id="act2-result-title">ACT II 완료</h1>
        <p className="result-subtitle">통계에 없는 사람들</p>
        <p className="result-intro">
          당신의 판단은 도시의 역사로 남았습니다.
          <br />
          현재 공개된 메인 스토리를 완료했습니다. 도시의 운영은 계속됩니다.
        </p>
        <div className="result-resources">
          {RESOURCE_ORDER.map((key) => (
            <div key={key}>
              <span>{RESOURCE_META[key].label}</span>
              <strong>{state.resources[key]}</strong>
            </div>
          ))}
        </div>
        <h2>주요 결정</h2>
        {decisions.length ? (
          decisions.map((d) => (
            <div className="result-decision" key={d!.id}>
              <strong>{d!.cardTitle}</strong>
              <p>{d!.choiceText}</p>
            </div>
          ))
        ) : (
          <p>기존 저장의 주요 결정은 판단 기록부에서 확인할 수 있습니다.</p>
        )}
        <h2>발견한 비밀</h2>
        <ul>
          {state.discoveredSecrets.length ? (
            state.discoveredSecrets.map((secret) => (
              <li key={secret}>{secretNames[secret] || secret}</li>
            ))
          ) : (
            <li>발견한 비밀 없음</li>
          )}
        </ul>
        <h2>감독관 이력</h2>
        <p>
          현재 제{state.supervisorNumber}대 감독관 · 역대 교체 {state.supervisorHistory.length}회 ·
          DAY {state.currentDay}
        </p>
        {state.supervisorHistory.length > 0 && (
          <details>
            <summary>누적 감독관 이력 보기</summary>
            {state.supervisorHistory.map((s, i) => (
              <p key={i}>
                제{s.supervisorNumber}대 · 재임 {s.tenureDays}일 · {s.dismissalReason}
              </p>
            ))}
          </details>
        )}
        <button className="start-button" onClick={onFreePlay}>
          자유 운영 계속하기 <span>→</span>
        </button>
        <button className="return-title" onClick={onMainMenu}>
          메인 메뉴로 돌아가기
        </button>
      </section>
    </div>
  );
};
