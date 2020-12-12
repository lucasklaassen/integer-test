import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HallOfFameService } from 'src/app/core/http/integer/hall-of-fame.service';
import { LeaderboardService } from 'src/app/core/http/integer/leaderboard.service';
import { HallOfFame } from 'src/app/core/models/hall-of-fame.model';
import { Leaderboard } from 'src/app/core/models/leaderboard.model';

@Component({
  selector: 'app-hall-of-fame',
  templateUrl: './hall-of-fame.component.html',
  styleUrls: ['./hall-of-fame.component.scss'],
})
export class HallOfFameComponent implements OnInit, OnDestroy {
  public hallOfFames: HallOfFame[];

  private destroy$: Subject<any> = new Subject();

  constructor(
    private hallOfFameService: HallOfFameService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.fetchHallOfFameList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public fetchHallOfFameList(): void {
    this.hallOfFameService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        results = results.sort((a, b) => b.totalPoints - a.totalPoints);
        this.hallOfFames = results;
      });
  }
}
