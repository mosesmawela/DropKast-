/**
 * ISRC and UPC code generation.
 *
 * ISRC = International Standard Recording Code, format: CC-XXX-YY-NNNNN
 *   CC    = ISO country code (e.g. "US")
 *   XXX   = registrant code (assigned by the IFPI national agency — RIAA in US)
 *   YY    = last two digits of the year of recording
 *   NNNNN = sequential 5-digit designation
 *
 * UPC-A = 12-digit barcode with GS1-issued prefix + sequence + check digit.
 *
 * For real production use you must purchase an ISRC registrant code block
 * from the RIAA (or your country's equivalent) and a GS1 UPC company prefix.
 * Until those are configured, we generate codes that follow the FORMAT
 * but use a placeholder registrant — they are NOT distributable.
 *
 * Override placeholder values in production by setting:
 *   ISRC_COUNTRY_CODE   (default "US")
 *   ISRC_REGISTRANT     (default "DKT" — placeholder)
 *   UPC_COMPANY_PREFIX  (default "0000000" — placeholder, won't validate at retail)
 */

const ISRC_COUNTRY = (process.env.ISRC_COUNTRY_CODE || 'US').toUpperCase();
const ISRC_REGISTRANT = (process.env.ISRC_REGISTRANT || 'DKT').toUpperCase();
const UPC_PREFIX = process.env.UPC_COMPANY_PREFIX || '0000000';

let isrcCounter = Math.floor(Math.random() * 10000);
let upcCounter = Math.floor(Math.random() * 10000);

export function generateIsrc(year = new Date().getUTCFullYear()): string {
  const yy = String(year).slice(-2);
  isrcCounter = (isrcCounter + 1) % 100000;
  const seq = String(isrcCounter).padStart(5, '0');
  return `${ISRC_COUNTRY}-${ISRC_REGISTRANT}-${yy}-${seq}`;
}

/**
 * Generates a 12-digit UPC-A. Uses an 11-digit body (prefix + seq) plus the
 * GS1 mod-10 check digit so the barcode itself is valid even if the company
 * prefix is a placeholder.
 */
export function generateUpc(): string {
  const prefix = UPC_PREFIX.replace(/\D/g, '').slice(0, 7).padEnd(7, '0');
  upcCounter = (upcCounter + 1) % 10000;
  const seq = String(upcCounter).padStart(4, '0');
  const body = (prefix + seq).slice(0, 11).padStart(11, '0');
  return body + upcCheckDigit(body);
}

function upcCheckDigit(body11: string): string {
  let oddSum = 0;
  let evenSum = 0;
  for (let i = 0; i < 11; i++) {
    const d = Number(body11[i]);
    if (i % 2 === 0) oddSum += d;
    else evenSum += d;
  }
  const total = oddSum * 3 + evenSum;
  const check = (10 - (total % 10)) % 10;
  return String(check);
}

export function isPlaceholderRegistrant(): boolean {
  return ISRC_REGISTRANT === 'DKT' || UPC_PREFIX === '0000000';
}
