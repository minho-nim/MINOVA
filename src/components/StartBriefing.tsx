import React from 'react';
import {ALL_OBJECTIVES} from '../engine/storyEngine';
import {ReadingModal} from './ReadingModal';

export function StartBriefing({onStart,onClose,hasSavedGame=false}:{onStart:()=>void;onClose:()=>void;hasSavedGame?:boolean}){
  const firstGoal=ALL_OBJECTIVES.find(goal=>goal.id==='act1_obj_inaugurate')!;
  return <ReadingModal title="감독관 업무 안내" onClose={onClose}>
    <p>당신은 도시 행정 AI <strong>ORACLE의 정책을 최종 검토하는 인간 감독관</strong>입니다.</p>
    <section className="briefing-goal"><span>첫 목표</span><h3>{firstGoal.title}</h3><p>첫 안건에서 공정성과 안전 중 어떤 원칙을 우선할지 선택하세요. 이후에는 시민의 목소리와 AI의 제안을 듣고 정책을 결정합니다.</p></section>
    <ul>
      <li><strong>시민 신뢰 · 공정성 · 개인 자유 · 사회 안전</strong>이 선택에 따라 변합니다. 한쪽이 무너지지 않도록 살펴보세요.</li>
      <li>왼쪽·오른쪽 버튼으로 정책을 선택합니다. 선택지 전문에서 전체 내용을 읽을 수 있습니다.</li>
      <li>긴 대사는 이전·다음으로 나누어 읽고, 진행 중 목표는 상단의 목표 버튼에서 다시 확인할 수 있습니다.</li>
    </ul>
    {hasSavedGame&&<p className="briefing-save-note">새 게임을 시작하면 기존 진행 대신 새 감독관의 기록을 저장합니다.</p>}
    <button className="start-button" type="button" onClick={onStart}>첫 목표 확인하고 시작</button>
  </ReadingModal>;
}
