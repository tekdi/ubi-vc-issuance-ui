import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from '../services/general/general.service';
import { AppConfig } from '../app.config';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  installed: boolean = false;
  checkbox: any;
  myTemplate: any;
  isExpanded = false;
  isExpanded1 = false;
  isExpanded2 = false;
  isExpanded3 = false;
  isExpanded4 = false;
  isExpanded5 = false;
   clientId = '86okaw3uu5wum6';
   clientSecret = 'WPL_AP1.tJxXUEuaiOsYrzQk.KLI71A==';
   redirectUri = 'https://dev.educert.ng/linkedin-callback';
  accessToken: any;
  constructor(public router: Router, private http: HttpClient,

    public generalService: GeneralService, private config: AppConfig, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.checkHtmlFile().subscribe((res) => {
      if (res) {
        this.myTemplate = res;
      }
    },
      (error) => {
        var handler = document.getElementById('menu-open-handler');
        var toggleInterval = setInterval(function () {
          this.checkbox = document.getElementById('menu-open');
          this.checkbox.checked = !this.checkbox.checked;
        }, 4000);

        handler.onclick = function () {
          clearInterval(toggleInterval);
        };
      }
    );


  }
  toggleIcon(): void {
    this.isExpanded = !this.isExpanded;
  }
  toggleIcon1(): void {
    this.isExpanded1 = !this.isExpanded1;
  }
  toggleIcon2(): void {
    this.isExpanded2 = !this.isExpanded2;
  }
  toggleIcon3(): void {
    this.isExpanded3 = !this.isExpanded3;
  }
  toggleIcon4(): void {
    this.isExpanded4 = !this.isExpanded4;
  }
  toggleIcon5(): void {
    this.isExpanded5 = !this.isExpanded5;
  }
  checkHtmlFile(): Observable<any> {
    return this.httpClient.get('/assets/config/home.html', { responseType: 'text' })
      .pipe(
        map((html: any) => {
          // console.log('html',html);
          return html;
        }),
        catchError(error => {
          console.log(error);
          return of(false);
        })
      );
  }


  postFile()
  {
     // this.generalService.tempShare('PNG', '/api/inspector/credentials', 'certificate', '2027/6/61/1NSS912' );
     const scope = 'openid%20w_member_social%20profile%20email'; // Adjust scopes as needed
   let authUrl =  `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scope}`;

     window.location.href = authUrl;
  }
}
