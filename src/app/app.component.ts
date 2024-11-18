import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppConfig } from "./app.config";
import { ThemeService } from "../app/services/theme/theme.service";
import { Location } from "@angular/common";
import { SchemaService } from "./services/data/schema.service";
import { KeycloakService } from "keycloak-angular";
import { GeneralService } from "../app/services/general/general.service";
import { SharedDataService } from "./subheader/shared-data.service";
import { LoadingService } from "../app/loader/loading.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  menuItems = ["Home", "Profile", "Settings", "Logout"];
  username: string;

  footerText = "Sunbird RC";
  isFooter = false;
  ELOCKER_THEME;
  entityName: string;
  menuJson: any;
  logingUserRes: any;
  ssid: string;
  jssid: string;

  constructor(
    private config: AppConfig,
    private themeService: ThemeService,
    public keycloakService: KeycloakService,
    private location: Location,
    public schemaService: SchemaService,
    private router: Router,
    private loadingService: LoadingService,
    private generalService: GeneralService,
    private sharedDataService: SharedDataService
  ) {
    if (
      this.config.getEnv("appType") &&
      this.config.getEnv("appType") != "digital_wallet"
    ) {
      this.isFooter = true;
      if (window.location.pathname != "/install") {
        this.footerText = this.config.getEnv("footerText");
      }
    }

    this.keycloakService.loadUserProfile().then((res) => {
      console.log("--------app " + res["attributes"].entity[0]);

      this.entityName = res["attributes"].entity[0];

      let user = this.keycloakService.getUsername();
      localStorage.setItem("loggedInUser", user);
    });

    // this.ELOCKER_THEME = localStorage.getItem('ELOCKER_THEME');

    // if (this.ELOCKER_THEME) {
    //   this.themeService.setTheme(this.ELOCKER_THEME);
    // }
  }

  async ngOnInit() {
    // this.loadingService.show();
    setTimeout(() => {
      this.entityName = this.entityName
        ? this.entityName
        : localStorage.getItem("entity");
      if (this.entityName) {
        this.generalService.getData(this.entityName).subscribe((res) => {
          if (res) {
            this.logingUserRes = res[0];
            this.jssid = res[0].studentJssId;
            this.ssid = res[0].studentSssId;
            localStorage.setItem("jssid", this.jssid);
            localStorage.setItem("ssid", this.ssid);
            localStorage.setItem("entity", this.entityName);

            this.schemaService.getMenuJSON().subscribe(async (menusSchema) => {
              var filtered = menusSchema.menus.filter((obj) => {
                return Object.keys(obj)[0] === this.entityName;
              });
              this.menuJson = filtered[0][this.entityName];
              this.username =
                (this.logingUserRes[this.menuJson["name"]] !== undefined
                  ? this.logingUserRes[this.menuJson["name"]]
                  : "") +
                " " +
                (this.logingUserRes[this.menuJson["lastname"]] !== undefined
                  ? this.logingUserRes[this.menuJson["lastname"]]
                  : "");
              this.sharedDataService.setMenuConfig(this.menuJson);
              if (!this.username || this.username.includes(undefined)) {
                this.username = localStorage.getItem("loggedInUser");
              }
              console.log(this.menuJson);
              // this.loadingService.hide(); // Hide loader when done
            });
          }
        });
      } else {
        // this.loadingService.hide(); // Hide loader when done
      }
    }, 1000);
  }

  isNotHome(): boolean {
    const currentPath = this.location.path();
    // Check if the path is not empty, not a form path, and not "not-found"
    return (
      currentPath !== "" &&
      !currentPath.includes("not-found") &&
      !currentPath.includes("form/")
    );
  }

  isNotNotFoundPage(): boolean {
    return this.router.url !== "/not-found"; // Assuming 404 path is used for not found page
  }
}
