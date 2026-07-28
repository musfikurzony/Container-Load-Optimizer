import { useState } from 'react';
import { FileDown, FileSpreadsheet, Image as ImageIcon, Printer } from 'lucide-react';
import type { CalculationResult } from '../types';

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
  result: CalculationResult;
}

export function ExportBar({ targetRef, result }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  const exportPng = async () => {
    if (!targetRef.current) return;
    setBusy('png');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(targetRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `sclo-${result.container.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = async () => {
    if (!targetRef.current) return;
    setBusy('pdf');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(targetRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(imgData, 'PNG', (pageWidth - w) / 2, (pageHeight - h) / 2, w, h);
      pdf.save(`sclo-${result.container.id}-${Date.now()}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  const exportExcel = async () => {
    setBusy('xlsx');
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const summary = [
        ['Container', result.container.label],
        ['Carton (cm)', `${result.carton.lengthCm} x ${result.carton.widthCm} x ${result.carton.heightCm}`],
        ['Carton CBM (m3)', result.cartonCbm],
        ['Best Orientation', result.bestOrientation.label],
        ['Single Orientation Cartons', result.bestOrientation.totalCartons],
        ['Mixed Orientation Cartons', result.mixed.finalCartons],
        ['CBM Estimate Cartons', result.cbmMethod.maxTheoreticalCartons],
        ['Total Pieces', result.totalPieces],
        ['Efficiency %', result.mixed.efficiencyPct],
        ['Used CBM (m3)', result.mixed.usedCbm],
        ['Unused CBM (m3)', result.mixed.unusedCbm],
        ['Total Weight (kg)', result.weight.totalWeightKg],
        ['Remaining Payload (kg)', result.weight.remainingCapacityKg],
      ];
      wb.SheetNames.push('Summary');
      wb.Sheets['Summary'] = XLSX.utils.aoa_to_sheet(summary);

      const orientationRows = [
        ['Orientation', 'L Fit', 'W Fit', 'H Fit', 'Cartons', 'Used CBM', 'Efficiency %'],
        ...result.orientations.map((o) => [o.label, o.fitLength, o.fitWidth, o.fitHeight, o.totalCartons, o.usedCbm, o.efficiencyPct]),
      ];
      wb.SheetNames.push('Orientations');
      wb.Sheets['Orientations'] = XLSX.utils.aoa_to_sheet(orientationRows);

      XLSX.writeFile(wb, `sclo-${result.container.id}-${Date.now()}.xlsx`);
    } finally {
      setBusy(null);
    }
  };

  const btn = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-soft-light dark:border-border-soft bg-surface-light dark:bg-surface text-text-muted-light dark:text-text-muted hover:text-accent hover:border-accent transition-colors disabled:opacity-50';

  return (
    <div className="flex items-center gap-2">
      <button className={btn} onClick={exportPdf} disabled={busy !== null}>
        <FileDown className="w-3.5 h-3.5" /> {busy === 'pdf' ? 'Exporting…' : 'PDF'}
      </button>
      <button className={btn} onClick={exportExcel} disabled={busy !== null}>
        <FileSpreadsheet className="w-3.5 h-3.5" /> {busy === 'xlsx' ? 'Exporting…' : 'Excel'}
      </button>
      <button className={btn} onClick={exportPng} disabled={busy !== null}>
        <ImageIcon className="w-3.5 h-3.5" /> {busy === 'png' ? 'Exporting…' : 'PNG'}
      </button>
      <button className={btn} onClick={() => window.print()}>
        <Printer className="w-3.5 h-3.5" /> Print
      </button>
    </div>
  );
}
