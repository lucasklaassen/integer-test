import { NgModule } from '@angular/core';
import { IntegersRoutingModule } from './integers-routing.module';
import { IntegersComponent } from './pages/integers.component';

@NgModule({
  imports: [IntegersRoutingModule],
  declarations: [IntegersComponent],
})
export class IntegersModule {}
