import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { useMediaPipeHands } from './hooks/useMediaPipeHands'
import { useGestureInference } from './hooks/useGestureInference'
import { KSL_MAPPING, RecognizedToken } from './types'
import { STABILIZATION_CONFIG } from './utils/constants'

function App() {
  const { videoRef, landmarks, status: streamStatus, error: streamError } = useMediaPipeHands()
  const { prediction, status: inferenceStatus, error: inferenceError } = useGestureInference(landmarks)

  const [tokens, setTokens] = useState<RecognizedToken[]>([])
  const nextId = useRef(1)

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>HandSpeak Translator</h1>
        <p>한국 수어(KSL) 실시간 인식 및 텍스트 변환</p>
      </header>
      <main className="app-main">
        <div className="camera-view">
          <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
          <div className="status-badge">{statusMessage}</div>
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

