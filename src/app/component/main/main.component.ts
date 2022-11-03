import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ExchangeRateEnum } from '../../constants/exchangeRate.enum';
import { ICurrency } from '../../interfaces/currency.interface';
import { ExchangeRateService } from '../../services/exchange/exchange-rate.service';

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

    this.currencyAmountFromSubscribe();
    this.currencyAmountToSubscribe();
    this.currencyTypeFromSubscribe();
    this.currencyTypeToSubscribe();
  }

  currencyAmountFromSubscribe(): void {
    this.exchangeForm.get('currencyAmountFrom')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyAmountFrom => {


      this.createPair();
      this.setExchangeRate(this.pair)
      this.exchangeForm.get('currencyAmountTo')?.setValue(Math.round(currencyAmountFrom
        * this.exchangeRate * 100) / 100, { emitEvent: false })
    });
  }

  currencyAmountToSubscribe(): void {
    this.exchangeForm.get('currencyAmountTo')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(currencyAmountTo => {
      this.createPair();
      this.setExchangeRate(this.reversePair);
      this.exchangeForm.get('currencyAmountFrom')?.setValue(Math.round(currencyAmountTo * this.exchangeRate * 100) / 100,
        { emitEvent: false })
    });
  }

  currencyTypeFromSubscribe(): void {
    this.exchangeForm.get('currencyTypeFrom')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(() => {
      this.createPair();
      this.setExchangeRate(this.pair);

      this.exchangeForm.get('currencyAmountTo')?.setValue(Math.round(this.exchangeForm.get('currencyAmountFrom')?.value
        * this.exchangeRate * 100) / 100, { emitEvent: false })
    })
  }

  currencyTypeToSubscribe(): void {
    this.exchangeForm.get('currencyTypeTo')?.valueChanges.pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe(() => {
      this.createPair()
      this.setExchangeRate(this.reversePair);

      this.exchangeForm.get('currencyAmountFrom')?.setValue(Math.round(this.exchangeForm.get('currencyAmountTo')?.value
        * this.exchangeRate * 100) / 100, { emitEvent: false })
    })
  }


  createExchangeForm(): void {
    this.exchangeForm = this.formBuilder.group({
      currencyAmountFrom: [0, Validators.required],
      currencyTypeFrom: ['UAH', Validators.required],
      currencyAmountTo: [0, Validators.required],
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

  setExchangeRate(pair: string): void {
    let currentExchangeRate = this.exchangeMap.get(pair);
    if (currentExchangeRate) {
      this.exchangeRate = currentExchangeRate;
    }
  }

  setCurrentExchangeRate(pair: string): void {
    this.createPair();
    this.setExchangeRate(pair);
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
