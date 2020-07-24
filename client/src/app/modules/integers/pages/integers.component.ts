import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IntegerService } from 'src/app/core/http/integer/integer.service';
import { Integer } from 'src/app/core/models/integer.model';

@Component({
  selector: 'app-integers',
  templateUrl: './integers.component.html',
  styleUrls: ['./integers.component.scss'],
})
export class IntegersComponent implements OnInit, OnDestroy {
  integerObj: Integer;

  private destroy$: Subject<any> = new Subject();

  constructor(private integerService: IntegerService) {}

  ngOnInit(): void {
    this.fetchCurrentInteger();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public fetchCurrentInteger(): void {
    this.integerService
      .getCurrentInteger()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.integerObj = results;
      });
  }

  public nextInteger(): void {
    this.integerService
      .getNextInteger()
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.integerObj = results;
      });
  }
}
