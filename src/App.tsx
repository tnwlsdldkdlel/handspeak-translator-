import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { useMediaPipeHands } from './hooks/useMediaPipeHands'
import { useGestureInference } from './hooks/useGestureInference'
import { KSL_MAPPING, RecognizedToken } from './types'
import { STABILIZATION_CONFIG } from './utils/constants'

function App() {
  const [videoWidth, setVideoWidth] = useState(640)
  const [videoHeight, setVideoHeight] = useState(480)
  const [processEvery, setProcessEvery] = useState(1)
  const [showOverlay, setShowOverlay] = useState(true)

  const { videoRef, landmarks, status: streamStatus, error: streamError, frameTimestamp } =
    useMediaPipeHands({ width: videoWidth, height: videoHeight, processEvery })
  const { prediction, status: inferenceStatus, error: inferenceError, inferenceMs } = useGestureInference(landmarks)

  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const [tokens, setTokens] = useState<RecognizedToken[]>([])
  const nextId = useRef(1)
  const [fps, setFps] = useState<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)

  // 새 예측이 확정 조건을 만족할 때만 토큰에 추가
  useEffect(() => {
    if (!prediction) return
    const { gestureId, confidence } = prediction
    if (confidence < STABILIZATION_CONFIG.CONFIDENCE_THRESHOLD) return

    setTokens((prev) => {
      const last = prev[prev.length - 1]
      if (last?.gestureId === gestureId) return prev

      const id = nextId.current++
      return [
        ...prev,
        {
          id,
          gestureId,
          text: KSL_MAPPING[gestureId],
          confidence,
        },
      ]
    })
  }, [prediction])

  const recognizedText = useMemo(
    () => tokens.map((t) => t.text).join(' '),
    [tokens],
  )

  const handleUndo = () => {
    setTokens((prev) => prev.slice(0, -1))
  }

  const handleReset = () => {
    setTokens([])
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recognizedText)
    } catch {
      // 클립보드 권한이 없는 경우는 무시
    }
  }

  const statusMessage = useMemo(() => {
    if (streamError) return `스트림 오류: ${streamError}`
    if (inferenceError) return `모델 오류: ${inferenceError}`
    if (streamStatus === 'loading') return '웹캠 초기화 중...'
    if (streamStatus === 'streaming' && inferenceStatus === 'ready') return '실시간 인식 중'
    if (inferenceStatus === 'loading') return '모델 불러오는 중...'
    return '준비 중'
  }, [streamError, inferenceError, streamStatus, inferenceStatus])

  useEffect(() => {
    if (frameTimestamp == null) return
    const prev = lastFrameRef.current
    if (prev != null) {
      const delta = frameTimestamp - prev
      if (delta > 0) {
        const instantFps = 1000 / delta
        setFps((prevFps) => (prevFps == null ? instantFps : prevFps * 0.8 + instantFps * 0.2))
      }
    }
    lastFrameRef.current = frameTimestamp
  }, [frameTimestamp])

  const metricsText = useMemo(() => {
    const fpsText = fps ? `FPS ${fps.toFixed(1)}` : 'FPS 측정 중'
    const inferText = inferenceMs != null ? `추론 ${inferenceMs.toFixed(1)}ms` : '추론 대기'
    return `${fpsText} · ${inferText}`
  }, [fps, inferenceMs])

  const overlayStatusText = useMemo(
    () => (showOverlay ? '오버레이: 켜짐' : '오버레이: 꺼짐'),
    [showOverlay],
  )

  // 랜드마크 오버레이 캔버스 그리기
  useEffect(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    if (!showOverlay) return
    if (!landmarks || landmarks.length === 0) return

    ctx.save()
    ctx.fillStyle = '#00ff88'
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 2

    // 간단히 포인트만 그린다 (연결선 필요 시 MediaPipe Hands connections를 추가로 사용할 수 있음)
    for (const point of landmarks) {
      const x = point.x * width
      const y = point.y * height
      const radius = 4
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }, [landmarks, showOverlay])

  const handleResolutionChange = (value: string) => {
    const [w, h] = value.split('x').map((v) => Number(v))
    if (!Number.isNaN(w) && !Number.isNaN(h)) {
      setVideoWidth(w)
      setVideoHeight(h)
    }
  }

  const handleProcessEveryChange = (value: string) => {
    const n = Number(value)
    if (!Number.isNaN(n) && n >= 1) {
      setProcessEvery(n)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>HandSpeak Translator</h1>
        <p>한국 수어(KSL) 실시간 인식 및 텍스트 변환</p>
      </header>
      <main className="app-main">
        <div className="camera-view">
          <video
            ref={videoRef}
            className="camera-video"
            autoPlay
            playsInline
            muted
            width={videoWidth}
            height={videoHeight}
          />
          <canvas
            ref={overlayCanvasRef}
            className="camera-overlay"
            width={videoWidth}
            height={videoHeight}
          />
          <div className="status-badge">
            <div>{statusMessage}</div>
            <div className="metrics">{metricsText}</div>
            <div className="overlay-status">{overlayStatusText}</div>
          </div>
          <div className="options-row">
            <label>
              해상도
              <select
                value={`${videoWidth}x${videoHeight}`}
                onChange={(e) => handleResolutionChange(e.target.value)}
              >
                <option value="640x480">640x480</option>
                <option value="1280x720">1280x720</option>
              </select>
            </label>
            <label>
              프레임 처리
              <select value={processEvery} onChange={(e) => handleProcessEveryChange(e.target.value)}>
                <option value={1}>모든 프레임</option>
                <option value={2}>2프레임마다</option>
                <option value={3}>3프레임마다</option>
              </select>
            </label>
            <label className="overlay-toggle">
              랜드마크 오버레이
              <input
                type="checkbox"
                checked={showOverlay}
                onChange={(e) => setShowOverlay(e.target.checked)}
              />
            </label>
          </div>
        </div>
        <div className="result-panel">
          <div className="result-text">
            {tokens.length === 0 ? (
              <p>인식 결과가 여기에 표시됩니다.</p>
            ) : (
              <p>{recognizedText}</p>
            )}
          </div>
          <div className="control-buttons">
            <button type="button" onClick={handleUndo} disabled={tokens.length === 0}>
              Undo
            </button>
            <button type="button" onClick={handleReset} disabled={tokens.length === 0}>
              Reset
            </button>
            <button type="button" onClick={handleCopy} disabled={tokens.length === 0}>
              Copy
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

