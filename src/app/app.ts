import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { NgIf, AsyncPipe } from '@angular/common';                     
import { LoadingService } from './compartido/loading/loadingservice'; 
import { LoadingComponent } from './compartido/loading/loading'; 
import { Accesibilidad } from './compartido/accesibilidad/accesibilidad';
import { CommonModule  } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,            
    AsyncPipe,       
    LoadingComponent 
    , Accesibilidad, CommonModule],
  template: `
    <router-outlet></router-outlet>
    <app-accesibilidad></app-accesibilidad>
    <app-loading *ngIf="loadingSvc.loading$ | async"></app-loading>
  `
})
export class App implements OnInit, OnDestroy {
  private sub?: Subscription;
  constructor(public loadingSvc: LoadingService, private router: Router) { }

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(filter(e =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ))
      .subscribe(e => {
        if (e instanceof NavigationStart) {
          this.loadingSvc.show();
        } else {
          setTimeout(() => this.loadingSvc.hide(), 200);
        }
      });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
