import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [summonerName, setSummonerName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [accountData, setAccountData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [opponentChampion, setOpponentChampion] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch account data and match history
  const fetchAccountData = async () => {
    setLoading(true);
    try {
      // Fetch account data
      const { data: account } = await axios.get(
        `http://localhost:5000/summoner/${summonerName}/${tagLine}`
      );
      setAccountData(account); // Update state with account data
      console.log('Account Data:', account);
  
      // Fetch match history using the PUUID
      const { data: matches } = await axios.get(
        `http://localhost:5000/matches/${account.puuid}`
      );
      setMatchHistory(matches); // Update state with match history
      console.log('Match History:', matches);
    } catch (error) {
      console.error('Error fetching account or matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run analytics for the selected opponent champion
  const runAnalytics = async () => {
    if (!opponentChampion) {
      alert('Please select a champion to analyze.');
      return;
    }
  
    if (!accountData) {
      alert('Account data is missing. Please fetch account data first.');
      return;
    }
  
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/analyze-champion', {
        matches: matchHistory,
        summonerName: accountData.gameName, // Use accountData.gameName here
        opponentChampion,
        puuid: accountData.puuid, // Include PUUID
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Error running analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="App">
      <h1>League of Legends Analytics</h1>
      <div className="search">
        <input
          type="text"
          placeholder="Enter summoner name"
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter tagline"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
        />
        <button onClick={fetchAccountData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Account'}
        </button>
      </div>

      {matchHistory.length > 0 && (
        <div>
          <h2>Select Opponent Champion</h2>
          <input
            type="text"
            placeholder="Enter champion name"
            value={opponentChampion}
            onChange={(e) => setOpponentChampion(e.target.value)}
          />
          <button onClick={runAnalytics} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      )}

      {analytics && (
        <div>
          <h2>Analytics for {opponentChampion}</h2>
          <h3>Best Counter Champions:</h3>
          {Object.keys(analytics.counterChampions).length > 0 ? (
            <ul>
              {Object.entries(analytics.counterChampions).map(([champion, stats]) => (
                <li key={champion}>
                  {champion} - Matchups: {stats.matchups}, Wins: {stats.wins}, Losses: {stats.losses}
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available for counter champions.</p>
          )}

          <h3>Core Items:</h3>
          {Object.keys(analytics.coreItems).length > 0 ? (
            <ul>
              {Object.entries(analytics.coreItems).map(([item, count]) => (
                <li key={item}>
                  Item ID: {item} - Used {count} times
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available for core items.</p>
          )}
        </div>
      )}

    </div>
  );
}

export default App;