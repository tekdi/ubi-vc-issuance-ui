import { Component, OnInit } from "@angular/core";
import { KeycloakService } from "keycloak-angular";
import { Router } from "@angular/router";
import { AppConfig } from "../../app.config";

@Component({
  selector: "app-keycloaklogin",
  templateUrl: "./keycloaklogin.component.html",
})
export class KeycloakloginComponent implements OnInit {
  user: any;
  entity: string;
  profileUrl: string = "";
  entityArr: any;
  constructor(
    public keycloakService: KeycloakService,
    public router: Router,
    private config: AppConfig
  ) {}

  ngOnInit(): void {
    this.keycloakService.loadUserProfile().then((res) => {
      console.log(res["attributes"].entity[0]);

      this.entity = res["attributes"].entity[0];
      localStorage.setItem("entity", this.entity);
      this.entityArr = res["attributes"].entity;
      if (
        res["attributes"].hasOwnProperty("locale") &&
        res["attributes"].locale.length
      ) {
        localStorage.setItem("setLanguage", res["attributes"].locale[0]);
      }
    });
    this.user = this.keycloakService.getUsername();
    localStorage.setItem("loggedInUser", this.user);

    this.keycloakService.getToken().then((token) => {
      localStorage.setItem("token", token);
      localStorage.setItem("entity", this.entity);
      console.log("---------", this.config.getEnv("appType"));
      if (
        this.config.getEnv("appType") &&
        this.config.getEnv("appType") === "digital_wallet"
      ) {
        this.profileUrl = this.entity + "/documents";
      }
      if (this.entity === "issue" || this.entity === "Issuer") {
        this.profileUrl = "/dashboard";
      } else {
        if (this.entityArr.length == 1) {
          if (this.entity == "Verifier") {
            this.profileUrl = "/verify";
          } else if (
            this.entity == "Student" ||
            this.entity == "Teacher" ||
            this.entity == "Examiner" ||
            this.entity == "board-cbse"
          ) {
            this.profileUrl = this.entity + "/list/" + this.entity;
          } else {
            this.profileUrl = this.entity + "/list/" + this.entity;
          }
        } else {
          let isSetEntity = false;

          for (let i = 0; i < this.entityArr.length; i++) {
            if (
              this.entityArr[i] == "Student" ||
              this.entityArr[i] == "Teacher" ||
              this.entityArr[i] == "Institute" ||
              this.entityArr[i] == "board-cbse"
            ) {
              this.entity = this.entityArr[i];
              this.profileUrl = "/profile/" + this.entity;
              isSetEntity = true;
            }
          }

          if (!isSetEntity) {
            this.profileUrl = "/list/verifiable-credential";
          }
        }
      }
      this.router.navigate([this.profileUrl]);
    });
  }
}
