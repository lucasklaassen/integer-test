import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntegersComponent } from './pages/integers.component';

const routes: Routes = [
  {
    path: '',
    component: IntegersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegersRoutingModule {}
