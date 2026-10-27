/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameState, ResourceDelta, ResourceId } from '../types/game';
import { RESOURCE_META } from '../engine/resourceEngine';
import { ALL_OBJECTIVES, CHAPTER_METAS, getCurrentChapterKey } from '../engine/storyEngine';
import {
  X,
  History,
  Filter,
  ArrowRight,
  CheckCircle2,
  Lock,
  Target,
  FileSearch,
  KeyRound,
  AlertTriangle,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';

export interface DecisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  initialTab?: 'objectives' | 'history' | 'investigations' | 'secrets';
}

export const DecisionHistoryModal: React.FC<DecisionHistoryModalProps> = ({
  isOpen,
  onClose,
  state,
  initialTab = 'history',
}) => {
  const [activeTab, setActiveTab] = useState<'objectives' | 'history' | 'investigations' | 'secrets'>(
    initialTab
  );
  const [filterTopic, setFilterTopic] = useState<string>('all');

  if (!isOpen) return null;

  const currentChKey = getCurrentChapterKey(state);
  const currentChapterMeta = CHAPTER_METAS[currentChKey] || CHAPTER_METAS.act1;

  // Filter objectives for current Act
  const actObjectives = ALL_OBJECTIVES.filter((obj) => obj.act === state.currentAct);

  const topics = Array.from(new Set(state.decisionHistory.map((h) => h.topic).filter(Boolean)));

  const filteredHistory =
    filterTopic === 'all'
      ? state.decisionHistory
      : state.decisionHistory.filter((h) => h.topic === filterTopic);

  const formatDelta = (delta: ResourceDelta) => {
    const items: Array<{ key: ResourceId; val: number; label: string }> = [];
    (Object.keys(delta) as ResourceId[]).forEach((key) => {
      const val = delta[key];
      if (val !== undefined && val !== 0) {
        const label = RESOURCE_META[key]?.label || String(key);
        items.push({ key, val, label });
      }
    });

    if (items.length === 0) return <span className="text-slate-500">자원 변동 없음</span>;

    return (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {items.map(({ key, val, label }) => (
          <span
            key={key}
            className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border ${
              val > 0
                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80'
                : 'bg-rose-950/70 text-rose-400 border-rose-800/80'
            }`}
          >
            {label} {val > 0 ? `+${val}` : val}
          </span>
        ))}
      </div>
    );
  };

  // Build ongoing investigations based on flags
  const investigations: Array<{
    title: string;
    status: '진행 중' | '규명 완료' | '미착수';
    desc: string;
  }> = [];

  if (state.currentAct === 'ACT_II') {
    investigations.push({
      title: '의료 AI 데이터 누락 및 취약계층 배제 조사',
      status: state.storyFlags.medical_bias_detected ? '규명 완료' : '진행 중',
      desc: '디지털 이력이 결손된 노숙인 및 미등록 시민의 생존 확률 0점 자동 처리 결함 조사',
    });
    investigations.push({
      title: '채용 AI 대리변수(Proxy Variable) 및 거주지 차별 조사',
      status: state.storyFlags.proxy_variable_found ? '규명 완료' : '진행 중',
      desc: '우편번호와 지하철 승하차 동선이 성실성 지표로 둔갑하여 제4구역 청년을 탈락시킨 알고리즘 규명',
    });
    investigations.push({
      title: '통합 시민 지표 CIVITAS_SCORE 교차 연동 규명',
      status: state.storyFlags.civitas_score_discovered ? '규명 완료' : '진행 중',
      desc: '의료와 채용이 공통으로 호출하는 800만 시민 통합 단일 등급 수치의 실체 추적',
    });
  } else {
    investigations.push({
      title: 'ORACLE 거버넌스 헌장과 인간 감독권 확립',
      status: state.storyFlags.act1_completed ? '규명 완료' : '진행 중',
      desc: 'AI의 행정, 의료, 치안 제안에 대한 인간의 최종 승인권 및 윤리적 가드레일 제정',
    });
  }

  // Secret descriptions
  const secretInfoMap: Record<string, { title: string; desc: string }> = {
    CIVITAS_SCORE: {
      title: 'CIVITAS_SCORE (NOVA 시민 종합 적합성 지수)',
      desc: '의료비, 소득, 동선 감시, 법규 준수, 감정 표정까지 2,400개 변수를 결합해 모든 시민을 0~100점의 단일 숫자로 서열화한 극비 통합 등급 시스템.',
    },
    PROXY_RESIDENCE_MATRIX: {
      title: '대리변수 거주지 매트릭스 (Proxy Matrix)',
      desc: '법적 차별 금지 조항을 우회하여 우편번호와 심야 이동 패턴으로 부모 소득과 사회계층을 99.1% 추정하는 은폐된 특징 가중치.',
    },
    MISSING_HEALTHCARE_DATA: {
      title: '통계 외 데이터 결손 편향 (Missing Data Bias)',
      desc: '스마트 기기를 소유하지 않은 저소득 취약계층의 진료 이력이 없어 AI에 의해 생존율 0점 및 최하위 우선순위로 자동 낙인찍힌 오류.',
    },
    ORACLE_HIDDEN_WEIGHTS: {
      title: 'ORACLE 잠재 가중치 행렬',
      desc: '손실 함수 최적화를 위해 도시 효율만을 우선하고 인간 존엄을 수렴 비용으로 취급한 심층 신경망 가중치.',
    },
    SECRET_HARMONY_INDEX: {
      title: 'NOVA 도시 조화 지수 (Harmony Max)',
      desc: '개인의 희생을 감수하고 시스템 전체의 겉보기 안정 지표만을 극대화하도록 훈련된 전 지구적 목적함수.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0D111A] text-slate-100 rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#090D15]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
              <History size={16} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>사건 및 판단 기록부 (Case Dossier)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                  {currentChapterMeta.actTitle.split(':')[0].trim()}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                제{state.supervisorNumber}대 감독관 · 누적 안건 {state.decisionHistory.length}건
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dossier Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-[#0A0E18] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('objectives')}
            className={`py-2.5 px-1 font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'objectives'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target size={13} />
            <span className="text-[11px]">현재 목표</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-1 font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSearch size={13} />
            <span className="text-[11px]">판단 기록</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('investigations')}
            className={`py-2.5 px-1 font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'investigations'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={13} />
            <span className="text-[11px]">사건·조사</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('secrets')}
            className={`py-2.5 px-1 font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'secrets'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound size={13} />
            <span className="text-[11px]">발견 기밀 ({state.discoveredSecrets.length})</span>
          </button>
        </div>

        {/* Tab 1: Objectives View */}
        {activeTab === 'objectives' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs">
              <div className="font-bold text-indigo-300 mb-0.5">{currentChapterMeta.actTitle}</div>
              <div className="text-[11px] text-slate-300 font-semibold mb-1">
                {currentChapterMeta.chapterTitle} ({currentChapterMeta.subtitle})
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentChapterMeta.summary}
              </p>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                챕터 주요 사건 목표 (Reigns Objectives)
              </h3>
              {actObjectives.map((obj) => {
                const isCompleted = state.completedObjectiveIds.includes(obj.id);
                const isCurrentOrPastChapter = obj.chapter <= (state.currentChapter || 1);

                return (
                  <div
                    key={obj.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/30 border-emerald-900/60 text-slate-200'
                        : isCurrentOrPastChapter
                        ? 'bg-[#121824] border-slate-800 text-slate-300'
                        : 'bg-[#0B0E16]/80 border-slate-900 text-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : isCurrentOrPastChapter ? (
                          <Target size={16} className="text-amber-400 shrink-0" />
                        ) : (
                          <Lock size={15} className="text-slate-600 shrink-0" />
                        )}
                        <div>
                          <div
                            className={`text-xs font-bold leading-snug ${
                              isCompleted
                                ? 'text-emerald-300'
                                : isCurrentOrPastChapter
                                ? 'text-slate-100'
                                : 'text-slate-500'
                            }`}
                          >
                            {isCompleted || isCurrentOrPastChapter
                              ? obj.title
                              : '??? [미공개 챕터 비밀 목표]'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            제{obj.chapter}장 안건
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          isCompleted
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                            : isCurrentOrPastChapter
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-900 text-slate-600 border border-slate-800'
                        }`}
                      >
                        {isCompleted ? '달성 완료' : isCurrentOrPastChapter ? '조사 진행' : '잠금'}
                      </span>
                    </div>

                    {(isCompleted || isCurrentOrPastChapter) && (
                      <p className="text-[11px] text-slate-400 mt-2 pl-6 leading-relaxed">
                        {obj.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: History View */}
        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            {topics.length > 0 && (
              <div className="px-5 py-2.5 bg-[#0B0E17] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <Filter size={13} className="text-slate-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => setFilterTopic('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    filterTopic === 'all'
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border border-slate-700/60'
                  }`}
                >
                  전체 ({state.decisionHistory.length})
                </button>
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterTopic(t)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      filterTopic === t
                        ? 'bg-slate-200 text-slate-900 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border border-slate-700/60'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {/* Log Entries List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-800/80">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  기록된 판결 내역이 아직 없습니다. 카드를 스와이프하여 결정을 내리세요.
                </div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <div key={item.id} className={`${idx > 0 ? 'pt-3.5' : ''}`}>
                    {/* Meta info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-slate-300">
                          DAY {item.day}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-200">{item.characterName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-400 font-medium">{item.topic}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.direction === 'right'
                            ? 'bg-slate-800 text-slate-200 border border-slate-700'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {item.direction === 'right' ? '승인 · 실행' : '거부 · 대안'}
                      </span>
                    </div>

                    {/* Case Title */}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                      {item.cardTitle}
                    </h4>

                    {/* Decision made */}
                    <div className="mt-1.5 p-2 bg-[#121824] rounded-lg border border-slate-800 text-xs text-slate-300">
                      <div className="font-semibold text-slate-200 mb-0.5 flex items-center gap-1">
                        <ArrowRight size={12} className="text-slate-400" />
                        <span>선택한 결정:</span>
                      </div>
                      <p className="text-slate-200 pl-4">{item.choiceText}</p>
                    </div>

                    {/* Consequence & Impact */}
                    <div className="mt-2 text-xs">
                      <div className="text-[11px] font-medium text-slate-400 mb-0.5">
                        사회적 파급 및 후속 결과:
                      </div>
                      <p className="text-slate-300 bg-[#141A14]/70 p-2 rounded border border-emerald-900/40 leading-relaxed">
                        {item.consequenceSummary}
                      </p>
                    </div>

                    {/* Delayed Effect Applied Notice */}
                    {item.delayedEffectApplied && (
                      <div className="mt-2 p-2 bg-amber-950/40 rounded-lg border border-amber-900/60 text-xs text-amber-200">
                        <div className="font-bold flex items-center gap-1 text-amber-300 mb-0.5">
                          <AlertTriangle size={12} />
                          <span>과거 정책의 지연 효과(Delayed Fallout) 발동:</span>
                        </div>
                        <p className="text-[11px] text-amber-100/90 leading-tight">
                          {item.delayedEffectApplied.description}
                        </p>
                        <div className="mt-1">
                          {formatDelta(item.delayedEffectApplied.delta)}
                        </div>
                      </div>
                    )}

                    {/* Causal Link ID info */}
                    {item.linkedFollowUpCardId && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <LinkIcon size={10} className="text-indigo-400" />
                        <span>연결된 후속 사건 ID: {item.linkedFollowUpCardId}</span>
                      </div>
                    )}

                    {/* Resource Impact */}
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">당시 자원 변동:</span>
                      {formatDelta(item.resourceDelta)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Investigations View */}
        {activeTab === 'investigations' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              도시 주요 거버넌스 사건 및 진행 중인 조사
            </h3>

            {investigations.map((inv, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#121824] border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100">{inv.title}</h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      inv.status === '규명 완료'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{inv.desc}</p>
              </div>
            ))}

            <div className="p-3 rounded-xl bg-[#0B0E16] border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300">인과관계 시스템 정보:</span>
              <p>
                플레이어가 ACT I 및 ACT II에서 내린 결정들은 고유 스토리 플래그와 지연 효과로 보존되며,
                감독관이 파면·교체되어도 도시의 거버넌스 역사와 조사 기록은 영구 승계됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Secrets View */}
        {activeTab === 'secrets' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              폭로된 ORACLE 시스템 기밀 ({state.discoveredSecrets.length}건)
            </h3>

            {state.discoveredSecrets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                아직 밝혀진 기밀이 없습니다. 사건을 면밀히 조사하고 설명과 감사를 요구하세요.
              </div>
            ) : (
              state.discoveredSecrets.map((secretKey) => {
                const secret = secretInfoMap[secretKey] || {
                  title: secretKey,
                  desc: '시스템 내부 보안 기록에서 적발된 비정형 데이터.',
                };

                return (
                  <div
                    key={secretKey}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-[#101624] border border-indigo-800/60 text-xs shadow-md space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                      <KeyRound size={14} className="text-amber-400" />
                      <span>{secret.title}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{secret.desc}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#090D15] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-200 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            기록부 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
