/**
 * BSofts School — Universal Client-Side Export & Template Utilities
 * Generates UTF-8 CSV, Excel (.xls), Printable PDF views, and empty Import CSV templates.
 */

export interface ExportColumn<T = Record<string, unknown>> {
  header: string;
  key: string;
  render?: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Export data to UTF-8 CSV with Excel BOM
 */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
): void {
  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(';');
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        let val: unknown = col.render ? col.render(row) : row[col.key];
        if (val === null || val === undefined) val = '';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(';')
  );

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Export data to Excel-compatible tabular sheet (.xls)
 */
export function exportToExcel<T extends Record<string, unknown>>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[],
  sheetTitle: string = 'Export'
): void {
  const tableHeaders = columns.map((c) => `<th style="background-color:#1E293B;color:#FFFFFF;padding:8px;border:1px solid #CBD5E1;">${c.header}</th>`).join('');
  const tableRows = data
    .map(
      (row) =>
        '<tr>' +
        columns
          .map((c) => {
            let val: unknown = c.render ? c.render(row) : row[c.key];
            if (val === null || val === undefined) val = '';
            return `<td style="padding:6px 8px;border:1px solid #E2E8F0;">${String(val)}</td>`;
          })
          .join('') +
        '</tr>'
    )
    .join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${sheetTitle}</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;">
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  downloadBlob(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`);
}

/**
 * Open formatted printable document view
 */
export function printFormattedTable<T extends Record<string, unknown>>(
  title: string,
  columns: ExportColumn<T>[],
  data: T[]
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const headers = columns.map((c) => `<th>${c.header}</th>`).join('');
  const rows = data
    .map(
      (row) =>
        '<tr>' +
        columns
          .map((c) => {
            let val: unknown = c.render ? c.render(row) : row[c.key];
            if (val === null || val === undefined) val = '';
            return `<td>${String(val)}</td>`;
          })
          .join('') +
        '</tr>'
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - BSofts School</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 20px; font-weight: bold; }
          .date { font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th { background-color: #f1f5f9; text-align: left; padding: 8px 12px; border-bottom: 1px solid #cbd5e1; font-weight: 600; text-transform: uppercase; font-size: 11px; }
          td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${title}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">BSofts School Platform</div>
          </div>
          <div class="date">Édité le ${new Date().toLocaleDateString('fr-TN')} à ${new Date().toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">Document généré automatiquement par BSofts School • Page 1/1</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generate and download an empty sample CSV template with exact required headers
 */
export function downloadSampleCsvTemplate(
  filename: string,
  headers: string[],
  sampleRow?: string[]
): void {
  const headerLine = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';');
  const sampleLine = sampleRow ? '\r\n' + sampleRow.map((s) => `"${s.replace(/"/g, '""')}"`).join(';') : '';
  const content = '\uFEFF' + headerLine + sampleLine;

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}_template.csv`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
