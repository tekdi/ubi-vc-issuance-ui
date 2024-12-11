import { Pipe, PipeTransform } from "@angular/core";
import {
  DomSanitizer,
  SafeHtml,
  SafeStyle,
  SafeScript,
  SafeUrl,
  SafeResourceUrl,
} from "@angular/platform-browser";

@Pipe({
  name: "safeHtml",
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}

  public transform(
    value: any,
    type: string
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    if (value == null || value === undefined) {
      return "";
    }

    switch (type) {
      case "html":
        return this.sanitizer.bypassSecurityTrustHtml(this.sanitizeHtml(value));

      case "style":
        return this.sanitizer.bypassSecurityTrustStyle(value);

      case "script":
        return this.sanitizer.bypassSecurityTrustScript(
          this.sanitizeScript(value)
        );

      case "url":
        return this.sanitizer.bypassSecurityTrustUrl(this.sanitizeUrl(value));

      case "resourceUrl":
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          this.sanitizeUrl(value)
        );

      default:
        return "";
    }
  }

  private sanitizeHtml(html: string): string {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  private sanitizeScript(script: string): string {
    if (script.startsWith("javascript:")) {
      return ""; // Block potentially harmful 'javascript:' links
    }
    return script;
  }

  private sanitizeUrl(url: string): string {
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    return urlPattern.test(url) ? url : ""; // Only allow safe URLs
  }
}
