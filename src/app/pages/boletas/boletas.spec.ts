import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Boletas } from './boletas';

describe('Boletas', () => {
  let component: Boletas;
  let fixture: ComponentFixture<Boletas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boletas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Boletas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
