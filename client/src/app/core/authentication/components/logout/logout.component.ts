import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-logout',
  template: ``,
})
export class LogoutComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.logout();
  }
}
