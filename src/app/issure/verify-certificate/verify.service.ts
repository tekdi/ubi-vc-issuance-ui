import { Injectable } from '@angular/core';
// import { ConfigService} from '../config/config.service';
import * as JSZip from 'jszip';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerifyService {

  scannerEnabled: boolean = false;
  success: boolean = false;
  qrString;
  item;
  loader: boolean = false;
  notValid: boolean = false;
  name: any;
  items: any = [];
  document = [];

  excludedFields: any = ['osid', 'id', 'type', 'fileUrl', 'otp', 'transactionId'];
  configData: any;

  constructor(
    // public configService: ConfigService
    ) { }

  ngOnInit(): void {
  }

  enableScanner() {
    this.success = false;
    this.notValid  = false;
    // this.scannerEnabled = !this.scannerEnabled;
    this.scannerEnabled = true;

  }


  public scanSuccessHandler($event: any, config = {}) {
    //this.configData = this.configService.getConfigUrl();

        return $event;
  }

  readData(res, config) {
    this.items = [];
    var _self = this;

    if(config && config.hasOwnProperty('showResult')){
      for(let i = 0 ; i < config.showResult.length; i++){
      var tempObject = {};
      tempObject['title'] = config.showResult[i].title;
      tempObject['value'] = this.getValue(res, config.showResult[i].path);
      tempObject['type'] = config.showResult[i].type;

      console.log(tempObject);

      this.items.push(tempObject);
      }

    }else{
    Object.keys(res).forEach(function (key) {
      var tempObject = {};

      if (!_self.excludedFields.includes(key)) {
        tempObject['title'] = (key).charAt(0).toUpperCase() + key.slice(1);;
        tempObject['value'] = res[key];

        console.log(tempObject);

        _self.items.push(tempObject);
      }

    });
  }
  }

  getValue(item, fieldsPath) {
    let fieldValue: any;

    if( !(Array.isArray(fieldsPath))){
    var propertySplit = fieldsPath.split(".");


    for (let j = 0; j < propertySplit.length; j++) {
      let a = propertySplit[j];

      if (j == 0 && item.hasOwnProperty(a)) {
        fieldValue = item[a];
      } else if (fieldValue.hasOwnProperty(a)) {

        fieldValue = fieldValue[a];

      } else if (fieldValue[0]) {
        let arryItem = []
        if (fieldValue.length > 0) {
          for (let i = 0; i < fieldValue.length; i++) {
          }

          fieldValue = arryItem;

        } else {
          fieldValue = fieldValue[a];
        }

      } else {
        fieldValue = '';
      }
    }
  }else{
    let concatenatedValues = '';
    fieldsPath?.forEach(prop => {
        concatenatedValues += this.getValue(item, prop) + " ";
      
    });
    fieldValue = concatenatedValues;
  }

    return fieldValue;
  

}


}
