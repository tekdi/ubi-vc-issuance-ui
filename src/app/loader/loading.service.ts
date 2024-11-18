import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCounter = 0;
  private isLoading = new Subject<boolean>();

  loadingStatus = this.isLoading.asObservable();

  show() {
    this.loadingCounter++;
    this.updateLoadingStatus();
  }

  hide() {
    if (this.loadingCounter > 0) {
      this.loadingCounter--;
    }
    this.updateLoadingStatus();
  }

  private updateLoadingStatus() {
    // Show the loader if there are ongoing API calls, otherwise hide it
    this.isLoading.next(this.loadingCounter > 0);
  }
}
