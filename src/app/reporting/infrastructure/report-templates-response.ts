import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {PageOrientation, PageSize, ReportKind, ReportSection, TemplateStatus} from '../domain/model/report-template.entity';

export interface ReportTemplatesResponse extends BaseResponse { reportTemplates: ReportTemplateResource[]; }

export interface ReportTemplateResource extends BaseResource {
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
}
