import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {LinkedSession, RecuperationStatus} from '../domain/model/recuperation.entity';

export interface RecuperationsResponse extends BaseResponse {
  recuperations: RecuperationResource[];
}

export interface RecuperationResource extends BaseResource {
  id: number;
  workOrderNumber: string;
  manufacturingOrderNumber: string;
  componentId: number;
  customerId: number;
  supplierOrganizationId: number;
  segment: string;
  operation: string;
  weightValue: number;
  weightUnitSymbol: string;
  hourmeterAtEntry: number;
  powderSupplier: string;
  powderLotNumber: string;
  powderChemicalComposition: string;
  status: RecuperationStatus;
  receivedAt: string;
  completedAt: string | null;
  linkedSessions: LinkedSession[];
}
