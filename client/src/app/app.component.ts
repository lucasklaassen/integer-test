import { Component } from '@angular/core';
import { AuthService } from './core/authentication/services/auth/auth.service';
import { Subject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'integer-tracking-client';
  public skipAuthentication = ['logout', 'login', 'callback', 'signup'];
  public requiresAuth = true;
  public authenticated = false;

  private destroy$: Subject<any> = new Subject();

  constructor(private authService: AuthService, private router: Router) {
    authService.handleAuthentication(window.location.href);
  }

  public ngOnInit() {
    this.authService.isLoggedIn$.subscribe((authenticated) => {
      if (authenticated) {
        this.authenticated = authenticated;
      }
    });

    this.router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.routeRequiresAuth(event);
        if (!this.authService.authenticated() && this.requiresAuth) {
          this.authService.renewTokens();
        }
      }
    });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private routeRequiresAuth(event: NavigationStart): void {
    this.requiresAuth = true;
    this.skipAuthentication.forEach((route) => {
      if (event.url.includes(route)) {
        this.requiresAuth = false;
      }
    });
  }
}
