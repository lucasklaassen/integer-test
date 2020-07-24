import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './authentication/components/login/login.component';
import { LogoutComponent } from './authentication/components/logout/logout.component';
import { AuthService } from './authentication/services/auth/auth.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [RouterModule, HttpClientModule],
  declarations: [LoginComponent, LogoutComponent],
  providers: [AuthService],
})
export class CoreModule {}
