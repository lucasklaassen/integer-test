import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-integers',
  templateUrl: './integers.component.html',
  styleUrls: ['./integers.component.scss'],
})
export class IntegersComponent implements OnInit, OnDestroy {
  // integer: Integer;

  private destroy$: Subject<any> = new Subject();

  constructor() {} // private integerService: IntegerService

  ngOnInit(): void {
    console.log('loading component');
    // this.fetchCurrentInteger();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public fetchCurrentInteger(): void {}
}
