import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './pages/admin.component';
import { WinOverridesComponent } from './pages/win-overrides/win-overrides.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
  },
  {
    path: ':id',
    component: WinOverridesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
