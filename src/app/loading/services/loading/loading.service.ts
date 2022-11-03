import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  setValue(value: boolean): void {
    this.isLoading$.next(value);
  }

  getIsLoadingValue(): BehaviorSubject<boolean> {
    return this.isLoading$;
  }
}
