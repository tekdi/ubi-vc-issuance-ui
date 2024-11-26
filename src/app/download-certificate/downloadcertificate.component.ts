import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
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

@Component({
  selector: "app-downloadcertificate",
  templateUrl: "./downloadcertificate.component.html",
  styleUrls: ["./downloadcertificate.component.scss"],
})
export class DownloadcertificateComponent implements OnInit {
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

  // Table schema for rendering the certificate list
  tableSchema = {
    fields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "certificateNo", label: "Certificate No." },
      { key: "status", label: "Status" },
      {
        key: "actions",
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
    private httpClient: HttpClient
  ) {}

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
        schoolId: { eq: this.schoolId },
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

  onDownloadButtonClick(item: any): void {
    console.log(item, "item item itemitem");

    const certificateId = item.certificateId;
    const apiUrl = `api/inspector/downloadVC/${certificateId}`;

    // Perform the HTTP request to download the certificate
    this.httpClient.get(apiUrl, { responseType: "blob" }).subscribe(
      (response: Blob) => {
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `response-${certificateId}.json`; // Optional: Provide a default name for the file
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      },
      (error) => {
        console.error("Error downloading certificate:", error);
        this.toastMsg.error("Error", "Failed to download the certificate.");
      }
    );
  }

  onDownloadAllIssuedCertificates(): void {
    const apiUrl = `api/inspector/downloadCSV/marksheet`;

    // Include the filter for document type
    const params = {
      doctype: this.selectedCourse || "marksheet",
    };

    // Perform the HTTP request to download the filtered certificate in CSV format
    this.httpClient.get(apiUrl, { params, responseType: "blob" }).subscribe(
      (response: Blob) => {
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${params.doctype}_certificates.csv`; // Save file with the filtered document type
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      },
      (error) => {
        console.error("Error downloading CSV file:", error);
        this.toastMsg.error(
          "Error",
          "Failed to download the filtered CSV file."
        );
      }
    );
  }
}
