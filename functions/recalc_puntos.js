const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'green-force-pwa-2025' });
const db = admin.firestore();

async function recalc() {
    console.log("Fetching users...");
    const usersSnap = await db.collection('pm_usuarios').get();
    
    console.log("Fetching bets...");
    const betsSnap = await db.collection('pm_apuestas').get();

    const userPoints = {};
    usersSnap.forEach(u => {
        userPoints[u.id] = { total: 0, byGroup: {} };
    });

    betsSnap.forEach(doc => {
        const a = doc.data();
        let pts = 0;
        if (typeof a.puntosObtenidos === 'number') {
            pts = a.puntosObtenidos;
        } else if (a.puntosObtenidos && typeof a.puntosObtenidos.total === 'number') {
            pts = a.puntosObtenidos.total;
        }

        if (pts > 0) {
            if (!userPoints[a.uid]) userPoints[a.uid] = { total: 0, byGroup: {} };
            userPoints[a.uid].total += pts;
            
            const grupo = a.codigoGrupo || 'LACURVA1';
            userPoints[a.uid].byGroup[grupo] = (userPoints[a.uid].byGroup[grupo] || 0) + pts;
        }
    });

    let batches = [];
    let currentBatch = db.batch();
    let count = 0;
    let totalUpdates = 0;

    for (const uid of Object.keys(userPoints)) {
        const uRef = db.collection('pm_usuarios').doc(uid);
        const data = userPoints[uid];
        currentBatch.update(uRef, {
            puntosTotal: data.total,
            puntosPorGrupo: data.byGroup
        });
        count++;
        totalUpdates++;
        if (count === 400) {
            batches.push(currentBatch);
            currentBatch = db.batch();
            count = 0;
        }
    }
    if (count > 0) batches.push(currentBatch);

    for (const b of batches) {
        await b.commit();
    }

    console.log(`Updated ${totalUpdates} users.`);
}

recalc().then(() => console.log("Done")).catch(console.error);
