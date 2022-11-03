import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ExchangeRateService } from './services/exchange-rate.service';
import { ICurrency } from './services/shared/currency.interface';
import { ExchangeRateEnum } from './services/shared/exchangeRate.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  currencyList: ICurrency[];
  exchangeMap: Map<string, number> = new Map<string, number>();
  exchangeRate: number = 0;

  exchangeForm: FormGroup;

  private unsubscribingData$: Subject<void> = new Subject<void>();

  constructor(
    private exchangeRateService: ExchangeRateService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.exchangeRateService.getCurrencyList().pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe((currencyList: ICurrency[]) => {
      this.currencyList = currencyList;

      this.exchangeMap.set(ExchangeRateEnum.USDUSD, 1)
      this.exchangeMap.set(ExchangeRateEnum.USDEUR,
        Number(this.currencyList.filter(el => el.ccy === 'USD')[0].sale) / Number(this.currencyList.filter(el => el.ccy === 'EUR')[0].sale));
      this.exchangeMap.set(ExchangeRateEnum.USDUAH, Number(this.currencyList.filter(el => el.ccy === 'USD')[0].sale));

      this.exchangeMap.set(ExchangeRateEnum.EURUSD,
        Number(this.currencyList.filter(el => el.ccy === 'EUR')[0].sale) / Number(this.currencyList.filter(el => el.ccy === 'USD')[0].sale));
      this.exchangeMap.set(ExchangeRateEnum.EUREUR, 1);
      this.exchangeMap.set(ExchangeRateEnum.EURUAH, Number(this.currencyList.filter(el => el.ccy === 'EUR')[0].sale));

      this.exchangeMap.set(ExchangeRateEnum.UAHUSD, 1 / Number(this.currencyList.filter(el => el.ccy === 'USD')[0].sale));
      this.exchangeMap.set(ExchangeRateEnum.UAHEUR, 1 / Number(this.currencyList.filter(el => el.ccy === 'EUR')[0].sale));
      this.exchangeMap.set(ExchangeRateEnum.UAHUAH, 1);
      console.log(this.exchangeMap);


      let currentExchangeRAte = this.exchangeMap.get('UAH-USD');
      if (currentExchangeRAte) {
        this.exchangeRate = currentExchangeRAte;
      }

    });

    this.exchangeForm = this.formBuilder.group({
      currencyAmmountA: [0, Validators.required],
      currencyTypeA: ['UAH', Validators.required],
      currencyAmmountB: [0, Validators.required],
      currencyTypeB: ['USD', Validators.required]
    })

    this.exchangeForm.get('currencyAmmountA')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyAmmountA => {
      let key = `${this.exchangeForm.get('currencyTypeA')?.value}-${this.exchangeForm.get('currencyTypeB')?.value}`
      this.setExchangeRate(key)
      this.exchangeForm.get('currencyAmmountB')?.setValue(currencyAmmountA * this.exchangeRate, { emitEvent: false })
    });

    this.exchangeForm.get('currencyAmmountB')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyAmmountB => {
      let key = `${this.exchangeForm.get('currencyTypeB')?.value}-${this.exchangeForm.get('currencyTypeA')?.value}`
      this.setExchangeRate(key)
      this.exchangeForm.get('currencyAmmountA')?.setValue(currencyAmmountB * this.exchangeRate, { emitEvent: false })
    });

    this.exchangeForm.get('currencyTypeA')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyTypeA => {
      let key = `${currencyTypeA}-${this.exchangeForm.get('currencyTypeB')?.value}`;
      this.setExchangeRate(key)
    })

    this.exchangeForm.get('currencyTypeB')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyTypeB => {
      let key = `${currencyTypeB}-${this.exchangeForm.get('currencyTypeA')?.value}`;
      this.setExchangeRate(key)
    })
  }

  setExchangeRate(key: string) {
    let currentExchangeRAte = this.exchangeMap.get(key);
    if (currentExchangeRAte) {
      this.exchangeRate = currentExchangeRAte;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribingData$.next();
    this.unsubscribingData$.complete();
  }

}

