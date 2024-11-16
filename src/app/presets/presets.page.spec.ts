import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetsPage } from './presets.page';

describe('Tab2Page', () => {
  let component: PresetsPage;
  let fixture: ComponentFixture<PresetsPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(PresetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
