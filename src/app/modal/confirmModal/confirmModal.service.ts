import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare var bootstrap: any;

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService {
  private modalElement: HTMLElement | null = null;
  private modalDataSubject = new BehaviorSubject<any>(null);  // Using BehaviorSubject to store modal data
  modalData$ = this.modalDataSubject.asObservable();  // Observable to subscribe to modal data

  constructor() {}

  initializeModal(modalId: string) {
    this.modalElement = document.getElementById(modalId);
    if (this.modalElement) {
      console.log(`Modal with ID "${modalId}" successfully initialized.`);
    } else {
      console.error(`Modal with ID "${modalId}" not found. Make sure it is correctly rendered in the DOM.`);
    }
  }

 async showModal() {
    this.modalElement = null;
   await this.initializeModal('confirmModal')
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
    this.modalDataSubject.next(data);  // Emit new modal data to subscribers
  }
}
