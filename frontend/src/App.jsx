import { useEffect, useState } from 'react';

const API = 'http://127.0.0.1:8000';

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [top5, setTop5] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/recommendations`)
      .then((res) => res.json())
      .then((data) => setRecommendations(data.recommendations))
      .catch(() => setError('Failed to load recommendations'));
    fetch(`${API}/top5up`)
      .then((res) => res.json())
      .then((data) => setTop5(data.top5up))
      .catch(() => setError('Failed to load top 5'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search) return;
    setSearchLoading(true);
    setSearchResult(null);
    fetch(`${API}/recommendation/${search}`)
      .then((res) => res.json())
      .then((data) => setSearchResult(data))
      .catch(() => setSearchResult({ error: 'Not found or error' }))
      .finally(() => setSearchLoading(false));
  };

  const getSignalColor = (signal) =>
    signal === 'likely up' ? '#00ff99' : signal === 'likely down' ? '#ff3b3b' : '#bafffa';

  const getPercentColor = (percent) =>
    percent > 0 ? '#00ff99' : percent < 0 ? '#ff3b3b' : '#bafffa';

  return (
    <div className="futuristic-bg">
      <div className="container centered">
        <h1 className="glow" style={{ textAlign: 'center', width: '100%' }}>TradePilot</h1>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search stock symbol (e.g. NVDA)"
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        {searchLoading && <p className="glow">Searching...</p>}
        {searchResult && (
          <div className="card search-result" style={{ borderColor: getSignalColor(searchResult.signal) }}>
            {searchResult.error ? (
              <span style={{ color: 'red' }}>{searchResult.error}</span>
            ) : (
              <>
                <span className="ticker" style={{ color: getSignalColor(searchResult.signal) }}>{searchResult.ticker}</span>
                <span className="signal" style={{ color: getSignalColor(searchResult.signal) }}>{searchResult.signal}</span>
                {searchResult.daily_changes && searchResult.daily_changes.length > 0 && (
                  <table className="daily-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Δ $</th>
                        <th>Δ %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResult.daily_changes.map((d, i) => (
                        <tr key={i}>
                          <td>{d.date}</td>
                          <td style={{ color: getPercentColor(d.dollar_change) }}>{d.dollar_change > 0 ? '+' : ''}{d.dollar_change}</td>
                          <td style={{ color: getPercentColor(d.percent_change) }}>{d.percent_change > 0 ? '+' : ''}{d.percent_change}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {searchResult.trend_percent !== null && (
                  <span className="trend" style={{ color: getPercentColor(searchResult.trend_percent), marginTop: 8 }}>
                    Est. Move Today: {searchResult.trend_percent > 0 ? '+' : ''}{searchResult.trend_percent}%
                  </span>
                )}
              </>
            )}
          </div>
        )}
        <h2 className="glow" style={{marginTop: '2rem'}}>Top 5 Likely Up Stocks</h2>
        {loading ? (
          <p className="glow">Loading...</p>
        ) : top5.length === 0 ? (
          <p className="glow">No strong uptrends found right now. Try again later!</p>
        ) : (
          <div className="card-list">
            {top5.map(stock => (
              <div className="card" key={stock.ticker} style={{ borderColor: getSignalColor(stock.signal) }}>
                <span className="ticker" style={{ color: getSignalColor(stock.signal) }}>{stock.ticker}</span>
                <span className="signal" style={{ color: getSignalColor(stock.signal) }}>{stock.signal}</span>
                {stock.daily_changes && stock.daily_changes.length > 0 && (
                  <table className="daily-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Δ $</th>
                        <th>Δ %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.daily_changes.map((d, i) => (
                        <tr key={i}>
                          <td>{d.date}</td>
                          <td style={{ color: getPercentColor(d.dollar_change) }}>{d.dollar_change > 0 ? '+' : ''}{d.dollar_change}</td>
                          <td style={{ color: getPercentColor(d.percent_change) }}>{d.percent_change > 0 ? '+' : ''}{d.percent_change}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {stock.trend_percent !== null && (
                  <span className="trend" style={{ color: getPercentColor(stock.trend_percent), marginTop: 8 }}>
                    Est. Move Today: {stock.trend_percent > 0 ? '+' : ''}{stock.trend_percent}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <h2 className="glow" style={{marginTop: '2rem'}}>MVP Watchlist</h2>
        <div className="card-list">
          {recommendations.map((rec) => (
            <div className="card" key={rec.ticker} style={{ borderColor: getSignalColor(rec.signal) }}>
              <span className="ticker" style={{ color: getSignalColor(rec.signal) }}>{rec.ticker}</span>
              <span className="signal" style={{ color: getSignalColor(rec.signal) }}>{rec.signal}</span>
              {rec.daily_changes && rec.daily_changes.length > 0 && (
                <table className="daily-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Δ $</th>
                      <th>Δ %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.daily_changes.map((d, i) => (
                      <tr key={i}>
                        <td>{d.date}</td>
                        <td style={{ color: getPercentColor(d.dollar_change) }}>{d.dollar_change > 0 ? '+' : ''}{d.dollar_change}</td>
                        <td style={{ color: getPercentColor(d.percent_change) }}>{d.percent_change > 0 ? '+' : ''}{d.percent_change}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {rec.trend_percent !== null && (
                <span className="trend" style={{ color: getPercentColor(rec.trend_percent), marginTop: 8 }}>
                  Est. Move Today: {rec.trend_percent > 0 ? '+' : ''}{rec.trend_percent}%
                </span>
              )}
            </div>
          ))}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <style>{`
        .futuristic-bg {
          min-height: 100vh;
          min-width: 100vw;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #0f2027 0%, #2c5364 100%);
          color: #fff;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container.centered {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .glow {
          text-shadow: 0 0 8px #00ffe7, 0 0 16px #00ffe7;
          color: #00ffe7;
          text-align: center;
        }
        .search-bar {
          display: flex;
          margin-bottom: 1.5rem;
          width: 100%;
          max-width: 400px;
          justify-content: center;
        }
        .search-input {
          flex: 1;
          padding: 0.7rem 1rem;
          border: none;
          border-radius: 8px 0 0 8px;
          font-size: 1.1rem;
          background: #1a2a3a;
          color: #fff;
          outline: none;
        }
        .search-btn {
          padding: 0 1.5rem;
          border: none;
          border-radius: 0 8px 8px 0;
          background: #00ffe7;
          color: #0f2027;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 0 8px #00ffe7;
          transition: background 0.2s;
        }
        .search-btn:hover {
          background: #00bfae;
        }
        .card-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
          width: 100%;
        }
        .card {
          background: rgba(20,40,60,0.85);
          border: 2px solid #00ffe7;
          border-radius: 12px;
          box-shadow: 0 0 16px #00ffe733, 0 0 4px #00ffe7;
          padding: 1.2rem 1.5rem;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 1.1rem;
          text-align: center;
        }
        .ticker {
          font-size: 1.3rem;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }
        .signal {
          font-size: 1.1rem;
          margin-bottom: 0.3rem;
        }
        .trend {
          font-size: 1.05rem;
          font-weight: bold;
        }
        .search-result {
          margin-bottom: 1.5rem;
        }
        .daily-table {
          width: 100%;
          margin-top: 0.5rem;
          border-collapse: collapse;
          font-size: 0.98rem;
        }
        .daily-table th, .daily-table td {
          padding: 0.2rem 0.5rem;
          text-align: center;
        }
        .daily-table th {
          color: #00ffe7;
          font-weight: 600;
        }
        .daily-table tr {
          border-bottom: 1px solid #223344;
        }
      `}</style>
    </div>
  );
}

export default App;
