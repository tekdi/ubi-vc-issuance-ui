import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare var bootstrap: any; // Declare bootstrap for global use

@Injectable({
  providedIn: 'root',
})
export class SuccessModalService {
  private modalElement: HTMLElement | null = null;
  private modalDataSubject = new BehaviorSubject<any>(null);
  modalData$ = this.modalDataSubject.asObservable();

  constructor() {}

  initializeModal(modalId: string) {
    // setTimeout(() => {
      this.modalElement = document.getElementById(modalId);
      if (this.modalElement) {
        console.log(`Modal with ID "${modalId}" successfully initialized.`);
      } else {
        console.error(`Modal with ID "${modalId}" not found. Make sure it is correctly rendered in the DOM.`);
      }
    // }, 900);
  }

  showModal() {
    if (this.modalElement) {
      const modal = new bootstrap.Modal(this.modalElement);
      modal.show();
    } else {
      console.error('Modal element not initialized.');
    }
  }

  hideModal() {
    if (this.modalElement) {
      const modal = new bootstrap.Modal(this.modalElement);
      modal.hide();
    }
  }

  updateModalData(data: any) {
    this.modalDataSubject.next(data); // Emit new data to all subscribers
  }
}
