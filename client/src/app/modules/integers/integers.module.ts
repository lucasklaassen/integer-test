import { NgModule } from '@angular/core';
import { IntegersRoutingModule } from './integers-routing.module';
import { IntegersComponent } from './pages/integers.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IntegersRoutingModule,
  ],
  declarations: [IntegersComponent],
})
export class IntegersModule {}
