const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('C:\\6. Mis proyectos PWA\\8. Polla Mundialista Goli\\functions\\service-account.json', 'utf8').replace(/^\uFEFF/, ''));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const TOKEN = 'b4f284604e1c4ac988962a735ec0f507';

const teamNameMapping = {
  "Qatar": "Catar", "Ecuador": "Ecuador", "Senegal": "Senegal", "Netherlands": "Países Bajos",
  "England": "Inglaterra", "Iran": "Irán", "USA": "Estados Unidos", "Wales": "Gales",
  "Argentina": "Argentina", "Saudi Arabia": "Arabia Saudita", "Mexico": "México", "Poland": "Polonia",
  "France": "Francia", "Australia": "Australia", "Denmark": "Dinamarca", "Tunisia": "Túnez",
  "Spain": "España", "Costa Rica": "Costa Rica", "Germany": "Alemania", "Japan": "Japón",
  "Belgium": "Bélgica", "Canada": "Canadá", "Morocco": "Marruecos", "Croatia": "Croacia",
  "Brazil": "Brasil", "Serbia": "Serbia", "Switzerland": "Suiza", "Cameroon": "Camerún",
  "Portugal": "Portugal", "Ghana": "Ghana", "Uruguay": "Uruguay", "South Korea": "Corea del Sur"
};

async function sync() {
  console.log("Fetching real matches from football-data.org...");
  const res = await axios.get('https://api.football-data.org/v4/competitions/2000/matches', {
    headers: { 'X-Auth-Token': TOKEN }
  });
  
  const matches = res.data.matches;
  console.log(`Fetched ${matches.length} matches.`);

  const snapshot = await db.collection('partidos').get();
  const dbPartidos = [];
  snapshot.forEach(doc => dbPartidos.push({ id: doc.id, ...doc.data() }));

  let updatedCount = 0;

  for (const apiMatch of matches) {
    if (apiMatch.status === 'FINISHED') {
      const homeNameApi = apiMatch.homeTeam.shortName || apiMatch.homeTeam.name;
      const awayNameApi = apiMatch.awayTeam.shortName || apiMatch.awayTeam.name;
      
      const homeNameDb = teamNameMapping[homeNameApi] || homeNameApi;
      const awayNameDb = teamNameMapping[awayNameApi] || awayNameApi;

      const dbMatch = dbPartidos.find(p => p.equipoLocal === homeNameDb && p.equipoVisitante === awayNameDb);
      
      if (dbMatch) {
        console.log(`Found match to update: ${homeNameDb} vs ${awayNameDb} -> ${apiMatch.score.fullTime.home} - ${apiMatch.score.fullTime.away}`);
        
        await db.collection('partidos').doc(dbMatch.id).update({
          estado: 'finalizado',
          golesLocal: apiMatch.score.fullTime.home,
          golesVisitante: apiMatch.score.fullTime.away
        });

        // Trigger checkPartidos logic for score calculation
        await require('./index.js').calcularPuntosPartido(dbMatch.id, apiMatch.score.fullTime.home, apiMatch.score.fullTime.away);
        updatedCount++;
      }
    }
  }
  console.log(`Updated ${updatedCount} matches with real data!`);
}
sync().catch(console.error);
