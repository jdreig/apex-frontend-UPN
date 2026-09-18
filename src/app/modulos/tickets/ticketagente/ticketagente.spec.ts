import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ticketagente } from './ticketagente';

describe('Ticketagente', () => {
  let component: Ticketagente;
  let fixture: ComponentFixture<Ticketagente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ticketagente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ticketagente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
