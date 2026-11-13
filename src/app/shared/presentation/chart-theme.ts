import { ChartOptions } from 'chart.js';

export const CHART_COLORS = {
  navy: '#0E1A2B',
  orange: '#D4781C',
  blue: '#1D4F91',
  grey: '#7A8699',
  ok: '#1F8A4C',
  okBg: 'rgba(31, 138, 76, 0.12)',
  warn: '#D4781C',
  warnBg: 'rgba(212, 120, 28, 0.14)',
  fault: '#C0392B',
  faultBg: 'rgba(192, 57, 43, 0.14)',
  series: ['#0E1A2B', '#D4781C', '#1D4F91', '#7A8699', '#1F8A4C', '#8E44AD'],
};

export const BASE_CHART_OPTIONS: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      labels: {
        font: { family: 'Poppins' },
        color: '#0E1A2B',
        boxWidth: 12,
      },
    },
    tooltip: {
      titleFont: { family: 'Poppins' },
      bodyFont: { family: 'Poppins' },
    },
  },
  scales: {
    x: {
      ticks: {
        font: { family: 'Poppins', size: 11 },
        color: '#5B6878',
      },
      grid: { display: false },
    },
    y: {
      ticks: {
        font: { family: 'Poppins', size: 11 },
        color: '#5B6878',
      },
      grid: { color: '#EEF0F4' },
    },
  },
};
