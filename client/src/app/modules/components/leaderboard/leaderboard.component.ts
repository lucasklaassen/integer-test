import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeaderboardService } from 'src/app/core/http/integer/leaderboard.service';
import { Leaderboard } from 'src/app/core/models/leaderboard.model';

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
  public showRules = false;

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
        results = results.sort((a, b) => b.totalPoints - a.totalPoints);
        this.leaderboards = results;
      });
  }

  public topDawg(leaderboards: Leaderboard[], index: number): boolean {
    if (index === 0) {
      const currentLeaderboard = leaderboards[index];
      const nextLeaderboard = leaderboards[index + 1];

      if (currentLeaderboard && +currentLeaderboard.totalPoints > 0) {
        if (
          !nextLeaderboard ||
          +nextLeaderboard.totalPoints < +currentLeaderboard.totalPoints
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private buildForm(): void {
    this.leaderboardForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.min(1)]],
    });
  }

  public toggleRules(): void {
    this.showRules = !this.showRules;
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
