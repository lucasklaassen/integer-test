import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IApiResponse } from '../../models/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserPicksService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = environment.apiUrl;
  }

  public fetch(eventId: number): Observable<any> {
    return this.http
      .get<IApiResponse<any>>(`${this.api}/user-picks?eventId=${eventId}`)
      .pipe(
        map((result) => result.data),
        catchError((error) => {
          return of({ picks: [] });
        })
      );
  }

  public savePicks(eventId: number, picks: any): Observable<any> {
    return this.http
      .post<IApiResponse<any>>(`${this.api}/user-picks`, {
        data: { eventId, picks },
      })
      .pipe(
        map((result) => result.data),
        catchError((error) => {
          return of({ picks: [] });
        })
      );
  }
}
