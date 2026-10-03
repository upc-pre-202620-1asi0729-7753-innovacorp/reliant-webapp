import {SignUpRequest} from './sign-up.request';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignUpResource, SignUpResponse} from './sign-up-response';

export class SignUpAssembler {
  toResourceFromResponse(response: SignUpResponse): SignUpResource {
    return {
      id: response.id,
      email: response.email,
      fullName: response.fullName,
      organizationId: response.organizationId
    } as SignUpResource;
  }

  toRequestFromCommand(command: SignUpCommand): SignUpRequest {
    return {
      organizationName: command.organizationName,
      ruc: command.ruc,
      organizationType: command.organizationType,
      fullName: command.fullName,
      email: command.email,
      password: command.password
    } as SignUpRequest;
  }
}
