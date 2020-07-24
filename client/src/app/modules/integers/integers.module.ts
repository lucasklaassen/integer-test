import { NgModule } from '@angular/core';
import { IntegersRoutingModule } from './integers-routing.module';
import { IntegersComponent } from './pages/integers.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, IntegersRoutingModule],
  declarations: [IntegersComponent],
})
export class IntegersModule {}
