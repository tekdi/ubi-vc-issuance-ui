import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { KeycloakService } from 'keycloak-angular';
import { HttpOptions } from '../../interfaces/httpOptions.interface';
import { DataService } from '../data/data-request.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  middleUrl = environment.baseUrl;
  token: string;
  isLoogedIn: boolean;

  constructor(private http: HttpClient, private config: AppConfig, 
    private dataService: DataService, public keycloak: KeycloakService) {
    this.keycloak.getToken().then((token)=>{
      this.token = token;
    })
  }



   uploadFile(params: any, url: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', params.file);
    formData.append('classType', params.classType);
    formData.append('academicYear', params.academicYear);
    this.token = (this.token != undefined )? this.token : localStorage.getItem('token');
    // const headers = new HttpHeaders();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    // const httpOptions: HttpOptions = {
    //   headers: requestParam.header ? this.dataService.getHeader(requestParam.header) : this.dataService.getHeader(),
    //   params: requestParam.param
    // };
  
    return this.http.post(`${this.middleUrl}/${url}`, formData, {
      headers: headers,
      reportProgress: true,  // Enable progress reporting
      observe: 'events'      // Observing events to track upload progress
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total!);
            return { status: 'progress', message: progress };
          case HttpEventType.Response:
            return { status: 'complete', message: event.body };
          default:
            return { status: 'other', message: event };
        }
      })
    );
  }
  
}
