const axios = require('axios');
const token = 'b4f284604e1c4ac988962a735ec0f507';
const today = '2026-06-10';
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = tomorrowDate.toISOString().split('T')[0];
axios.get(`https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${today}&dateTo=${tomorrow}`, {
  headers: { 'X-Auth-Token': token }
}).then(res => {
  const match = res.data.matches.find(m => m.homeTeam.name === 'Germany' && m.awayTeam.name === 'Curaçao');
  console.log("MATCH FOUND:", !!match);
  if (!match) {
     const gMatch = res.data.matches.find(m => m.homeTeam.name === 'Germany');
     console.log("Away team in API:", gMatch.awayTeam.name);
     console.log("Away team bytes:", Buffer.from(gMatch.awayTeam.name).toString('hex'));
     console.log("My string bytes:", Buffer.from('Curaçao').toString('hex'));
  }
}).catch(console.error);
