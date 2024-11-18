import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ConfirmModalService } from './confirmModal.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { Router } from '@angular/router';
import { SuccessModalService } from '../success/success.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirmModal.component.html',
  styleUrls: ['./confirmModal.component.scss']
})
export class ConfirmModalComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() cmodalInfo: any = {};  // Assuming it's for initial modal data, but BehaviorSubject will manage updates
  @Input() item: any = {};  // Additional input for item

  private modalDataSubscription: Subscription;
  successModalInfo: any;

  constructor(
    private cmodalService: ConfirmModalService,
    private successModalService: SuccessModalService,
    public generalService: GeneralService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.cmodalService.initializeModal('confirmModal');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.cmodalInfo) {
      this.updateModalData();  // Update modal data when input changes
    }
  }

  ngOnInit() {
    // Subscribe to modal data changes using BehaviorSubject
    this.modalDataSubscription = this.cmodalService.modalData$.subscribe(data => {
      if (data) {
        this.cmodalInfo = data[0];  // Update the modal title and description dynamically
        if (data[1]) {
          this.item = data[1];  // Update item if provided
        }
        this.cdr.detectChanges();  // Force change detection to update modal content
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.modalDataSubscription) {
      this.modalDataSubscription.unsubscribe();
    }
  }

  updateModalData() {
    if (this.cmodalInfo) {
      this.cdr.detectChanges();  // Ensure the UI updates with the new data
    }
  }

  actionFun(data, item) {
    if(item)
    {
      this.item = item;
    }
    if (data.action === 'requestCall' && data?.call === 'delete') {
      this.generalService.delete(data.api + this.item['osid']).subscribe((res) => {
        if (res.length > 0) {
          if (data['successModal']) {

            let selectItem
            if(this.item.length > 0){
               selectItem = this.item[0][data.modal['bodyVal']];

            }else{
             selectItem = this.item[data.modal['bodyVal']];
            }

            if (data['modal'].title.includes('$' + data.modal['bodyVal'])) {
              // Reassign the replaced string back to button['modal'].title
              data['modal'].title = data['modal'].title.replace('$' + data.modal['bodyVal'], selectItem);
            }
    
            
            this.successModalInfo = data['modal'];
            console.log(this.successModalInfo);
              // this.successModalService.initializeModal('successModal');
              this.successModalService.updateModalData(this.successModalInfo);
              this.successModalService.showModal();
          }
        }
      });
    }else  if (data.action === 'requestCall' && data?.call === 'post') {
      this.generalService.postData(data.api, this.item, true, true).subscribe((res) => {
        if (res.length || res.params.status === 'SUCCESSFUL') {
          if (data['successModal']) {
            let selectItem
            if(this.item.length > 0){
               selectItem = this.item[0][data.modal['bodyVal']];

            }else{
             selectItem = this.item[data.modal['bodyVal']];
            }

            if (data['modal'].title.includes('$' + data.modal['bodyVal'])) {
              // Reassign the replaced string back to button['modal'].title
              data['modal'].title = data['modal'].title.replace('$' + data.modal['bodyVal'], selectItem);
            }
    
            
            this.successModalInfo = data['modal'];
            console.log(this.successModalInfo);
              // this.successModalService.initializeModal('successModal');
              this.successModalService.updateModalData(this.successModalInfo);
              setTimeout(() => {
                this.successModalService.showModal();

              }, 300);
          }
        }
      });
    }else if(data.action ==  "redirect"){
      this.router.navigate([data['redirectTo']])

    }else{
      this.cmodalService.hideModal();

    }
  }
}
