import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IApiResponse } from '../../models/interfaces/api-response.interface';
import { Leaderboard } from '../../models/leaderboard.model';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = environment.apiUrl;
  }

  public fetch(): Observable<Leaderboard> {
    return this.http
      .get<IApiResponse<Leaderboard>>(`${this.api}/leaderboard`)
      .pipe(
        map((result) => result.data),
        catchError((error) => {
          return of(plainToClass(Leaderboard, {}));
        })
      );
  }

  public getAll(): Observable<Leaderboard[]> {
    return this.http
      .get<IApiResponse<Leaderboard[]>>(`${this.api}/leaderboards`)
      .pipe(
        map((result) =>
          plainToClass(Leaderboard, result.data as Leaderboard[])
        ),
        catchError((error) => {
          return of([]);
        })
      );
  }

  public saveLeaderboard(name: string): Observable<Leaderboard> {
    return this.http
      .post<IApiResponse<Leaderboard>>(`${this.api}/leaderboard`, {
        data: { name },
      })
      .pipe(
        map((result) => result.data),
        catchError((error) => {
          return of(plainToClass(Leaderboard, {}));
        })
      );
  }
}
