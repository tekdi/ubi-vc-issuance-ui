import { SuccessModalService } from './success.service';
import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedDataService } from 'src/app/subheader/shared-data.service';
@Component({
  selector: 'app-success-modal',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessModalComponent implements AfterViewInit, OnChanges {
  @Input() modalInfo: any = {};
  private modalDataSubscription: Subscription;

  constructor(private smodalService: SuccessModalService, private sharedDataService: SharedDataService,
    public router: Router,
    private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modalInfo) {
      console.log('SModal Info updated:------> ', this.modalInfo?.title);
      this.updateModalData();
    }
  }

  ngOnInit() {
    // Subscribe to modal data changes and update the view when necessary
    this.modalDataSubscription = this.smodalService.modalData$.subscribe(data => {
      if (data) {
        this.modalInfo = data;
        this.cdr.detectChanges(); // Force change detection to update modal content
        console.log('Success Modal Data Received:', this.modalInfo);
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe from the modal data observable when the component is destroyed
    if (this.modalDataSubscription) {
      this.modalDataSubscription.unsubscribe();
    }
  }

  updateModalData() {
    if (this.modalInfo) {
      this.cdr.detectChanges(); // Force change detection to ensure the UI is updated
    }
  }

  ngAfterViewInit(): void {
    this.smodalService.initializeModal('successModal');
  }

  publishEvent()
  {
    this.sharedDataService.triggerOkButtonClick();

  }

  goTo(redirectTo){
    this.router.navigate([redirectTo])

  }
}
