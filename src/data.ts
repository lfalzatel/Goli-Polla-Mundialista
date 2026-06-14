/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Partido, RankedUser, Apuesta, PicksGlobales } from './types';

// Let's gather the precise official images matching the prompt or beautiful alternatives
export const PARTIDOS_INICIALES: Partido[] = [
  { partidoId: "p1", fecha: "JUE 11-06", hora: "02:00 PM", fechaHoraInicio: 1781204400000, equipoLocal: "MÉXICO", equipoVisitante: "SUDÁFRICA", banderaLocal: "https://flagcdn.com/w160/mx.png", banderaVisitante: "https://flagcdn.com/w160/za.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 1", grupoTorneo: "GRUPO A" },
  { partidoId: "p2", fecha: "JUE 11-06", hora: "09:00 PM", fechaHoraInicio: 1781229600000, equipoLocal: "COREA DEL SUR", equipoVisitante: "CHEQUIA", banderaLocal: "https://flagcdn.com/w160/kr.png", banderaVisitante: "https://flagcdn.com/w160/cz.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 2", grupoTorneo: "GRUPO A" },
  { partidoId: "p3", fecha: "VIE 12-06", hora: "02:00 PM", fechaHoraInicio: 1781290800000, equipoLocal: "CANADÁ", equipoVisitante: "BOSNIA", banderaLocal: "https://flagcdn.com/w160/ca.png", banderaVisitante: "https://flagcdn.com/w160/ba.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 3", grupoTorneo: "GRUPO B" },
  { partidoId: "p4", fecha: "VIE 12-06", hora: "08:00 PM", fechaHoraInicio: 1781312400000, equipoLocal: "ESTADOS UNIDOS", equipoVisitante: "PARAGUAY", banderaLocal: "https://flagcdn.com/w160/us.png", banderaVisitante: "https://flagcdn.com/w160/py.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 4", grupoTorneo: "GRUPO B" },
  { partidoId: "p5", fecha: "SÁB 13-06", hora: "02:00 PM", fechaHoraInicio: 1781377200000, equipoLocal: "QATAR", equipoVisitante: "SUIZA", banderaLocal: "https://flagcdn.com/w160/qa.png", banderaVisitante: "https://flagcdn.com/w160/ch.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 5", grupoTorneo: "GRUPO C" },
  { partidoId: "p6", fecha: "SÁB 13-06", hora: "05:00 PM", fechaHoraInicio: 1781388000000, equipoLocal: "BRASIL", equipoVisitante: "MARRUECOS", banderaLocal: "https://flagcdn.com/w160/br.png", banderaVisitante: "https://flagcdn.com/w160/ma.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 6", grupoTorneo: "GRUPO C" },
  { partidoId: "p7", fecha: "SÁB 13-06", hora: "08:00 PM", fechaHoraInicio: 1781398800000, equipoLocal: "HAITÍ", equipoVisitante: "ESCOCIA", banderaLocal: "https://flagcdn.com/w160/ht.png", banderaVisitante: "https://flagcdn.com/w160/gb-sct.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 7", grupoTorneo: "GRUPO D" },
  { partidoId: "p8", fecha: "SÁB 13-06", hora: "11:00 PM", fechaHoraInicio: 1781409600000, equipoLocal: "AUSTRALIA", equipoVisitante: "TURQUÍA", banderaLocal: "https://flagcdn.com/w160/au.png", banderaVisitante: "https://flagcdn.com/w160/tr.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 8", grupoTorneo: "GRUPO D" },
  { partidoId: "p9", fecha: "DOM 14-06", hora: "12:00 PM", fechaHoraInicio: 1781456400000, equipoLocal: "ALEMANIA", equipoVisitante: "CURAZAO", banderaLocal: "https://flagcdn.com/w160/de.png", banderaVisitante: "https://flagcdn.com/w160/cw.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 9", grupoTorneo: "GRUPO E" },
  { partidoId: "p10", fecha: "DOM 14-06", hora: "03:00 PM", fechaHoraInicio: 1781467200000, equipoLocal: "PAÍSES BAJOS", equipoVisitante: "JAPÓN", banderaLocal: "https://flagcdn.com/w160/nl.png", banderaVisitante: "https://flagcdn.com/w160/jp.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 10", grupoTorneo: "GRUPO E" },
  { partidoId: "p11", fecha: "DOM 14-06", hora: "06:00 PM", fechaHoraInicio: 1781478000000, equipoLocal: "COSTA DE MARFIL", equipoVisitante: "ECUADOR", banderaLocal: "https://flagcdn.com/w160/ci.png", banderaVisitante: "https://flagcdn.com/w160/ec.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 11", grupoTorneo: "GRUPO F" },
  { partidoId: "p12", fecha: "DOM 14-06", hora: "09:00 PM", fechaHoraInicio: 1781488800000, equipoLocal: "SUECIA", equipoVisitante: "TÚNEZ", banderaLocal: "https://flagcdn.com/w160/se.png", banderaVisitante: "https://flagcdn.com/w160/tn.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 12", grupoTorneo: "GRUPO F" },
  { partidoId: "p13", fecha: "LUN 15-06", hora: "11:00 AM", fechaHoraInicio: 1781539200000, equipoLocal: "ESPAÑA", equipoVisitante: "CABO VERDE", banderaLocal: "https://flagcdn.com/w160/es.png", banderaVisitante: "https://flagcdn.com/w160/cv.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 13", grupoTorneo: "GRUPO G" },
  { partidoId: "p14", fecha: "LUN 15-06", hora: "02:00 PM", fechaHoraInicio: 1781550000000, equipoLocal: "BÉLGICA", equipoVisitante: "EGIPTO", banderaLocal: "https://flagcdn.com/w160/be.png", banderaVisitante: "https://flagcdn.com/w160/eg.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 14", grupoTorneo: "GRUPO G" },
  { partidoId: "p15", fecha: "LUN 15-06", hora: "05:00 PM", fechaHoraInicio: 1781560800000, equipoLocal: "ARABIA SAUDITA", equipoVisitante: "URUGUAY", banderaLocal: "https://flagcdn.com/w160/sa.png", banderaVisitante: "https://flagcdn.com/w160/uy.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 15", grupoTorneo: "GRUPO H" },
  { partidoId: "p16", fecha: "LUN 15-06", hora: "08:00 PM", fechaHoraInicio: 1781571600000, equipoLocal: "IRÁN", equipoVisitante: "NUEVA ZELANDA", banderaLocal: "https://flagcdn.com/w160/ir.png", banderaVisitante: "https://flagcdn.com/w160/nz.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 16", grupoTorneo: "GRUPO H" },
  { partidoId: "p17", fecha: "MAR 16-06", hora: "02:00 PM", fechaHoraInicio: 1781636400000, equipoLocal: "FRANCIA", equipoVisitante: "SENEGAL", banderaLocal: "https://flagcdn.com/w160/fr.png", banderaVisitante: "https://flagcdn.com/w160/sn.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 17", grupoTorneo: "GRUPO I" },
  { partidoId: "p18", fecha: "MAR 16-06", hora: "05:00 PM", fechaHoraInicio: 1781647200000, equipoLocal: "IRAK", equipoVisitante: "NORUEGA", banderaLocal: "https://flagcdn.com/w160/iq.png", banderaVisitante: "https://flagcdn.com/w160/no.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 18", grupoTorneo: "GRUPO I" },
  { partidoId: "p19", fecha: "MAR 16-06", hora: "08:00 PM", fechaHoraInicio: 1781658000000, equipoLocal: "ARGENTINA", equipoVisitante: "ARGELIA", banderaLocal: "https://flagcdn.com/w160/ar.png", banderaVisitante: "https://flagcdn.com/w160/dz.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 19", grupoTorneo: "GRUPO J" },
  { partidoId: "p20", fecha: "MAR 16-06", hora: "11:00 PM", fechaHoraInicio: 1781668800000, equipoLocal: "AUSTRIA", equipoVisitante: "JORDANIA", banderaLocal: "https://flagcdn.com/w160/at.png", banderaVisitante: "https://flagcdn.com/w160/jo.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 20", grupoTorneo: "GRUPO J" },
  { partidoId: "p21", fecha: "MIE 17-06", hora: "12:00 PM", fechaHoraInicio: 1781715600000, equipoLocal: "PORTUGAL", equipoVisitante: "RD CONGO", banderaLocal: "https://flagcdn.com/w160/pt.png", banderaVisitante: "https://flagcdn.com/w160/cd.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 21", grupoTorneo: "GRUPO K" },
  { partidoId: "p22", fecha: "MIE 17-06", hora: "03:00 PM", fechaHoraInicio: 1781726400000, equipoLocal: "INGLATERRA", equipoVisitante: "CROACIA", banderaLocal: "https://flagcdn.com/w160/gb-eng.png", banderaVisitante: "https://flagcdn.com/w160/hr.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 22", grupoTorneo: "GRUPO K" },
  { partidoId: "p23", fecha: "MIE 17-06", hora: "06:00 PM", fechaHoraInicio: 1781737200000, equipoLocal: "GHANA", equipoVisitante: "PANAMÁ", banderaLocal: "https://flagcdn.com/w160/gh.png", banderaVisitante: "https://flagcdn.com/w160/pa.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 23", grupoTorneo: "GRUPO L" },
  { partidoId: "p24", fecha: "MIE 17-06", hora: "09:00 PM", fechaHoraInicio: 1781748000000, equipoLocal: "UZBEKISTÁN", equipoVisitante: "COLOMBIA", banderaLocal: "https://flagcdn.com/w160/uz.png", banderaVisitante: "https://flagcdn.com/w160/co.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 24", grupoTorneo: "GRUPO L" }
];

export const RANKING_INICIAL: RankedUser[] = [
  {
    uid: "u1",
    nombre: "Andrés Giraldo",
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQj3pLLQT8P1w75chCuC_tzMNjdsizvjum3gjel-S94O68kukUncFrxrZu6RdzBiZ8s5QGxg8n-Q5HyB6sR9EGTdOfuHhiN8-YJN7kCrFDJ5dpjpf079PzG7Cmcd0X4tTJBysavMhdskDNfDggwm66qID0t7-ZOjMRO7AccZCc-vOzNoUxkzJckj79v4XaUMEeaEmqfIXyrEYw2xKUWf-cTCYErSgqKwMNI8NfsT1QSC_8P3HnJsHabi9WC4TwP04YVBWWSMad_qc",
    puntosTotal: 540,
    isMe: false,
    tendencia: "estable",
    posicion: 1
  },
  {
    uid: "u2",
    nombre: "Maria Paula R.",
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuDypM2AhuM9fIdK0m5F2c5LHPeP8H23GUxv97qezWItFLIY6qLaHXJxfaQl0N4-3wfrBqiFKjXVfNuaMYDJVIpQQCaneFGVBW7hUodxLKt9PLnrmYM5-l4hMkOAjGgj0KWc33ZJUqYxOSb2Teh5dTB7MdSq2ze4meY6Ujij7yCAsE8obL4CVi19LN4eYjL787zCp794nswHFfnEF3_FZZxuAvQ5iH7HHb_gAHu7amUoq29SJBDFcvAqfLBfz8OxLS3TD7pFRepFIx4",
    puntosTotal: 528,
    isMe: false,
    tendencia: "estable",
    posicion: 2
  },
  {
    uid: "u3",
    nombre: "Carlos Arturo",
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5YBxbVIUgG269eCtzL9GJc4aAdx8ZhLU3Bohmup4jkFOScz7G4RkJVOqlOEaqIfdeji36dgaHsUTxdNJ8giWNYFCZ4qLpXuCyGNd_oBDuStv9F78oUDhe07OScYGJlBb2JI18Cj2yjjqj1hWDXrrYiCr2lacMLQe02dTlFiL7_edGozxTtVgJTzbda56pB-jfIIuKRQye0rW0sJHaGbm4tXhrOIhwmOo7XTe0ho5svOJPiFjopYZNc4X2hsCwuVLswedbgjB3_3E",
    puntosTotal: 512,
    isMe: false,
    tendencia: "bajando",
    posicion: 3
  },
  {
    uid: "me",
    nombre: "Santiago Velásquez",
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuB51HhLfnZaDiGtKYp7MwISidlkzLIvjuKRkqP-Z4Ht2dfgJK3G8Ve2q4QdXolTh7pung4KkLRXjVW-wEb_4UESxWciOP6HrVq2_JhM1XYhDssQTl7p5-ey-rgv2tfQCzfManWqd5WgZ8rShV-0IJFalxgyqdM5DuGNi-aMWPgI2fDBTcvn1bDgPNRX6YlC9MMlGEC_qv3OozOdRzTAWf5n3njxyzJz_10pMEEW1tGZ9t6OAaoy2zhSTVl1dQ10KnYavNUUhU2_0RU",
    puntosTotal: 482,
    isMe: true,
    tendencia: "subiendo",
    posicion: 14
  }
];

export const APUESTAS_INICIALES_PRESETS = [
  {
    id: "me_p1",
    uid: "me",
    partidoId: "p1",
    golesLocalApuesta: 2,
    golesVisitanteApuesta: 1,
    equipoGanadorApuesta: "local",
    puntosObtenidos: 5,
    bloqueada: true
  }
];

export const HISTORIAL_DESGLOSE_MOCK = [
  {
    fase: "FASE DE GRUPOS • 12 JUN",
    tipo: "RESULTADO EXACTO",
    puntosLabel: "+25 PUNTOS GANADOS",
    puntosColor: "text-secondary-fixed bg-secondary-fixed/10 border-secondary-fixed/20",
    colorLeft: "border-secondary-fixed",
    local: "ARG",
    visitante: "MEX",
    golesLocApuesta: 3,
    golesVisApuesta: 1,
    golesLocReal: 3,
    golesVisReal: 1,
    badgeColor: "bg-secondary-container text-on-secondary-container",
    banderaLoc: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQS_YFCg6l-4lNECaTrKS9sdPJMVFMEnOyvrg0WRF4SJJFc4cY8-t3xdsSltiVmEAHaKy-0vyqqy3398lLx-639MzeGIz64e22oc7Tdmo4ZZEFs0nWg6pWdoasQhNQD-Jq7l8pgr-YZ38MfJEbco7tO57Y-gdF5y1wlQsvnKLQRz_lLrO4oOV7zx04rkR59FERZ4OE8ZlsTJFPs9nz3I8x5kKP7C87s9XWYJogg2vEEBuSGB5WIm8n1MyLYy8RUGcWOYXgPbukq8o",
    banderaVis: "https://lh3.googleusercontent.com/aida-public/AB6AXuC167vcfCXI7eDtPyI2Ksfrwr3aXj3FUwEcHjDifWeKzawjDTZu6-HvNB915Ct2O3kJfcOoG5YYAc9ALanfBLEshNwZyDPk-bu4A6GEw5fjzAn1G4xSkS-kzffpu5gNg8swwGvO451Fr0xBUuNu0_d_RuNgTEvMkQGp5DG7IGRKZa6bQlqRZIGh1FK72bRupEX2czyVkx4PKMw5J2q_2pZgDnoYOpPjvHDrg8SG-jd-r4Gu0hnGJQaPBSv9DCfKr-2QteaoQbhI3iQ"
  },
  {
    fase: "FASE DE GRUPOS • 11 JUN",
    tipo: "ACIERTÓ GANADOR",
    puntosLabel: "+10 PUNTOS GANADOS",
    puntosColor: "text-primary bg-primary/10 border-primary/20",
    colorLeft: "border-primary",
    local: "BRA",
    visitante: "CRO",
    golesLocApuesta: 2,
    golesVisApuesta: 0,
    golesLocReal: 1,
    golesVisReal: 0,
    badgeColor: "bg-primary-container text-on-primary-container",
    banderaLoc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDBl3s8YRNP0wQ9bzM-BiUKBKnLaxiU477DZ2wZNksPCtcPt-fTXQyvthYRB9Pe7QqwsEdGWKx2eCCgWpNRoQhqdOE8gOt9kmiKaPnQNf4RIZ119jKPIG04NVEAe-qniKirRCCRJi7HaFwKdpe8w5c6fxg_cIDg6rc3fK5gcn0XJIO5kk-LvhT6yA7rxf-uMxxwSza7UX8OwNBzY_E1NCoESzNm6wCHzYLQWlh55Goo_qr98hqSpJuVckHDENxXnV_EzRzOX8fZjo",
    banderaVis: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfB0kV6d2Ebkmg-eSOXeYJ0o8F4Uyd_CL6pFV691-KYsF7JyGaWCBn0Su8UwKz-gfhEnGuMCmS5Dtqgr_YlBzPQYyUwvb1H1dBhYb9dk-4ieqjsuf3LU955Bj0dZiaB_B7l85g2qNd2ZdIl7NdR5dVx7WT-lMfy6LVJruckfZwAR7ww-6LRc8iZmW9Jsb9tjvsb6kTPMTgm3t6kQu-ns_YE_RKfrBCJJcFzhVK3-ilFZ5L2mxocr9smTQdHt3JXcAPfXC51AK69cA"
  },
  {
    fase: "FASE DE GRUPOS • 10 JUN",
    tipo: "SIN ACIERTOS",
    puntosLabel: "0 PUNTOS",
    puntosColor: "text-error bg-error/10 border-error/20",
    colorLeft: "border-error",
    local: "ESP",
    visitante: "GER",
    golesLocApuesta: 2,
    golesVisApuesta: 2,
    golesLocReal: 0,
    golesVisReal: 1,
    badgeColor: "bg-error-container text-on-error-container",
    banderaLoc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM-qpJZSN-iac6nKmRyQGxyLKy04DzloeHoStUoQzl7y_Hutm_S0PjQjQt29D6RrNazNQ8PLbAbyPS6vBBxJv0UvLK7fcTohzh7tMVzzflhfhdIfnwKsNiKrwzaYOGhIz8J8C8XN5Wqwd_KvKbfJxw3_j9kDXey4iUG6U0VsZdV_T9yR-FVlGgaayXR7QndYlJkLYtmgXUGvtJEs4sibjWPRPMY-I38FhMAEl7QllNCMSqaQVCVvsRGDuJI1FO1rIttSEkEoi4lk",
    banderaVis: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfiwskYOei8g_oeRx1tq4FzU6-i9y5xKEX2MO1da97dt0IAaIUXvEuJLN21SygUaEd-AtTIlA4Dk_f5lC-Nt7yie9wD8zPdDCQry1TdM0JagY2V7gnSe2_V6Ogg1yUkl8ex0Qwlgh9ryEKNcBIpb91Dipp9LFTuh8Yny3FrGNzzifnotAIfJksOxaXKAGMoI3ETBrXqcuV8hm_WsxhATLHDB6nf6vJb4opzoE5pC8_xXZdLx_GiSOqDiEnh5RuXbQgv_72Ikf67eo"
  }
];

export function calcularPuntosPartido(
  golesLocalReal: number,
  golesVisitanteReal: number,
  golesLocalApuesta: number,
  golesVisitanteApuesta: number,
  totalGolesApuesta?: "mas25" | "menos25" | null
) {
  let marcador = 0;
  let ganador = 0;
  let empate = 0;
  let totalGoles = 0;

  const diferenciaReal = Math.abs(golesLocalReal - golesVisitanteReal);
  const diferenciaApuesta = Math.abs(golesLocalApuesta - golesVisitanteApuesta);

  const ganadorReal = golesLocalReal > golesVisitanteReal ? "local" : golesLocalReal < golesVisitanteReal ? "visitante" : "empate";
  const ganadorApuesta = golesLocalApuesta > golesVisitanteApuesta ? "local" : golesLocalApuesta < golesVisitanteApuesta ? "visitante" : "empate";

  const acertoGolesLocal = golesLocalReal === golesLocalApuesta;
  const acertoGolesVisitante = golesVisitanteReal === golesVisitanteApuesta;

  // 1. Marcador Exacto
  if (golesLocalReal === golesLocalApuesta && golesVisitanteReal === golesVisitanteApuesta) {
    marcador = 5;
  }
  // 2. Ganador + Goles
  else if (ganadorReal === ganadorApuesta && (acertoGolesLocal || acertoGolesVisitante) && ganadorReal !== "empate") {
    ganador = 3;
  }
  // 3. Solo ganador
  else if (ganadorReal === ganadorApuesta && ganadorReal !== "empate") {
    ganador = 2;
  }

  // 4. Empate Acertado
  if (ganadorReal === "empate" && ganadorApuesta === "empate") {
    if (marcador === 0) { // Si ya ganó 5 pts por el marcador exacto de empate, esto es bonus adicional? El user dijo "Bonus extra si predice empate y acierta que fue empate aunque no el marcador exacto" - "Empate acertado: 4". Asumo que si es 5 pts no se le dan 4. Si falló el marcador pero le dio al empate son 4 pts.
      empate = 4;
    }
  }

  // 5. Total goles Over/Under
  const totalGolesReal = golesLocalReal + golesVisitanteReal;
  if (totalGolesApuesta === "mas25" && totalGolesReal > 2.5) {
    totalGoles = 2;
  } else if (totalGolesApuesta === "menos25" && totalGolesReal < 2.5) {
    totalGoles = 2;
  }

  const total = marcador + ganador + empate + totalGoles;

  return {
    marcador,
    ganador,
    empate,
    totalGoles,
    total
  };
}
