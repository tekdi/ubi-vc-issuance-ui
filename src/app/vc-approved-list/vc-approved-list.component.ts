import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";

import { ConfirmModalService } from "../modal/confirmModal/confirmModal.service";
import { GeneralService } from "src/app/services/general/general.service";
import { DataService } from "src/app/services/data/data-request.service";
import { CsvService } from "src/app/services/csv/csv.service";
import { AppConfig } from "src/app/app.config";
import { LoadingService } from "../loader/loading.service";
import { SharedDataService } from "../subheader/shared-data.service";
import { ToastMessageService } from "../services/toast-message/toast-message.service";
import { Observable } from "rxjs";
declare var bootstrap: any;
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { map } from "rxjs/operators";

@Component({
  selector: "app-vc-approved-list",
  templateUrl: "./vc-approved-list.component.html",
  styleUrls: ["./vc-approved-list.component.scss"],
})
export class VcApprovedListComponent implements OnInit {
  @Input() menuConfig: any = {};
  activeMenu: any;
  modalInfo: any;
  domain: string = environment.baseUrl;
  menuConfigData: any;
  certificateList: any[] = []; // Holds the API response
  certificates: any[] = [];
  selectedCourse: any;
  schoolId = localStorage.getItem("schoolId")
    ? localStorage.getItem("schoolId")
    : localStorage.getItem("selectedItem");
  subHeaderTitle = localStorage.getItem("subHeaderTitle");
  pdfResponse: any;
  pdfResponse2: any;
  pdfName: any;
  documentName: string;
  sanitizer: DomSanitizer;
  vcOsid: any;
  certid;
  middleUrl = environment.baseUrl;

  // Table schema for rendering the certificate list
  tableSchema = {
    fields: [
      { key: "firstName", label: "First Name" },
      { key: "certificateNo", label: "Certificate No." },
      { key: "status", label: "Status" },
      {
        key: "action",
        type: "button",
        buttons: [
          { label: "Download Certificate", action: "Download Certificate" },
        ],
      },
    ],
  };

  constructor(
    private router: Router,
    private confirmModalService: ConfirmModalService,
    private sharedDataService: SharedDataService,
    private dataService: DataService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private generalService: GeneralService,
    private csvService: CsvService,
    private toastMsg: ToastMessageService,
    private httpClient: HttpClient,
    sanitizer: DomSanitizer,
    public route: ActivatedRoute
  ) {
    this.sanitizer = sanitizer;
    this.documentName =
      this.route.snapshot.paramMap.get("document") + "/credentials";

    this.route.params.subscribe((params) => {
      const paramKeys = Object.keys(params);

      // Check if the route has more than 3 parameters
      if (paramKeys.length > 3) {
        this.vcOsid = this.route.snapshot.paramMap.get("id");
      } else {
        this.vcOsid = decodeURIComponent(
          this.route.snapshot.paramMap.get("id")
        );
      }
    });

    // this.jsid = this.route.snapshot.paramMap.get('jssid');

    this.certid = decodeURIComponent(
      this.route.snapshot.paramMap.get("certificateId")
    );
  }

  loadCertificates(): void {
    this.http
      .get<any[]>("../../assets/config/ui-config/certificateList.json")
      .subscribe(
        (data) => {
          this.certificates = data;
        },
        (error) => {
          console.error("Error loading certificates:", error);
        }
      );
  }

  ngOnInit(): void {
    this.loadCertificates();
    this.subscribeToMenuConfig();
  }

  /**
   * Subscribe to menu configuration updates
   */
  private subscribeToMenuConfig(): void {
    this.sharedDataService.menuConfig$.subscribe((menuConfigData) => {
      this.menuConfigData = menuConfigData;
    });
  }

  onDocumentChange(event: any): void {
    this.selectedCourse = event.target.value;

    if (this.selectedCourse) {
      // Call API to get filtered data
      this.getFilteredCertificates();
    }
  }

  getFilteredCertificates(): void {
    // Prepare API payload

    const payload = {
      offset: 0,
      limit: 1000,
      filters: {
        status: { eq: "issued" },
      },
    };

    // API URL
    const apiUrl = `registry/api/v1/${this.selectedCourse}/search`;

    // Call API and handle response
    this.post(apiUrl, payload).subscribe(
      (response: any) => {
        // Assuming the response contains the filtered certificates
        this.certificateList = response;
      },
      (error) => {
        console.error("Error fetching filtered data:", error);
      }
    );
  }

  post(url: string, payload: any): Observable<any> {
    return this.http.post(url, payload);
  }

  preview(item: any): void {
    const modalElement = document.getElementById("certificateView");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  onCancel(): void {
    const modalElement = document.getElementById("certificateView");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  }

  injectHTML(cert: string) {
    this.pdfName = this.documentName;
    const doctype = this.sharedDataService.getSelectedDoc() || "marksheet";

    let headerOptions = new HttpHeaders({
      Accept: "application/pdf",
      certificateNo: cert,
      doctype: doctype,
    });

    let requestOptions = {
      headers: headerOptions,
      responseType: "blob" as "blob",
    };
    // post or get depending on your requirement

    // this.http.get(this.middleUrl  + '/' + this.documentName + '/' + this.vcOsid, requestOptions).pipe(map((data: any) => {
    this.http
      .post(
        this.middleUrl + "/api/inspector/preview",
        {},
        { headers: headerOptions, responseType: "blob" as "blob" }
      )
      .pipe(
        map((data: any) => {
          let blob = new Blob([data], {
            type: "application/pdf", // must match the Accept type
            // type: 'application/octet-stream' // for excel
          });

          this.pdfResponse = window.URL.createObjectURL(blob);
          this.pdfResponse2 = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.pdfResponse
          );
          this.pdfResponse = this.readBlob(blob);
          //this.showModal();
        })
      )
      .subscribe((result: any) => {});
  }
  readBlob(blob) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      var base64String = reader.result;
      return base64String;
    };
  }

  getPreviewHtml(certNo: string) {
    let headerOptions = new HttpHeaders({
      Accept: "application/pdf",
      certificateNo: certNo,
    });
    this.http
      .post(
        this.middleUrl + "/api/inspector/preview",
        {},
        { headers: headerOptions, responseType: "text" }
      )
      .pipe(
        map((data: string) => {
          // Get the iframe element
          const iframe: HTMLIFrameElement = document.getElementById(
            "iframe2"
          ) as HTMLIFrameElement;

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
            //this.showModal();

            iframedoc.close();
          } else {
            alert("Cannot inject dynamic contents into iframe.");
          }
        })
      )
      .subscribe((result: any) => {
        // Handle success
      });
  }
}
