import { useEffect, useState } from 'react'
import axios from 'axios'
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

function App() {
  const [ticker, setTicker] = useState('삼성전자')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [topStocks, setTopStocks] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [strategy, setStrategy] = useState('volatility');

  // 🌟 로고 클릭 시 모든 상태를 초기화해서 처음 화면으로 돌아가는 함수
  const handleGoHome = () => {
    setTicker('');       // 검색창 비우기
    setData(null);       // 분석 결과 화면 지우기
    setError(false);     // 에러 메시지 지우기
    setLoading(false);   // 혹시 모를 로딩 상태 끄기
    fetchTopStocks();
  };

  // 🌟 실시간 인기 종목을 서버에서 가져오는 전용 함수
  const fetchTopStocks = () => {
    setIsRefreshing(true); // 뺑글뺑글 아이콘 돌기 시작!
    // fetch("https://auto-trading-4bbo.onrender.com/top_stocks")
    fetch("http://127.0.0.1:8000/top_stocks")
      .then(res => res.json())
      .then(data => {
        if (data && data.top_stocks && Array.isArray(data.top_stocks)) {
          setTopStocks(data.top_stocks);
        }
      })
      .catch(err => console.error("인기 종목을 못 가져왔어요!", err))
      .finally(() => {
        // 0.5초 정도 살짝 여유를 두고 뺑글뺑글 멈추기 (시각적 효과)
        setTimeout(() => setIsRefreshing(false), 500);
      });
  };

  // 화면이 처음 켜질 때 딱 한 번 실행
  useEffect(() => {
    fetchTopStocks();
  }, []);

  // 🌟 1. handleAnalyze 함수 수정
  // 괄호 안에 directTicker = null 을 추가해서, 버튼을 눌렀을 때 종목명을 직접 받을 수 있게 만듭니다.
  const handleAnalyze = async (e, directTicker = null) => {
    // 폼 제출(엔터)로 실행됐을 때만 새로고침을 막아줍니다.
    if (e) e.preventDefault();

    // 버튼을 클릭해서 들어온 종목명이 있으면 그걸 쓰고, 아니면 검색창(ticker) 값을 씁니다.
    const searchTarget = directTicker || ticker;

    if (!searchTarget.trim()) return;

    setLoading(true);
    setError(false);
    setData(null);

    try {
      // const response = await axios.get(`https://auto-trading-4bbo.onrender.com/analyze?ticker=${searchTarget}&strategy=${strategy}`);
      const response = await axios.get(`http://127.0.0.1:8000/analyze?ticker=${searchTarget}&strategy=${strategy}`);
      if (response.data.status === 'error') {
        alert(response.data.message);
        setError(true);
      } else {
        setData(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      alert("서버 연결 실패! 파이썬 서버가 켜져 있는지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 2. 버튼 클릭 함수 수정
  const handleStockClick = (stockName) => {
    setTicker(stockName);
    handleAnalyze(null, stockName); // 이벤트(e) 자리는 비우고, 종목명을 직접 넘겨서 바로 분석 시작!
  };


  return (
    // 🌟 1. 전체 화면을 상하로 꽉 채우고(min-h-screen) 세로 배치(flex-col)합니다.
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-green-500/30 flex-col">

      {/* 🌟 수정된 헤더 (로고 클릭 기능 추가) */}
      <header className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* onClick과 cursor-pointer, hover 효과를 추가했습니다! */}
          <h1
            onClick={handleGoHome}
            className="text-xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent tracking-wide cursor-pointer hover:opacity-80 transition-opacity"
            title="처음 화면으로"
          >
            AI TRADER PRO
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            <span className="text-sm font-medium text-gray-400 tracking-wider">LIVE</span>
          </div>
        </div>
      </header>

      {/* 🌟 2. 메인 영역을 화면 '정중앙'으로 밀어줍니다 (flex-1, justify-center, items-center) */}
      <main className="flex-1 flex flex-col justify-center items-center w-full py-8 md:py-12">

        {/* 🌟 3. 내용물들이 너무 퍼지지 않게 최대 너비를 고정(max-w-6xl)합니다 */}
        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* 🌟 업그레이드된 검색창 (전략 선택 기능 포함) */}
          <div className="max-w-3xl mx-auto mb-10 md:mb-16 w-full">
            <form onSubmit={handleAnalyze} className="relative group w-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

              <div className="relative flex flex-col md:flex-row items-center bg-[#1e1e1e] rounded-2xl border border-gray-700/50 overflow-hidden shadow-inner w-full">

                {/* 🌟 전략 선택 드롭다운 메뉴 */}
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full md:w-auto md:min-w-[180px] bg-[#2a2a2a] text-gray-200 px-4 py-3 md:py-5 border-b md:border-b-0 md:border-r border-gray-700/50 focus:outline-none text-sm md:text-base cursor-pointer hover:bg-[#333333] transition-colors appearance-none font-medium"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value="volatility">📈 변동성 돌파</option>
                  <option value="moving_average">🌊 이동평균선</option>
                  <option value="rsi">📊 RSI 기반</option>
                  {/* 파이썬에 만들어두신 다른 전략이 있다면 여기에 value 값을 맞춰서 추가하세요! */}
                </select>

                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="종목명 또는 코드 (예: 삼성전자)"
                  className="w-full bg-transparent text-white px-6 py-4 md:py-5 focus:outline-none text-base md:text-lg"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="whitespace-nowrap w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-6 md:px-8 py-4 md:py-4 m-0 md:m-1.5 rounded-none md:rounded-xl font-bold text-sm md:text-base transition-all disabled:opacity-50"
                >
                  {loading ? '분석 중...' : 'AI 분석'}
                </button>
              </div>
            </form>
          </div>

          {/* 🔥 실시간 인기 검색 종목 영역 (새로고침 + 20개 버전) */}
          <div className="max-w-2xl mx-auto w-full mb-12">
            {/* 타이틀 & 새로고침 버튼 영역 */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">🔥</span>
                <h3 className="text-lg font-bold text-gray-200 tracking-wide">실시간 인기 검색 TOP 20</h3>
              </div>

              {/* 🌟 새로고침 버튼 */}
              <button
                onClick={fetchTopStocks}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e1e] hover:bg-gray-800 border border-gray-700/50 rounded-lg text-sm font-medium text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-green-400' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {isRefreshing ? '업데이트 중...' : ''}
              </button>
            </div>

            {/* 종목 버튼 리스트 */}
            <div className="flex flex-wrap gap-2 md:gap-3 px-2">
              {topStocks && topStocks.length > 0 && !isRefreshing ? (
                // ✅ 데이터가 있을 때 (20개 쫙 깔아주기)
                topStocks.map((stock, index) => (
                  <button
                    key={index}
                    onClick={() => handleStockClick(stock)}
                    className="group relative flex items-center gap-2 bg-[#1e1e1e] hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-500 border border-gray-700/50 hover:border-transparent px-3 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:-translate-y-1"
                  >
                    <span className="text-xs font-bold text-gray-500 group-hover:text-green-100 bg-black/40 px-1.5 py-0.5 rounded">
                      {index + 1}
                    </span>
                    <span className="text-sm md:text-sm font-medium text-gray-300 group-hover:text-white">
                      {stock}
                    </span>
                  </button>
                ))
              ) : (
                // ⏳ 데이터 가져오는 중 (새로고침 누를 때마다 스켈레톤 보여주기)
                Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-[#1e1e1e] border border-gray-800 h-9 w-20 rounded-xl"
                  ></div>
                ))
              )}
            </div>
          </div>

          {/* 결과 / 대기 / 로딩 화면 영역 */}
          <div className="w-full">

            {loading && (
              <div className="flex flex-col items-center justify-center py-10 animate-pulse w-full">
                <div className="w-14 h-14 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 text-base md:text-lg font-medium">AI가 시장 데이터를 수집하고 분석 중입니다...</p>
              </div>
            )}

            {!data && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40 w-full">
                <div className="text-7xl mb-6">📈</div>
                <p className="text-base md:text-lg font-medium">투자하고 싶은 종목을 검색해 보세요.</p>
              </div>
            )}

            {/* 그리드 시스템 (분석 결과) */}
            {data && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up w-full">

                {/* 🌟 업그레이드된 가격 & 미니 차트 카드 */}
                <div className="md:col-span-5 bg-[#1e1e1e] rounded-3xl p-6 md:p-8 shadow-lg border border-gray-800/50 flex flex-col w-full">

                  {/* 상단: 이름과 가격 */}
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{data.name}</h2>
                    <span className="text-sm font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-gray-700/50">{data.code}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
                      {data.current_price.toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-400 font-medium">KRW</span>
                  </div>

                  {/* 하단: 트레이딩뷰 미니 캔들 차트 */}
                  <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden border border-gray-700/50 bg-[#121212] relative">
                    <AdvancedRealTimeChart
                      symbol={`KRX:${data.code}`} // 한국 주식 코드를 자동으로 넣어줌!
                      theme="dark"                // 찰떡같은 다크모드
                      locale="kr"                 // 한국어 설정
                      autosize                    // 박스 크기에 딱 맞게 자동 조절
                      hide_top_toolbar={true}     // 윗부분 지저분한 툴바 숨기기
                      hide_legend={true}          // 범례 숨기기
                      save_image={false}
                      backgroundColor="#121212"   // 배경색 맞춤
                      allow_symbol_change={false} // 다른 종목 검색 못하게 고정
                    />
                  </div>
                </div>

                {/* AI 시그널 카드 */}
                <div className={`md:col-span-7 relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-lg border flex flex-col items-center justify-center w-full ${data.signal === 'buy' ? 'bg-red-950/20 border-red-500/30' :
                  data.signal === 'sell' ? 'bg-blue-950/20 border-blue-500/30' :
                    'bg-gray-800/20 border-gray-600/30'
                  }`}>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 blur-[80px] rounded-full opacity-30 ${data.signal === 'buy' ? 'bg-red-500' : data.signal === 'sell' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>

                  <h3 className="text-sm md:text-base font-bold text-gray-400 mb-4 relative z-10 tracking-widest">AI TRADING SIGNAL</h3>
                  <div className={`text-6xl md:text-8xl font-black uppercase tracking-tight relative z-10 ${data.signal === 'buy' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                    data.signal === 'sell' ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                      'text-gray-400 drop-shadow-[0_0_15px_rgba(156,163,175,0.5)]'
                    }`}>
                    {data.signal}
                  </div>
                </div>

                {/* 보조지표 & AI 분석 카드 */}
                <div className="md:col-span-12 bg-[#1e1e1e] rounded-3xl p-6 md:p-8 shadow-lg border border-gray-800/50 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">

                    {/* 🌟 업그레이드된 기술적 지표 대시보드 */}
                    <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0 md:pr-12 flex flex-col justify-center gap-6">
                      
                      {/* 1. RSI 지표 */}
                      <div>
                        <div className="flex justify-between items-end mb-3">
                          <h3 className="text-sm font-bold text-gray-400">RSI (14) <span className="text-xs font-normal text-gray-500 ml-1">상대강도지수</span></h3>
                          <span className={`text-2xl font-bold font-mono ${
                            data.rsi > 70 ? 'text-red-400' : data.rsi < 30 ? 'text-blue-400' : 'text-gray-200'
                          }`}>
                            {data.rsi.toFixed(1)}
                          </span>
                        </div>
                        <div className="relative w-full h-2 bg-gray-800 rounded-full mb-2 overflow-hidden flex">
                          <div className="h-full bg-blue-500/80" style={{ width: '30%' }}></div>
                          <div className="h-full bg-gray-600/50" style={{ width: '40%' }}></div>
                          <div className="h-full bg-red-500/80" style={{ width: '30%' }}></div>
                        </div>
                        <div className="relative w-full h-4 -mt-3.5 mb-2">
                          <div
                            className="absolute top-0 w-2.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000 -ml-1.25"
                            style={{ left: `${Math.min(Math.max(data.rsi, 0), 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                          <span>과매도 (30↓)</span>
                          <span>과매수 (70↑)</span>
                        </div>
                      </div>

                      {/* 2. MACD 지표 */}
                      <div className="bg-[#121212] p-4 rounded-xl border border-gray-800/80">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-bold text-gray-400">MACD <span className="text-xs font-normal text-gray-500 ml-1">추세지표</span></h3>
                          <span className={`text-xl font-bold font-mono ${
                            data.macd > 0 ? 'text-red-400' : data.macd < 0 ? 'text-blue-400' : 'text-gray-200'
                          }`}>
                            {data.macd > 0 ? '+' : ''}{data.macd ? data.macd.toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs font-medium">
                          <span className="text-gray-500">현재 추세 방향</span>
                          <span className={`px-2 py-1 rounded-md ${
                            data.macd > 0 ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {data.macd > 0 ? '📈 상승 추세 (강세)' : '📉 하락 추세 (약세)'}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* AI 이유 텍스트 */}
                    <div className="md:col-span-2 flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <span className="text-lg">🤖</span> AI 종합 판단 근거
                      </h3>
                      <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800/80">
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed whitespace-pre-line font-medium">
                          {data.summary}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App