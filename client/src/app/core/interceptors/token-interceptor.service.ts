import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../authentication/services/auth/auth.service';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headers = {};

    if (!req.headers.has('authorization')) {
      headers['Authorization'] = `Bearer ${this.authService.accessToken}`;
    }

    if (!req.headers.has('content-type')) {
      headers['Content-Type'] = 'application/json';
    }

    const authReq = req.clone({
      setHeaders: headers,
    });

    // Send the new authorized request
    return next.handle(authReq).pipe(
      tap(() => {}),
      catchError((error: any) => {
        return this._onError(error);
      })
    );
  }

  // Handle errors
  private _onError(error): Observable<any> {
    if (error instanceof HttpErrorResponse) {
      const errMsg = error.message;
      if (
        error.status === 401 ||
        errMsg.indexOf('No JWT') > -1 ||
        errMsg.indexOf('Unauthorized') > -1
      ) {
        this.authService.renewTokens();
      }
    }
    return throwError(error);
  }
}
