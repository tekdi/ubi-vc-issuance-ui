import { Injectable, EventEmitter } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  // Subject to share data between components
  private dataSource = new Subject<any>();
  private menuConfig = new Subject<any>();

  okButtonClicked: EventEmitter<void> = new EventEmitter<void>();

  private selectedAcademicYearSource = new BehaviorSubject<any>(''); // Default value
  selectedAcademicYear$ = this.selectedAcademicYearSource.asObservable();
  searchDataEmitter: EventEmitter<string> = new EventEmitter<string>();

  private subHeaderTitleSubject = new BehaviorSubject<string>('');
  subHeaderTitle$ = this.subHeaderTitleSubject.asObservable(); // Observable to subscribe to changes

  private approveCertificateSubject = new Subject<void>();
  approveCertificate$ = this.approveCertificateSubject.asObservable();

  // Method to update the subHeaderTitle
  setSubHeaderTitle(newSubHeaderTitle: string) {
    this.subHeaderTitleSubject.next(newSubHeaderTitle);
  }

  // Update the selected year
  setSelectedAcademicYear(year: any): void {
    this.selectedAcademicYearSource.next(year);
  }

  emitApproveCertificate() {
    this.approveCertificateSubject.next();
  }

  // Observable to subscribe to the data
  data$ = this.dataSource.asObservable();
  menuConfig$ = this.menuConfig.asObservable();


  // Function to set data
  setData(data: any) {
    this.dataSource.next(data);
  }

  setMenuConfig(menuConfig: any) {
    this.menuConfig.next(menuConfig);
  }

  triggerOkButtonClick() {
    this.okButtonClicked.emit();
  }

  emitSearchData(searchTerm: string) {
    this.searchDataEmitter.emit(searchTerm);
  }
}
