import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ICurrency } from '../interfaces/currency.interface';
import { LoadingService } from '../loading/services/loading/loading.service';
import { ExchangeRateService } from '../services/exchange/exchange-rate.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  dollarSale: number;
  euroSale: number;

  private unsubscribingData$: Subject<void> = new Subject<void>();

  constructor(
    private exchangeRateService: ExchangeRateService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadingService.setValue(true);

    this.exchangeRateService.getCurrencyList().pipe(
      takeUntil(this.unsubscribingData$)
    ).subscribe((currencyList: ICurrency[]) => {
      this.loadingService.setValue(false);

      this.dollarSale = Number(currencyList.filter(el => el.ccy === 'USD')[0].sale);
      this.euroSale = Number(currencyList.filter(el => el.ccy === 'EUR')[0].sale);
    })
  }


  ngOnDestroy(): void {
    this.unsubscribingData$.next();
    this.unsubscribingData$.complete();
  }
}
