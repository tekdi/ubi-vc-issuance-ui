import { Component, Input, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ConfirmModalService } from '../modal/confirmModal/confirmModal.service';
import { SharedDataService } from '../subheader/shared-data.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements AfterViewChecked {
  @Input() menuConfig: any = {};
  activeMenu: any;
  modalInfo: any;
  constructor(private router: Router, private cdRef: ChangeDetectorRef,
    private sharedDataService: SharedDataService, private location: Location,
    private confirmModalService: ConfirmModalService) {


    this.sharedDataService.menuConfig$.subscribe(menuConfigData => {
      this.menuConfig = menuConfigData;
      this.setActiveMenuBasedOnRoute(this.location.path());
    })
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges(); // Ensure any changes in the active menu are detected
  }

  setActiveMenu(activeMenu: string) {
    this.activeMenu = activeMenu;
    this.cdRef.detectChanges();
  }

  private setActiveMenuBasedOnRoute(url: string) {
    // Find the menu item that matches the current URL and set it as active
    const matchingMenu = this.menuConfig.menus.find(menu => url.startsWith(menu.redirectTo));
    if (matchingMenu) {
      this.setActiveMenu(matchingMenu.title);
    }
  }


  doLogout() {

    this.modalInfo = {
      "title": "Logout",
      "message": "Are you sure you want to Logout?",
      "titleCss": "titleClr-g",
      "buttons": [
        {
          "title": "Logout",
          "classes": "btn-primary dsn-g-btn",
          "action": "redirect",
          "redirectTo": "/logout",
          "call": "delete",
        },
        {
          "title": "Cancel"
        }
      ]

    };

    setTimeout(() => {

      this.confirmModalService.updateModalData([this.modalInfo]); // Pass updated data

      // this.confirmModalService.initializeModal('confirmModal');

      this.confirmModalService.showModal();
    }, 500);

  }

}
