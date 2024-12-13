import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/general/general.service";

@Component({
  selector: "app-browse-documents",
  templateUrl: "./browse-documents.component.html",
  styleUrls: ["./browse-documents.component.scss"],
})
export class BrowseDocumentsComponent implements OnInit {
  documentTypes: any;
  constructor(public generalService: GeneralService) {}

  ngOnInit(): void {
    let search = {
      entityType: ["Issuer"],
      filters: {},
    };
    this.generalService.postData("/Issuer/search", search).subscribe(
      (res) => {
        console.log("pub res", res);
        this.documentTypes = res;
      },
      (err) => {
        console.log("error", err);
      }
    );
  }
}
