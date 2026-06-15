const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'green-force-pwa-2025' });
const db = admin.firestore();

db.collection('pm_partidos')
  .where('equipoLocal', '==', 'ALEMANIA')
  .where('equipoVisitante', '==', 'CURAZAO')
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch(console.error);
