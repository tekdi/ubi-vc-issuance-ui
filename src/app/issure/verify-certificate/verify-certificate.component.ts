


import { Component, OnInit, Renderer2 } from '@angular/core';
import { SuccessModalService } from '../../modal/success/success.service';

import { VerifyService } from './verify.service';
import { GeneralService } from 'src/app/services/general/general.service';
//  const { createCanvas, loadImage } = require('canvas');
//  const { scanImageData } = require('zbar-angular.wasm');
import { AppConfig } from 'src/app/app.config';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'verify-vc',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.scss']
})
export class VerifyCertificateComponent implements OnInit {
  itemData: any;
  baseUrl = this.config.getEnv('baseUrl');
  uploadProgress: number = 30;
  selectedFile: File | null = null;
  middleUrl = environment.baseUrl;
  isVerifyModal = true;
  modalInfo: any = {
    "title": "Result Uploaded successfully",
    "redirectTo": "/profile/student",
    "image": "assets/images/success.png",
    "Buttons": [{
      "title": "Done",
      "redirectTo": "/profile/student",
    }]
  };
  uniqueId: string;
  isModalVisible: boolean;
  issueDate: any;

  constructor(private renderer: Renderer2, public generalService: GeneralService,
    private config: AppConfig, private toastMsg: ToastMessageService,
    private successModalService: SuccessModalService, public verifyService: VerifyService) {

    if(localStorage.getItem('entity') == null || !localStorage.getItem('entity')){
    const subheader = this.renderer.selectRootElement('.subheader', true);
    if (subheader) {
      this.renderer.setStyle(subheader, 'display', 'none');
    }
    

    const sideMenu = this.renderer.selectRootElement('.layout-container', true);
    if (sideMenu) {
      this.renderer.setStyle(sideMenu, 'display', 'none');
    }
    }
  }


  async scanHandler($event: any) {
    this.verifyService.configData = this.itemData
    console.log(this.verifyService.configData);
    this.verifyVc(await this.verifyService.scanSuccessHandler($event, this.itemData), 'scan');

  }

  openScanner() {
    this.verifyService.enableScanner();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  ngOnInit(): void {

    this.itemData =
    {
      "scanner_type": "ZBAR_QRCODE",
      "showResult": [
        { "title": "Candidate No", "path": "credentialSubject.candidateNo" },
        { "title": "Certificate No", "path": "credentialSubject.certificateNo", "removeStr": "did:abha:" },
        { "title": "Name", "path": ["credentialSubject.firstName", "credentialSubject.middleName", "credentialSubject.lastName"] },
        { "title": "Degree", "path": "credentialSubject.degree" },
        { "title": "Academic Year", "path": "credentialSubject.academicYear" },
        { "title": "Email", "path": "credentialSubject.email" },
        { "title": "Phone Number", "path": "credentialSubject.phoneNumber" },
        { "title": "Issue Date", "path": "issuanceDate", 'type': 'date'  },

      ],
      "scanNote": "To verify pledge certificate, simply scan the QR code thats on the document.",
      "certificateTitle": 'Pledge Certificate',
      "verify_another_Certificate": 'Verify another Certificate',
      "cetificate_not_valid": 'This Certificate is not valid',
      "scan_qrcode_again": "Please scan QR code again"
    }


  }


  onClose() {
    this.selectedFile = null;
    this.uploadProgress = 0;
    // You can also add any additional logic to handle closing the box
  }

  hideModal() {
    this.uniqueId = '';
    this.isModalVisible = false;
    this.isVerifyModal = true;

    this.verifyService.scannerEnabled = false;
    this.verifyService.notValid = false;
  }


  doVerify() {
    let body = {
      "filters": {
        "certificateNo": {
            "eq": this.uniqueId
        }
      }
    }
     this.generalService.postData(environment.baseUrl + '/registry/api/v1/Results/search',body).subscribe((res) => {
      if (res.hasOwnProperty('data')) {

          this.verifyVc( res.data[0].certificateId, 'uniqueId')
          this.issueDate = res.data[0].examDate;
          console.log(this.issueDate)
      }})
   

  }

  verifyVc(uniqueIdorUrl, type) {
    let uniqueId , url, isMiddleUrl;
    if (type == 'uniqueId') {
      uniqueId = uniqueIdorUrl;
       url = "credentials/credentials/" + uniqueIdorUrl + "/verify";
       isMiddleUrl = true;
    } else {
      url = uniqueIdorUrl;
      let segments = url.split('/');
       uniqueId = segments.find(segment => segment.startsWith('did:'));
       isMiddleUrl = false;

    }

    this.generalService.getData(url, true, null, isMiddleUrl).subscribe((res) => {
      if (res.status === 'ISSUED') {

        let vcUrl =  "credentials/credentials/" + uniqueId;
        this.generalService.getData(vcUrl, true, null, true).subscribe((res) => {
          console.log({ res });
          this.isVerifyModal = false;
          this.isModalVisible = true;

          this.verifyService.readData(res, this.itemData);

        }, error => {
          this.verifyService.scannerEnabled = false;
          this.verifyService.notValid = true;
          console.log('error', error);

        });


      }
    }, err => {
      this.verifyService.scannerEnabled = false;
      this.verifyService.notValid = true;
        this.toastMsg.error('error', err.error.params.errmsg);
  
      
      console.log('error', err);
    });
  }


}

