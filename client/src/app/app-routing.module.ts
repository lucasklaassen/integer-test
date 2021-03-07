import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './core/authentication/components/login/login.component';
import { LogoutComponent } from './core/authentication/components/logout/logout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HallOfFameComponent } from './modules/components/hall-of-fame/hall-of-fame.component';
import { LeaderboardComponent } from './modules/components/leaderboard/leaderboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'scheduled-events',
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
    path: 'leaderboard',
    component: LeaderboardComponent,
  },
  {
    path: 'hall-of-fame',
    component: HallOfFameComponent,
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
      {
        path: 'scheduled-events',
        loadChildren: () =>
          import('./modules/scheduled-events/scheduled-events.module').then(
            (m) => m.ScheduledEventsModule
          ),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./modules/admin/admin.module').then((m) => m.AdminModule),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'scheduled-events',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
