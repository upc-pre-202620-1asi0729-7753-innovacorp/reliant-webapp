import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, forkJoin, map, of, startWith, switchMap } from 'rxjs';

import type { ProcessReading } from '../../../domain/model/process-reading.entity';
import { ProcessMonitoringApi } from '../../../infrastructure/process-monitoring-api';

type ReportState =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; sessionId: number; readings: ProcessReading[] };

const loading: ReportState = { status: 'loading' };
const failed: ReportState = { status: 'error' };

@Component({
  selector: 'app-spray-session-report',
  imports: [DatePipe, MatButtonModule, RouterLink, TranslatePipe],
  templateUrl: './spray-session-report.html',
  styles: `
    .table-wrapper {
      overflow-x: auto;
      margin-top: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      padding: 12px;
      border-bottom: 1px solid #cbd5e1;
      text-align: start;
    }
    th {
      white-space: nowrap;
    }
  `,
})
export class SpraySessionReport {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProcessMonitoringApi);

  readonly report = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const sessionId = Number(params.get('id'));

        if (!Number.isSafeInteger(sessionId) || sessionId < 1) {
          return of(failed);
        }

        return forkJoin({
          session: this.api.getSession(sessionId),
          readings: this.api.getReadingsBySessionId(sessionId),
        }).pipe(
          map(({ session, readings }): ReportState => ({
            status: 'ready',
            sessionId: session.id,
            readings: readings
              .filter((reading) => reading.spraySessionId === session.id)
              .sort((a, b) => a.epochMillis - b.epochMillis || a.id - b.id),
          })),
          catchError(() => of(failed)),
          startWith(loading),
        );
      }),
    ),
    { initialValue: loading },
  );
}
