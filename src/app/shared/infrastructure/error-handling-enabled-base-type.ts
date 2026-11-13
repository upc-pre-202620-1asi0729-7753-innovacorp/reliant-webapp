import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

/**
 * Turns an HTTP failure into an Error whose message a view can show. The platform answers with
 * RFC 9457 problem details, so the localized `detail` (or `title`) is preferred over the status code.
 */
export abstract class ErrorHandlingEnabledBaseType {
  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      return throwError(() => new Error(ErrorHandlingEnabledBaseType.describe(error, operation)));
    };
  }

  static describe(error: HttpErrorResponse, operation: string): string {
    const problem = error.error as { detail?: string; title?: string; errors?: Record<string, string> } | null;
    if (problem && typeof problem === 'object') {
      const fieldErrors = problem.errors ? Object.values(problem.errors).join('. ') : '';
      const detail = problem.detail || fieldErrors || problem.title;
      if (detail) return detail;
    }
    if (error.status === 0) return `${operation}: Platform unreachable`;
    if (error.status === 401) return `${operation}: Invalid credentials or expired session`;
    if (error.status === 403) return `${operation}: Access forbidden`;
    if (error.status === 404) return `${operation}: Resource not found`;
    return `${operation}: ${error.status || 'Unexpected error'}`;
  }
}
