import { Component, Input } from '@angular/core';
import { SharedDataService } from '../subheader/shared-data.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-mainheader',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent {
  @Input() username: string = '';
  menuConfig: any;
  isSearch: boolean;
constructor(  private sharedDataService: SharedDataService, private location: Location){
  this.sharedDataService.menuConfig$.subscribe(menuConfigData => {
    this.menuConfig = menuConfigData;  
    this.checkSubHeaderTitle();

  });
}
  getInitials(name: string): string {

    return name ? name.charAt(0).toUpperCase() : '';
  }

  searchData(event: any) {
    const searchTerm = event.target.value;
    console.log('Searching for:', searchTerm);
    this.sharedDataService.emitSearchData(searchTerm);

    // Perform your search logic here
  }

  checkSubHeaderTitle()
  {
    for(let i = 0; i< this.menuConfig.menus.length; i++){
    if(this.menuConfig.menus[i].hasOwnProperty('isSearch') && this.menuConfig.menus[i].redirectTo == this.location.path())
    {
        this.isSearch = this.menuConfig.menus[i].isSearch;
    }else{
      this.isSearch = true;
    }
  }
}


}
