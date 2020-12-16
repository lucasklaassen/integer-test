import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  public userPicks: any = {};
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
        if (results.picks.length) {
          this.userHasMadePicks = true;
          results.picks.forEach((pick) => {
            this.userPicks[+pick.fightId] = +pick.fighterId;
          });
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
        if (new Date(this.currentEvent.dateTime) < new Date()) {
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
                map((results) => {
                  results.name = leaderboard.name;
                  return results;
                })
              )
            );
          }
        });
        const friendPicks = forkJoin(userPickObservables);
        friendPicks.subscribe((friendPickArray) => {
          friendPickArray.forEach((friendPick: any) => {
            let friendPickObj = {};
            if (friendPick.picks.length) {
              friendPick.picks.forEach((pick) => {
                friendPickObj[+pick.fightId] = +pick.fighterId;
              });
              this.friendPicks.push({
                name: friendPick.name,
                userPicks: friendPickObj,
              });
            }
          });
        });
      });
  }

  public savePicks(): void {
    if (this.userHasMadePicks || this.eventComplete) {
      return;
    }
    this.submitText = 'Submitting...';
    let picksForApi = [];
    Object.keys(this.userPicks).forEach((key) => {
      let pick = {};
      pick['fightId'] = +key;
      pick['fighterId'] = +this.userPicks[key];
      picksForApi.push(pick);
    });
    this.userPicksService
      .savePicks(this.currentEvent.id, picksForApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.userHasMadePicks = true;
        window.scrollTo(0, 0);
        this.submitText = 'Submit';
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
      return 'Pending...';
    }
  }

  public toggleFriendPicks(): void {
    this.showFriendPicks = !this.showFriendPicks;
  }

  public pickFighter(fightId: number, fighterId: number): void {
    const fight = this.fights.find((fight: Fight) => +fight.id === +fightId);
    if (this.userHasMadePicks || fight.status === 'Final') {
      return;
    }
    this.userPicks[fightId] = fighterId;
  }

  public checkIfPicked(
    fightId: number,
    fighterId: number,
    userPicks: any
  ): boolean {
    return userPicks[fightId] === fighterId;
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
