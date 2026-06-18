const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Initialise Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// 2. Parse src/data.ts to extract PARTIDOS_INICIALES
const dataTsPath = path.join(__dirname, '../src/data.ts');
if (!fs.existsSync(dataTsPath)) {
  console.error('ERROR: No se encontró src/data.ts en:', dataTsPath);
  process.exit(1);
}

const content = fs.readFileSync(dataTsPath, 'utf8');

// Find the start of the PARTIDOS_INICIALES array
const arrayStartMarker = 'export const PARTIDOS_INICIALES: Partido[] = [';
const startIndex = content.indexOf(arrayStartMarker);
if (startIndex === -1) {
  console.error('ERROR: No se encontró PARTIDOS_INICIALES en data.ts');
  process.exit(1);
}

// Find the end of the array (we search for the closing ]; before export const RANKING_INICIAL)
const searchRest = content.substring(startIndex + arrayStartMarker.length);
const arrayEndMarker = '];';
const endIndex = searchRest.indexOf(arrayEndMarker);
if (endIndex === -1) {
  console.error('ERROR: No se encontró el cierre ]; de PARTIDOS_INICIALES');
  process.exit(1);
}

const arrayText = searchRest.substring(0, endIndex + 1); // include the ]

// Parse using eval (safe since it's our own file)
let partidos;
try {
  partidos = eval('[' + arrayText);
} catch (e) {
  console.error('ERROR al evaluar la lista de partidos:', e);
  process.exit(1);
}

console.log(`Partidos cargados desde data.ts: ${partidos.length}`);
fs.writeFileSync(path.join(__dirname, 'partidos.json'), JSON.stringify(partidos, null, 2), 'utf8');
console.log('partidos.json guardado en functions/');

async function seed() {
  const batch = db.batch();
  let count = 0;

  for (const p of partidos) {
    const docRef = db.collection('pm_partidos').doc(p.partidoId);
    
    // We only update if it doesn't exist, or merge with existing to avoid wiping score inputs if any
    batch.set(docRef, p, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`Seeded/Updated ${count} partidos in Firestore pm_partidos successfully.`);
}

seed().catch(err => {
  console.error('Error al ejecutar el seed:', err);
});
