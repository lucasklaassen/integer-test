import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { HallOfFame } from '../../models/hall-of-fame.model';
import { IApiResponse } from '../../models/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class HallOfFameService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = environment.apiUrl;
  }

  public getAll(): Observable<HallOfFame[]> {
    return this.http
      .get<IApiResponse<HallOfFame[]>>(`${this.api}/hall-of-fame`)
      .pipe(
        map((result) => plainToClass(HallOfFame, result.data as HallOfFame[])),
        catchError((error) => {
          return of([]);
        })
      );
  }
}
