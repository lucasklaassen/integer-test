import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScheduledEventsService } from 'src/app/core/http/integer/scheduled-events.service';
import { WinOverrideService } from 'src/app/core/http/integer/win-override.service';
import { Fight } from 'src/app/core/models/fight.model';
import { Fighter } from 'src/app/core/models/fighter.model';
import { ScheduledEvent } from 'src/app/core/models/scheduled-event.model';
import { UserPick } from 'src/app/core/models/user-pick.model';

@Component({
  selector: 'app-win-overrides',
  templateUrl: './win-overrides.component.html',
  styleUrls: ['./win-overrides.component.scss'],
})
export class WinOverridesComponent implements OnInit, OnDestroy {
  public events: ScheduledEvent[];
  public currentEvent: ScheduledEvent;
  public fights: Fight[];
  public winners: any[];
  public eventComplete: boolean = false;
  public submitText = 'Update Winners';

  private destroy$: Subject<any> = new Subject();

  constructor(
    private scheduledEventsService: ScheduledEventsService,
    private winOverrideService: WinOverrideService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const eventId: number = +this.activatedRoute.snapshot.paramMap.get('id');
    this.fetchFights(eventId);
    this.fetchWinOverrides(eventId);
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

  public fetchWinOverrides(eventId: number): void {
    this.winOverrideService
      .fetch(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.winners = results;
      });
  }

  public saveWinners(): void {
    const winners = this.winners;
    this.winOverrideService
      .saveWinners(this.currentEvent.id, winners)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
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
      return '';
    } else {
      if (fight.status === 'In Progress' || fight.status === 'End of Round') {
        return 'Live!';
      }
      if (fight.status === 'Pre-fight') {
        return 'Up Next!';
      }
      if (fight.status === 'Walkouts') {
        return 'Walking out...';
      }
      return 'Pending...';
    }
  }

  public pickFighter(fightId: number, fighterId: number): void {
    const fight = this.fights.find((fight: Fight) => +fight.id === +fightId);
    const winner: any = this.winners.find(
      (winner: any) => winner.fightId === fightId
    );
    if (!winner) {
      this.winners.push({ fightId, winnerId: fighterId });
    } else {
      winner.winnerId = fighterId;
    }
    fight.winnerId = fighterId;
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
}
