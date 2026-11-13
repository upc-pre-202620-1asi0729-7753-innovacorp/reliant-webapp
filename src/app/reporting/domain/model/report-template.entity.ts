import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type ReportKind = 'quality_certificate' | 'session_report' | 'fault_summary';
export type PageSize = 'a4' | 'letter';
export type PageOrientation = 'portrait' | 'landscape';
export type TemplateStatus = 'active' | 'archived';
export type VariableSource = 'process' | 'session' | 'recuperation' | 'fault_cases';
export type WidgetViewType = 'value' | 'min_max' | 'trend' | 'table' | 'text';
export type Aggregation = 'avg' | 'min' | 'max' | 'range' | 'last' | 'count';
export type WidgetWidth = 'half' | 'full';

export const REPORT_KINDS: ReportKind[] = ['quality_certificate', 'session_report', 'fault_summary'];
export const PAGE_SIZES: PageSize[] = ['a4', 'letter'];
export const ORIENTATIONS: PageOrientation[] = ['portrait', 'landscape'];
export const VARIABLE_SOURCES: VariableSource[] = ['process', 'session', 'recuperation', 'fault_cases'];
export const AGGREGATIONS: Aggregation[] = ['avg', 'min', 'max', 'range', 'last', 'count'];
export const WIDGET_WIDTHS: WidgetWidth[] = ['half', 'full'];

/** Variables each non-process source can show; process variables are the recipe parameters. */
export const SOURCE_VARIABLES: Record<Exclude<VariableSource, 'process'>, string[]> = {
  session: ['system', 'recipe', 'operator', 'started_at', 'ended_at', 'duration', 'status', 'readings', 'compliance', 'deviations'],
  recuperation: ['work_order_number', 'manufacturing_order_number', 'component_serial', 'component_part_number', 'machine', 'customer_name', 'mine_site', 'operation', 'powder_lot_number', 'powder_chemical_composition'],
  fault_cases: ['cases', 'open_cases']
};

/** View types that make sense for each source. */
export const VIEWS_BY_SOURCE: Record<VariableSource, WidgetViewType[]> = {
  process: ['value', 'min_max', 'trend'],
  session: ['value', 'table'],
  recuperation: ['value', 'text'],
  fault_cases: ['value', 'table']
};

export interface ReportWidget {
  position: number;
  variableSource: VariableSource;
  variableCode: string;
  variableLabel: string;
  viewType: WidgetViewType;
  aggregation: Aggregation;
  width: WidgetWidth;
}

export interface ReportSection {
  title: string;
  sectionOrder: number;
  widgets: ReportWidget[];
}

export function emptyWidget(position = 1): ReportWidget {
  return {position, variableSource: 'process', variableCode: '', variableLabel: '', viewType: 'min_max', aggregation: 'range', width: 'half'};
}

export function emptySection(sectionOrder = 1): ReportSection {
  return {title: '', sectionOrder, widgets: [emptyWidget(1)]};
}

export function isFullWidth(widget: ReportWidget): boolean {
  return widget.width === 'full' || widget.viewType === 'trend' || widget.viewType === 'table';
}

/** A customizable report layout: branding, page setup and ordered sections of widgets. */
export class ReportTemplate implements BaseEntity {
  id: number;
  organizationId: number;
  ownerUserId: number;
  name: string;
  description: string;
  reportKind: ReportKind;
  primaryColor: string;
  secondaryColor: string;
  headerText: string;
  footerText: string;
  pageSize: PageSize;
  orientation: PageOrientation;
  showSignatureBlock: boolean;
  defaultForKind: boolean;
  status: TemplateStatus;
  sections: ReportSection[];

  constructor(props: {
    id: number; organizationId: number; ownerUserId: number; name: string; description: string; reportKind: ReportKind; primaryColor: string;
    secondaryColor: string; headerText: string; footerText: string; pageSize: PageSize; orientation: PageOrientation; showSignatureBlock: boolean;
    defaultForKind: boolean; status: TemplateStatus; sections: ReportSection[];
  }) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.ownerUserId = props.ownerUserId;
    this.name = props.name;
    this.description = props.description;
    this.reportKind = props.reportKind;
    this.primaryColor = props.primaryColor;
    this.secondaryColor = props.secondaryColor;
    this.headerText = props.headerText;
    this.footerText = props.footerText;
    this.pageSize = props.pageSize;
    this.orientation = props.orientation;
    this.showSignatureBlock = props.showSignatureBlock;
    this.defaultForKind = props.defaultForKind;
    this.status = props.status;
    this.sections = props.sections;
  }

  get orderedSections(): ReportSection[] {
    return [...this.sections].sort((a, b) => a.sectionOrder - b.sectionOrder)
      .map(s => ({...s, widgets: [...s.widgets].sort((a, b) => a.position - b.position)}));
  }

  get widgetCount(): number {
    return this.sections.reduce((n, s) => n + s.widgets.length, 0);
  }

  get isActive(): boolean {
    return this.status === 'active';
  }
}
