/**
 * KSL 제스처 ID 타입 정의
 */
export type GestureId = 'KSL_1' | 'KSL_2' | 'KSL_3' | 'KSL_4' | 'KSL_5';

/**
 * 인식된 토큰 데이터 구조
 */
export interface RecognizedToken {
  id: number;
  gestureId: GestureId;
  text: string;
  confidence: number;
}

/**
 * KSL 제스처 ID를 한국어 텍스트로 매핑
 */
export const KSL_MAPPING: Record<GestureId, string> = {
  KSL_1: '일',
  KSL_2: '이',
  KSL_3: '삼',
  KSL_4: '사',
  KSL_5: '오',
};

/**
 * MediaPipe 손 랜드마크 좌표 타입 (21개 포인트)
 */
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = HandLandmark[];

