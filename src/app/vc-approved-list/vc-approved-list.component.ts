import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

import { ConfirmModalService } from "../modal/confirmModal/confirmModal.service";
import { GeneralService } from "src/app/services/general/general.service";
import { DataService } from "src/app/services/data/data-request.service";
import { CsvService } from "src/app/services/csv/csv.service";
import { LoadingService } from "../loader/loading.service";
import { SharedDataService } from "../subheader/shared-data.service";
import { ToastMessageService } from "../services/toast-message/toast-message.service";
import { Observable } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";

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
  page: number = 1;
  limit: number = 20;

  // Table schema for rendering the certificate list
  tableSchema = {
    fields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "certificateNo", label: "Certificate No." },
      {
        key: "issuanceDate",
        label: "Issued Date & Time (IST)",
        formatter: this.generalService.formatDate,
      },
      { key: "status", label: "Status" },
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
}
