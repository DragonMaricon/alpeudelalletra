import crypto from 'crypto';

// valiente mierda de código pero funciona así que me la pela

// Lista pequeña de palabras sencillas (sin acentos ni caracteres especiales)
const PARAULES = [
	"aire", "alt", "amic", "ample", "animal", "any", "arbre", "banc",
	"blau", "bosc", "camp", "casa", "cau", "cert", "data", "dau",
	"dits", "eina", "fada", "festa", "fila", "flor", "foc", "fons",
	"font", "fusta", "gall", "gat", "gel", "gran", "herba", "illa",
	"joc", "llac", "llop", "llum", "marbre", "mare", "mel", "menta",
	"mina", "mon", "nau", "neu", "nit", "nord", "oli", "pare",
	"pota", "punt", "radi", "roca", "roda", "rosa", "ruta", "sac",
	"salt", "sol", "terra", "torre", "vall", "vent", "verd", "vida"
];

function getAcademicPeriod(date = new Date()) {
	const month = date.getMonth() + 1; // 1-12
	const year = date.getFullYear();

	// Margen/Trimestre
	if (month >= 9 && month <= 12) return `${year}-T1`;
	if (month >= 1 && month <= 3) return `${year}-T2`;
	if (month >= 4 && month <= 6) return `${year}-T3`;
	return `${year}-ESTIU`;
}

function getPeriodStart(date) {
	const m = date.getMonth() + 1;
	const startMonth = m >= 9 ? 8 : m >= 7 ? 6 : m >= 4 ? 3 : 0; // 0-indexed
	return new Date(date.getFullYear(), startMonth, 1);
}

export function generateQuarterCode(date = new Date()) {
	const secret = process.env.ADMIN_SECRET_KEY || 'quiere toto de loca';
	const period = getAcademicPeriod(date);

	// HMAC-SHA256 de la semilla + periodo
	const hmac = crypto.createHmac('sha256', secret).update(period).digest('hex');

	// Convertimos partes del hash en índices para el array de palabras
	const num1 = parseInt(hmac.substring(0, 4), 16);
	const num2 = parseInt(hmac.substring(4, 8), 16);
	const num3 = parseInt(hmac.substring(8, 12), 16);

	const w1 = PARAULES[num1 % PARAULES.length];
	const w2 = PARAULES[num2 % PARAULES.length];
	const w3 = PARAULES[num3 % PARAULES.length];

	return `${w1}-${w2}-${w3}`;
}

export function validateAccessCode(userInput, now = new Date()) {
	const cleanInput = String(userInput).trim().toLowerCase().replace(/[\s_]+/g, '-');
	if (cleanInput === generateQuarterCode(now)) return true;

	const start = getPeriodStart(now);
	const daysIn = (now - start) / 86400000;
	if (daysIn > 14) return false; // grace window: first 14 days only

	// Day 0 of the start month = last day of the previous period
	const previous = new Date(start.getFullYear(), start.getMonth(), 0);
	return cleanInput === generateQuarterCode(previous);
}
