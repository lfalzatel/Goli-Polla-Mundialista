/**
 * Script explorador: Ver qué apuestas existen realmente
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function explore() {
  console.log('\n🔍 EXPLORANDO COLECCIONES...\n');

  try {
    // 1. Listar TODAS las colecciones
    console.log('📚 Colecciones en Firestore:');
    const collections = await db.listCollections();
    collections.forEach(col => {
      console.log(`   - ${col.id}`);
    });
    console.log('');

    // 2. Contar documentos en pm_apuestas
    const apuestasSnap = await db.collection('pm_apuestas').limit(5).get();
    console.log(`📊 Primeras 5 apuestas en 'pm_apuestas':`);
    
    if (apuestasSnap.empty) {
      console.log('   ❌ Colección vacía o sin acceso\n');
    } else {
      apuestasSnap.forEach((doc, idx) => {
        const data = doc.data();
        console.log(`\n   ${idx + 1}. Doc ID: ${doc.id}`);
        console.log(`      uid: ${data.uid}`);
        console.log(`      partidoId: ${data.partidoId}`);
        console.log(`      puntosObtenidos: ${JSON.stringify(data.puntosObtenidos)}`);
      });
    }

    // 3. Buscar todas las apuestas para p21 (sin filtro, con búsqueda manual)
    console.log('\n\n🔎 Buscando apuestas con partidoId = "p21"...');
    const allApuestas = await db.collection('pm_apuestas').get();
    
    let p21Count = 0;
    allApuestas.forEach(doc => {
      if (doc.data().partidoId === 'p21') {
        p21Count++;
        console.log(`   ✅ Encontrada: ${doc.id}`);
      }
    });
    
    if (p21Count === 0) {
      console.log('   ❌ No hay apuestas con partidoId = "p21"');
      
      // Mostrar qué valores de partidoId existen
      console.log('\n   Valores únicos de partidoId encontrados:');
      const partidoIds = new Set();
      allApuestas.forEach(doc => {
        if (doc.data().partidoId) {
          partidoIds.add(doc.data().partidoId);
        }
      });
      const sorted = Array.from(partidoIds).sort();
      sorted.forEach(pid => {
        console.log(`      - ${pid}`);
      });
    }

    console.log(`\n   Total apuestas en p21: ${p21Count}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

explore();
