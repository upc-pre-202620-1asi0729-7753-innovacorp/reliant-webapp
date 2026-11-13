import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {ReportSubjectType} from '../domain/model/generated-report.entity';

export interface GeneratedReportsResponse extends BaseResponse { generatedReports: GeneratedReportResource[]; }

export interface GeneratedReportResource extends BaseResource {
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
}
