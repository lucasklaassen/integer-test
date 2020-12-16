import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeaderboardService } from 'src/app/core/http/integer/leaderboard.service';
import { ScheduledEventsService } from 'src/app/core/http/integer/scheduled-events.service';
import { ScheduledEvent } from 'src/app/core/models/scheduled-event.model';

@Component({
  selector: 'app-scheduled-events',
  templateUrl: './scheduled-events.component.html',
  styleUrls: ['./scheduled-events.component.scss'],
})
export class ScheduledEventsComponent implements OnInit, OnDestroy {
  public upcomingEvents: ScheduledEvent[];
  public pastEvents: ScheduledEvent[];
  public todaysEvent: ScheduledEvent[];
  public userHasName = true;
  public leaderboardForm: FormGroup;
  public formSubmitted = false;

  private destroy$: Subject<any> = new Subject();

  constructor(
    private scheduledEventsService: ScheduledEventsService,
    private leaderboardService: LeaderboardService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAllEvents();
    this.buildForm();
    this.fetchLeaderboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public fetchLeaderboard(): void {
    this.leaderboardService
      .fetch()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        if (!results.name) {
          this.userHasName = false;
        }
      });
  }
  private buildForm(): void {
    this.leaderboardForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.min(1)]],
    });
  }

  public fetchAllEvents(): void {
    this.scheduledEventsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        console.log(results);
        this.todaysEvent = results
          .filter(
            (event: ScheduledEvent) => new Date(event.dateTime) === new Date()
          )
          .sort(
            (a: ScheduledEvent, b: ScheduledEvent) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          );
        this.upcomingEvents = results
          .filter(
            (event: ScheduledEvent) => new Date(event.dateTime) > new Date()
          )
          .sort(
            (a: ScheduledEvent, b: ScheduledEvent) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          );
        this.pastEvents = results
          .filter(
            (event: ScheduledEvent) => new Date(event.dateTime) < new Date()
          )
          .sort(
            (a: ScheduledEvent, b: ScheduledEvent) =>
              new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
          );
      });
  }

  public goToEvent(id: number) {
    this.router.navigate(['scheduled-events', id]);
  }

  public submitForm(): void {
    this.formSubmitted = true;
    if (this.leaderboardForm.invalid) {
      return;
    }
    const formModel = this.leaderboardForm.value;

    this.leaderboardService.saveLeaderboard(formModel.name).subscribe(() => {
      this.formSubmitted = false;
      this.userHasName = true;
    });
  }
}
