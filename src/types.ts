/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Grupo {
  codigoGrupo: string;
  gruposPermitidos?: string[];
  nombre: string;
  activo: boolean;
  creadoPor: string;
}

export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  foto: string;
  whatsapp: string;
  codigoGrupo: string;
  puntosTotal: number;\n  puntosPorGrupo?: Record<string, number>;
  createdAt: string;
  esAdmin?: boolean;
}

export interface Partido {
  partidoId: string;\n  codigoGrupo?: string;
  fecha: string;      // Formato legible "JUE 11-06", "VIE 12-06", etc.
  hora: string;       // "10:00 AM", "03:00 PM"
  fechaHoraInicio: number; // Timestamp en ms (Date.now())
  equipoLocal: string;
  equipoVisitante: string;
  banderaLocal: string;      // URL de la bandera
  banderaVisitante: string;  // URL de la bandera
  fase: "primera" | "segunda";
  golesLocal: number | null;     // null hasta que se simule o juegue
  golesVisitante: number | null; // null hasta que se simule o juegue
  estado: "pendiente" | "en_vivo" | "finalizado";
  estadio: string;
  grupoTorneo: string; // "GRUPO A", "GRUPO B", etc.
}

export interface ApuestaPuntosDesglose {
  marcador: number;
  ganador: number;
  empate: number;
  totalGoles: number;
  total: number;
}

export interface Apuesta {
  id: string; // `${uid}_${partidoId}`
  uid: string;
  partidoId: string;
  golesLocalApuesta: number;
  golesVisitanteApuesta: number;
  equipoGanadorApuesta: string; // "local" | "visitante" | "empate" de la predicción
  empateApuesta?: boolean;
  totalGolesApuesta?: "mas25" | "menos25" | null;
  puntosObtenidos: number | ApuestaPuntosDesglose;
  bloqueada: boolean;
}

export interface BonificacionesEspeciales {
  uid: string;
  campeon: string;
  goleador: string; // Para goleador permitiremos texto libre porque es un jugador
  vallaInvicta: string; // Equipo
  fairPlay: string; // Equipo
  revelacion: string; // Equipo
  puntosObtenidos: number;
}

export interface RankedUser {
  uid: string;
  nombre: string;
  foto: string;
  puntosTotal: number;
  isMe: boolean;
  tendencia: "subiendo" | "bajando" | "estable";
  posicion: number;
}
