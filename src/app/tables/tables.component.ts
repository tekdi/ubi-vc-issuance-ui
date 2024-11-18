import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { GeneralService } from '../services/general/general.service';
import { SuccessModalService } from '../modal/success/success.service';
import { ConfirmModalService } from '../modal/confirmModal/confirmModal.service';
// import * as TableSchemas from './tables.json'
import { SharedDataService } from '../subheader/shared-data.service';
import { Location } from '@angular/common';
import { LoadingService } from '../loader/loading.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  table: any;
  entity: any;
  tab: string = 'list';
  tableSchema: any;
  apiUrl: any;
  model: any = [];
  Data: string[] = [];
  property: any[] = [];
  field;
  studentIdValue: string = (localStorage.getItem("loggedInUser")).toUpperCase();

  selectedFileForUpload: File | null = null;
  page: number = 1;
  limit: number = 20;
  identifier: any;
  selectedAcademicYear!: string;

  name = 'Set iframe source';
  url: string = "https://sunbirdrc-sandbox.xiv.in/public/dashboards/N6Rl6lfgdvfflB3sJLLQJtqp6ZSrD23TSSj9a35U?org_slug=default";
  urlSafe: SafeResourceUrl;
  vcType: any;
  confirmModal: any;


  modalInfo: any = {
    "title": "You have successfully delete results for SUCCESS GROUP OF SCHOOL",
    "redirectTo": "/Inspector/list/studentresult",
    "image": "assets/images/success.png",
    "Buttons": [
      {
        "title": "Done",
        "redirectTo": "/Inspector/list/studentresult"
      }
    ]

  };
  loggedInUser: string;
  selectItem: any;
  currentItem: any;
  selectedClassType: any;
  selectbutton: any;
  selectButtonData: any;
  constructor(public router: Router, private successModalService: SuccessModalService, private confirmModalService: ConfirmModalService,
    private route: ActivatedRoute, public generalService: GeneralService,
    private sharedDataService: SharedDataService, private location: Location, private loadingService: LoadingService,
    public schemaService: SchemaService, public sanitizer: DomSanitizer) {
    this.loadingService.show();

  }

  ngOnInit(): void {
    // console.log(environment.CLIENT_ID); //kpet it for checking
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.sharedDataService.approveCertificate$.subscribe(() => {
      this.confirmModalFun(this.selectbutton, 1, this.selectButtonData);
    });
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    var tab_url = this.router.url
    this.route.params.subscribe(async params => {
      this.table = (params['table']).toLowerCase()
      this.entity = (params['entity']).toLowerCase();
      this.loggedInUser = (localStorage.getItem('loggedInUser')).toUpperCase();


      this.tab = tab_url.replace(this.table, "").replace(this.entity, "").split("/").join("")
      this.schemaService.getTableJSON().subscribe(async (TableSchemas) => {
        var filtered = TableSchemas.tables.filter(obj => {
          return Object.keys(obj)[0] === this.table
        })
        this.tableSchema = filtered[0][this.table]
        this.apiUrl = this.tableSchema.api;
        this.limit = filtered[0].hasOwnProperty(this.limit) ? filtered[0].limit : this.limit;

        if (this.tableSchema.call == 'post' && this.entity) {
          await this.postData();
        } else {
          await this.getData();
        }



      })

    });

    this.sharedDataService.selectedAcademicYear$.subscribe(filter => {

      for (let i = 0; i < filter.length; i++) {
        if (filter[i].value != undefined && filter[i].value != "") {
          this.tableSchema.body.filters[filter[i].filter] = {
            eq: filter[i].value
          };
        } else {
          if (this.tableSchema?.body?.filters.hasOwnProperty(filter[i].filter))
            delete this.tableSchema?.body.filters[filter[i].filter];
        }
      }

      this.model = [];
      // console.log("Received Academic Year in Another Component:", this.selectedAcademicYear);
      if (this.tableSchema) {
        this.postData();
      }

    });

    this.sharedDataService.okButtonClicked.subscribe(() => {
      this.postData();
    });

    this.sharedDataService.searchDataEmitter.subscribe((data: string) => {
      if (this.tableSchema.hasOwnProperty('menuFilter')) {
        const filters = this.tableSchema.menuFilter;
        for (let i = 0; i < filters.searchBy.length; i++) {
          const opt = filters.opt;

          this.tableSchema.body.filters[filters.searchBy[i]] = {
            'contains': data.trim() // or replace 'opt' with 'data' depending on what you intend to assign
          };
        }
      }

      this.postData();
    });
  }
 
  
  sendDataToSubheader() {
    setTimeout(() => {
      this.sharedDataService.setData([this.tableSchema.items, this.model]);

    }, 500);
    // this.sharedDataService.setData(this.tableSchema.items);

  }
  encodeURI(value: string): string {
    return encodeURIComponent(value);
}

  getData() {

    var get_url;
    if (this.entity) {
      get_url = this.apiUrl
    } else {
      console.log("Something went wrong")
    }
    this.generalService.getData(get_url).subscribe((res) => {
      if (res.hasOwnProperty('content')) {
        this.model = res['content'];
      } else {
        this.model = res;
      }

      this.addData()
    });
  }

  async postData() {
    this.model = [];
    this.property = [];
    if (this.tableSchema.hasOwnProperty('callMultiApi') && this.tableSchema['callMultiApi']) {
      this.tableSchema.callMultiApi['api'].forEach(elememt => {

        this.apiUrl = elememt;
        this.addDataMultiCall();

      });
    } else {
      if (this.entity === "student") {
        setTimeout(() => {
          this.addDataMultiCall()

        }, 1500);
        ;
      } else {
        this.addDataMultiCall();

      }

    }
  }

  async addDataMultiCall() {
    var get_url;
    if (this.entity) {
      get_url = this.apiUrl
    } else {
      console.log("Something went wrong")
    }
    if (this.entity === "student") {

      let jssid: string = (localStorage.getItem("jssid"));
      let ssid: string = (localStorage.getItem("ssid"));
      this.tableSchema.body.filters['studentId'] = {
        or: [jssid, ssid]
      };
    } else {
      delete this.tableSchema.body.filters.studentId;
    }

    if (this.tableSchema.bodyVal) {
      await this.replacePlaceholders(this.tableSchema.body, "$" + this.tableSchema.bodyVal, localStorage.getItem('selectedItem'));
    }

    if (this.tableSchema.getFromStoreVal) {
      await this.replacePlaceholders(this.tableSchema.body, "$" + this.tableSchema.getFromStoreVal, localStorage.getItem(this.tableSchema.getFromStoreVal));
    }

    this.model = [];
    this.generalService.postData(get_url, this.tableSchema.body).subscribe((res) => {
      if (res.hasOwnProperty('content')) {
        this.model.push(res['content']);
      } if (res.hasOwnProperty('data')) {
        this.model.push(...res['data']);
      } else {
        this.model = res;
      }


      var temp_array;
      let temp_object
      this.model.forEach((element, index) => {
        element['vctype'] = get_url;
        temp_array = [];
        // if(element.hasOwnProperty('email') && element['email'] == localStorage.getItem('loggedInUser'))
        // {
        this.tableSchema.fields.forEach((field) => {

          temp_object = field;
          let concatenatedValues = "";

          if (temp_object.name == 's/n') {
            temp_object['value'] = index + 1;
          } else if (temp_object.name && !temp_object.isArray) {
            temp_object['value'] = element[field.name]
            temp_object['status'] = element['status']
          } else {
            temp_object['name']?.forEach(prop => {
              if (element[prop]) {
                concatenatedValues += element[prop] + " ";
              }
            });
            temp_object['value'] = concatenatedValues.trim();
            temp_object['status'] = element['status']

          }



          if (temp_object.formate) {
            temp_object['formate'] = field.formate
          }
          if (temp_object.custom) {
            if (temp_object.type == "button" && !temp_object.isMultiple) {
              if (temp_object.redirectTo && temp_object.redirectTo.includes(":")) {
                let urlParam = temp_object.redirectTo.split(":")
                urlParam.forEach((paramVal, index) => {
                  if (paramVal in element) {
                    urlParam[index] = element[paramVal]
                  }
                });
                temp_object['redirectToUrl'] = JSON.stringify(urlParam.join("/").replace("//", "/"));
              }
              else {
                temp_object['redirectToUrl'] = temp_object.redirectTo;
              }
            } else {
              if (temp_object.type == "button" && temp_object.isMultiple) {
                for (let i = 0; i < temp_object.buttons.length; i++) {

                  if (temp_object.buttons[i].redirectTo && temp_object.buttons[i].redirectTo.includes(":")) {
                    let urlParam = temp_object.buttons[i].redirectTo.split(":")
                    urlParam.forEach((paramVal, index) => {
                      if (paramVal in element) {
                        urlParam[index] = element[paramVal]
                      }
                    });
                    temp_object.buttons[i]['redirectToUrl'] = urlParam.join("/").replace("//", "/");

                  } else {
                    temp_object.buttons[i]['redirectToUrl'] = temp_object.buttons[i].redirectTo;
                  }
                }
              }
            }
            temp_object['type'] = field.type
          }
          temp_array.push(this.pushData(temp_object));

        });
        temp_array['res'] = element;

        this.property.push(temp_array);
        // }

      });
      this.loadingService.hide();

      this.tableSchema.items = this.property;
      this.sendDataToSubheader()

    });
  }

  addData() {

    var temp_array;
    let temp_object
    this.model.forEach((element, index) => {
      if (element.status === "OPEN" || !this.tableSchema['checkStatus']) {
        temp_array = [];
        this.tableSchema.fields.forEach((field) => {

          temp_object = field;

          if (temp_object.name == 's/n') {
            temp_object['value'] = index + 1;
          } else if (temp_object.name) {
            temp_object['value'] = element[field.name]
            temp_object['status'] = element['status']
          }



          if (temp_object.formate) {
            temp_object['formate'] = field.formate
          }


          if (temp_object.custom) {
            if (temp_object.type == "button" && !temp_object.isMultiple) {
              if (temp_object.redirectTo && temp_object.redirectTo.includes(":")) {
                let urlParam = temp_object.redirectTo.split(":")
                urlParam.forEach((paramVal, index) => {
                  if (paramVal in element) {
                    urlParam[index] = element[paramVal]
                  }
                });
                temp_object['redirectToUrl'] = urlParam.join("/").replace("//", "/");
              } else {
                temp_object['redirectToUrl'] = temp_object.redirectTo;
              }
            } else {
              if (temp_object.type == "button" && temp_object.isMultiple) {
                for (let i = 0; i < temp_object.buttons.length; i++) {

                  if (temp_object.buttons[i].redirectTo && temp_object.buttons[i].redirectTo.includes(":")) {
                    let urlParam = temp_object.buttons[i].redirectTo.split(":")
                    urlParam.forEach((paramVal, index) => {
                      if (paramVal in element) {
                        urlParam[index] = element[paramVal]
                      }
                    });
                    temp_object.buttons[i]['redirectToUrl'] = urlParam.join("/").replace("//", "/");
                  } else {
                    temp_object.buttons[i]['redirectToUrl'] = temp_object.buttons[i].redirectTo;
                  }


                }
              }
            }
            temp_object['type'] = field.type
          }
          temp_array.push(this.pushData(temp_object));
        });
        this.property.push(temp_array)
      }
    });
    this.loadingService.hide();
    this.tableSchema.items = this.property;
    this.sendDataToSubheader()

  }

  pushData(data) {
    var object = {};
    for (var key in data) {
      if (data.hasOwnProperty(key))
        object[key] = data[key];
    }
    return object;
  }


  async actionFunction(action, data, proprties, index) {

    let params = '';
    console.log({ proprties });
    console.log({ index });

    const currentPath = this.location.path();

    if (data.hasOwnProperty('subHeaderTitle')) {
      let subHeaderTitle = proprties.res[data['subHeaderTitle']];
      this.sharedDataService.setSubHeaderTitle(subHeaderTitle);
      localStorage.setItem('subHeaderTitle', subHeaderTitle);

    }

    if (data.hasOwnProperty('getFromStoreVal')) {
      this.selectItem = proprties.res[data['getFromStoreVal']];
      localStorage.setItem('selectedItem', this.selectItem);
      params = data['body'];

      await this.replacePlaceholders(params, "$" + data['bodyVal'], this.selectItem);

    } else
      if (action == 'post' && data['bodyVal'] == '*') {
        params = proprties.res;
      } else {
        this.selectItem = proprties.res[data['bodyVal']];
        localStorage.setItem('selectedItem', this.selectItem);
        params = data['body'];

        await this.replacePlaceholders(params, "$" + data['bodyVal'], this.selectItem);
      }

    let isMiddleUrl;
    if (data['api'] == 'Results/search') {
      isMiddleUrl = false;
    } else {
      isMiddleUrl = true;
    }

    // Convert the string back to a JSON object
    this.generalService.postData(data.api, params, true, isMiddleUrl).subscribe((res) => {
      console.log({ res });

      if (data['successModal']) {
        if (data['afterActionRemoveRow']) {
          this.tableSchema.items.splice(index, 1);
        }

        let selectItem = proprties.res[data.modal['bodyVal']];

        if (data['modal'].title.includes('$' + data.modal['bodyVal'])) {
          // Reassign the replaced string back to button['modal'].title
          data['modal'].title = data['modal'].title.replace('$' + data.modal['bodyVal'], selectItem);
        }

        this.modalInfo = data['modal'];
        this.successModalService.updateModalData(data['modal']);
        // this.successModalService.initializeModal('successModal');
        this.successModalService.showModal();
      }
    })


  }

  storeData(button, data) {
    this.selectbutton = button;
    this.selectButtonData = data;
    console.log({ data });
    if (button.storeVal) {
      let opt = button['storeVal'];
      localStorage.setItem(opt, data.res[button.storeVal])
    }

    this.sendDataToSubheader()

  }

  downloadFile(filepath, item, typeRes,shouldUpload) {
  this.generalService.downloadFile(filepath, '/api/inspector/credentials', typeRes, item['res']['certificateNo'],shouldUpload);
  }

  shareOnSocial(filepath, item, typeRes): void {
    this.generalService.shareFile(filepath, '/api/inspector/credentials', typeRes, item['res']['certificateNo'] );

  }

  // Recursive function to replace placeholders
  replacePlaceholders(obj, placeholder, value) {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.replacePlaceholders(obj[key], placeholder, value); // Recursive call for nested objects
      } else if (obj[key] === placeholder) {
        obj[key] = value; // Replace the placeholder
      }
    }
  }

  shareDoc(service: string, file: File, docId: string, type: string): void {
    if (service === 'gdrive') {
      this.selectedFileForUpload = file;  // Store the file to be uploaded
      // this.initClient();  // Initialize the client and login
    }
  }


  confirmModalFun(button, i, proprties) {

    if (button.modal['bodyVal'].length > 1) {
      for (let i = 0; i < button.modal['bodyVal'].length; i++) {
        let selectItem = proprties.res[button.modal['bodyVal'][i]];
        if (button['modal'].message.includes('$' + button.modal['bodyVal'][i])) {
          // Reassign the replaced string back to button['modal'].message
          button['modal'].message = button['modal'].message.replace('$' + button.modal['bodyVal'][i], selectItem);
        }

      }

    } else {
      this.selectItem = proprties.res[button.modal['bodyVal']];

      if (button['modal'].message.includes('$' + button.modal['bodyVal'])) {
        // Reassign the replaced string back to button['modal'].message
        button['modal'].message = button['modal'].message.replace('$' + button.modal['bodyVal'], this.selectItem);
      }
    }

    this.confirmModal = button['modal'];
    this.currentItem = proprties['res'];
    // this.confirmModalService.initializeModal('confirmModal');
    this.confirmModalService.updateModalData([this.confirmModal, this.currentItem]);
    this.confirmModalService.showModal(); // Pass updated data
  }
}
