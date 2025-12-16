import { useEffect, useMemo, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import { GestureId, HandLandmarks } from '../types'
import { STABILIZATION_CONFIG } from '../utils/constants'

type InferenceStatus = 'idle' | 'loading' | 'ready' | 'error'

interface Prediction {
  gestureId: GestureId
  confidence: number
}

interface UseGestureInferenceResult {
  prediction: Prediction | null
  status: InferenceStatus
  error: string | null
  inferenceMs: number | null
}

// 캐시된 구버전 모델을 피하기 위해 버전 쿼리 추가
const MODEL_URL = '/model/model.json?v=1'

/**
 * TF.js MLP 모델을 사용해 손 랜드마크를 분류하는 훅
 * 모델 파일이 없을 경우 에러 메시지를 반환하지만 앱은 지속적으로 동작함.
 */
export function useGestureInference(landmarks: HandLandmarks | null): UseGestureInferenceResult {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [status, setStatus] = useState<InferenceStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [inferenceMs, setInferenceMs] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      setStatus('loading')
      try {
        const loaded = await tf.loadLayersModel(MODEL_URL)
        if (cancelled) return
        setModel(loaded)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof Error
            ? err.message
            : '모델을 불러오는 중 오류가 발생했습니다.',
        )
        setStatus('error')
      }
    }

    loadModel()
    return () => {
      cancelled = true
    }
  }, [])

  const prediction: Prediction | null = useMemo(() => {
    if (!model) return null
    if (!landmarks) return null

    const start = performance.now()
    // 랜드마크를 [x1, y1, z1, ..., x21, y21, z21] 형태로 평탄화
    const flat = landmarks.flatMap((p) => [p.x, p.y, p.z])
    const input = tf.tensor([flat])

    let output: tf.Tensor | null = null
    try {
      output = model.predict(input) as tf.Tensor
      const data = output.dataSync()
      // 가장 큰 확률의 인덱스 선택
      let maxIdx = 0
      for (let i = 1; i < data.length; i += 1) {
        if (data[i] > data[maxIdx]) maxIdx = i
      }
      const confidence = data[maxIdx] ?? 0
      const gestureId = (['KSL_1', 'KSL_2', 'KSL_3', 'KSL_4', 'KSL_5'] as GestureId[])[maxIdx] ?? 'KSL_1'

      if (confidence < STABILIZATION_CONFIG.CONFIDENCE_THRESHOLD) {
        return null
      }

      setInferenceMs(performance.now() - start)
      return { gestureId, confidence }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '추론 중 오류가 발생했습니다.',
      )
      setStatus('error')
      return null
    } finally {
      input.dispose()
      output?.dispose()
    }
  }, [landmarks, model])

  return { prediction, status, error, inferenceMs }
}

