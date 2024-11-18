import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmModalService } from '../modal/confirmModal/confirmModal.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { DataService } from 'src/app/services/data/data-request.service'
import { CsvService } from 'src/app/services/csv/csv.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { AppConfig } from 'src/app/app.config';
import { LoadingService } from '../loader/loading.service';
import { SharedDataService } from '../subheader/shared-data.service';
import { error } from 'console';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
@Component({
  selector: 'download-sample',
  templateUrl: './download-sample.component.html',
  styleUrls: ['./download-sample.component.scss']
})
export class DownloadSampleComponent  implements OnInit {
  @Input() menuConfig: any = {};
  activeMenu: any;
  modalInfo: any;
  domain: any;
  menuConfigData: any;
  constructor(private router: Router, private confirmModalService: ConfirmModalService, private sharedDataService: SharedDataService, 
    public dataService: DataService, private http: HttpClient,private loadingService: LoadingService,
    public generalService: GeneralService, public CsvService: CsvService, private toastMsg: ToastMessageService,
    private config: AppConfig) {

  }

  ngOnInit(): void {

    this.sharedDataService.menuConfig$.subscribe(menuConfigData => {
      this.menuConfigData = menuConfigData;

    })

  }

  downloadTemplate(classType: string) {
    let headers = new HttpHeaders({
      'ClassType': classType,
      
    });
    console.log(classType);
    this.loadingService.show();
    this.domain = environment.baseUrl;
    try{
    this.http.get(this.domain + '/api/examiner/downloadSampleCsv', {headers: headers, responseType: 'text' }).subscribe((res) => {
      this.CsvService.downloadCSVTemplate(res,classType);
      this.loadingService.hide();
    }, err =>{
      this.toastMsg.error('error', err.error.params.errmsg);

    });

  }catch(err){
      this.toastMsg.error('error', 'Something went wrong please try again');
    
    }
  


}

}
