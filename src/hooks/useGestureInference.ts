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

// base 경로를 포함해 정적 모델을 로드 (캐시 버전 쿼리 포함)
// Vite의 내장 BASE_URL 사용 (기본값: '/')
const BASE_URL = (import.meta.env.BASE_URL as string) || '/'
const MODEL_URL = `${BASE_URL}model/model.json?v=11`
const WEIGHTS_PREFIX = `${BASE_URL}model/`

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
        // 표준 TF.js 로더 사용 (가중치 경로는 weightPathPrefix로 지정)
        const httpHandler = tf.io.browserHTTPRequest(MODEL_URL, {
          weightPathPrefix: WEIGHTS_PREFIX,
          requestInit: { cache: 'no-store' },
        })

        const loaded = await tf.loadLayersModel(httpHandler)
        
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

    // 입력 통계 로깅 (분포 확인용)
    const xs: number[] = []
    const ys: number[] = []
    const zs: number[] = []
    for (const p of landmarks) {
      xs.push(p.x)
      ys.push(p.y)
      zs.push(p.z)
    }
    const min = Math.min(...flat)
    const max = Math.max(...flat)
    const mean = flat.reduce((acc, v) => acc + v, 0) / flat.length
    const variance = flat.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / flat.length
    const std = Math.sqrt(variance)
    console.log('[추론] 입력 통계', {
      min: min.toFixed(3),
      max: max.toFixed(3),
      mean: mean.toFixed(3),
      std: std.toFixed(3),
      xRange: { min: Math.min(...xs).toFixed(3), max: Math.max(...xs).toFixed(3) },
      yRange: { min: Math.min(...ys).toFixed(3), max: Math.max(...ys).toFixed(3) },
      zRange: { min: Math.min(...zs).toFixed(3), max: Math.max(...zs).toFixed(3) },
    })
    const input = tf.tensor([flat])

    let output: tf.Tensor | null = null
    try {
      output = model.predict(input) as tf.Tensor
      const data = output.dataSync()
      
      // 디버깅: 모든 클래스의 확률 출력
      const probabilities = {
        KSL_1: data[0] ?? 0,
        KSL_2: data[1] ?? 0,
        KSL_3: data[2] ?? 0,
        KSL_4: data[3] ?? 0,
        KSL_5: data[4] ?? 0,
      }
      
      console.log('[추론] 예측 확률:', {
        KSL_1: probabilities.KSL_1.toFixed(3),
        KSL_2: probabilities.KSL_2.toFixed(3),
        KSL_3: probabilities.KSL_3.toFixed(3),
        KSL_4: probabilities.KSL_4.toFixed(3),
        KSL_5: probabilities.KSL_5.toFixed(3),
      })
      
      // 가장 큰 확률의 인덱스 선택
      let maxIdx = 0
      for (let i = 1; i < data.length; i += 1) {
        if (data[i] > data[maxIdx]) maxIdx = i
      }
      const confidence = data[maxIdx] ?? 0
      const gestureId = (['KSL_1', 'KSL_2', 'KSL_3', 'KSL_4', 'KSL_5'] as GestureId[])[maxIdx] ?? 'KSL_1'

      console.log('[추론] 선택된 제스처:', gestureId, '확률:', confidence.toFixed(3), '임계값:', STABILIZATION_CONFIG.CONFIDENCE_THRESHOLD)

      if (confidence < STABILIZATION_CONFIG.CONFIDENCE_THRESHOLD) {
        console.log('[추론] 신뢰도 임계값 미달 - 필터링됨')
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
