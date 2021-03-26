import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IApiResponse } from '../../models/interfaces/api-response.interface';
import { ScheduledEvent } from '../../models/scheduled-event.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduledEventsService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = environment.apiUrl;
  }

  public getAll(): Observable<ScheduledEvent[]> {
    return this.http
      .get<IApiResponse<ScheduledEvent[]>>(`${this.api}/scheduled-events`)
      .pipe(
        map((result) =>
          plainToClass(ScheduledEvent, result.data as ScheduledEvent[])
        )
      );
  }

  public fetch(eventId: number): Observable<ScheduledEvent> {
    return this.http
      .get<IApiResponse<ScheduledEvent>>(
        `${this.api}/scheduled-event?eventId=${eventId}`
      )
      .pipe(map((result) => plainToClass(ScheduledEvent, result.data)));
  }
}
