import * as XLSX from 'xlsx';

export function exportToExcelFile(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportToCSVFile(data: Record<string, unknown>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
