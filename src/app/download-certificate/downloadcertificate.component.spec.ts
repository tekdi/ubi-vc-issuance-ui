import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadcertificateComponent } from './downloadcertificate.component';

describe('DownloadcertificateComponent', () => {
  let component: DownloadcertificateComponent;
  let fixture: ComponentFixture<DownloadcertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadcertificateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadcertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
