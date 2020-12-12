import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScheduledEventsService } from 'src/app/core/http/integer/scheduled-events.service';
import { UserPicksService } from 'src/app/core/http/integer/user-picks.service';
import { Fight } from 'src/app/core/models/fight.model';
import { Fighter } from 'src/app/core/models/fighter.model';
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
  public userPicks: any = {};
  public submitText = 'Submit';

  private destroy$: Subject<any> = new Subject();

  constructor(
    private scheduledEventsService: ScheduledEventsService,
    private userPicksService: UserPicksService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const eventId: number = +this.activatedRoute.snapshot.paramMap.get('id');
    this.fetchFights(eventId);
    this.userPicksService
      .fetch(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        console.log(results);
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
        this.fights = this.currentEvent.fights;
      });
  }

  public savePicks(): void {
    if (this.userHasMadePicks) {
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

  public pickFighter(fightId: number, fighterId: number): void {
    if (this.userHasMadePicks) {
      return;
    }
    this.userPicks[fightId] = fighterId;
  }

  public checkIfPicked(fightId: number, fighterId: number): boolean {
    return this.userPicks[fightId] === fighterId;
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
