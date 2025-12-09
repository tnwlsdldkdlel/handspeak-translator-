import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>HandSpeak Translator</h1>
        <p>한국 수어(KSL) 실시간 인식 및 텍스트 변환</p>
      </header>
      <main className="app-main">
        <div className="camera-view">
          <p>웹캠 뷰 영역 (60-65%)</p>
        </div>
        <div className="result-panel">
          <div className="result-text">
            <p>인식 결과 텍스트 영역</p>
          </div>
          <div className="control-buttons">
            <button>Undo</button>
            <button>Reset</button>
            <button>Copy</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

