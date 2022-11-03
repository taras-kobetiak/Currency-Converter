import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ExchangeRateEnum } from '../constants/exchangeRate.enum';
import { ICurrency } from '../interfaces/currency.interface';
import { LoadingService } from '../loading/services/loading/loading.service';
import { ExchangeRateService } from '../services/exchange/exchange-rate.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  currencyList: ICurrency[];
  exchangeMap: Map<string, number> = new Map<string, number>();
  exchangeRate: number = 0;

  pair: string;
  reversePair: string;

  exchangeForm: FormGroup;

  private unsubscribingData$: Subject<void> = new Subject<void>();

  constructor(
    private exchangeRateService: ExchangeRateService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.exchangeRateService.getCurrencyList().pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe((currencyList: ICurrency[]) => {
      this.currencyList = currencyList;
      this.createExchangeMap(this.currencyList);
    });

    this.createInitialPair();
    this.createExchangeForm();

    this.currencyAmmountFromSubscribe();
    this.currencyAmmountToSubscribe();
    this.currencyTypeFromSubscribe();
    this.currencyTypeToSubscribe();
  }

  currencyAmmountFromSubscribe(): void {
    this.exchangeForm.get('currencyAmmountFrom')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyAmmountFrom => {
      this.createPair();
      this.setExchangeRate(this.pair)
      this.exchangeForm.get('currencyAmmountTo')?.setValue((currencyAmmountFrom
        * this.exchangeRate), { emitEvent: false })
    });
  }

  currencyAmmountToSubscribe(): void {
    this.exchangeForm.get('currencyAmmountTo')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyAmmountTo => {
      this.createPair()

      this.setExchangeRate(this.reversePair);
      this.exchangeForm.get('currencyAmmountFrom')?.setValue(currencyAmmountTo * this.exchangeRate, { emitEvent: false })
    });
  }

  currencyTypeFromSubscribe(): void {
    this.exchangeForm.get('currencyTypeFrom')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(() => {
      this.createPair()

      this.setExchangeRate(this.pair);

      // this.exchangeForm.get('currencyAmmountTo')?.setValue(this.exchangeForm.get('currencyAmountFrom')?.value * this.exchangeRate)
    })
  }

  currencyTypeToSubscribe(): void {
    this.exchangeForm.get('currencyTypeTo')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(() => {
      this.createPair()
      this.setExchangeRate(this.reversePair);
    })
  }


  createExchangeForm(): void {
    this.exchangeForm = this.formBuilder.group({
      currencyAmmountFrom: [0, Validators.required],
      currencyTypeFrom: ['UAH', Validators.required],
      currencyAmmountTo: [0, Validators.required],
      currencyTypeTo: ['USD', Validators.required]
    })
  }

  createInitialPair(): void {
    this.pair = 'UAH-USD'
    this.reversePair = 'USD-UAH'
  }

  createPair(): void {
    this.pair = `${this.exchangeForm.get('currencyTypeFrom')?.value}-${this.exchangeForm.get('currencyTypeTo')?.value}`
    this.reversePair = `${this.exchangeForm.get('currencyTypeTo')?.value}-${this.exchangeForm.get('currencyTypeFrom')?.value}`
  }

  // createReversePair(currencyFrom: string, currencyTo: string): void {
  //   this.reversePair = `${currencyFrom}-${currencyTo}`
  // }

  setExchangeRate(pair: string): void {
    let currentExchangeRAte = this.exchangeMap.get(pair);
    if (currentExchangeRAte) {
      this.exchangeRate = currentExchangeRAte;
    }
  }

  createExchangeMap(currencyList: ICurrency[]) {
    this.exchangeMap.set(ExchangeRateEnum.USDUSD, 1)
    this.exchangeMap.set(ExchangeRateEnum.USDEUR,
      Number(currencyList.filter(el => el.ccy === 'USD')[0].sale) / Number(currencyList.filter(el => el.ccy === 'EUR')[0].sale));
    this.exchangeMap.set(ExchangeRateEnum.USDUAH, Number(currencyList.filter(el => el.ccy === 'USD')[0].sale));

    this.exchangeMap.set(ExchangeRateEnum.EURUSD,
      Number(currencyList.filter(el => el.ccy === 'EUR')[0].sale) / Number(currencyList.filter(el => el.ccy === 'USD')[0].sale));
    this.exchangeMap.set(ExchangeRateEnum.EUREUR, 1);
    this.exchangeMap.set(ExchangeRateEnum.EURUAH, Number(currencyList.filter(el => el.ccy === 'EUR')[0].sale));

    this.exchangeMap.set(ExchangeRateEnum.UAHUSD, 1 / Number(currencyList.filter(el => el.ccy === 'USD')[0].sale));
    this.exchangeMap.set(ExchangeRateEnum.UAHEUR, 1 / Number(currencyList.filter(el => el.ccy === 'EUR')[0].sale));
    this.exchangeMap.set(ExchangeRateEnum.UAHUAH, 1);
  }

  ngOnDestroy(): void {
    this.unsubscribingData$.next();
    this.unsubscribingData$.complete();
  }

}
