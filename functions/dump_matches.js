const axios = require('axios');
const fs = require('fs');
const token = 'b4f284604e1c4ac988962a735ec0f507';
const today = '2026-06-10';
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = tomorrowDate.toISOString().split('T')[0];
axios.get(`https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${today}&dateTo=${tomorrow}`, {
  headers: { 'X-Auth-Token': token }
}).then(res => {
  res.data.matches.forEach(m => {
     console.log(`${m.homeTeam.name} vs ${m.awayTeam.name} | Status: ${m.status}`);
  });
}).catch(console.error);
