import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/** RFC 9457 problem details as the Reliant Platform emits them (standard fields plus its extensions). */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  details?: string;
  invalidParams?: { field: string; message: string }[];
  errors?: Record<string, string>;
}

/**
 * Turns an HTTP failure into an Error whose message a view can show. The platform answers with
 * RFC 9457 problem details localized by `Accept-Language`, so the `detail` (or the field errors,
 * or the `title`) is preferred over the status code.
 */
export abstract class ErrorHandlingEnabledBaseType {
  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      return throwError(() => new Error(ErrorHandlingEnabledBaseType.describe(error, operation)));
    };
  }

  static describe(error: HttpErrorResponse, operation: string): string {
    const problem = error.error as ProblemDetails | null;
    if (problem && typeof problem === 'object') {
      const invalidParams =
        problem.invalidParams?.map((p) => `${p.field}: ${p.message}`).join('. ') ?? '';
      const fieldErrors = problem.errors ? Object.values(problem.errors).join('. ') : '';
      const detail =
        problem.detail || invalidParams || fieldErrors || problem.details || problem.title;
      if (detail) return detail;
    }
    if (error.status === 0) return `${operation}: Platform unreachable`;
    if (error.status === 401) return `${operation}: Invalid credentials or expired session`;
    if (error.status === 403) return `${operation}: Access forbidden`;
    if (error.status === 404) return `${operation}: Resource not found`;
    return `${operation}: ${error.status || 'Unexpected error'}`;
  }
}
