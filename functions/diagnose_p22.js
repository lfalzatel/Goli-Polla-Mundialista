const https = require('https');
const API_KEY = 'AIzaSyC0QFzN6ZZQGXhH1fcYdfx0-dcQ2XdYJ6g';
const PROJECT_ID = 'green-force-pwa-2025';

function get(path) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}?key=${API_KEY}`;
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function fieldVal(f) {
  if (!f) return null;
  if (f.stringValue !== undefined) return f.stringValue;
  if (f.integerValue !== undefined) return parseInt(f.integerValue, 10);
  if (f.doubleValue !== undefined) return f.doubleValue;
  if (f.booleanValue !== undefined) return f.booleanValue;
  if (f.mapValue) {
    const o = {};
    for (const [k, v] of Object.entries(f.mapValue.fields || {})) o[k] = fieldVal(v);
    return o;
  }
  return f;
}

async function diagnose() {
  const p22 = await get('/pm_partidos/p22');
  console.log('=== PARTIDO P22 ===');
  if (p22.error) {
    console.log('Error:', p22.error.message);
  } else {
    const f = p22.fields || {};
    console.log('estado:', fieldVal(f.estado));
    console.log('goles:', fieldVal(f.golesLocal), '-', fieldVal(f.golesVisitante));
    console.log('equipos:', fieldVal(f.equipoLocal), 'vs', fieldVal(f.equipoVisitante));
  }

  const apuestas = await get('/pm_apuestas');
  const p22bets = (apuestas.documents || []).filter(d => fieldVal(d.fields?.partidoId) === 'p22');
  console.log(`\n=== APUESTAS P22: ${p22bets.length} ===`);

  let sinPuntos = 0;
  let conPuntos = 0;
  p22bets.forEach(d => {
    const f = d.fields || {};
    const pts = fieldVal(f.puntosObtenidos);
    const hasPts = pts && (typeof pts === 'object' ? (pts.total || 0) > 0 : pts > 0);
    if (hasPts) conPuntos++;
    else sinPuntos++;
  });
  console.log(`Con puntos: ${conPuntos}, Sin puntos: ${sinPuntos}`);

  p22bets.slice(0, 5).forEach(d => {
    const f = d.fields || {};
    const pts = fieldVal(f.puntosObtenidos);
    console.log(
      fieldVal(f.uid)?.slice(0, 12),
      `${fieldVal(f.golesLocalApuesta)}-${fieldVal(f.golesVisitanteApuesta)}`,
      'pts:', JSON.stringify(pts)
    );
  });

  const users = await get('/pm_usuarios');
  const list = (users.documents || []).map(d => ({
    nombre: fieldVal(d.fields?.nombre),
    puntosTotal: fieldVal(d.fields?.puntosTotal) || 0,
    puntosPorGrupo: fieldVal(d.fields?.puntosPorGrupo)
  })).sort((a, b) => b.puntosTotal - a.puntosTotal);

  console.log('\n=== TOP 5 USUARIOS ===');
  list.slice(0, 5).forEach(u => {
    console.log(u.nombre, '| total:', u.puntosTotal, '| porGrupo:', JSON.stringify(u.puntosPorGrupo));
  });

  const p21 = await get('/pm_partidos/p21');
  console.log('\n=== PARTIDO P21 ===');
  const f21 = p21.fields || {};
  console.log('estado:', fieldVal(f21.estado), '| goles:', fieldVal(f21.golesLocal), '-', fieldVal(f21.golesVisitante));
}

diagnose().catch(console.error);
