import { Injectable } from '@angular/core';
import { DataService } from '../data/data-request.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { LoadingService } from '../../loader/loading.service';
import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { environment } from 'src/environments/environment';
declare var FB : any;
@Injectable({
  providedIn: 'root'
})


export class GeneralService {
  baseUrl = environment.baseUrl + this.config.getEnv('rcBaseUrl');
  middleUrl = environment.baseUrl;
  translatedString: string;
  isDownloading: boolean;
  shouldUploadToDrive: boolean = false;
  client_id = environment.client_id;
  cert_template_id = environment.certificate_template_id;
  res_template_id = environment.result_template_id;
  discovery_docs = environment.discovery_docs;
  scopes = environment.scopes;
  api_key = environment.api_key;
  constructor(public dataService: DataService,
    private http: HttpClient, private config: AppConfig, public translate: TranslateService,
    private loadingService: LoadingService,) {
  }

  postData(apiUrl, data, outside: boolean = false, middleUrl = false) {
    var url;

    if (middleUrl) {
      url = `${this.middleUrl}/${apiUrl}`;

    }
    else if (apiUrl.indexOf('http') > -1) {
      url = apiUrl
    } else {
      if (apiUrl.charAt(0) == '/') {
        url = `${this.baseUrl}${apiUrl}`
      }
      else {
        url = `${this.baseUrl}/${apiUrl}`;
      }
    }

    const req = {
      url: url,
      data: data
    };

    return this.dataService.post(req);
  }

  getDocument(url: string): Observable<any> {
    return this.dataService.getDocument(url);
  }


  getData(apiUrl, outside: boolean = false, wHeader: any = null, middleUrl = false) {
    var url;
    if (middleUrl) {
      url = `${this.middleUrl}/${apiUrl}`;

    }
    else if (outside) {
      url = apiUrl;
    }
    else {
      url = `${this.baseUrl}/${apiUrl}`;
    }
    url.replace('//', '/');
    const req = {
      url: url
    };

    if (wHeader != null) {
      req['header'] = wHeader;
    }
    return this.dataService.get(req);
  }

  getPrefillData(apiUrl) {
    var url = apiUrl;
    let headers = new HttpHeaders();
    url.replace('//', '/');
    const req = {
      url: url,
      headers: headers
    };

    return this.dataService.get(req);
  }

  postPrefillData(apiUrl, data) {
    apiUrl.replace('//', '/');
    const req = {
      url: apiUrl,
      data: data
    };

    return this.dataService.post(req);
  }

  putData(apiUrl, id, data) {
    var url;
    if (apiUrl.charAt(0) == '/') {
      url = `${this.baseUrl}${apiUrl}/${id}`
    }
    else {
      url = `${this.baseUrl}/${apiUrl}/${id}`;
    }
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  // Configurations
  getConfigs() {
    let url = "./assets/config/config.json";
    const req = {
      url: url
    };

    return this.dataService.get(req);
  }

  updateclaims(apiUrl, data) {
    let url = `${this.baseUrl}${apiUrl}`;
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  translateString(constantStr) {
    this.translate.get(constantStr).subscribe((val) => {
      this.translatedString = val;
    });
    return this.translatedString;
  }

  attestationReq(apiUrl, data) {
    let url = `${this.baseUrl}${apiUrl}`;
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }


  openPDF(url) {
    url = `${this.baseUrl}` + '/' + `${url}`;

    let requestOptions = { responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(url, requestOptions).pipe(map((data: any) => {

      let blob = new Blob([data], {
        type: 'application/pdf' // must match the Accept type
        // type: 'application/octet-stream' // for excel 
      });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      window.open(link.href, '_blank')
      // link.download =  'temp.pdf';
      // link.click();
      // window.URL.revokeObjectURL(link.href);

    })).subscribe((result: any) => {
    });
  }

shareFile(fileType: string, url: string, typeRes: string,certNo : string) {
    let fileTypeHeader: string;
    let blobType: string;
    let fileExtension: string;

    // Handle case insensitivity for file types
    const lowerFileType = fileType.toLowerCase();

    switch (lowerFileType) {
      case 'pdf':
        fileTypeHeader = 'application/pdf';
        blobType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'jpeg':
        fileTypeHeader = 'image/jpeg';
        blobType = 'image/jpeg';
        fileExtension = 'jpeg';
        break;
      case 'png':
        fileTypeHeader = 'image/png';
        blobType = 'image/png';
        fileExtension = 'png';
        break;
      default:
        console.error('Unsupported file type requested');
        alert('Unsupported file type. Please choose PDF, JPEG, or PNG.');
        return;
    }

    const headers = new HttpHeaders({
      'Accept': fileTypeHeader,
      'certificateNo': certNo
    });

    const requestOptions = { headers: headers, responseType: 'blob' as 'blob' };

    const fileName = `${typeRes}_${localStorage.getItem('loggedInUser')}_${new Date().toISOString()}`;
    // this.loadingService.show();
    // Make the request to fetch the file
    console.log({fileName});

    console.log(`${this.middleUrl}${url}`);
    this.http.get(`${this.middleUrl}${url}`, requestOptions).subscribe(
      (data: Blob) => {
        FB.login(function (response) {
          console.log(response);
          if (response.authResponse) {
            var accessToken = response.authResponse.accessToken;
            console.log(accessToken);
            FB.api('/me/accounts', function(pageRes) {
              console.log('Page List:', pageRes);
              
              const pageId = pageRes.data[0].id;  // Replace with the actual Page ID
const pageAccessToken = pageRes.data[0].access_token; 
          
            // this.loadingService.hide();
            // Assuming you have a blob object
            const blob = new Blob(['sample data'], { type: 'image/jpeg' }); // Replace this with your actual Blob

            // Convert Blob to File
            const file = new File([data], 'image.jpg', {
              type: data.type,
              lastModified: Date.now(),
          })

            // Create FormData and append fields
            const formData = new FormData();
            formData.append('access_token', pageAccessToken); // Assuming accessToken is defined
            formData.append('message', 'Check out this image!');
            formData.append('source', file); // Append the file (converted from Blob)
            console.log({ blob });

            console.log({ formData });


            fetch('https://graph.facebook.com/'+ pageId + '/photos', {
              method: 'POST',
              body: formData
            })
              .then(response => response.json())
              .then(data => console.log('Image posted successfully:', data))
              .catch(error => console.error('Error posting image:', error));

            })
          }
          
        }, { scope: 'pages_show_list,pages_manage_posts' });

        // Now, you can send the formData via XMLHttpRequest or fetch API
      },
      (error) => {
        this.isDownloading = false;

        console.error('Error fetching the file:', error);
        alert('Error downloading the file. Please try again.');
      }
    );




  }

  downloadFile(fileType: string, url: string, typeRes: string, certNo: string, shouldUpload: boolean): void {
    this.shouldUploadToDrive = shouldUpload; // Set the flag based on user choice
    let fileTypeHeader: string;
    let blobType: string;
    let fileExtension: string;

    // Handle case insensitivity for file types
    const lowerFileType = fileType.toLowerCase();

    switch (lowerFileType) {
        case 'pdf':
            fileTypeHeader = 'application/pdf';
            blobType = 'application/pdf';
            fileExtension = 'pdf';
            break;
        case 'jpeg':
            fileTypeHeader = 'image/jpeg';
            blobType = 'image/jpeg';
            fileExtension = 'jpeg';
            break;
        case 'png':
            fileTypeHeader = 'image/png';
            blobType = 'image/png';
            fileExtension = 'png';
            break;
        default:
            console.error('Unsupported file type requested');
            alert('Unsupported file type. Please choose PDF, JPEG, or PNG.');
            return;
    }

    const headers = new HttpHeaders({
        'Accept': fileTypeHeader,
        'certificateNo': certNo
    });

    const requestOptions = { headers: headers, responseType: 'blob' as 'blob' };

    const fileName = `${typeRes}_${localStorage.getItem('loggedInUser')}_${new Date().toISOString()}`;
    // this.loadingService.show();
    // Make the request to fetch the file
    console.log(`${this.middleUrl}${url}`);
    this.http.get(`${this.middleUrl}${url}`, requestOptions).subscribe(
        (data: Blob) => {
            if (this.shouldUploadToDrive) {
                // Initialize Google API Client
                this.initClient().then(() => {
                    // Always sign in the user
                    this.handleSignIn(data, fileName, blobType); // Always prompt sign-in
                });
            } else {
                // Download blob locally
                this.downloadBlob(data, blobType, fileName, fileExtension);
            }
        },
        (error) => {
            console.error('Error fetching the file:', error);
            alert('Error downloading the file. Please try again.');
        }
    );
}

// Initialize the Google API client
private initClient(): Promise<void> {
    return loadGapiInsideDOM().then(() => {
        return new Promise<void>((resolve, reject) => {
            gapi.load('client:auth2', () => {
                gapi.client.init({
                    clientId: this.client_id,
                    discoveryDocs: this.discovery_docs,
                    scope: this.scopes,
                    apiKey: this.api_key,
                }).then(() => {
                    resolve(); // Resolve once the client is initialized
                }, reject);
            });
        });
    });
}

// Handle user sign-in
private handleSignIn(data: Blob, fileName: string, blobType: string): void {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleAuth.signIn({ prompt: 'consent' }).then(() => {
        // User signed in, now perform the upload
        this.uploadFileFromBlob(data, fileName, blobType).then(() => {
            this.signOut(); // Sign out after successful upload
        });
    }).catch(error => {
        console.error('Sign-in error:', error);
    });
}

// Sign out the user
private signOut(): void {
    const GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleAuth.signOut().then(() => {
        console.log('User signed out successfully.');
    }).catch(error => {
        console.error('Sign-out error:', error);
    });
}

// Upload the blob to Google Drive
private uploadFileFromBlob(data: Blob, fileName: string, mimeType: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const metadata = {
            'name': fileName,
            'mimeType': mimeType,
        };

        const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', data);

        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form,
        }).then(response => response.json()).then(result => {
            console.log('File uploaded to Google Drive:', result);
            this.redirectToFile(result.id); // Redirect to the uploaded file
            resolve(); // Resolve the promise after upload
        }).catch(error => {
            console.error('Error uploading file to Google Drive:', error);
            reject(error); // Reject the promise if there is an error
        });
    });
}

// Redirect to the uploaded file on Google Drive
private redirectToFile(fileId: string): void {
  const driveFileUrl = `https://drive.google.com/drive/home`;
  window.open(driveFileUrl, '_blank'); // Open the file in a new tab
}
  // Download the blob locally
  private downloadBlob(data: Blob, blobType: string, fileName: string, fileExtension: string) {
    const blob = new Blob([data], { type: blobType });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${fileName}.${fileExtension}`;
    this.isDownloading = false;

    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  // handleHtmlResponse(htmlTemp: string, requestOptionsjpg, lowerFileType, blobType: string, fileName: string, fileExtension: string) {
  //   let jpgUrl = this.middleUrl + '/api/inspector/convert?format=' + lowerFileType;
  //   const callJPG = this.http.post(jpgUrl, {
  //     html: htmlTemp
  //   }, requestOptionsjpg);

  //   callJPG.subscribe(
  //     (data) => {
  //       if (data instanceof ArrayBuffer) {
  //         const blob = new Blob([data], { type: blobType });
  //         this.downloadBlob(blob, blobType, fileName, fileExtension);
  //       } else {
  //         this.downloadBlob(data, blobType, fileName, fileExtension);
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching the file:', error);
  //       alert('Error downloading the file. Please try again.');
  //     }
  //   );

  // }


  shareDocument(sharingType, url, templateId, typeRes) {
    console.log({ sharingType });

    let headers = new HttpHeaders({
      'Accept': 'text/html',
      'templateId': templateId
    });

    let requestOptions = { headers: headers, responseType: 'blob' as 'blob' };
    let fileName = `${typeRes}_${localStorage.getItem('loggedInUser')}_${new Date().toISOString()}`;

    this.http.get(`${this.middleUrl}${url}`, requestOptions)
      .subscribe((data) => {
        console.log(data);
        // Download the file
        let blob = new Blob([data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);
        const message = encodeURIComponent(`Check this PDF: ${blobUrl}`);

        switch (sharingType) {
          case 'whatsapp':
            if (this.isMobileDevice()) {
              // Open WhatsApp on mobile
              window.open(`whatsapp://send?text=${message}`, '_blank');
            } else {
              // Open WhatsApp Web on desktop
              window.open(`https://web.whatsapp.com/send?text=${message}`, '_blank');
            }
            break;
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${blobUrl}`, '_blank');
            break;
          case 'linkedin':
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${blobUrl}`, '_blank');
            break;
          case 'sms':
            window.open(`sms:?body=Check this PDF: ${blobUrl}`, '_blank');
            break;
          default:
            break;

        }



      }, (error) => {
        console.error('Error fetching the file:', error);
        // Handle the error as needed
      });



  }

  isMobileDevice(): boolean {
    return /Mobi|Android/i.test(navigator.userAgent);
  }


  delete(apiUrl, outside: boolean = false, wHeader: any = null) {
    var url;
    if (outside) {
      url = apiUrl;
    }
    else {
      url = `${this.baseUrl}/${apiUrl}`;
    }
    url.replace('//', '/');
    const req = {
      url: url
    };

    if (wHeader != null) {
      req['header'] = wHeader;
    }
    return this.dataService.delete(req);
  }


}

