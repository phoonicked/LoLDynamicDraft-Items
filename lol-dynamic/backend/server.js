const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = 'RGAPI-00487cca-48b8-4914-8153-b9c9ac7d2621';

app.get('/summoner/:gameName/:tagLine', async (req, res) => {
  const { gameName, tagLine } = req.params;
  console.log(`Incoming request: gameName=${gameName}, tagLine=${tagLine}`);
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    console.log('Riot API response:', response.data);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching account:', err.response?.data || err.message);
    res.status(err.response?.status || 500).send(err.response?.data || 'Internal Server Error');
  }
});

app.get('/matches/:puuid', async (req, res) => {
  const { puuid } = req.params;
  console.log(`Fetching match history for PUUID: ${puuid}`);
  try {
    const response = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    console.log('Match IDs:', response.data); // Log the match IDs being fetched
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching match history:', err.response?.data || err.message);
    res.status(err.response?.status || 500).send(err.response?.data || 'Internal Server Error');
  }
});

app.post('/analyze-champion', async (req, res) => {
  const { matches, summonerName, opponentChampion } = req.body;

  console.log('Incoming request for analysis:');
  console.log('Matches:', matches);
  console.log('Summoner Name:', summonerName);
  console.log('Opponent Champion:', opponentChampion);

  try {
    const analytics = {
      counterChampions: {},
      coreItems: {},
    };

    for (const match of matches) {
      console.log(`Fetching details for match ID: ${match}`);
      const response = await axios.get(
        `https://europe.api.riotgames.com/lol/match/v5/matches/${match}`,
        { headers: { 'X-Riot-Token': API_KEY } }
      );

      const matchDetails = response.data;
      console.log(`Participants in match ${match}:`, matchDetails.info.participants);

      // Find the user's participant data
      const yourData = matchDetails.info.participants.find(
        (p) => p.puuid === accountData.puuid // Match by PUUID instead of summoner name
      );
      
      
      if (!yourData) {
  console.log(
    `Summoner not found by name. Attempting to match using PUUID: ${accountData.puuid}`
  );
  yourData = matchDetails.info.participants.find(
    (p) => p.puuid === accountData.puuid
  );
}

if (!yourData) {
  console.log(`No participant data found for summoner: ${summonerName} in match: ${match}`);
  continue;
}

      // Find the opponent champion data
      const opponent = matchDetails.info.participants.find(
        (p) => p.championName === opponentChampion && p.teamId !== yourData.teamId
      );

      if (!opponent) {
        console.log(`Opponent champion (${opponentChampion}) not found in match: ${match}`);
        continue;
      }

      const yourChampion = yourData.championName;
      if (!analytics.counterChampions[yourChampion]) {
        analytics.counterChampions[yourChampion] = { matchups: 0, wins: 0, losses: 0 };
      }

      analytics.counterChampions[yourChampion].matchups += 1;
      if (yourData.win) {
        analytics.counterChampions[yourChampion].wins += 1;
      } else {
        analytics.counterChampions[yourChampion].losses += 1;
      }

      for (let i = 0; i <= 6; i++) {
        const item = yourData[`item${i}`];
        if (item) {
          analytics.coreItems[item] = (analytics.coreItems[item] || 0) + 1;
        }
      }
    }

    console.log('Final Analytics:', analytics);
    res.json(analytics);
  } catch (err) {
    console.error('Error analyzing matches:', err.message);
    res.status(500).send('Error analyzing matches');
  }
});


// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));