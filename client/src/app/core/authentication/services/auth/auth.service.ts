// src/app/auth/auth.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';
import * as auth0 from 'auth0-js';
import { plainToClass } from 'class-transformer';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUser } from 'src/app/core/models/auth-user.model';
import { IAuthResult } from 'src/app/core/models/interfaces/auth-result.interface';
import { IUserProfile } from 'src/app/core/models/interfaces/user-profile.interface';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthService {
  public isLoggedIn = new BehaviorSubject<boolean>(this.authenticated());
  public isLoggedIn$ = this.isLoggedIn.asObservable();

  private _idToken: string;
  private _accessToken: string;
  private _expiresAt: number;
  public _namespace: string;
  public _currentUser: AuthUser;

  auth0 = new auth0.WebAuth({
    clientID: environment.auth.clientId,
    domain: environment.auth.domain,
    responseType: 'code',
    responseMode: 'query',
    redirectUri: environment.auth.redirect,
    audience: environment.auth.audience,
    scope: environment.auth.scope,
  });

  constructor(
    private router: Router,
    private storageMap: StorageMap,
    private http: HttpClient
  ) {
    this._idToken = '';
    this._accessToken = '';
    this._expiresAt = 0;
    this._currentUser = plainToClass(AuthUser, {});
    this._namespace = environment.auth.namespace;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  get idToken(): string {
    return this._idToken;
  }

  get currentUser(): AuthUser {
    return this._currentUser;
  }

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(url?): void {
    const queryParams = this.extractQueryParams(url);
    if (queryParams.code && !String(url).includes('signup')) {
      this.getAccessToken(queryParams.code)
        .toPromise()
        .then((result) => {
          this.clearLoginInfoFromUrl();
          const authResult = this.parseAuthResult(result);
          if (this.validAuthResult(authResult)) {
            this.localLogin(authResult);
          } else {
            this.warningLogout(new Error('Login Required'));
          }
        });
    }
  }

  public getAccessToken(code: string): Observable<any> {
    const params = {
      grant_type: 'authorization_code',
      client_id: environment.auth.clientId,
      code: code,
      redirect_uri: environment.auth.redirect,
    };

    return this.http.post<any>(
      `https://${environment.auth.domain}/oauth/token`,
      params
    );
  }

  public renewTokens(): void {
    this.storageMap
      .get('authResult')
      .subscribe((savedAuthResult: IAuthResult) => {
        if (savedAuthResult) {
          this.localLogin(savedAuthResult);
        } else {
          this.warningLogout(new Error('Login Required'));
        }
      });
  }

  public logout(): void {
    // Remove tokens and expiry time
    this._accessToken = '';
    this._idToken = '';
    this._expiresAt = 0;
    this.storageMap.clear().subscribe(() => {});
    // Go back to the home route
    window.location.href = `https://${environment.auth.domain}/v2/logout?returnTo=${environment.auth.mainUrl}/login&client_id=${environment.auth.clientId}`;
  }

  public authenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    return Math.trunc(new Date().getTime() / 1000) < this._expiresAt;
  }

  private validAuthResult(authResult: IAuthResult): boolean {
    return !!(
      authResult &&
      authResult.accessToken &&
      authResult.idToken &&
      authResult.expiresIn
    );
  }

  private parseAuthResult(oauthResponse): IAuthResult {
    return {
      accessToken: oauthResponse.access_token,
      idToken: oauthResponse.id_token,
      expiresIn: oauthResponse.expires_in,
    };
  }

  private clearLoginInfoFromUrl(): void {
    window.location.hash = '';
  }

  private warningLogout(error): void {
    console.warn(error);
    this.router.navigate(['/logout']);
  }

  public localLogin(authResult: IAuthResult): void {
    // Set the time that the access token will expire at
    let expiresAt = authResult.expiresAt;
    if (!expiresAt) {
      expiresAt =
        Math.trunc(new Date().getTime() / 1000) + authResult.expiresIn;
    }
    authResult.expiresAt = expiresAt;
    this._accessToken = authResult.accessToken;
    this._idToken = authResult.idToken;
    this._expiresAt = expiresAt;
    this.parseUserProfile(authResult)
      .then(() => {
        if (!this.authenticated()) {
          throw new Error('Login Expired');
        } else {
          this.updateLoggedInStatus(this.authenticated());
        }
      })
      .catch((error) => {
        console.warn(error);
        this.logout();
        this.updateLoggedInStatus(false);
      });
  }

  public updateLoggedInStatus(result: boolean): void {
    this.isLoggedIn.next(result);
  }

  private parseUserProfile(authResult: IAuthResult): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!authResult.profile) {
        this.auth0.client.userInfo(
          authResult.accessToken,
          (err, profile: IUserProfile) => {
            if (err) {
              return reject(err);
            }
            authResult.profile = profile;
            this.storageMap.set('authResult', authResult).subscribe(() => {});
            this._currentUser = this.loadCurrentUser(profile);
            return resolve();
          }
        );
      } else {
        this._currentUser = this.loadCurrentUser(authResult.profile);
        return resolve();
      }
    });
  }

  private loadCurrentUser(profile): AuthUser {
    return plainToClass(AuthUser, {
      userId: profile[`sub`],
      name: profile['name'],
    });
  }

  private extractQueryParams(url: string): any {
    const re = /[?&]([^=#&]+)=([^&#]*)/g;
    let match;
    let isMatch = true;
    const matches = [];
    while (isMatch) {
      match = re.exec(url);
      if (match !== null) {
        matches[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
        if (match.index === re.lastIndex) {
          re.lastIndex++;
        }
      } else {
        isMatch = false;
      }
    }
    return matches;
  }
}
