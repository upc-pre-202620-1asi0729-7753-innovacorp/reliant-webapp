import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ReportTemplate} from '../domain/model/report-template.entity';
import {ReportTemplateResource, ReportTemplatesResponse} from './report-templates-response';

export class ReportTemplateAssembler implements BaseAssembler<ReportTemplate, ReportTemplateResource, ReportTemplatesResponse> {
  toEntitiesFromResponse(response: ReportTemplatesResponse): ReportTemplate[] {
    return response.reportTemplates.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(r: ReportTemplateResource): ReportTemplate {
    return new ReportTemplate({
      id: r.id, organizationId: r.organizationId, ownerUserId: r.ownerUserId, name: r.name, description: r.description ?? '', reportKind: r.reportKind,
      primaryColor: r.primaryColor, secondaryColor: r.secondaryColor, headerText: r.headerText ?? '', footerText: r.footerText ?? '', pageSize: r.pageSize,
      orientation: r.orientation, showSignatureBlock: r.showSignatureBlock, defaultForKind: r.defaultForKind, status: r.status,
      sections: (r.sections ?? []).map(s => ({title: s.title, sectionOrder: s.sectionOrder, widgets: s.widgets.map(w => ({...w}))}))
    });
  }

  /** Create and update requests: the organization and owner come from the token, the kind only on creation. */
  toResourceFromEntity(e: ReportTemplate): ReportTemplateResource {
    return {
      id: e.id, organizationId: e.organizationId, ownerUserId: e.ownerUserId, name: e.name, description: e.description, reportKind: e.reportKind,
      primaryColor: e.primaryColor, secondaryColor: e.secondaryColor, headerText: e.headerText, footerText: e.footerText, pageSize: e.pageSize,
      orientation: e.orientation, showSignatureBlock: e.showSignatureBlock, defaultForKind: e.defaultForKind, status: e.status,
      sections: e.sections.map(s => ({title: s.title, sectionOrder: s.sectionOrder, widgets: s.widgets.map(w => ({...w}))}))
    };
  }
}
