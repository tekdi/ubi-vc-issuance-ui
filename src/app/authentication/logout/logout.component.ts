import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AppConfig } from 'src/app/app.config';
import { LoadingService } from 'src/app/loader/loading.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  baseUrl = environment.baseUrl + this.config.getEnv('rcBaseUrl');
  constructor(public keycloakService: KeycloakService,private config: AppConfig, 
    private loadingService: LoadingService, public router: Router) { 

    }

  ngOnInit(): void {
    localStorage.clear();
    this.loadingService.show();

    this.keycloakService.clearToken();
    this.keycloakService.logout(window.location.origin);

    // this.router.navigate([''])
  }

}
