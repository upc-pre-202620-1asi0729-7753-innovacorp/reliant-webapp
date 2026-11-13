import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {GeneratedReport} from '../domain/model/generated-report.entity';
import {GeneratedReportResource, GeneratedReportsResponse} from './generated-reports-response';

export class GeneratedReportAssembler implements BaseAssembler<GeneratedReport, GeneratedReportResource, GeneratedReportsResponse> {
  toEntitiesFromResponse(response: GeneratedReportsResponse): GeneratedReport[] {
    return response.generatedReports.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(r: GeneratedReportResource): GeneratedReport {
    return new GeneratedReport({
      id: r.id, reportTemplateId: r.reportTemplateId, organizationId: r.organizationId, generatedByUserId: r.generatedByUserId, subjectType: r.subjectType,
      subjectId: r.subjectId, format: r.format ?? 'PDF', fileName: r.fileName, periodFrom: r.periodFrom ?? null, periodTo: r.periodTo ?? null, generatedAt: r.generatedAt
    });
  }

  toResourceFromEntity(e: GeneratedReport): GeneratedReportResource {
    return {
      id: e.id, reportTemplateId: e.reportTemplateId, organizationId: e.organizationId, generatedByUserId: e.generatedByUserId, subjectType: e.subjectType,
      subjectId: e.subjectId, format: e.format, fileName: e.fileName, periodFrom: e.periodFrom, periodTo: e.periodTo, generatedAt: e.generatedAt
    };
  }
}
