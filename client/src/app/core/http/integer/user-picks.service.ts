import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IApiResponse } from '../../models/interfaces/api-response.interface';
import { UserPick } from '../../models/user-pick.model';

@Injectable({
  providedIn: 'root',
})
export class UserPicksService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = environment.apiUrl;
  }

  public fetch(eventId: number, userId: string): Observable<UserPick[]> {
    return this.http
      .get<IApiResponse<UserPick[]>>(
        `${this.api}/user-picks?eventId=${eventId}&userId=${encodeURIComponent(
          userId
        )}`
      )
      .pipe(
        map((result: any) => result.data.picks as UserPick[]),
        catchError((error) => {
          return of([]);
        })
      );
  }

  public savePicks(eventId: number, picks: any): Observable<UserPick[]> {
    return this.http
      .post<IApiResponse<UserPick[]>>(`${this.api}/user-picks`, {
        data: { eventId, picks },
      })
      .pipe(
        map((result: any) => result.data.picks as UserPick[]),
        catchError((error) => {
          return of([]);
        })
      );
  }
}
