/**
 * Script diagnóstico usando API REST de Firestore
 * Usa la API key que ya está en firebase.ts
 */

const https = require('https');

const API_KEY = 'AIzaSyC0QFzN6ZZQGXhH1fcYdfx0-dcQ2XdYJ6g';
const PROJECT_ID = 'green-force-pwa-2025';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}?key=${API_KEY}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function diagnose() {
  console.log('\n🔍 DIAGNÓSTICO P21 - Via API REST\n');

  try {
    // 1. Obtener TODAS las apuestas
    console.log('📋 Obteniendo apuestas...');
    const apuestasRes = await makeRequest('GET', '/pm_apuestas');
    
    if (!apuestasRes.data.documents) {
      console.log('❌ Error:', apuestasRes.data.error?.message || 'No se encontraron apuestas');
      process.exit(0);
    }

    const allApuestas = apuestasRes.data.documents || [];
    console.log(`Total apuestas en colección: ${allApuestas.length}\n`);

    // 2. Filtrar p21
    let p21Apuestas = [];
    
    allApuestas.forEach(doc => {
      const fields = doc.fields || {};
      
      // Los campos en Firestore REST API están envueltos en objetos tipados
      const partidoId = fields.partidoId?.stringValue;
      
      if (partidoId === 'p21') {
        p21Apuestas.push({
          docName: doc.name,
          fields
        });
      }
    });

    console.log(`📊 APUESTAS EN P21: ${p21Apuestas.length}\n`);

    if (p21Apuestas.length === 0) {
      console.log('❌ No hay apuestas en p21');
      console.log('\n📝 Primeras 3 apuestas encontradas:');
      
      allApuestas.slice(0, 3).forEach((doc, idx) => {
        const fields = doc.fields || {};
        console.log(`\n${idx + 1}. ${doc.name.split('/').pop()}`);
        console.log(`   uid: ${fields.uid?.stringValue || 'N/A'}`);
        console.log(`   partidoId: ${fields.partidoId?.stringValue || 'N/A'}`);
      });
      process.exit(0);
    }

    // 3. Analizar
    let conNumero = 0;
    let conObjeto = 0;

    console.log('DETALLES:');
    p21Apuestas.forEach((apuesta, idx) => {
      const fields = apuesta.fields;
      const uid = fields.uid?.stringValue || 'N/A';
      const golesLocal = fields.golesLocalApuesta?.integerValue || 0;
      const golesVisitante = fields.golesVisitanteApuesta?.integerValue || 0;
      const totalGoles = fields.totalGolesApuesta?.stringValue || 'ninguno';
      
      // puntosObtenidos puede ser number o map
      let puntos = 'N/A';
      let tipo = 'desconocido';
      
      if (fields.puntosObtenidos?.doubleValue !== undefined) {
        puntos = fields.puntosObtenidos.doubleValue;
        tipo = 'number';
        conNumero++;
      } else if (fields.puntosObtenidos?.integerValue !== undefined) {
        puntos = fields.puntosObtenidos.integerValue;
        tipo = 'number';
        conNumero++;
      } else if (fields.puntosObtenidos?.mapValue) {
        puntos = JSON.stringify(fields.puntosObtenidos.mapValue.fields);
        tipo = 'object';
        conObjeto++;
      }

      console.log(`\n${idx + 1}. UID: ${uid}`);
      console.log(`   Predicción: ${golesLocal}-${golesVisitante}`);
      console.log(`   Total Goles: ${totalGoles}`);
      console.log(`   puntosObtenidos: ${puntos}`);
      console.log(`   Tipo: ${tipo}`);
    });

    console.log('\n' + '─'.repeat(60));
    console.log(`\n📈 RESUMEN:`);
    console.log(`   ✅ Con objeto (correcto): ${conObjeto}`);
    console.log(`   ❌ Con número (problema): ${conNumero}`);
    console.log(`   Total: ${p21Apuestas.length}`);
    console.log('\n' + '─'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

diagnose();
