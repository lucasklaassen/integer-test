import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeaderboardService } from 'src/app/core/http/integer/leaderboard.service';
import { Fight } from 'src/app/core/models/fight.model';
import { Leaderboard } from 'src/app/core/models/leaderboard.model';
import { ScheduledEvent } from 'src/app/core/models/scheduled-event.model';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  public leaderboards: Leaderboard[];
  public userHasName = true;
  public leaderboardForm: FormGroup;
  public formSubmitted = false;

  private destroy$: Subject<any> = new Subject();

  constructor(
    private leaderboardService: LeaderboardService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.fetchLeaderboard();
    this.fetchLeaderboardList();
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

  public fetchLeaderboardList(): void {
    this.leaderboardService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.leaderboards = results;
      });
  }

  private buildForm(): void {
    this.leaderboardForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.min(1)]],
    });
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
      this.fetchLeaderboardList();
    });
  }
}
