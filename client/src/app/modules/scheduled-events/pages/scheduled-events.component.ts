import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScheduledEventsService } from 'src/app/core/http/integer/scheduled-events.service';
import { ScheduledEvent } from 'src/app/core/models/scheduled-event.model';

@Component({
  selector: 'app-scheduled-events',
  templateUrl: './scheduled-events.component.html',
  styleUrls: ['./scheduled-events.component.scss'],
})
export class ScheduledEventsComponent implements OnInit, OnDestroy {
  public events: ScheduledEvent[];

  private destroy$: Subject<any> = new Subject();

  constructor(
    private scheduledEventsService: ScheduledEventsService,
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
        this.events = results;
      });
  }

  public goToEvent(id: number) {
    this.router.navigate(['scheduled-events', id]);
  }
}
