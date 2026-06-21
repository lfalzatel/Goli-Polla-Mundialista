/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Partido, RankedUser, Apuesta } from './types';

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
  { partidoId: "p24", fecha: "MIE 17-06", hora: "09:00 PM", fechaHoraInicio: 1781748000000, apuestaAbiertaHasta: 1781751600000, equipoLocal: "UZBEKISTÁN", equipoVisitante: "COLOMBIA", banderaLocal: "https://flagcdn.com/w160/uz.png", banderaVisitante: "https://flagcdn.com/w160/co.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 24", grupoTorneo: "GRUPO L" },

  // ──────────── JORNADA 2 ────────────

  // JUE 18-JUN
  { partidoId: "p25", fecha: "JUE 18-06", hora: "11:00 AM", fechaHoraInicio: 1781798400000, equipoLocal: "CHEQUIA", equipoVisitante: "SUDÁFRICA", banderaLocal: "https://flagcdn.com/w160/cz.png", banderaVisitante: "https://flagcdn.com/w160/za.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 25", grupoTorneo: "GRUPO A" },
  { partidoId: "p26", fecha: "JUE 18-06", hora: "02:00 PM", fechaHoraInicio: 1781809200000, equipoLocal: "SUIZA", equipoVisitante: "BOSNIA", banderaLocal: "https://flagcdn.com/w160/ch.png", banderaVisitante: "https://flagcdn.com/w160/ba.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 26", grupoTorneo: "GRUPO B" },
  { partidoId: "p27", fecha: "JUE 18-06", hora: "05:00 PM", fechaHoraInicio: 1781820000000, equipoLocal: "CANADÁ", equipoVisitante: "QATAR", banderaLocal: "https://flagcdn.com/w160/ca.png", banderaVisitante: "https://flagcdn.com/w160/qa.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 27", grupoTorneo: "GRUPO B" },
  { partidoId: "p28", fecha: "JUE 18-06", hora: "08:00 PM", fechaHoraInicio: 1781830800000, equipoLocal: "MÉXICO", equipoVisitante: "COREA DEL SUR", banderaLocal: "https://flagcdn.com/w160/mx.png", banderaVisitante: "https://flagcdn.com/w160/kr.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 28", grupoTorneo: "GRUPO A" },

  // VIE 19-JUN
  { partidoId: "p29", fecha: "VIE 19-06", hora: "02:00 PM", fechaHoraInicio: 1781895600000, equipoLocal: "ESTADOS UNIDOS", equipoVisitante: "AUSTRALIA", banderaLocal: "https://flagcdn.com/w160/us.png", banderaVisitante: "https://flagcdn.com/w160/au.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 29", grupoTorneo: "GRUPO D" },
  { partidoId: "p30", fecha: "VIE 19-06", hora: "05:00 PM", fechaHoraInicio: 1781906400000, equipoLocal: "ESCOCIA", equipoVisitante: "MARRUECOS", banderaLocal: "https://flagcdn.com/w160/gb-sct.png", banderaVisitante: "https://flagcdn.com/w160/ma.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 30", grupoTorneo: "GRUPO C" },
  { partidoId: "p31", fecha: "VIE 19-06", hora: "07:30 PM", fechaHoraInicio: 1781915400000, equipoLocal: "BRASIL", equipoVisitante: "HAITÍ", banderaLocal: "https://flagcdn.com/w160/br.png", banderaVisitante: "https://flagcdn.com/w160/ht.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 31", grupoTorneo: "GRUPO C" },
  { partidoId: "p32", fecha: "VIE 19-06", hora: "10:00 PM", fechaHoraInicio: 1781924400000, equipoLocal: "TURQUÍA", equipoVisitante: "PARAGUAY", banderaLocal: "https://flagcdn.com/w160/tr.png", banderaVisitante: "https://flagcdn.com/w160/py.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 32", grupoTorneo: "GRUPO D" },

  // SÁB 20-JUN
  { partidoId: "p33", fecha: "SÁB 20-06", hora: "12:00 PM", fechaHoraInicio: 1781974800000, equipoLocal: "PAÍSES BAJOS", equipoVisitante: "SUECIA", banderaLocal: "https://flagcdn.com/w160/nl.png", banderaVisitante: "https://flagcdn.com/w160/se.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 33", grupoTorneo: "GRUPO F" },
  { partidoId: "p34", fecha: "SÁB 20-06", hora: "03:00 PM", fechaHoraInicio: 1781985600000, equipoLocal: "ALEMANIA", equipoVisitante: "COSTA DE MARFIL", banderaLocal: "https://flagcdn.com/w160/de.png", banderaVisitante: "https://flagcdn.com/w160/ci.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 34", grupoTorneo: "GRUPO E" },
  { partidoId: "p35", fecha: "SÁB 20-06", hora: "07:00 PM", fechaHoraInicio: 1782000000000, equipoLocal: "ECUADOR", equipoVisitante: "CURAZAO", banderaLocal: "https://flagcdn.com/w160/ec.png", banderaVisitante: "https://flagcdn.com/w160/cw.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 35", grupoTorneo: "GRUPO E" },

  // DOM 21-JUN
  { partidoId: "p36", fecha: "SÁB 20-06", hora: "11:00 PM", fechaHoraInicio: 1781928000000, equipoLocal: "TÚNEZ", equipoVisitante: "JAPÓN", banderaLocal: "https://flagcdn.com/w160/tn.png", banderaVisitante: "https://flagcdn.com/w160/jp.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 36", grupoTorneo: "GRUPO F" },
  { partidoId: "p37", fecha: "DOM 21-06", hora: "11:00 AM", fechaHoraInicio: 1782057600000, equipoLocal: "ESPAÑA", equipoVisitante: "ARABIA SAUDITA", banderaLocal: "https://flagcdn.com/w160/es.png", banderaVisitante: "https://flagcdn.com/w160/sa.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 37", grupoTorneo: "GRUPO H" },
  { partidoId: "p38", fecha: "DOM 21-06", hora: "02:00 PM", fechaHoraInicio: 1782068400000, equipoLocal: "BÉLGICA", equipoVisitante: "IRÁN", banderaLocal: "https://flagcdn.com/w160/be.png", banderaVisitante: "https://flagcdn.com/w160/ir.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 38", grupoTorneo: "GRUPO G" },
  { partidoId: "p39", fecha: "DOM 21-06", hora: "05:00 PM", fechaHoraInicio: 1782079200000, equipoLocal: "URUGUAY", equipoVisitante: "CABO VERDE", banderaLocal: "https://flagcdn.com/w160/uy.png", banderaVisitante: "https://flagcdn.com/w160/cv.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 39", grupoTorneo: "GRUPO H" },
  { partidoId: "p40", fecha: "DOM 21-06", hora: "08:00 PM", fechaHoraInicio: 1782090000000, equipoLocal: "NUEVA ZELANDA", equipoVisitante: "EGIPTO", banderaLocal: "https://flagcdn.com/w160/nz.png", banderaVisitante: "https://flagcdn.com/w160/eg.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 40", grupoTorneo: "GRUPO G" },

  // LUN 22-JUN
  { partidoId: "p41", fecha: "LUN 22-06", hora: "12:00 PM", fechaHoraInicio: 1782147600000, equipoLocal: "ARGENTINA", equipoVisitante: "AUSTRIA", banderaLocal: "https://flagcdn.com/w160/ar.png", banderaVisitante: "https://flagcdn.com/w160/at.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 41", grupoTorneo: "GRUPO J" },
  { partidoId: "p42", fecha: "LUN 22-06", hora: "04:00 PM", fechaHoraInicio: 1782162000000, equipoLocal: "FRANCIA", equipoVisitante: "IRAK", banderaLocal: "https://flagcdn.com/w160/fr.png", banderaVisitante: "https://flagcdn.com/w160/iq.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 42", grupoTorneo: "GRUPO I" },
  { partidoId: "p43", fecha: "LUN 22-06", hora: "07:00 PM", fechaHoraInicio: 1782172800000, equipoLocal: "NORUEGA", equipoVisitante: "SENEGAL", banderaLocal: "https://flagcdn.com/w160/no.png", banderaVisitante: "https://flagcdn.com/w160/sn.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 43", grupoTorneo: "GRUPO I" },
  { partidoId: "p44", fecha: "LUN 22-06", hora: "10:00 PM", fechaHoraInicio: 1782183600000, equipoLocal: "JORDANIA", equipoVisitante: "ARGELIA", banderaLocal: "https://flagcdn.com/w160/jo.png", banderaVisitante: "https://flagcdn.com/w160/dz.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 44", grupoTorneo: "GRUPO J" },

  // MAR 23-JUN
  { partidoId: "p45", fecha: "MAR 23-06", hora: "12:00 PM", fechaHoraInicio: 1782234000000, equipoLocal: "PORTUGAL", equipoVisitante: "UZBEKISTÁN", banderaLocal: "https://flagcdn.com/w160/pt.png", banderaVisitante: "https://flagcdn.com/w160/uz.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 45", grupoTorneo: "GRUPO K" },
  { partidoId: "p46", fecha: "MAR 23-06", hora: "03:00 PM", fechaHoraInicio: 1782244800000, equipoLocal: "INGLATERRA", equipoVisitante: "GHANA", banderaLocal: "https://flagcdn.com/w160/gb-eng.png", banderaVisitante: "https://flagcdn.com/w160/gh.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 46", grupoTorneo: "GRUPO L" },
  { partidoId: "p47", fecha: "MAR 23-06", hora: "06:00 PM", fechaHoraInicio: 1782255600000, equipoLocal: "PANAMÁ", equipoVisitante: "CROACIA", banderaLocal: "https://flagcdn.com/w160/pa.png", banderaVisitante: "https://flagcdn.com/w160/hr.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 47", grupoTorneo: "GRUPO L" },
  { partidoId: "p48", fecha: "MAR 23-06", hora: "09:00 PM", fechaHoraInicio: 1782266400000, equipoLocal: "COLOMBIA", equipoVisitante: "RD CONGO", banderaLocal: "https://flagcdn.com/w160/co.png", banderaVisitante: "https://flagcdn.com/w160/cd.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 48", grupoTorneo: "GRUPO K" },

  // ──────────── JORNADA 3 (SIMULTÁNEOS) ────────────

  // MIE 24-JUN — GRUPO B y GRUPO C
  { partidoId: "p49", fecha: "MIE 24-06", hora: "02:00 PM", fechaHoraInicio: 1782327600000, equipoLocal: "SUIZA", equipoVisitante: "CANADÁ", banderaLocal: "https://flagcdn.com/w160/ch.png", banderaVisitante: "https://flagcdn.com/w160/ca.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 49", grupoTorneo: "GRUPO B" },
  { partidoId: "p50", fecha: "MIE 24-06", hora: "02:00 PM", fechaHoraInicio: 1782327600000, equipoLocal: "BOSNIA", equipoVisitante: "QATAR", banderaLocal: "https://flagcdn.com/w160/ba.png", banderaVisitante: "https://flagcdn.com/w160/qa.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 50", grupoTorneo: "GRUPO B" },
  { partidoId: "p51", fecha: "MIE 24-06", hora: "05:00 PM", fechaHoraInicio: 1782338400000, equipoLocal: "MARRUECOS", equipoVisitante: "HAITÍ", banderaLocal: "https://flagcdn.com/w160/ma.png", banderaVisitante: "https://flagcdn.com/w160/ht.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 51", grupoTorneo: "GRUPO C" },
  { partidoId: "p52", fecha: "MIE 24-06", hora: "05:00 PM", fechaHoraInicio: 1782338400000, equipoLocal: "ESCOCIA", equipoVisitante: "BRASIL", banderaLocal: "https://flagcdn.com/w160/gb-sct.png", banderaVisitante: "https://flagcdn.com/w160/br.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 52", grupoTorneo: "GRUPO C" },
  { partidoId: "p53", fecha: "MIE 24-06", hora: "08:00 PM", fechaHoraInicio: 1782349200000, equipoLocal: "SUDÁFRICA", equipoVisitante: "COREA DEL SUR", banderaLocal: "https://flagcdn.com/w160/za.png", banderaVisitante: "https://flagcdn.com/w160/kr.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 53", grupoTorneo: "GRUPO A" },
  { partidoId: "p54", fecha: "MIE 24-06", hora: "08:00 PM", fechaHoraInicio: 1782349200000, equipoLocal: "CHEQUIA", equipoVisitante: "MÉXICO", banderaLocal: "https://flagcdn.com/w160/cz.png", banderaVisitante: "https://flagcdn.com/w160/mx.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 54", grupoTorneo: "GRUPO A" },

  // JUE 25-JUN — GRUPO E y GRUPO F y GRUPO D
  { partidoId: "p55", fecha: "JUE 25-06", hora: "03:00 PM", fechaHoraInicio: 1782417600000, equipoLocal: "CURAZAO", equipoVisitante: "COSTA DE MARFIL", banderaLocal: "https://flagcdn.com/w160/cw.png", banderaVisitante: "https://flagcdn.com/w160/ci.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 55", grupoTorneo: "GRUPO E" },
  { partidoId: "p56", fecha: "JUE 25-06", hora: "03:00 PM", fechaHoraInicio: 1782417600000, equipoLocal: "ECUADOR", equipoVisitante: "ALEMANIA", banderaLocal: "https://flagcdn.com/w160/ec.png", banderaVisitante: "https://flagcdn.com/w160/de.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 56", grupoTorneo: "GRUPO E" },
  { partidoId: "p57", fecha: "JUE 25-06", hora: "06:00 PM", fechaHoraInicio: 1782428400000, equipoLocal: "TÚNEZ", equipoVisitante: "PAÍSES BAJOS", banderaLocal: "https://flagcdn.com/w160/tn.png", banderaVisitante: "https://flagcdn.com/w160/nl.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 57", grupoTorneo: "GRUPO F" },
  { partidoId: "p58", fecha: "JUE 25-06", hora: "06:00 PM", fechaHoraInicio: 1782428400000, equipoLocal: "JAPÓN", equipoVisitante: "SUECIA", banderaLocal: "https://flagcdn.com/w160/jp.png", banderaVisitante: "https://flagcdn.com/w160/se.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 58", grupoTorneo: "GRUPO F" },
  { partidoId: "p59", fecha: "JUE 25-06", hora: "09:00 PM", fechaHoraInicio: 1782439200000, equipoLocal: "TURQUÍA", equipoVisitante: "ESTADOS UNIDOS", banderaLocal: "https://flagcdn.com/w160/tr.png", banderaVisitante: "https://flagcdn.com/w160/us.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 59", grupoTorneo: "GRUPO D" },
  { partidoId: "p60", fecha: "JUE 25-06", hora: "09:00 PM", fechaHoraInicio: 1782439200000, equipoLocal: "PARAGUAY", equipoVisitante: "AUSTRALIA", banderaLocal: "https://flagcdn.com/w160/py.png", banderaVisitante: "https://flagcdn.com/w160/au.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 60", grupoTorneo: "GRUPO D" },

  // VIE 26-JUN — GRUPO I y GRUPO H y GRUPO G
  { partidoId: "p61", fecha: "VIE 26-06", hora: "02:00 PM", fechaHoraInicio: 1782500400000, equipoLocal: "NORUEGA", equipoVisitante: "FRANCIA", banderaLocal: "https://flagcdn.com/w160/no.png", banderaVisitante: "https://flagcdn.com/w160/fr.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 61", grupoTorneo: "GRUPO I" },
  { partidoId: "p62", fecha: "VIE 26-06", hora: "02:00 PM", fechaHoraInicio: 1782500400000, equipoLocal: "SENEGAL", equipoVisitante: "IRAK", banderaLocal: "https://flagcdn.com/w160/sn.png", banderaVisitante: "https://flagcdn.com/w160/iq.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 62", grupoTorneo: "GRUPO I" },
  { partidoId: "p63", fecha: "VIE 26-06", hora: "07:00 PM", fechaHoraInicio: 1782518400000, equipoLocal: "CABO VERDE", equipoVisitante: "ARABIA SAUDITA", banderaLocal: "https://flagcdn.com/w160/cv.png", banderaVisitante: "https://flagcdn.com/w160/sa.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 63", grupoTorneo: "GRUPO H" },
  { partidoId: "p64", fecha: "VIE 26-06", hora: "07:00 PM", fechaHoraInicio: 1782518400000, equipoLocal: "URUGUAY", equipoVisitante: "ESPAÑA", banderaLocal: "https://flagcdn.com/w160/uy.png", banderaVisitante: "https://flagcdn.com/w160/es.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 64", grupoTorneo: "GRUPO H" },
  { partidoId: "p65", fecha: "VIE 26-06", hora: "10:00 PM", fechaHoraInicio: 1782529200000, equipoLocal: "NUEVA ZELANDA", equipoVisitante: "BÉLGICA", banderaLocal: "https://flagcdn.com/w160/nz.png", banderaVisitante: "https://flagcdn.com/w160/be.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 65", grupoTorneo: "GRUPO G" },
  { partidoId: "p66", fecha: "VIE 26-06", hora: "10:00 PM", fechaHoraInicio: 1782529200000, equipoLocal: "EGIPTO", equipoVisitante: "IRÁN", banderaLocal: "https://flagcdn.com/w160/eg.png", banderaVisitante: "https://flagcdn.com/w160/ir.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 66", grupoTorneo: "GRUPO G" },

  // SÁB 27-JUN — GRUPO L, GRUPO K y GRUPO J
  { partidoId: "p67", fecha: "SÁB 27-06", hora: "04:00 PM", fechaHoraInicio: 1782594000000, equipoLocal: "PANAMÁ", equipoVisitante: "INGLATERRA", banderaLocal: "https://flagcdn.com/w160/pa.png", banderaVisitante: "https://flagcdn.com/w160/gb-eng.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 67", grupoTorneo: "GRUPO L" },
  { partidoId: "p68", fecha: "SÁB 27-06", hora: "04:00 PM", fechaHoraInicio: 1782594000000, equipoLocal: "CROACIA", equipoVisitante: "GHANA", banderaLocal: "https://flagcdn.com/w160/hr.png", banderaVisitante: "https://flagcdn.com/w160/gh.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 68", grupoTorneo: "GRUPO L" },
  { partidoId: "p69", fecha: "SÁB 27-06", hora: "06:30 PM", fechaHoraInicio: 1782603000000, equipoLocal: "COLOMBIA", equipoVisitante: "PORTUGAL", banderaLocal: "https://flagcdn.com/w160/co.png", banderaVisitante: "https://flagcdn.com/w160/pt.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Hard Rock Stadium", grupoTorneo: "GRUPO K" },
  { partidoId: "p70", fecha: "SÁB 27-06", hora: "06:30 PM", fechaHoraInicio: 1782603000000, equipoLocal: "RD CONGO", equipoVisitante: "UZBEKISTÁN", banderaLocal: "https://flagcdn.com/w160/cd.png", banderaVisitante: "https://flagcdn.com/w160/uz.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 70", grupoTorneo: "GRUPO K" },
  { partidoId: "p71", fecha: "SÁB 27-06", hora: "09:00 PM", fechaHoraInicio: 1782612000000, equipoLocal: "ARGELIA", equipoVisitante: "AUSTRIA", banderaLocal: "https://flagcdn.com/w160/dz.png", banderaVisitante: "https://flagcdn.com/w160/at.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 71", grupoTorneo: "GRUPO J" },
  { partidoId: "p72", fecha: "SÁB 27-06", hora: "09:00 PM", fechaHoraInicio: 1782612000000, equipoLocal: "JORDANIA", equipoVisitante: "ARGENTINA", banderaLocal: "https://flagcdn.com/w160/jo.png", banderaVisitante: "https://flagcdn.com/w160/ar.png", fase: "primera", golesLocal: null, golesVisitante: null, estado: "pendiente", estadio: "Estadio 72", grupoTorneo: "GRUPO J" }
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

/** Hora límite para enviar apuesta (10:00 PM Bogotá en p24 por falla de la app). */
export function getCierreApuestas(partido: { partidoId: string; fechaHoraInicio: number; apuestaAbiertaHasta?: number }): number {
  return partido.apuestaAbiertaHasta ?? partido.fechaHoraInicio;
}

export function apuestasAbiertas(partido: { estado: string; fechaHoraInicio: number; apuestaAbiertaHasta?: number; partidoId: string }): boolean {
  if (partido.estado === 'finalizado') return false;
  return Date.now() < getCierreApuestas(partido);
}

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
