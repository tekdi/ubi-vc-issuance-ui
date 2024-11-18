import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general/general.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { SafeUrl } from "@angular/platform-browser";
import { AppConfig } from 'src/app/app.config';
declare var bootstrap: any;
import { Location } from '@angular/common';
import { SharedDataService } from 'src/app/subheader/shared-data.service';
import { LoadingService } from 'src/app/loader/loading.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss']
})
export class PdfViewComponent implements OnInit {
  item: any;
  recordItems: any;
  vcOsid: any;
  headerName: string = 'records'
  //headerName : string = 'issuer';
  newName = "hello";
  documentName: string;
  pdfName: any;
  public data: any;
  sampleData: any;
  schemaContent: any;
  userJson: any;
  templateName: any;
  oldTemplateName: string;
  description: any;
  pdfResponse: any;
  pdfResponse2: any;
  sanitizer: DomSanitizer;
  base64data: any;
  base64String: string;
  imagePath: any;
  modalInstance: any;
  middleUrl = environment.baseUrl;
  entityName =  localStorage.getItem('entity');
  items;
  certid
  jsid;
  constructor(public router: Router, public route: ActivatedRoute, private location: Location,
    private config: AppConfig, private sharedDataService: SharedDataService, private loadingService: LoadingService,
    public translate: TranslateService, sanitizer: DomSanitizer,
    public generalService: GeneralService, public http: HttpClient) {
    this.sanitizer = sanitizer;
    this.documentName = this.route.snapshot.paramMap.get('document') + '/credentials';
    console.log(this.documentName);

    this.route.params.subscribe(params => {
      const paramKeys = Object.keys(params);
      
      // Check if the route has more than 3 parameters
      if (paramKeys.length > 3) {
        this.vcOsid =this.route.snapshot.paramMap.get('id');
    console.log('vcOsid' +this.vcOsid);
      } else {
        this.vcOsid = decodeURIComponent(this.route.snapshot.paramMap.get('id'));
    console.log('vcOsid' + this.vcOsid);
      }
    });
  
   
    // this.jsid = this.route.snapshot.paramMap.get('jssid');

    this.certid = decodeURIComponent(this.route.snapshot.paramMap.get('certificateId'));
    

  }

  async ngOnInit() {

    // if (this.vcOsid.includes('did')) {
    //   this.injectHTML();
    // } else {
    //   this.getPreviewHtml();
    // }
    this.route.params.subscribe(params => {
      const paramKeys = Object.keys(params);
      
      // Check if the route has more than 3 parameters
      if (paramKeys.length > 2)  {
        console.log(this.certid);
        this.injectHTML(this.certid);
      } else {
        console.log(this.vcOsid);
        this.injectHTML(this.vcOsid);
      }
    });
    
  }




  downloadPDF(fileType, tempId) {
    // this.generalService.downloadFile(fileType, '/credentials/credentials/' + this.vcOsid, tempId, 'certificate');
  }


  injectHTML(cert :string) {
    console.log(cert);
    this.pdfName = this.documentName;
    let headerOptions = new HttpHeaders({
      'Accept': 'application/pdf',
       "certificateNo":cert

    });
    let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
  

    // this.http.get(this.middleUrl  + '/' + this.documentName + '/' + this.vcOsid, requestOptions).pipe(map((data: any) => {
    this.http.post(this.middleUrl + '/api/inspector/preview'  ,  {}, { headers: headerOptions,  responseType: 'blob' as 'blob'  }).pipe(map((data: any) => {

      let blob = new Blob([data], {
        type: 'application/pdf' // must match the Accept type
        // type: 'application/octet-stream' // for excel 
      });

      this.pdfResponse = window.URL.createObjectURL(blob);
      this.pdfResponse2 = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfResponse);
      console.log(this.pdfResponse2);
      this.pdfResponse = this.readBlob(blob);
      console.log(this.pdfResponse);
      this.showModal();


    })).subscribe((result: any) => {
    });
  }

  readBlob(blob) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      var base64String = reader.result;
      console.log('Base64 String - ', base64String);
      return base64String;

    }

  }

  onCancel() {
    this.location.back();
    this.modalInstance.hide();
    // Or you can use this.router.navigate(['/specific-route']) to navigate to a specific route
  }

  showModal() {
    // Get the modal element by its ID
    const uploadResultModalElement = document.getElementById('certificateView');

    // Create a new instance of the modal using Bootstrap's JS API
    this.modalInstance = new bootstrap.Modal(uploadResultModalElement);

    // Show the modal
    this.modalInstance.show();
  }

  downloadFile(filepath, item, typeRes) {
    this.generalService.downloadFile(filepath, '/api/inspector/credentials', typeRes, this.certid,false);
  }

  getPreviewHtml(certNo: string) {
    let headerOptions = new HttpHeaders({
      'Accept': 'application/pdf',  
      "certificateNo":certNo
    });

    console.log(certNo + "cert no");
    // Setting the responseType to 'text' because we're fetching HTML, not a blob.
    // let requestOptions = { headers: headerOptions, responseType: 'text' as 'json' };
    // return this.http.post(this.middleUrl + '/inspector/preview/' + this.vcOsid, {}, { headers: headerOptions, responseType: 'text' });

    // this.http.post(this.middleUrl + '/inspector/preview/' + this.vcOsid, requestOptions)
    this.http.post(this.middleUrl + '/api/inspector/preview', {}, { headers: headerOptions, responseType: 'text' }).pipe(
      map((data: string) => {

        // Get the iframe element
        const iframe: HTMLIFrameElement = document.getElementById('iframe2') as HTMLIFrameElement;

        let iframedoc;
        if (iframe.contentDocument) {
          iframedoc = iframe.contentDocument;
        } else if (iframe.contentWindow) {
          iframedoc = iframe.contentWindow.document;
        }

        if (iframedoc) {
          // Inject the HTML content into the iframe
          iframedoc.open();
          iframedoc.write(data);
          this.showModal();

          iframedoc.close();
        } else {
          alert('Cannot inject dynamic contents into iframe.');
        }
      })
    ).subscribe((result: any) => {
      console.log({ result });

      // Handle success
    });
  }

  onApproveCertificate() {
    this.onCancel();
    this.loadingService.show();

    setTimeout(() => {
      this.sharedDataService.emitApproveCertificate();
      setTimeout(() => {
        this.loadingService.hide();
      },200);

    }, 1000);
  
  }

}
