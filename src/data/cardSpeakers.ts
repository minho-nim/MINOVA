import type { GameCard } from '../types/game';
import { APPROVED_ART_ROOT } from './characterArt';

export interface SpeakerPortrait {
  src:string;
  label:string;
  width:number;
  height:number;
}
export interface CardSpeaker {
  name:string;
  role:string;
  portrait:SpeakerPortrait;
}

// Presentation only. These are the current card's voices, not new persistent
// character IDs, invented biographies or changes to the original testimony.
const CITIZEN_VOICES:Record<string,readonly [number,string]> = {
  act1_09_housing_allocation:[3,'공공임대 신청자'],
  act1_14_labor_dispute:[4,'항만 노동자'],
  act2_ch1_05_family_appeal:[2,'환자 가족 대표'],
  act2_ch2_03_district4_screening:[1,'이민우 · 취업 지원자'],
  act2_ch2_11_neurodiverse_job_filter:[1,'채용 지원 시민 의견 전달자'],
  cond_union_whistleblower:[4,'물류센터 노동자'],
  cond_deepfake_election_crisis:[2,'유권자 의견 전달자'],
  cond_social_credit_housing:[3,'퇴거 통지를 받은 주민'],
  cond_autonomous_taxi_strike:[3,'택시 이용·생계 의견 전달자'],
  cond_water_rationing_algorithm:[4,'급수 제한 지역 주민'],
  cond_synthetic_media_copyright:[1,'지역 예술가'],
  crisis_safety_high:[2,'야간 통행 시민 의견 전달자'],
  daily_workplace_monitoring:[2,'콜센터 직원 의견 전달자'],
  daily_smart_trash_fine:[5,'분리배출 과태료 민원 전달자'],
  daily_sweeper_hostile_design:[5,'공원 이용 시민'],
  daily_delivery_drone_corridor:[2,'드론 항로 인근 주민'],
  daily_park_sprinkler_ai:[3,'공원을 찾은 보호자'],
  daily_parking_size_tariff:[3,'차량 이용 시민 의견 전달자'],
  daily_subway_ad_retargeting:[2,'퇴근길 지하철 이용자'],
  daily_parcel_locker_equity:[2,'택배함 이용 주민 의견 전달자'],
  daily_bike_damage_deposit:[3,'자전거 이용 아이의 보호자'],
  daily_robotic_kitchen_standard:[5,'골목식당 운영자'],
  daily_pigeon_contraceptive_feed:[3,'광장 이용 시민 의견 전달자'],
  daily_library_seat_sensor:[0,'열람실 이용 시민 의견 전달자'],
  daily_smart_bench_power:[4,'배달 업무 중인 시민'],
  daily_heated_sidewalk_snow:[5,'주택가 주민 의견 전달자'],
  daily_playground_aggression_sensor:[2,'놀이터 이용 아이의 보호자'],
};

export function getCardSpeaker(card:Pick<GameCard,'id'|'characterId'>):CardSpeaker|undefined {
  if(card.characterId==='council') return {
    name:'최고평의회 의장', role:'NOVA 최고평의회 · 의결사항 전달',
    portrait:{src:`${APPROVED_ART_ROOT}council-speaker-0.png`,label:'최고평의회 의장',width:289,height:230},
  };
  if(card.characterId!=='citizen') return undefined;
  const [index,role]=CITIZEN_VOICES[card.id] ?? [2,'시민 의견 전달자'];
  return {
    name:role==='이민우 · 취업 지원자'?'이민우':'NOVA 시민',
    role, portrait:{src:`${APPROVED_ART_ROOT}citizen-speaker-${index}.png`,label:role,width:index===0?211:index===1?209:210,height:182},
  };
}
