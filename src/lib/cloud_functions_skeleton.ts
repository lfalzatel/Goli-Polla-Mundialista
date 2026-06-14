import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Inicializa Firebase Admin SDK para interactuar con Firestore desde el servidor
admin.initializeApp();
const db = admin.firestore();

/**
 * Función programada (cron job) que se ejecuta cada 15 minutos.
 * Objetivo: Consultar la API de resultados de fútbol, buscar los partidos en_vivo o finalizados
 * y actualizar la colección 'pm_partidos' y recalcular puntos en 'pm_usuarios'.
 */
export const syncMundialMatches = functions.scheduler.onSchedule('every 15 minutes', async (event) => {
  try {
    console.log("Iniciando sincronización de partidos...");

    // 1. Llamar a la API externa (Ejemplo con API-Football o similar)
    // const response = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', { ... });
    // const data = await response.json();

    // Simulación de datos recibidos:
    const partidosActualizados = [
      { idExterno: "ext_1", golesLocal: 2, golesVisitante: 1, estado: "finalizado" }
    ];

    const batch = db.batch();

    // 2. Por cada partido actualizado, buscar su equivalente en Firestore (pm_partidos)
    // Esto asume que guardaste el "idExterno" (apiMatchId) al inicializar la base de datos
    for (const partido of partidosActualizados) {
      const matchQuery = await db.collection('pm_partidos').where('apiMatchId', '==', partido.idExterno).get();
      
      if (!matchQuery.empty) {
        const docRef = matchQuery.docs[0].ref;
        batch.update(docRef, {
          golesLocal: partido.golesLocal,
          golesVisitante: partido.golesVisitante,
          estado: partido.estado // 'en_vivo' o 'finalizado'
        });
      }
    }

    // 3. Confirmar la actualización de los marcadores
    await batch.commit();

    console.log("Partidos actualizados con éxito.");
    
    // NOTA: Para recalcular los puntos de los usuarios, se sugiere hacer otro proceso (trigger)
    // que escuche los cambios en pm_partidos, o hacerlo directamente aquí iterando sobre pm_apuestas.

  } catch (error) {
    console.error("Error sincronizando los partidos:", error);
  }
});
