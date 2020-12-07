import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FightsComponent } from './pages/fights/fights.component';
import { ScheduledEventsComponent } from './pages/scheduled-events.component';

const routes: Routes = [
  {
    path: '',
    component: ScheduledEventsComponent,
  },
  {
    path: ':id',
    component: FightsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduledEventsRoutingModule {}
