import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IntegerService } from 'src/app/core/http/integer/integer.service';
import { Integer } from 'src/app/core/models/integer.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { plainToClass } from 'class-transformer';

@Component({
  selector: 'app-integers',
  templateUrl: './integers.component.html',
  styleUrls: ['./integers.component.scss'],
})
export class IntegersComponent implements OnInit, OnDestroy {
  public integerObj: Integer;
  public integerForm: FormGroup;
  public formSubmitted = false;
  public apiErrors: Array<string>;

  private destroy$: Subject<any> = new Subject();

  constructor(
    private integerService: IntegerService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.fetchCurrentInteger();
    this.buildForm();
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

  public submitForm(): void {
    this.formSubmitted = true;
    if (this.integerForm.invalid) {
      return;
    }
    const formModel = this.integerForm.value;
    const newInteger: Integer = plainToClass(Integer, {
      integerValue: +formModel.integerValue,
    });

    this.integerService.updateInteger(newInteger).subscribe((results) => {
      if (results.errors) {
        this.apiErrors = results.errors;
      } else {
        this.apiErrors = [];
        this.integerObj = results;
        this.formSubmitted = false;
      }
    });
  }

  private buildForm(): void {
    this.integerForm = this.formBuilder.group({
      integerValue: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
    });
  }
}
