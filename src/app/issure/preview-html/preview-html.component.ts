import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GeneralService } from "src/app/services/general/general.service";
declare let grapesjs: any;
import "grapesjs-preset-webpage";
import { JsonEditorComponent, JsonEditorOptions } from "ang-jsoneditor";
import { ToastMessageService } from "src/app/services/toast-message/toast-message.service";
import { SchemaService } from "../../services/data/schema.service";
import * as newSchema from "./newSchema.json";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GeneralService } from "src/app/services/general/general.service";
declare let grapesjs: any;
import "grapesjs-preset-webpage";
import { JsonEditorComponent, JsonEditorOptions } from "ang-jsoneditor";
import { ToastMessageService } from "src/app/services/toast-message/toast-message.service";
import { SchemaService } from "../../services/data/schema.service";
import * as newSchema from "./newSchema.json";

@Component({
  selector: "app-preview-html",
  templateUrl: "./preview-html.component.html",
  styleUrls: ["./preview-html.component.scss"],
  selector: "app-preview-html",
  templateUrl: "./preview-html.component.html",
  styleUrls: ["./preview-html.component.scss"],
})
export class PreviewHtmlComponent implements OnInit {
  public editorOptions: JsonEditorOptions;
  public data: any;
  @ViewChild(JsonEditorComponent, { static: false })
  jsonEditor: JsonEditorComponent;
  @ViewChild(JsonEditorComponent, { static: false })
  jsonEditor: JsonEditorComponent;
  sampleData: any;
  schemaContent: any;
  userJson: any;
  userHtml: any = "";
  userHtml: any = "";
  templateName: any;
  issuerOsid: string;
  oldTemplateName: string;
  description: any;

  private editor: any = "";
  schemaDiv = false;
  htmlDiv = true;

  demoBaseConfig: {
    width: number;
    height: number;
    resize: boolean;
    autosave_ask_before_unload: boolean;
    codesample_dialog_width: number;
    codesample_dialog_height: number;
    template_popup_width: number;
    template_popup_height: number;
    powerpaste_allow_local_images: boolean;
    plugins: string[]; //removed:  charmap insertdatetime print
    external_plugins: { mentions: string };
    templates: { title: string; description: string; content: string }[];
    toolbar: string;
    content_css: string[];
  };
  certificateTemplate: any;
  certificateProperties: any;
  certificateTitle: any;
  propertyArr: any = [];
  iscredentialSubAdd: boolean;
  id: string;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public toastMsg: ToastMessageService,
    public generalService: GeneralService,
    public schemaService: SchemaService
  ) {
    this.id = this.route.snapshot.paramMap.get("id");
    this.editorOptions = new JsonEditorOptions();

    this.editorOptions.mode = "code";
    this.editorOptions.history = true;
    this.editorOptions.onChange = () => this.jsonEditor.get();

    // this.userHtml = '';

    if (!this.id) {
      if (localStorage.getItem("sampleData")) {
        this.sampleData = JSON.parse(localStorage.getItem("sampleData"));
      } else {
        this.editor.runCommand("core:canvas-clear");

        this.sampleData = this.router.getCurrentNavigation().extras.state.item;
        localStorage.setItem("sampleData", JSON.stringify(this.sampleData));
      }
    }

    this.generalService.getData("/Issuer").subscribe((res) => {
      this.issuerOsid = res[0].osid;
    });
  }

  async ngOnInit() {
    this.userHtml = "";
    if (this.id) {
      await this.getSchemaById();
    } else {
      await this.readHtmlSchemaContent(this.sampleData);
      this.grapesJSDefine();
    }

    /* ------END-------------------------Advance Editor ----------------------- */
  } //onInit();

  getSchemaById() {
    this.generalService.getData("Schema/" + this.id).subscribe((res) => {
      this.schemaContent = res.schema;
      this.sampleData = JSON.parse(res.schema); //._osConfig['certificateTemplates']['html'];
      let url = this.sampleData._osConfig["certificateTemplates"][
        "html"
      ].replace("minio://", "");
      this.certificateTitle = this.sampleData["title"];
      this.templateName = this.certificateTitle;
      this.userJson = this.sampleData;
      this.addCrtTemplateFields(this.sampleData);
      this.getCrtTempFields(this.userJson);

      this.generalService.getData(url, false, {}).subscribe(
        (res) => {
          console.log(res);
          this.userHtml = res;
          this.grapesJSDefine();
        },
        (err) => {
          console.log(err);
          this.userHtml = err.error.text;
          this.grapesJSDefine();
        }
      );
      this.generalService.getData(url, false, {}).subscribe(
        (res) => {
          console.log(res);
          this.userHtml = res;
          this.grapesJSDefine();
        },
        (err) => {
          console.log(err);
          this.userHtml = err.error.text;
          this.grapesJSDefine();
        }
      );
    });
  }

  grapesJSDefine() {
  grapesJSDefine() {
    this.editor = this.initializeEditor();
    this.editor.on("load", () => {
      let panelManager = this.editor.Panels;

      panelManager.removePanel("devices-c");
      panelManager.removeButton("options", "gjs-toggle-images");
      panelManager.removeButton("options", "gjs-open-import-webpage");
      panelManager.removeButton("options", "undo");
      const um = this.editor.UndoManager;
      um.clear();
    });

    this.editor.on("asset:add", () => {
      this.editor.runCommand("open-assets");
    });
    this.editor.on("asset:add", () => {
      this.editor.runCommand("open-assets");
    });

    // This will execute once asset manager will be open
    this.editor.on("run:select-assets", function () {
      let dateNow = "img-" + Date.now();
      let dateNow = "img-" + Date.now();

      // Using below line i am changing the id of img tag on which user has clicked.
      this.editor.getSelected().setId(dateNow);

      // Store active asset manager image id and it's src
      localStorage.setItem("activeAssetManagerImageId", dateNow);
    });

    const pn = this.editor.Panels;
    const panelViews = pn.addPanel({
      id: "views",
    });

    panelViews.get("buttons").add([
      {
        attributes: {
          title: "Open Code",
        },
        className: "fa fa-file-code-o",
        command: "open-code",
        togglable: false, //do not close when button is clicked again
        id: "open-code",
      },
    ]);

    const panelOp1 = pn.addPanel({
      id: "options",
    });

    panelOp1.get("buttons").add([
      {
        attributes: {
          title: "preview",
        },
        className: "fa fa-eye",
        command: "preview",
        togglable: false, //do not close when button is clicked again
        id: "preview",
      },
    ]);

    /* ---------Start----------------------Advance Editor ----------------------- */

    const panelOp = pn.addPanel({
      id: "options",
    });

    let editPanel = null;
    let self = this;
    pn.addButton("views", {
      id: "advanceEditor",
      attributes: { class: "fa fa-pencil-square-o", title: "Advance Editor" },
      active: false,
      togglable: false,
      command: {
        run: function (editor) {
          if (editPanel == null) {
            const editMenuDiv = document.createElement("div");
            const cardDiv = document.createElement("div");
            cardDiv.className = "pcard p-3";
            cardDiv.setAttribute("style", "text-align: left; color:white");
            cardDiv.innerHTML = ` <div class="d-flex flex-justify-between px-2 py-2">
            <div class="heading-2">Preview</div>
            <div>
                <button id="advanceBtn" (click)="editTemplate()"
                    class="float-end adv-btn btn"><i
                        class="fa fa-pencil-square-o" aria-hidden="true"></i>Advance Editor</button>
            </div>
        </div>
        <p style="color:white;font-size:12px"> <i class="fa fa-asterisk" style="color: #FFD965; font-size: 7px;" aria-hidden="true"></i>
        These propeties are mandatory to make it <org> complaint</p>`;

            const cardBContainer = document.createElement("div");
            cardBContainer.className = "card-body-container p-3";
            cardDiv.appendChild(cardBContainer);
            for (let i = 0; i <= self.propertyArr.length - 1; i++) {
              const cardBdiv = document.createElement("div"); // create li element.

              if (self.propertyArr[i].require) {
                cardBdiv.innerHTML =
                  `<i class="fa fa-asterisk" style="color: red; font-size: 7px;" aria-hidden="true"></i> &nbsp` +
                  self.propertyArr[i].propertyTag;
              } else {
                cardBdiv.innerHTML =
                  `&nbsp &nbsp` + self.propertyArr[i].propertyTag; // assigning text to li using array value.
              }
              cardBdiv.className = "pcard-body  mt-4";
              cardBdiv.setAttribute(
                "style",
                "padding-bottom: 10px; border-bottom: 2px solid #000"
              ); // remove the bullets.
              cardBContainer.appendChild(cardBdiv); // append li to ul.
            }

            editMenuDiv.appendChild(cardDiv);
            const panels = pn.getPanel("views-container");
            panels
              .set("appendContent", editMenuDiv)
              .trigger("change:appendContent");
            editPanel = editMenuDiv;

            const urlInputElemen = document.getElementById("advanceBtn");
            urlInputElemen.onclick = function () {
              // here is where you put your ajax logic
              self.editTemplate();
            };
          }
          editPanel.style.display = "block";
        },
        stop: function (editor) {
          if (editPanel != null) {
            editPanel.style.display = "none";
          }
        },
      },
    });
  }

  editTemplate() {
    this.schemaDiv = true;
    this.htmlDiv = false;
  }

  private initializeEditor(): any {
    return grapesjs.init({
      // Indicate where to init the editor. You can also pass an HTMLElement
      container: "#gjs",
      // Get the content for the canvas directly from the element
      // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
      autorender: true,
      forceClass: false,
      height: "700px",
      width: "auto",
      // components: '<h1> Hello </h1>',
      components: this.userHtml,
      // Avoid any default panel
      panels: { defaults: [] },
      deviceManager: {},
      storageManager: {},
      undoManager: {},
      plugins: [
        "gjs-preset-webpage",
        "grapesjs-component-code-editor",
        "gjs-preset-newsletter",
      ],
      pluginsOpts: {
        "gjs-preset-webpage": {
          navbarOpts: false,
          countdownOpts: false,
          formsOpts: false,
          blocksBasicOpts: {
            blocks: [
              "link-block",
              "quote",
              "column1",
              "column2",
              "column3",
              "column3-7",
              "text",
              "link",
              "image",
              "video",
            ],
            // flexGrid: false,
          },
        },
        "gjs-preset-newsletter": {},
      },

      assetManager: {
        uploadText: "Add image through link or upload image",
        modalTitle: "Select Image",
        openAssetsOnDrop: 1,
        inputPlaceholder: "https://url/to/the/image.jpg",
        addBtnText: "Add image",
        showUrlInput: true,
        embedAsBase64: true,
        dropzone: 0, // Enable an upload dropzone on the entire editor (not document) when dragging files over it
        handleAdd: (textFromInput) => {
          this.editor.AssetManager.add(textFromInput);
        },
        assets: [],
      },
    });
  }

  async goTpCertificatePg() {
    if (!this.id) {
      await this.router.navigateByUrl("/certificate");
      window.location.reload();
    } else {
      await this.router.navigateByUrl("/dashboard");
    }
  }

  back() {
    history.back(); //this.router.navigate(['/certificate']);
  }

  backToHtmlEditor() {
    this.schemaDiv = false;
    this.htmlDiv = true;
  }

  cancel() {
    localStorage.setItem("sampleData", "");
    this.router.navigate(["/dashboard"]);
  }

  async readHtmlSchemaContent(doc) {
    this.userHtml = "";
    if (!doc.hasOwnProperty("htmlContent") && !doc.htmlContent) {
      await fetch(doc.schemaUrl)
        .then((response) => response.text())
        .then((data) => {
          this.schemaContent = data;
          data = JSON.parse(data);
          this.certificateTitle = data["title"];
          this.userJson = data;
          this.addCrtTemplateFields(this.schemaContent);
          this.getCrtTempFields(this.userJson);
        });

      await fetch(doc.certificateUrl)
        .then((response) => response.text())
        .then((data) => {
          this.userHtml = data;
        });
    } else {
      await fetch(doc.certificateUrl)
        .then((response) => response.text())
        .then((data) => {
          this.userHtml = data;
        });
    } else {
      this.userHtml = doc.htmlContent;
      this.certificateTitle = "newSchema";
      this.userJson = newSchema.default;
      console.log(newSchema);
    }
  }

  getCrtTempFields(certificateSchema) {
    this.propertyArr = [];
    let temp = certificateSchema.definitions[this.certificateTitle].properties;
    let required =
      certificateSchema.definitions[this.certificateTitle].required;
    let _self = this;
    let propertyName;
    Object.keys(temp).forEach(function (key) {
      if (temp[key].type == "string" || temp[key].type == "number") {
        propertyName = "{{credentialSubject." + key + "}}";
        let isRequire = required.includes(key) ? true : false;
        console.log(propertyName);
        _self.propertyArr.push({
          propertyTag: propertyName,
          require: isRequire,
        });
      } else if (temp[key].type == "object") {
        let objPro = temp[key].properties;
        let objProReq = temp[key].required;
        Object.keys(objPro).forEach(function (key2) {
          propertyName = "{{credentialSubject." + key2 + "}}";
          let isRequire = objProReq.includes(key2) ? true : false;
          console.log(propertyName);
          _self.propertyArr.push({
            propertyTag: propertyName,
            require: isRequire,
          });
        });
      } else if (temp[key].type == "array") {
        propertyName =
          "{{#each credentialSubject." + key + "}} {{this}} {{/each}}";
        _self.propertyArr.push({ propertyTag: propertyName, require: false });
      }
    });

    this.addCrtTemplateFields(this.sampleData);
    this.grapesJSDefine();
  }

  stringToHTML(str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
    return doc.body;
  }

  replaceAll(str, find, replace) {
    let escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, "g"), replace);
  }

  addCrtTemplateFields(schemaContent) {
    // this.schemaContent = (this.schemaContent && (typeof(this.sampleData) != 'object')) ? JSON.parse(this.schemaContent) : this.userJson;
    this.schemaContent =
      typeof schemaContent != "object"
        ? JSON.parse(schemaContent)
        : this.userJson;

    let certTmpJson =
      this.schemaContent && this.schemaContent != ""
        ? this.schemaContent
        : this.userJson;
    certTmpJson = certTmpJson["_osConfig"].hasOwnProperty("credentialTemplate")
      ? certTmpJson["_osConfig"]["credentialTemplate"]
      : "";
    if (typeof certTmpJson == "string" && certTmpJson != "") {
      let jsonUrl = certTmpJson;

      fetch(jsonUrl)
        .then((response) => response.text())
        .then((data) => {
          this.schemaContent["_osConfig"]["credentialTemplate"] = data;

          // this.schemaContent = data;
          console.log({ data });
          // console.log(JSON.parse(data));
        });
    } else {
      certTmpJson = certTmpJson != "" ? certTmpJson["credentialSubject"] : {};
      certTmpJson["type"] =
        certTmpJson.hasOwnProperty("type") && certTmpJson != ""
          ? certTmpJson["type"]
          : this.schemaContent.title;

      if (this.schemaContent) {
        let _self = this;
        let propertyData =
          this.schemaContent.definitions[this.certificateTitle].properties;

        if (
          !this.schemaContent._osConfig.hasOwnProperty("credentialTemplate")
        ) {
          this.schemaContent._osConfig["credentialTemplate"] = {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              {
                "@context": {
                  "@version": 1.1,
                  "@protected": true,
                },
              },
            ],
          };
        }

        let contextJson =
          this.schemaContent._osConfig.credentialTemplate["@context"][1][
            "@context"
          ];

        contextJson[certTmpJson["type"]] = {
          "@id":
            "https://github.com/sunbird-specs/vc-specs#" + certTmpJson["type"],
          "@context": {
            name: "schema:Text",
          },
        };

        Object.keys(propertyData).forEach(function (key) {
          console.log({ key });

          if (key != "name") {
            if (
              propertyData[key].type == "string" ||
              propertyData[key].type == "number"
            ) {
              certTmpJson[key] = "{{" + key + "}}";
              contextJson[certTmpJson["type"]]["@context"][key] = "schema:Text";
            } else if (propertyData[key].type == "object") {
              let objPro = propertyData[key].properties;
              Object.keys(objPro).forEach(function (key2) {
                certTmpJson[key2] = "{{" + key + "." + key2 + "}}";
                contextJson[certTmpJson["type"]]["@context"][key2] =
                  "schema:Text";
              });
            }
          }
        });

        this.schemaContent["_osConfig"]["credentialTemplate"][
          "credentialSubject"
        ] = certTmpJson;
        this.schemaContent._osConfig.credentialTemplate["@context"][1][
          "@context"
        ] = contextJson;
        this.userJson = this.schemaContent;
      }
    }
  }

  async submit() {
    this.schemaContent =
      this.schemaContent && typeof this.schemaContent != "string"
        ? this.schemaContent
        : this.userJson;

    // if(!this.schemaContent['_osConfig'].hasOwnProperty('credentialTemplate'))
    // {
    //   this.getCrtTempFields(this.schemaContent)
    // }

    let htmlWithCss = this.editor.runCommand("gjs-get-inlined-html");

    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(htmlWithCss, "text/html");
    this.userHtml = htmlDoc.documentElement.innerHTML;

    // Creating a file object with some content
    let fileObj = new File(
      [this.userHtml],
      this.templateName.replace(/\s+/g, "") + ".html"
    );

    let str = this.templateName.replace(/\s+/g, "");
    this.templateName = str.charAt(0).toUpperCase() + str.slice(1);
    // Create form data
    const formData = new FormData();
    // Store form name as "file" with file data
    formData.append("files", fileObj, fileObj.name);
    this.generalService
      .postData("/Issuer/" + this.issuerOsid + "/schema/documents", formData)
      .subscribe((res) => {
        // this.schemaContent = JSON.parse(this.schemaContent);
        let _self = this;
        Object.keys(this.schemaContent["properties"]).forEach(function (key) {
          _self.oldTemplateName = key;
        });

        this.schemaContent._osConfig["certificateTemplates"] = {
          html: "minio://" + res.documentLocations[0],
        };

        let result = JSON.stringify(this.schemaContent);

        result = this.replaceAll(
          result,
          this.oldTemplateName,
          this.templateName
        );
        result = this.replaceAll(result, "nameofthestudent", "name");

        let payload = {
          name: this.templateName,
          description: this.description,
          schema: result,
          status: "PUBLISHED",
        };

        if (res.documentLocations[0]) {
          if (!this.id) {
            this.generalService.postData("/Schema", payload).subscribe(
              (res) => {
                localStorage.setItem("content", "");
                this.router.navigate(["/dashboard"]);
              },
              (err) => {
                console.log("err ----", err);
                this.toastMsg.error("error", err.error.params.errmsg);
              }
            );
          } else {
            this.generalService.putData("/Schema", this.id, payload).subscribe(
              (res) => {
                localStorage.setItem("content", "");
                this.router.navigate(["/dashboard"]);
              },
              (err) => {
                console.log("err ----", err);
                this.toastMsg.error("error", err.error.params.errmsg);
              }
            );
          }
        }
      });
  }

  showPopup() {
    let htmlWithCss = this.editor.runCommand("gjs-get-inlined-html");

    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(htmlWithCss, "text/html");
    this.userHtml = htmlDoc.documentElement.innerHTML;

    this.iscredentialSubAdd = this.userHtml.includes("credentialSubject");

    let button = document.createElement("button");
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", `#saveDocumentData`);
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  injectHTML() {
    const iframe: HTMLIFrameElement = document.getElementById(
      "iframe2"
    ) as HTMLIFrameElement;

    let iframedoc;
    if (iframe.contentDocument) iframedoc = iframe.contentDocument;
    else if (iframe.contentWindow) iframedoc = iframe.contentWindow.document;

    if (iframedoc) {
      // Put the content in the iframe
      iframedoc.open();
      iframedoc.writeln(this.userHtml);
      iframedoc.close();
    } else {
      alert("Cannot inject dynamic contents into iframe.");
    }
  }

  jsonSchemaData(jsonSchema) {
    this.schemaContent = jsonSchema._data;
    this.getCrtTempFields(this.schemaContent);
    this.schemaDiv = false;
    this.htmlDiv = true;
  }

  ngOnDestroy() {
    this.editor.runCommand("core:canvas-clear");
  }
}
