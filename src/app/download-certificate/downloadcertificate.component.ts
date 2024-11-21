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
import { log } from "console";

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
  schoolId: string | null = localStorage.getItem("schoolId");

  // Table schema for rendering the certificate list
  tableSchema = {
    fields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "certificateNo", label: "Certificate No." },
      { key: "schoolId", label: "School ID" },
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
        schoolId: { eq: this.schoolId },
        status: { eq: "issued" },
      },
    };

    this.generalService.postData(apiUrl, body).subscribe(
      (response) => {
        console.log(response);

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
    // Construct the URL with certificateId
    const apiUrl = `api/v1/certificate/download/${certificateId}`;

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

  /**
   * Downloads the CSV template based on the provided class type
   * @param classType - The type of class for the template
   */ x;
  downloadTemplate(classType: string): void {
    const headers = new HttpHeaders({ ClassType: classType });
    this.loadingService.show();

    this.http
      .get(`${this.domain}/api/examiner/downloadSampleCsv`, {
        headers,
        responseType: "text",
      })
      .subscribe(
        (res) => {
          this.csvService.downloadCSVTemplate(res, classType);
          this.loadingService.hide();
        },
        (err) => {
          this.loadingService.hide();
          const errorMsg =
            err?.error?.params?.errmsg || "An unexpected error occurred.";
          this.toastMsg.error("Error", errorMsg);
        }
      );
  }

  /**
   * Handles button actions like "View" and "Edit"
   * @param action - Action type (view/edit)
   * @param item - Row data
   */
  handleButtonAction(action: string, item: any): void {
    if (action === "view") {
      this.viewCertificate(item);
    } else if (action === "edit") {
      this.editCertificate(item);
    }
  }

  /**
   * Opens the certificate in view mode
   * @param certificate - The certificate data
   */
  private viewCertificate(certificate: any): void {
    // Implement view logic here
    console.log("View Certificate:", certificate);
  }

  /**
   * Opens the certificate in edit mode
   * @param certificate - The certificate data
   */
  private editCertificate(certificate: any): void {
    // Implement edit logic here
    console.log("Edit Certificate:", certificate);
  }
}
