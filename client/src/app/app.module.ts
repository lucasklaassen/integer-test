import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './core/interceptors/token-interceptor.service';
import { CommonModule } from '@angular/common';
import { LeaderboardComponent } from './modules/components/leaderboard/leaderboard.component';

@NgModule({
  declarations: [AppComponent, LeaderboardComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
