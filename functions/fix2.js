const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'green-force-pwa-2025' });
const db = admin.firestore();

function calc(golesLocalReal, golesVisitanteReal, localApuesta, visitanteApuesta, totalGolesApuesta) {
    let pts = 0;
    let marcador = 0;
    let ganador = 0;
    let empate = 0;
    let totalGoles = 0;

    if (golesLocalReal === localApuesta && golesVisitanteReal === visitanteApuesta) {
        marcador = 5;
    } else {
        const diffReal = golesLocalReal - golesVisitanteReal;
        const diffApuesta = localApuesta - visitanteApuesta;
        if ((diffReal > 0 && diffApuesta > 0) || (diffReal < 0 && diffApuesta < 0)) {
            ganador = 3;
        } else if (diffReal === 0 && diffApuesta === 0) {
            empate = 3;
        }
    }

    const sumaReal = golesLocalReal + golesVisitanteReal;
    if (totalGolesApuesta === 'mas25' && sumaReal > 2.5) totalGoles = 2;
    else if (totalGolesApuesta === 'menos25' && sumaReal < 2.5) totalGoles = 2;

    pts = marcador + ganador + empate + totalGoles;
    return { marcador, ganador, empate, totalGoles, total: pts };
}

async function fix() {
    const apuestasSnap = await db.collection('pm_apuestas').get();
    const partidosSnap = await db.collection('pm_partidos').get();
    const partidos = {};
    partidosSnap.forEach(d => { partidos[d.id] = d.data(); });

    const batch = db.batch();
    let count = 0;

    apuestasSnap.forEach(doc => {
        const a = doc.data();
        const p = partidos[a.partidoId];
        if (p && p.estado === 'finalizado' && p.golesLocal !== null) {
            if (typeof a.puntosObtenidos === 'number') {
                const ptsObj = calc(p.golesLocal, p.golesVisitante, a.golesLocalApuesta, a.golesVisitanteApuesta, a.totalGolesApuesta);
                batch.update(doc.ref, { puntosObtenidos: ptsObj });
                count++;
            }
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Fixed ${count} apuestas.`);
    } else {
        console.log("No apuestas needed fixing.");
    }
}

fix().catch(console.error);
