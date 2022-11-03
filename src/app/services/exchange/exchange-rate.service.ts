import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICurrency } from '../../interfaces/currency.interface';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  constructor(private http: HttpClient) { }

  getCurrencyList(): Observable<ICurrency[]> {
    return this.http.get<ICurrency[]>('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
  }
}
