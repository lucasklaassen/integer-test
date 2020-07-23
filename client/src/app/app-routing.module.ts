import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './core/authentication/components/login/login.component';
import { LogoutComponent } from './core/authentication/components/logout/logout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'integers',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'integers',
        loadChildren: () =>
          import('./modules/integers/integers.module').then(
            (m) => m.IntegersModule
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'integers',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
