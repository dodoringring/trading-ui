import { useState } from 'react'
import axios from 'axios'

function App() {
  const [ticker, setTicker] = useState('삼성전자')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleAnalyze = async (e) => {
    e.preventDefault() // 폼 제출 시 새로고침 방지
    if (!ticker.trim()) return

    setLoading(true)
    setError(false)
    setData(null)

    try {
      const response = await axios.get(`http://127.0.0.1:8000/analyze?ticker=${ticker}`)

      if (response.data.status === 'error') {
        alert(response.data.message)
        setError(true)
      } else {
        setData(response.data)
      }
    } catch (err) {
      console.error(err)
      setError(true)
      alert("서버 연결 실패! 파이썬 서버가 켜져 있는지 확인해주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    // 전체 배경은 아주 어두운 회색, 내용은 중앙에 스마트폰 비율(max-w-md)로 배치
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center font-sans text-gray-100 selection:bg-green-500/30">

      {/* 📱 모바일 앱 컨테이너 */}
      <div className="w-full max-w-md bg-[#121212] min-h-screen shadow-2xl flex flex-col relative border-x border-gray-800/50">

        {/* 상단 헤더 (고정) */}
        <header className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-md px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-lg font-extrabold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            AI TRADER
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            <span className="text-xs font-medium text-gray-400">LIVE</span>
          </div>
        </header>

        {/* 검색창 영역 */}
        <div className="px-6 py-5 bg-gradient-to-b from-[#121212] to-transparent">
          <form onSubmit={handleAnalyze} className="relative flex items-center">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="종목명 또는 코드 (예: 삼성전자)"
              className="w-full bg-[#1e1e1e] border border-gray-700/50 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm pr-16 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-green-600 hover:bg-green-500 text-white px-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {loading ? '...' : '분석'}
            </button>
          </form>
        </div>

        {/* 메인 콘텐츠 영역 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-6">

          {/* 로딩 화면 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-sm font-medium">AI가 시장을 분석하고 있습니다...</p>
            </div>
          )}

          {/* 대기 화면 (초기 상태) */}
          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-sm font-medium">어떤 종목을 분석해 볼까요?</p>
            </div>
          )}

          {/* 결과 화면 */}
          {data && !loading && (
            <div className="animate-fade-in-up space-y-5">

              {/* 1. 가격 카드 */}
              <div className="bg-[#1e1e1e] rounded-3xl p-6 shadow-lg border border-gray-800/50">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-white">{data.name}</h2>
                  <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded-md">{data.code}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {data.current_price.toLocaleString()}
                  </span>
                  <span className="text-gray-400 font-medium">원</span>
                </div>
              </div>

              {/* 2. AI 시그널 카드 (핵심) */}
              <div className={`relative overflow-hidden rounded-3xl p-6 shadow-lg border ${data.signal === 'buy' ? 'bg-red-950/20 border-red-500/30' :
                  data.signal === 'sell' ? 'bg-blue-950/20 border-blue-500/30' :
                    'bg-gray-800/20 border-gray-600/30'
                }`}>
                {/* 배경 글로우 효과 */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-3xl rounded-full opacity-20 ${data.signal === 'buy' ? 'bg-red-500' : data.signal === 'sell' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>

                <h3 className="text-xs font-bold text-gray-400 mb-3 relative z-10 text-center">AI TRADING SIGNAL</h3>
                <div className={`text-center text-5xl font-black uppercase tracking-widest relative z-10 ${data.signal === 'buy' ? 'text-red-500' :
                    data.signal === 'sell' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                  {data.signal}
                </div>
              </div>

              {/* 3. 보조지표 및 요약 카드 */}
              <div className="bg-[#1e1e1e] rounded-3xl p-6 shadow-lg border border-gray-800/50">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xs font-bold text-gray-400">RSI (14)</h3>
                  <span className={`text-lg font-bold font-mono ${data.rsi > 70 ? 'text-red-400' : data.rsi < 30 ? 'text-blue-400' : 'text-gray-200'
                    }`}>
                    {data.rsi.toFixed(1)}
                  </span>
                </div>

                {/* RSI 게이지 바 */}
                <div className="w-full h-1.5 bg-gray-800 rounded-full mb-6 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
                  <div className="h-full bg-gray-600" style={{ width: '40%' }}></div>
                  <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
                  {/* 현재 위치 마커 (절대 위치로 덮어씌움) */}
                  <div className="absolute w-full h-1.5 -ml-6 pr-12">
                    <div
                      className="w-2 h-3 bg-white rounded-full -mt-0.5 shadow-md border border-gray-300 transition-all duration-1000"
                      style={{ marginLeft: `${Math.min(Math.max(data.rsi, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* AI 요약 이유 */}
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1">
                    <span>💡</span> AI 판단 근거
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-medium">
                    {data.summary}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App