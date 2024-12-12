import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VcApprovedListComponent } from './vc-approved-list.component';

describe('VcApprovedListComponent', () => {
  let component: VcApprovedListComponent;
  let fixture: ComponentFixture<VcApprovedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VcApprovedListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VcApprovedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
