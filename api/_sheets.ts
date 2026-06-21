/**
 * XLSX document generation — powers scheduling forms, earnings exports,
 * and royalty reports. Uses exceljs for robust spreadsheet creation.
 *
 * Every function returns a Node Buffer suitable for email attachment
 * or HTTP download.
 */
import ExcelJS from 'exceljs';

const BRAND = { primary: 'FF4D00', dark: '1A1A1A', light: 'F5F0E5', text: 'F0F0F0', muted: '888888' };

function styleHeader(ws: ExcelJS.Worksheet, rows: number) {
  for (let r = 1; r <= rows; r++) {
    const cell = ws.getRow(r).getCell(1);
    cell.font = { bold: true, color: { argb: BRAND.primary }, size: 10, name: 'Inter' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.dark } };
  }
}

// ── Release Scheduling Form ────────────────────────────────────────────────

export async function generateScheduleSheet(data: Record<string, unknown>): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DROPKAST';
  wb.created = new Date();

  const ws = wb.addWorksheet('Scheduling Form', {
    properties: { defaultRowHeight: 18 },
  });

  ws.columns = [
    { width: 36 }, { width: 26 }, { width: 26 }, { width: 26 }, { width: 26 },
    { width: 46 }, { width: 30 }, { width: 26 }, { width: 26 }, { width: 20 },
  ];

  const s = (k: string) => (data[k] as string) ?? '';

  ws.mergeCells('A1:J1');
  const title = ws.getCell('A1');
  title.value = `DROPKAST Scheduling Form — ${s('artistName') || s('projectName') || 'New Release'}`;
  title.font = { bold: true, size: 14, color: { argb: BRAND.primary }, name: 'Inter' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.dark } };

  let row = 3;
  const put = (label: string, value: string) => {
    ws.getCell(`A${row}`).value = label;
    ws.getCell(`A${row}`).font = { bold: true, color: { argb: BRAND.muted }, size: 10, name: 'Inter' };
    ws.getCell(`B${row}`).value = value;
    ws.getCell(`B${row}`).font = { color: { argb: BRAND.text }, size: 10, name: 'Inter' };
    row++;
  };

  put('Artist', s('artistName'));
  put('Project', s('projectName'));
  put('Track', s('trackName'));
  put('Release Date', s('releaseDate'));
  put('Contact Email', s('contactEmail'));
  put('UPC', s('upc'));
  put('ISRC', s('isrc'));
  put('Genre', s('genre'));
  put('Product Type', s('productType'));
  put('Explicit', s('explicit'));
  put('Label', s('label'));
  put('Catalogue Number', s('catalogueNumber'));

  row++;
  ws.getCell(`A${row}`).value = 'Marketing Links';
  ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: BRAND.primary }, name: 'Inter' };
  row++;

  const links: [string, string][] = [
    ['Final Master', s('finalMasterLink')],
    ['Artwork', s('artworkLink')],
    ['Spotify', s('spotifyLink')],
    ['Apple Music', s('appleLink')],
    ['Pre-Save', s('preSaveLink')],
    ['Press Photo', s('pressPhotoLink')],
    ['Campaign Plan', s('campaignPlanLink')],
  ];
  for (const [label, value] of links) {
    if (value) put(label, value);
  }

  return wb.xlsx.writeBuffer() as Promise<Buffer>;
}

// ── Earnings Report ────────────────────────────────────────────────────────

export async function generateEarningsReport(
  rows: Array<{ releaseTitle: string; platform: string; period: string; plays: number; revenueCents: number; payee: string }>,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DROPKAST';
  wb.created = new Date();

  const ws = wb.addWorksheet('Earnings', { properties: { defaultRowHeight: 16 } });
  ws.columns = [
    { width: 32 }, { width: 20 }, { width: 16 }, { width: 12 }, { width: 14 }, { width: 24 },
  ];

  const headers = ['Release', 'Platform', 'Period', 'Plays', 'Revenue', 'Payee'];
  ws.addRow(headers).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10, name: 'Inter' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primary } };
  });

  for (const r of rows) {
    ws.addRow([r.releaseTitle, r.platform, r.period, r.plays, (r.revenueCents / 100).toFixed(2), r.payee]);
  }

  ws.addRow([]);
  const total = rows.reduce((s, r) => s + r.revenueCents, 0);
  const totalRow = ws.addRow(['', '', '', '', 'TOTAL', (total / 100).toFixed(2)]);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: BRAND.primary } };
  });

  return wb.xlsx.writeBuffer() as Promise<Buffer>;
}

// ── Royalty Ledger Export ──────────────────────────────────────────────────

export async function generateRoyaltyLedger(
  entries: Array<{ releaseId: string; releaseTitle: string; payeeEmail: string; payeeName: string; percentage: number; amountCents: number; period: string }>,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DROPKAST';
  wb.created = new Date();

  const ws = wb.addWorksheet('Royalty Ledger', { properties: { defaultRowHeight: 16 } });
  ws.columns = [
    { width: 28 }, { width: 28 }, { width: 22 }, { width: 14 }, { width: 14 }, { width: 14 },
  ];

  const headers = ['Release', 'Payee', 'Email', 'Split %', 'Amount', 'Period'];
  ws.addRow(headers).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10, name: 'Inter' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.primary } };
  });

  for (const e of entries) {
    ws.addRow([e.releaseTitle, e.payeeName, e.payeeEmail, `${e.percentage}%`, (e.amountCents / 100).toFixed(2), e.period]);
  }

  return wb.xlsx.writeBuffer() as Promise<Buffer>;
}
