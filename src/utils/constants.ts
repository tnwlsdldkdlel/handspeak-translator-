/**
 * 애플리케이션 상수 정의
 */

// 안정화 로직 관련
export const STABILIZATION_CONFIG = {
  /** 신뢰도 임계값 (0.0 ~ 1.0) */
  CONFIDENCE_THRESHOLD: 0.5,
  /** 제스처 확정을 위한 최소 지속 시간 (ms) */
  MIN_DURATION: 500,
  /** 제스처 확정을 위한 최대 지속 시간 (ms) */
  MAX_DURATION: 800,
} as const;

// 성능 관련
export const PERFORMANCE_CONFIG = {
  /** 목표 FPS */
  TARGET_FPS: 20,
  /** 최대 추론 지연 시간 (ms) */
  MAX_INFERENCE_DELAY: 30,
} as const;

// MediaPipe 설정
export const MEDIAPIPE_CONFIG = {
  /** 손 랜드마크 개수 */
  LANDMARK_COUNT: 21,
  /** 최대 손 개수 */
  MAX_HANDS: 1,
} as const;

