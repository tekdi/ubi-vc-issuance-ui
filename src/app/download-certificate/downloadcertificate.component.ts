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
    private httpClient: HttpClient,
    private config: AppConfig
  ) {}

  ngOnInit(): void {
    this.subscribeToMenuConfig();
    this.getCertificateList();
  }

  /**
   * Subscribe to menu configuration updates
   */
  private subscribeToMenuConfig(): void {
    this.sharedDataService.menuConfig$.subscribe((menuConfigData) => {
      this.menuConfigData = menuConfigData;
    });
  }

  /**
   * Fetches the certificate list from the API
   */
  getCertificateList(): void {
    const apiUrl = `${this.domain}/registry/api/v1/marksheet/search`;
    const body = {
      offset: 0,
      limit: 1000,
      filters: {
        status: { eq: "issued" },
      },
    };

    this.generalService.postData(apiUrl, body).subscribe(
      (response) => {
        this.certificateList = response || []; // Bind the API response to the table
      },
      (error) => {
        console.error("API error:", error);
        this.toastMsg.error("Error", "Failed to fetch certificate data.");
      }
    );
  }

  onDownloadButtonClick(item: any): void {
    const certificateId = item.certificateId;
    const apiUrl = `api/inspector/downloadVC/${certificateId}`;

    // Perform the HTTP request to download the certificate
    this.httpClient.get(apiUrl, { responseType: "blob" }).subscribe(
      (response: Blob) => {
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "certificate.pdf"; // Optional: Provide a default name for the file
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

    // Perform the HTTP request to download the certificate in CSV format
    this.httpClient.get(apiUrl, { responseType: "blob" }).subscribe(
      (response: Blob) => {
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "certificate.csv"; // Save file with .csv extension
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      },
      (error) => {
        console.error("Error downloading CSV file:", error);
        this.toastMsg.error("Error", "Failed to download the CSV file.");
      }
    );
  }
}
