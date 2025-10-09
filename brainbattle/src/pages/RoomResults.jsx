import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roomAPI } from '../api/api';

const RoomResults = () => {
  const { roomCode } = useParams();
  const { darkMode, user } = useApp();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchResults();
  }, [roomCode]);
  
  const fetchResults = async () => {
    try {
      const response = await roomAPI.getRoomResults(roomCode);
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading results...</div>;
  if (!results) return <div>No results found</div>;
  
  return (
    <div>
      <h1>Room Results - {roomCode}</h1>
      <h2>Category: {results.category}</h2>
      <h3>Host: {results.host.name}</h3>
      
      {/* Winner Podium */}
      {results.leaderboard.length >= 3 && (
        <div>
          <h2>🏆 Top 3 Winners</h2>
          {/* Show top 3 with podium */}
        </div>
      )}
      
      {/* Full Leaderboard */}
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {results.leaderboard.map((player, index) => (
            <tr key={index}>
              <td>#{player.rank}</td>
              <td>{player.user.name}</td>
              <td>{player.score}</td>
              <td>{player.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={() => navigate('/')}>
        Back to Home
      </button>
      <button onClick={() => navigate('/leaderboard')}>
        Global Leaderboard
      </button>
    </div>
  );
};

export default RoomResults;