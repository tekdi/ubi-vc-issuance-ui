import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'linkedin-callback',
  templateUrl: './linkedin-callback.component.html',
  styleUrls: ['./linkedin-callback.component.scss']
})
export class LinkedinCallbackComponent implements OnInit {
  clientId = '86okaw3uu5wum6';
   clientSecret = 'WPL_AP1.tJxXUEuaiOsYrzQk.KLI71A==';
   redirectUri = 'https://dev.educert.ng/linkedin-callback';
  accessToken: any;
  user_id: string = "5qaXTXuK2l";
  constructor(private route: ActivatedRoute,
    private httpClient:HttpClient) { }


  ngOnInit(): void {
    // Retrieve the authorization code from LinkedIn's response
    this.route.queryParams.subscribe(params => {
        console.log({params});
      const authorizationCode = params['code'];
      if (authorizationCode) {
        // Process the code or redirect to a service to exchange it for an access token
        console.log("Authorization Code:", authorizationCode);
        this.getAccessToken(authorizationCode);
        // Optionally, navigate away or handle the code here
      } else {
        console.error("Authorization code not present");
      }
    });
  }

  async getAccessToken(authorizationCode: string) {
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', authorizationCode)
      .set('redirect_uri', this.redirectUri)
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret);

    // const response: any = await lastValueFrom(this.http.post(tokenUrl, null, { params }));
    // Replace lastValueFrom with toPromise
const response: any = await this.httpClient.post(tokenUrl, null , {params}).toPromise();
console.log({response})
    this.accessToken = response.access_token;

    this.accessToken = response.access_token; // This is your access token

  //  this.getUseiId();
  this.postCertificateOnLinkedIn(null, this.accessToken)

   
  }

  getUseiId()
  {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`
    });

    this.httpClient.get('https://api.linkedin.com/v2/userinfo',  {headers} ).subscribe(response => {
      console.log(response['id']);  // This is your person URN
      this.user_id = response['sub'];
      this.postCertificateOnLinkedIn(null, this.accessToken)
    
    });
  }

  async postCertificateOnLinkedIn(file: File, token: string): Promise<void> {
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";//await this.convertImageToBase64(file);
    const registerResponse = await this.registerImageUpload(token);
    const uploadUrl = registerResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerResponse.value.asset;
  
    await this.uploadImageToLinkedIn(uploadUrl, base64Image);
    await this.createLinkedInPost(token, asset);
  }
  


async registerImageUpload(token: string): Promise<any> {
  const url = 'https://api.linkedin.com/v2/assets?action=registerUpload';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const body = {
    registerUploadRequest: {
      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
      owner: "urn:li:orgnization:" + this.user_id,  // Replace with LinkedIn User ID
      serviceRelationships: [
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent"
        }
      ]
    }
  };

  return this.httpClient.post(url, body, { headers }).toPromise();
}


async uploadImageToLinkedIn(uploadUrl: string, base64Image: string): Promise<void> {
    const blob = this.base64ToBlob(base64Image);
    const headers = {
      'Content-Type': 'application/octet-stream'
    };
  
    await this.httpClient.put(uploadUrl, blob, { headers }).toPromise();
  }
  
  base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
  
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: 'image/jpeg' }); // adjust if other formats
  }

  
  async createLinkedInPost(token: string, asset: string): Promise<void> {
    const url = 'https://api.linkedin.com/v2/ugcPosts';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    };
    const body = {
      author: "urn:li:orgnization:" + this.user_id,  // Replace with LinkedIn User ID
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: "Here's my new certificate!"
          },
          shareMediaCategory: "IMAGE",
          media: [
            {
              status: "READY",
              description: {
                text: "Certification image"
              },
              media: asset,  // The asset URN from upload step
              title: {
                text: "My Certificate"
              }
            }
          ]
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };
  
    await this.httpClient.post(url, body, { headers }).toPromise();
  }
  


 }
