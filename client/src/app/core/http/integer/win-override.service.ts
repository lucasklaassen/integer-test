import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IApiResponse } from '../../models/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class WinOverrideService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = environment.apiUrl;
  }

  public fetch(eventId: number): Observable<any[]> {
    return this.http
      .get<IApiResponse<any[]>>(`${this.api}/win-overrides?id=${eventId}`)
      .pipe(
        map((result: any) => result.data.winners as any[]),
        catchError((error) => {
          return of([]);
        })
      );
  }

  public saveWinners(id: number, winners: any[]): Observable<any[]> {
    return this.http
      .post<IApiResponse<any[]>>(`${this.api}/win-overrides`, {
        data: { id, winners },
      })
      .pipe(
        map((result: any) => result.data.winners as any[]),
        catchError((error) => {
          return of([]);
        })
      );
  }
}
