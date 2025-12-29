import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename: string;
  sheetName?: string;
}

export function exportToExcel(data: any[], columns: { key: string; header: string }[], options: ExportOptions): Buffer {
  // Map data to include only the columns we want
  const mappedData = data.map((row) => {
    const mappedRow: any = {};
    columns.forEach((col) => {
      mappedRow[col.header] = row[col.key] ?? '';
    });
    return mappedRow;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

export function exportToCSV(data: any[], columns: { key: string; header: string }[]): string {
  // Map data to include only the columns we want
  const mappedData = data.map((row) => {
    const mappedRow: any = {};
    columns.forEach((col) => {
      mappedRow[col.header] = row[col.key] ?? '';
    });
    return mappedRow;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  
  // Convert to CSV
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return csv;
}

