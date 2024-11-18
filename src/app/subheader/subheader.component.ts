import { Component, Input, OnInit } from '@angular/core';
import { SharedDataService } from './shared-data.service';
import { GeneralService } from '../services/general/general.service';
import { Location } from '@angular/common';
import { ConfirmModalService } from '../modal/confirmModal/confirmModal.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

@Component({
  selector: 'app-subheader',
  templateUrl: './subheader.component.html',
  styleUrls: ['./subheader.component.scss']
})
export class SubheaderComponent implements OnInit {
  @Input() username: string = '';
  menuConfig: any = {};
  data: any;
  isAvailable: boolean = false;
  items: any;
  confirmModal: any;
  years: string[] = [];
  classTypes = [{'title':"Upper Basic", value: "bcece"}, { title : 'Middle Basic', value: 'middle basic'}];

  certid: any;
  entity: string;
  selectedValue: any;
  selectedYear: any;
  selectedClassType: any;
  jssid = localStorage.getItem('jssid');
  sssid = localStorage.getItem('ssid');
  storeVal: string;
  jssidValue;
  certidValue;
  subHeaderTitle = '';
  displayUserName: boolean = true;
  isDataAvailable: boolean;
  constructor(private sharedDataService: SharedDataService, private location: Location,
    public toastMsg: ToastMessageService,
    private confirmModalService: ConfirmModalService,private router: Router,
    private generalService: GeneralService) {
    console.log(this.menuConfig);

   console.log(this.sssid + 'ssid');
   console.log(this.jssid + 'jssid');

   if (this?.sssid === 'undefined') {
    this.storeVal = this.jssid;
} else if (this?.jssid === 'undefined') {
    this.storeVal = this.sssid;
}

    console.log(this.storeVal);
    //  this.sharedDataService.setSelectedAcademicYear(this.selectedAcademicYear);

  }

  ngOnInit(): void {

    this.sharedDataService.data$.subscribe(newData => {
      this.data = newData[0];
      this.items = newData[1];
      this.isDataAvailable = false;
      console.log(this.items);
      if (this.items.length > 0) {
        this.isDataAvailable = true;
        console.log('isdata' + this.isDataAvailable);
        this.jssidValue = this.jssid; // Using jssid for the URL
        console.log(this.items[0]);
        this.certidValue = this.items[0]?.certificateNo; // Use certificateId from items
        console.log(this.storeVal, this.certidValue);
      }
     
      if (this.menuConfig){
              this.buildsubMenu()

        this.checkSubHeaderTitle();
       this.isPathAvailable();
      }

    });

    this.sharedDataService.menuConfig$.subscribe(menuConfigData => {
      this.menuConfig = menuConfigData;     
      this.checkSubHeaderTitle();
      this.entity = (localStorage.getItem("entity").toLowerCase());
      if (this.menuConfig.hasOwnProperty('acadmicYearStartWith')) {
        const startYear = this.menuConfig.acadmicYearStartWith;
        const currentYear = new Date().getFullYear();

        // Array to hold the academic years

        // Loop through each year and generate academic year range
        for (let year = currentYear; year >= startYear; year--) {
          let nextYear = year + 1;
          this.years.push(`${year}-${nextYear}`);
        }
      }
      console.log(this.menuConfig);
      this.buildsubMenu()
       this.isPathAvailable();
    });
    
    this.sharedDataService.subHeaderTitle$.subscribe((newSubHeaderTitle) => {
      this.subHeaderTitle = newSubHeaderTitle;
    });
    
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          // Check if menuConfig is available
          if (this.menuConfig) {
            this.isPathAvailable();
          }
          console.log('Route changed!');
        });


    }
  


  buildsubMenu()
  {
    if (this.menuConfig?.subMenus?.left[0]?.redirectTo && this.menuConfig?.subMenus?.left[0]?.redirectTo.includes(":")) {
      let urlParam = this.menuConfig.subMenus.left[0].redirectTo.split("/");
      urlParam.forEach((paramVal, index) => {
        if (paramVal.startsWith(":")) {
          let key = paramVal.substring(1);

          // Replace jssid
          if (key === 'id' &&  ( this.jssidValue || localStorage.getItem('jssid')))  {
            urlParam[index] =  this.jssidValue? `${this.jssidValue}` : localStorage.getItem('jssid'); // Replace with actual jssid
          }

          // Replace certificateId
          if (key === 'certificateId' && this.certidValue) {
            // Use encodeURIComponent to safely pass certidValue
            urlParam[index] = encodeURIComponent(this.certidValue); 
          }
        }
      });
      this.menuConfig.subMenus.left[0].redirectTo = urlParam.join("/");
     
    }
  }

  checkSubHeaderTitle()
  {
    if(this.menuConfig.hasOwnProperty('subHeaderTitleNotshow') && !this.menuConfig.subHeaderTitleNotshow.some(path => (this.location.path()).includes(path)))
    {
        this.displayUserName = false;
        this.subHeaderTitle = localStorage.getItem('subHeaderTitle');
    }else{
      this.displayUserName = true;
    }
  }

 

  isPathAvailable() {
    if (this.menuConfig.hasOwnProperty('subMenus') && this.menuConfig.subMenus.hasOwnProperty('left') && this.menuConfig.subMenus.left.length) {
      const currentPath = this.location.path();
      for(let i = 0; i < this.menuConfig.subMenus.left.length; i++)
      {
        if(this.menuConfig.subMenus.right[i].hasOwnProperty('iscorrectPathToshowBtn') && this.menuConfig.subMenus.left[i].iscorrectPathToshowBtn.some(path => currentPath.includes(path))
        ){
          console.log(this.isDataAvailable);
          this.menuConfig.subMenus.left[i]['showButton'] = true;
      }else

      this.menuConfig.subMenus.left[i]['showButton'] = false;
      
      }
    } 
      if (this.menuConfig.hasOwnProperty('subMenus') && this.menuConfig.subMenus.hasOwnProperty('right') && this.menuConfig.subMenus.right.length) {
      const currentPath = this.location.path();
      for(let i = 0; i < this.menuConfig.subMenus.right.length; i++)
      {
        if(this.menuConfig.subMenus.right[i].hasOwnProperty('iscorrectPathToshowBtn') && this.menuConfig.subMenus.right[i].iscorrectPathToshowBtn.some(path => currentPath.includes(path))
        ){
          this.menuConfig.subMenus.right[i]['showButton'] = true;
      }else

      this.menuConfig.subMenus.right[i]['showButton'] = false
      }
    }

    console.log( this.menuConfig.subMenus);
  }

  doAction(data) {
    // Assuming the API URL and structure
    let params;
    if (data.bodyVal == '*') {
      params = this.items
    }

    if (data.call == 'post') {

      this.generalService.postData(data.api, params, false, true).subscribe(
        (response) => {
          console.log('Upload successful:', response);
          // Handle success response and return to third component
        },
        (error) => {
          console.error('Upload failed:', error);
        }
      );
    }
    else if (data.call == 'delete') {

      params = [
        {
          "osid": "1-7afae6c7-51fc-41e3-a7cb-628e795a037f"
        }
      ];

      this.generalService.delete(data.api, params, false).subscribe(
        (response) => {
          console.log('Upload successful:', response);
          // Handle success response and return to third component
        },
        (error) => {
          console.error('Upload failed:', error);
        }
      );

    }
  }

  onYearChange(event: any): void {
    this.selectedYear = event.target.value;
    console.log("Selected Academic Year:", this.selectedYear);
    // this.sharedDataService.setSelectedAcademicYear(selectedYear);
    let paramf = [{value : this.selectedYear, filter : 'academicYear'},
    {value : this.selectedClassType, filter : 'schoolType'}]
    this.filterChanged(paramf)
    // You can now use 'selectedValue' for further processing
  }

  onClassChange(event: any): void {
    this.selectedClassType = event.target.value;
    console.log("Selected Academic Year:", this.selectedClassType);
    let paramf = [{value : this.selectedYear, filter : 'academicYear'},
    {value : this.selectedClassType, filter : 'schoolType'}]    // this.sharedDataService.setSelectedAcademicYear(selectedValue)
    this.filterChanged(paramf);
  }

  filterChanged(filterValue)
  {
    this.sharedDataService.setSelectedAcademicYear(filterValue);

  }

  confirmModalFun(button) {
    if(button.hasOwnProperty('bodyVal') && button.bodyVal && button.call == 'post')
    {

      if(this.items.length){
    // this.selectItem = proprties.res[button.modal['bodyVal']];

    // if (button['modal'].message.includes('$' + button.modal['bodyVal'])) {
    //   // Reassign the replaced string back to button['modal'].message
    //   button['modal'].message = button['modal'].message.replace('$' + button.modal['bodyVal'], this.selectItem);
    // }

    this.confirmModal = button['modal'];
    // this.currentItem = proprties['res'];
    // setTimeout(() => {
    // this.confirmModalService.initializeModal('confirmModal');
    this.confirmModalService.updateModalData([this.confirmModal, this.items]); // Pass updated data
    this.confirmModalService.showModal();
    }else{
      this.toastMsg.error('error', "No Processing Records Found")
    }
  }
    // }, 500);

  }


}
