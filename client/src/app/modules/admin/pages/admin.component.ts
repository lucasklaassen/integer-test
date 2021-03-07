import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeaderboardService } from 'src/app/core/http/integer/leaderboard.service';
import { ScheduledEventsService } from 'src/app/core/http/integer/scheduled-events.service';
import { ScheduledEvent } from 'src/app/core/models/scheduled-event.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
  public upcomingEvents: ScheduledEvent[];
  public pastEvents: ScheduledEvent[];

  private destroy$: Subject<any> = new Subject();

  constructor(
    private scheduledEventsService: ScheduledEventsService,
    private leaderboardService: LeaderboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAllEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public fetchAllEvents(): void {
    this.scheduledEventsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        console.log(results);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.upcomingEvents = results
          .filter((event: ScheduledEvent) => new Date(event.day) >= today)
          .sort(
            (a: ScheduledEvent, b: ScheduledEvent) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          );
        this.pastEvents = results
          .filter((event: ScheduledEvent) => new Date(event.day) < today)
          .sort(
            (a: ScheduledEvent, b: ScheduledEvent) =>
              new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
          );
      });
  }

  public eventScheduleText(event: ScheduledEvent): string {
    const daysFromToday = event.daysFromToday();
    if (daysFromToday > 0) {
      return `In ${event.daysFromToday()} day(s)`;
    }
    if (event.status === 'In Progress') {
      return 'Live!';
    }
    return 'Today';
  }

  public goToEvent(id: number) {
    this.router.navigate(['admin', id]);
  }
}
