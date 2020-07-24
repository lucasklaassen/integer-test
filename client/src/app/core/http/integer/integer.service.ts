import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { classToPlain, plainToClass } from 'class-transformer';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../authentication/services/auth/auth.service';
import { IApiResponse } from '../../models/interfaces/api-response.interface';
import { Integer } from '../../models/integer.model';

@Injectable({
  providedIn: 'root',
})
export class IntegerService {
  private api: string;

  constructor(private http: HttpClient) {
    this.api = environment.apiUrl;
  }

  public getCurrentInteger(): Observable<Integer> {
    return this.http
      .get<IApiResponse<Integer>>(`${this.api}/integers/current`)
      .pipe(map((result) => plainToClass(Integer, result.data as Integer)));
  }

  public getNextInteger(): Observable<Integer> {
    return this.http
      .get<IApiResponse<Integer>>(`${this.api}/integers/next`)
      .pipe(map((result) => plainToClass(Integer, result.data as Integer)));
  }

  public updateInteger(newInteger: Integer): Observable<Integer> {
    const integerToSend = classToPlain(newInteger);
    return this.http
      .put<IApiResponse<Integer>>(`${this.api}/integers/current`, {
        data: { attributes: { ...integerToSend } },
      })
      .pipe(
        map((result) => plainToClass(Integer, result.data as Integer)),
        catchError((error) => {
          return of(plainToClass(Integer, { errors: error.error.errors }));
        })
      );
  }
}
