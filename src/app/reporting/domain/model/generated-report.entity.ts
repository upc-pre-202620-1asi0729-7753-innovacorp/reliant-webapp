import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type ReportSubjectType = 'spray_session' | 'recuperation';

/** Record of a PDF rendered from a template: who generated it, about what and when. */
export class GeneratedReport implements BaseEntity {
  id: number;
  reportTemplateId: number;
  organizationId: number;
  generatedByUserId: number;
  subjectType: ReportSubjectType;
  subjectId: number;
  format: string;
  fileName: string;
  periodFrom: string | null;
  periodTo: string | null;
  generatedAt: string;

  constructor(props: {
    id: number; reportTemplateId: number; organizationId: number; generatedByUserId: number; subjectType: ReportSubjectType; subjectId: number;
    format: string; fileName: string; periodFrom: string | null; periodTo: string | null; generatedAt: string;
  }) {
    this.id = props.id;
    this.reportTemplateId = props.reportTemplateId;
    this.organizationId = props.organizationId;
    this.generatedByUserId = props.generatedByUserId;
    this.subjectType = props.subjectType;
    this.subjectId = props.subjectId;
    this.format = props.format;
    this.fileName = props.fileName;
    this.periodFrom = props.periodFrom;
    this.periodTo = props.periodTo;
    this.generatedAt = props.generatedAt;
  }
}
