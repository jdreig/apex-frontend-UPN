import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaTickets } from './lista-tickets';

describe('ListaTickets', () => {
  let component: ListaTickets;
  let fixture: ComponentFixture<ListaTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaTickets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
