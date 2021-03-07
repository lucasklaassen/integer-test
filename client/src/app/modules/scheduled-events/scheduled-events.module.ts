import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScheduledEventsRoutingModule } from './scheduled-events-routing.module';
import { ScheduledEventsComponent } from './pages/scheduled-events.component';
import { FightsComponent } from './pages/fights/fights.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScheduledEventsRoutingModule,
  ],
  declarations: [ScheduledEventsComponent, FightsComponent],
})
export class ScheduledEventsModule {}
