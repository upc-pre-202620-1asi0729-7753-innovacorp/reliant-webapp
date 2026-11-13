import {inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import {Chart} from 'chart.js/auto';
import {ReportTemplate, ReportWidget} from '../domain/model/report-template.entity';
import {ReportContext, ReportDataService, TableData, TrendData} from './report-data.service';
import {ProcessReading} from '../../process-monitoring/domain/model/process-reading.entity';
import {FaultCase} from '../../fault-diagnosis/domain/model/fault-case.entity';
import {RecipeParameter} from '../../equipment/domain/model/recipe.entity';
import {CHART_COLORS} from '../../shared/presentation/chart-theme';

type Rgb = [number, number, number];

const MARGIN = 14;

function rgb(hex: string): Rgb {
  const v = hex.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

/** Draws a trend with the recipe bands on an offscreen canvas and returns it as a PNG data URL. */
function trendImage(data: TrendData, label: string, accent: Rgb): string | null {
  const rows = data.rows;
  const parameter: RecipeParameter | undefined = data.parameter;
  if (!rows.length) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1400; canvas.height = 450;
  const labels = rows.map(r => new Date(r.epochMillis).toLocaleTimeString('es-PE'));
  const line = (value: number, color: string, dash: number[]) => ({label: '', data: rows.map(() => value), borderColor: color, borderDash: dash, borderWidth: 1.2, pointRadius: 0, fill: false});
  const datasets: object[] = [{label, data: rows.map(r => Number(r.value)), borderColor: `rgb(${accent.join(',')})`, backgroundColor: `rgba(${accent.join(',')},.15)`, borderWidth: 2, pointRadius: 0, fill: true, tension: .25}];
  if (parameter) {
    datasets.push(line(parameter.upperShutdown, CHART_COLORS.fault, [6, 4]), line(parameter.lowerShutdown, CHART_COLORS.fault, [6, 4]),
      line(parameter.upperWarning, CHART_COLORS.warn, [4, 4]), line(parameter.lowerWarning, CHART_COLORS.warn, [4, 4]),
      line(parameter.setpoint, CHART_COLORS.grey, [2, 3]));
  }
  const chart = new Chart(canvas.getContext('2d')!, {
    type: 'line', data: {labels, datasets: datasets as never},
    options: {animation: false, responsive: false, devicePixelRatio: 1, plugins: {legend: {display: false}},
      scales: {x: {ticks: {maxTicksLimit: 10, font: {size: 18}}, grid: {display: false}}, y: {ticks: {font: {size: 18}}}}}
  });
  const image = chart.toBase64Image('image/png', 1);
  chart.destroy();
  return image;
}

/**
 * Renders a report template over a report context into a PDF with jsPDF.
 * Layout: brand header band, title, subject line, sections with a two-column widget grid, optional signature block
 * and a footer with the template text and the page number.
 */
@Injectable({providedIn: 'root'})
export class ReportPdfService {
  readonly #data = inject(ReportDataService);
  readonly #translate = inject(TranslateService);

  render(template: ReportTemplate, context: ReportContext): {doc: jsPDF; fileName: string} {
    const t = (key: string, fallback?: string) => {
      const v = this.#translate.instant(key) as string;
      return v === key && fallback !== undefined ? fallback : v;
    };
    const doc = new jsPDF({orientation: template.orientation === 'landscape' ? 'landscape' : 'portrait', unit: 'mm', format: template.pageSize === 'letter' ? 'letter' : 'a4'});
    const page = {width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight()};
    const m = MARGIN;
    const primary = rgb(template.primaryColor);
    const secondary = rgb(template.secondaryColor);
    const contentWidth = page.width - 2 * m;
    const bottomLimit = page.height - 18;
    let y = 0;

    const ensure = (height: number) => { if (y + height > bottomLimit) { doc.addPage(); y = m; } };
    const sectionTitle = (title: string) => {
      ensure(14);
      doc.setFillColor(...secondary); doc.rect(m, y, 2, 7, 'F');
      doc.setTextColor(...primary); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text(title, m + 5, y + 5.5);
      y += 11;
    };
    const valueBox = (x: number, width: number, label: string, value: string) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 120, 135);
      doc.text(label.toUpperCase(), x, y + 4);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(String(value), width - 2) as string[];
      doc.text(lines, x, y + 10);
      return 12 + (lines.length - 1) * 5;
    };

    // Header band
    doc.setFillColor(...primary); doc.rect(0, 0, page.width, 22, 'F');
    doc.setFillColor(...secondary); doc.rect(0, 22, page.width, 1.5, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text(template.headerText || template.name, m, 10);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(t('reports.kind.' + template.reportKind), m, 17);
    doc.text(`Reliant · ${new Date().toLocaleString('es-PE', {dateStyle: 'medium', timeStyle: 'short'})}`, page.width - m, 17, {align: 'right'});
    y = 32;

    // Title and subject line
    doc.setTextColor(...primary); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text(template.name, m, y); y += 7;
    doc.setTextColor(90, 100, 115); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    const subject = [`${t('reports.subject.spray_session')} #${context.session.id}`, context.system?.code, context.recuperation?.workOrderNumber, context.customer?.legalName]
      .filter(Boolean).join('  ·  ');
    doc.text(subject, m, y); y += 9;

    for (const section of template.orderedSections) {
      sectionTitle(section.title);
      let column = 0;
      let rowHeight = 0;
      for (const widget of section.widgets) {
        const resolved = this.#data.resolve(widget, context);
        const label = widget.variableLabel || widget.variableCode;
        const isFull = widget.width === 'full' || widget.viewType === 'trend' || widget.viewType === 'table';
        if (isFull && column === 1) { y += rowHeight; column = 0; rowHeight = 0; }

        if (typeof resolved === 'object' && resolved.kind === 'trend') {
          const image = trendImage(resolved, label, secondary);
          const height = contentWidth * 0.32;
          ensure(height + 8);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
          doc.text(label, m, y + 4);
          if (image) doc.addImage(image, 'PNG', m, y + 6, contentWidth, height);
          else { doc.setFont('helvetica', 'normal'); doc.text(t('reports.empty-table'), m, y + 12); }
          y += height + 10;
          continue;
        }
        if (typeof resolved === 'object' && resolved.kind === 'table') {
          ensure(20);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
          doc.text(label, m, y + 4);
          const {head, body} = this.#tableOf(widget, resolved, t);
          autoTable(doc, {
            startY: y + 6, margin: {left: m, right: m}, head: [head], body: body.length ? body : [[t('reports.empty-table')]],
            styles: {fontSize: 8, cellPadding: 1.6}, headStyles: {fillColor: primary, textColor: 255}, alternateRowStyles: {fillColor: [246, 247, 250]}
          });
          y = (doc as jsPDF & {lastAutoTable: {finalY: number}}).lastAutoTable.finalY + 6;
          continue;
        }

        const width = isFull ? contentWidth : (contentWidth - 6) / 2;
        const x = m + column * ((contentWidth - 6) / 2 + 6);
        ensure(16);
        const h = valueBox(x, width, label, typeof resolved === 'string' ? resolved : '–');
        rowHeight = Math.max(rowHeight, h + 3);
        if (isFull || column === 1) { y += rowHeight; column = 0; rowHeight = 0; }
        else column = 1;
      }
      if (column === 1) y += rowHeight;
      y += 4;
    }

    if (template.showSignatureBlock) {
      ensure(30);
      y += 10;
      const half = (contentWidth - 10) / 2;
      doc.setDrawColor(150, 150, 150);
      doc.line(m, y + 12, m + half, y + 12); doc.line(m + half + 10, y + 12, m + contentWidth, y + 12);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(90, 100, 115);
      doc.text(t('reports.signature.quality'), m, y + 17);
      doc.text(t('reports.signature.supervisor'), m + half + 10, y + 17);
      doc.text(context.operatorName, m, y + 21);
    }

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...secondary); doc.line(m, page.height - 12, page.width - m, page.height - 12);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
      doc.text(template.footerText || 'Reliant', m, page.height - 7);
      doc.text(`${i} / ${pages}`, page.width - m, page.height - 7, {align: 'right'});
    }

    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    return {doc, fileName: `${template.reportKind}-session-${context.session.id}-${stamp}.pdf`};
  }

  #tableOf(widget: ReportWidget, data: TableData, t: (k: string, f?: string) => string): {head: string[]; body: string[][]} {
    const time = (ms: number) => new Date(ms).toLocaleTimeString('es-PE');
    const number = (v: number) => Number(v).toLocaleString('es-PE', {maximumFractionDigits: 1});
    if (widget.variableSource === 'fault_cases') {
      const rows = data.rows as FaultCase[];
      return {
        head: [t('fault-cases.detected-at'), t('fault-cases.parameter'), t('fault-cases.band'), t('fault-cases.value'), t('fault-cases.recommended-action'), t('fault-cases.status')],
        body: rows.map(c => [time(c.epochMillis), t('parameter.' + c.parameter, c.parameter), t('fault-cases.band-option.' + c.band), number(c.value), c.recommendedAction, t('fault-cases.status-option.' + c.status)])
      };
    }
    const rows = data.rows as ProcessReading[];
    return {
      head: [t('analysis.time'), t('analysis.parameter'), t('fault-cases.band'), t('fault-cases.value'), t('analysis.unit')],
      body: rows.map(r => [time(r.epochMillis), t('parameter.' + r.parameter, r.parameter), t('session-detail.band.' + r.band), number(r.value), r.unitSymbol])
    };
  }
}
