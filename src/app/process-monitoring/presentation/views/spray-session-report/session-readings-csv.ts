import type { ProcessReading } from '../../../domain/model/process-reading.entity';

function csvText(value: string): string {
  const escaped = /^[\s]*[=+\-@]|^[\t\r\n]/.test(value) ? `'${value}` : value;

  return `"${escaped.replace(/"/g, '""')}"`;
}

export function downloadSessionReadingsCsv(
  sessionId: number,
  readings: readonly ProcessReading[],
): void {
  if (readings.length === 0) return;

  const rows = [
    'timestamp_utc,parameter,value,unit,band',
    ...readings.map((reading) => {
      const timestamp = reading.timestamp;
      const date = Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : '';

      return [
        csvText(date),
        csvText(reading.parameter),
        Number.isFinite(reading.value) ? String(reading.value) : '',
        csvText(reading.unitSymbol),
        csvText(reading.band),
      ].join(',');
    }),
  ];

  const blob = new Blob(['\uFEFF', rows.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `reliant-session-${sessionId}.csv`;
  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
