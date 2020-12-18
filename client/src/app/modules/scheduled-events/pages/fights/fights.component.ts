import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { forkJoin, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/authentication/services/auth/auth.service';
import { LeaderboardService } from 'src/app/core/http/integer/leaderboard.service';
import { ScheduledEventsService } from 'src/app/core/http/integer/scheduled-events.service';
import { UserPicksService } from 'src/app/core/http/integer/user-picks.service';
import { Fight } from 'src/app/core/models/fight.model';
import { Fighter } from 'src/app/core/models/fighter.model';
import { Leaderboard } from 'src/app/core/models/leaderboard.model';
import { ScheduledEvent } from 'src/app/core/models/scheduled-event.model';
import { UserPick } from 'src/app/core/models/user-pick.model';
@Component({
  selector: 'app-fights',
  templateUrl: './fights.component.html',
  styleUrls: ['./fights.component.scss'],
})
export class FightsComponent implements OnInit, OnDestroy {
  public events: ScheduledEvent[];
  public currentEvent: ScheduledEvent;
  public fights: Fight[];
  public userHasMadePicks: boolean = false;
  public eventComplete: boolean = false;
  public userPicks: UserPick[] = [];
  public submitText = 'Submit';
  public viewImages = false;
  public showFriendPicks = false;
  public friendPicks: any[] = [];

  private destroy$: Subject<any> = new Subject();

  constructor(
    private scheduledEventsService: ScheduledEventsService,
    private leaderboardService: LeaderboardService,
    private authService: AuthService,
    private userPicksService: UserPicksService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const eventId: number = +this.activatedRoute.snapshot.paramMap.get('id');
    const userId = this.authService.currentUser.userId;
    this.fetchFights(eventId);
    this.fetchFriendPicks(eventId);
    this.userPicksService
      .fetch(eventId, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        console.log(results);
        if (results.length) {
          this.userHasMadePicks = true;
          this.submitText = 'Update Picks';
          this.userPicks = results;
          return;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public fetchFights(eventId: number): void {
    this.scheduledEventsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.events = results;
        this.currentEvent = this.events.find(
          (currentEvent) => currentEvent.id === eventId
        );
        console.log(this.currentEvent.fights);
        this.fights = this.currentEvent.fights;
        if (this.currentEvent.status === 'Final') {
          this.eventComplete = true;
        }
      });
  }

  public fetchFriendPicks(eventId: number): void {
    const currentUserId = this.authService.currentUser.userId;
    this.leaderboardService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        const leaderboards: Leaderboard[] = results;
        let userPickObservables = [];
        leaderboards.forEach((leaderboard) => {
          if (currentUserId !== leaderboard.id) {
            userPickObservables.push(
              this.userPicksService.fetch(eventId, leaderboard.id).pipe(
                map((results: UserPick[]) => {
                  return {
                    name: leaderboard.name,
                    userPicks: results,
                  };
                })
              )
            );
          }
        });
        const friendPicks = forkJoin(userPickObservables);
        friendPicks.subscribe((friendPickArray) => {
          console.log(friendPickArray);
          this.friendPicks = friendPickArray;
        });
      });
  }

  public savePicks(): void {
    if (this.eventComplete) {
      return;
    }
    this.submitText = 'Submitting...';
    let picksForApi = this.userPicks;
    this.userPicksService
      .savePicks(this.currentEvent.id, picksForApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.userHasMadePicks = true;
        this.submitText = 'Update Picks';
        window.scrollTo(0, 0);
      });
  }

  public resultText(fight: Fight): string {
    if (fight.status === 'Final') {
      if (fight.winnerId !== null) {
        let winner = fight.fighters.find(
          (fighter: Fighter) => +fighter.id === +fight.winnerId
        );
        return `Winner: ${winner.firstName} ${winner.lastName}`;
      }
      return 'Draw';
    } else {
      if (fight.status === 'InProgress') {
        return 'Live!';
      }
      return 'Pending...';
    }
  }

  public userResultText(fight: Fight, userPicks: any): string {
    const pick: UserPick = userPicks.find(
      (pick: UserPick) => +pick.fightId === +fight.id
    );

    if (!pick || !pick.completed || !pick.correct) {
      return;
    }

    if (pick.correct) {
      if (pick.bigUnderdog) {
        return '+2 Points Big Underdog Win';
      }
      return '+1 Point Win';
    }
  }

  public toggleFriendPicks(): void {
    this.showFriendPicks = !this.showFriendPicks;
  }

  public pickFighter(fightId: number, fighterId: number): void {
    const fight = this.fights.find((fight: Fight) => +fight.id === +fightId);
    if (fight.status !== 'Scheduled') {
      return;
    }
    const pick: UserPick = this.userPicks.find(
      (pick: UserPick) => pick.fightId === fightId
    );
    if (!pick) {
      this.userPicks.push(plainToClass(UserPick, { fightId, fighterId }));
    } else {
      pick.fighterId = fighterId;
    }
  }

  public checkIfPicked(
    fightId: number,
    fighterId: number,
    userPicks: any
  ): boolean {
    const pick: UserPick = userPicks.find(
      (pick: UserPick) => pick.fightId === fightId
    );
    if (!pick) {
      return false;
    }
    return pick.fighterId === fighterId;
  }

  public favourite(fighters: Fighter[], index: number) {
    let currentFighter = fighters[0];
    let otherFighter = fighters[1];
    if (index === 1) {
      currentFighter = fighters[1];
      otherFighter = fighters[0];
    }
    return currentFighter.moneyline < otherFighter.moneyline;
  }

  public toggleImages(): void {
    this.viewImages = !this.viewImages;
  }
}
