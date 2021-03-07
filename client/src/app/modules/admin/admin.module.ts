import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './pages/admin.component';
import { WinOverridesComponent } from './pages/win-overrides/win-overrides.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminRoutingModule],
  declarations: [AdminComponent, WinOverridesComponent],
})
export class AdminModule {}
