import { useEffect, useRef, useState, type RefObject } from 'react'
import { Camera } from '@mediapipe/camera_utils'
import { Hands, Results } from '@mediapipe/hands'
import { HandLandmarks } from '../types'
import { MEDIAPIPE_CONFIG } from '../utils/constants'

type StreamStatus = 'idle' | 'loading' | 'streaming' | 'error'

interface UseMediaPipeHandsResult {
  videoRef: RefObject<HTMLVideoElement | null>
  landmarks: HandLandmarks | null
  status: StreamStatus
  error: string | null
  frameTimestamp: number | null
}

/**
 * MediaPipe Hands를 초기화하고 실시간 랜드마크를 제공하는 훅
 */
export interface MediaPipeOptions {
  width?: number
  height?: number
  processEvery?: number
}

export function useMediaPipeHands(options?: MediaPipeOptions): UseMediaPipeHandsResult {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [landmarks, setLandmarks] = useState<HandLandmarks | null>(null)
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [frameTimestamp, setFrameTimestamp] = useState<number | null>(null)

  useEffect(() => {
    let hands: Hands | null = null
    let camera: Camera | null = null
    let stopped = false
    const frameCount = { current: 0 }

    async function setup() {
      if (!videoRef.current) return
      setStatus('loading')

      hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })

      hands.setOptions({
        maxNumHands: MEDIAPIPE_CONFIG.MAX_HANDS,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      })

      hands.onResults((results: Results) => {
        if (stopped) return
        frameCount.current += 1
        const processEvery = options?.processEvery ?? 1
        if (frameCount.current % processEvery !== 0) return

        const firstHand = results.multiHandLandmarks?.[0]
        if (firstHand) {
          const mapped: HandLandmarks = firstHand.map((p) => ({
            x: p.x,
            y: p.y,
            z: p.z,
          }))
          setLandmarks(mapped)
        } else {
          setLandmarks(null)
        }
        setFrameTimestamp(performance.now())
      })

      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (!hands || !videoRef.current) return
          await hands.send({ image: videoRef.current })
        },
        width: options?.width ?? 640,
        height: options?.height ?? 480,
      })

      await camera.start()
      if (stopped) {
        camera.stop()
        return
      }
      setStatus('streaming')
    }

    setup().catch((err) => {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    })

    return () => {
      stopped = true
      camera?.stop()
      hands?.close()
    }
  }, [options?.width, options?.height, options?.processEvery])

  return { videoRef, landmarks, status, error, frameTimestamp }
}

