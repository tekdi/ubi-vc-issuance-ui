import { Component, Input, Renderer2, AfterViewInit  } from '@angular/core';
import { SuccessModalService } from '../modal/success/success.service';
import { Router } from '@angular/router';
declare var bootstrap: any;
import { Location } from '@angular/common';
import { UploadService } from '../services/upload-result/upload-result.service';
import { GeneralService } from '../services/general/general.service';
import { ConfirmModalService } from '../modal/confirmModal/confirmModal.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';



@Component({
  selector: 'upload-result',
  templateUrl: './upload-result.component.html',
  styleUrls: ['./upload-result.component.scss']
})
export class UploadResultCompoenent {


  startYear = 2019;
  years: string[] = [];
  classTypes = ['Upper Basic', 'Middle Basic'];

  selectedAcademicYear: string | null = null;
  selectedClassType: string | null = null;
  selectedFile: File | null = null;
  
  uploadProgress: number = 0;
  isDragging: boolean = false;
  isUploading: boolean = false;
  uploadComplete: boolean = false;
  modalInstance: any;
  classType:string;
  // Error flags
  showAcademicYearError: boolean = false;
  showClassTypeError: boolean = false;
  showFileError: boolean = false;
  confirmToupload: boolean = false;


  private uploadResultModalElement: HTMLElement | null = null;
  modalInfo : any  = {
    "title": "Result uploaded, awaiting approval from the Inspectors",
    "redirectTo": "/Examiner/list/Examiner",
    "image" : "assets/images/success.png",
    "Buttons" : [{
        "title": "OK",
        "redirectTo": "/Examiner/list/Examiner",
    }]};

    cmodalInfo : any  = {
      "title": "Confirm Approval",
      "titleCss": "titleClr-g",
      "bodyVal": [
          "schoolId"
      ],
      "message": "Confirm you are uploading results",
      "buttons": [
          {
              "title": "Yes",
              "classes": "btn-primary dsn-g-btn",
              "action": "redirect",
              "call": "post",
              "redirectTo": "/Examiner/list/Examiner/action/upload-result",
              "successModal": true,
          },
          {
              "title": "Cancel",
              "action": "redirect",
              "redirectTo": "/Examiner/list/Examiner",
          }
      ]
  };
  isError: boolean;
  subSuccess: any;
  subFailed: any;

  constructor(private renderer: Renderer2,private router: Router,private location: Location,
    public toastMsg: ToastMessageService,
   public uploadService: UploadService, public generalService: GeneralService,
private successModalService: SuccessModalService, private confirmModalService: ConfirmModalService) {

  const startYear = this.startYear;
  const currentYear = new Date().getFullYear();

  // Array to hold the academic years

  // Loop through each year and generate academic year range
  for (let year = currentYear; year >= startYear; year--) {
    let nextYear = year + 1;
    this.years.push(`${year}-${nextYear}`);
  }

    // const subheader = this.renderer.selectRootElement('.subheader', true);
    // if (subheader) {
    //   this.renderer.setStyle(subheader, 'display', 'none');
    // }
  }

  ngAfterViewInit() {
    this.showModal();
      
  }

  onCancel() {
    this.onClose();
    this.router.navigate(['/Examiner/list/Examiner'])
    this.location.back();    // Or you can use this.router.navigate(['/specific-route']) to navigate to a specific route
  }

  showModal() {
    // Get the modal element by its ID
    const uploadResultModalElement = document.getElementById('uploadResult');
    
    // Create a new instance of the modal using Bootstrap's JS API
    this.modalInstance = new bootstrap.Modal(uploadResultModalElement);
    
    // Show the modal
    this.modalInstance.show();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      this.selectedFile = file;
      this.showFileError = false; // Hide error if a valid CSV is selected
    } else {
      this.selectedFile = null;
      this.showFileError = true;  // Show error if the selected file is not a CSV
    }
  }

  

  onClose() {
    this.selectedFile = null;
    this.uploadProgress = 0;
    // You can also add any additional logic to handle closing the box
  }


  onCancel1()
  {
    this.successModalService.initializeModal('successModal');

    this.successModalService.showModal();

  }

  validateAndUpload() {
    // Reset error flags
    this.showAcademicYearError = false;
    this.showClassTypeError = false;

    // Validation for academic year and class type
    if (!this.selectedAcademicYear) {
      this.showAcademicYearError = true;
    }

    if (!this.selectedClassType) {
      this.showClassTypeError = true;
    }

    // If validation passes, proceed with file upload
    if (this.selectedAcademicYear && this.selectedClassType && this.selectedFile) {
      this.conformationPop();
    }
  }


  conformationPop()
  {
    this.confirmToupload = true;
  }

  uploadFile() {
  //  this.confirmToupload = false;
  this.confirmToupload = false;

    const uploadUrl = 'api/examiner/uploadResult';
    this.isUploading = true;

    if (this.selectedClassType === 'Upper Basic') {
      this.classType = 'bcece';
  } else if (this.selectedClassType === 'Middle Basic') {
      this.classType = 'middle basic';
  }
    const params = {
      academicYear: this.selectedAcademicYear,
      classType: this.classType,
      file: this.selectedFile
    };

    this.uploadService.uploadFile(params, uploadUrl).subscribe(
      (event: any) => {
        if (event.status === 'progress') {
          this.uploadProgress = event.message;  // Progress percentage
        } else if (event.status === 'complete') {

          this.subSuccess = event?.message?.fulfilledCount;
          this.subFailed = event?.message?.rejectedCount ;

          if(event.hasOwnProperty('message') && event.message.hasOwnProperty('error'))
          {
            this.uploadComplete = false;
            this.isUploading = false;
            this.isError = true;
            this.confirmToupload = false;
            this.toastMsg.error('error',event.message.error);
          }else{
          this.uploadProgress = 100;

          setTimeout(() => {
            this.uploadComplete = true;
            this.isUploading = false;
            this.confirmToupload = false;
          }, 1000);
        }
        }
      },
      (err) => {
        this.uploadComplete = false;
        this.isUploading = false;
        this.isError = true;
        this.confirmToupload = false;
        this.toastMsg.error('error',"An error occurred during file upload. Please try again.");
        console.error('Upload failed:', err);
      }
    );
  }



    onDragOver(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = true;
    }
  
    // Handle when the drag leaves the element
    onDragLeave(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
    }
  
    // Handle the drop event
    onDrop(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
  
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.name.endsWith('.csv')) {
          this.selectedFile = file;
          this.showFileError = false;
        } else {
          this.selectedFile = null;
          this.showFileError = true;
        }
      }
    }
   
}
