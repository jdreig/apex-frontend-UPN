// src/app/core/interceptors/jwt.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private auth = inject(Auth);
  private router = inject(Router);

  // Endpoints que NO deben llevar Authorization
  private SKIP = [
    '/api/autenticarToken',   // emitir token
    '/api/refresh',           // (si implementas refresh servidor)
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = (req.url || '').toLowerCase();
    const skip = this.SKIP.some(p => url.includes(p));

    // 1) Si es endpoint público → pasa directo
    if (skip) {
      return next.handle(req);
    }

    // 2) Si tengo token pero ya venció o está por vencer, intento refrescar ANTES de mandar
    const token = this.auth.getAccessToken();
    const exp = this.auth.getAccessExp(); // epoch ms
    const now = Date.now();
    const margenMs = 30_000; // refrescar si faltan <= 30s

    const tryAttach = (tkn: string | null) => {
      if (!tkn) return req;
      return req.clone({ setHeaders: { Authorization: `Bearer ${tkn}` } });
    };

    // helper: intentar refresh si near-expiry
    const preflight$ = (() => {
      if (token && exp && exp - now <= margenMs) {
        // near expiry → refresh primero
        return this.auth.refresh().pipe(
          switchMap(_ => of(this.auth.getAccessToken())) // usa el nuevo token
        );
      }
      // no refresh: sigue con el token actual (o null)
      return of(token);
    })();

    return preflight$.pipe(
      switchMap((maybeToken) => next.handle(tryAttach(maybeToken))),
      catchError((err: HttpErrorResponse) => {
        // 3) Si recibimos 401/403 intentamos UN refresh y reintentar UNA vez
        if (err.status === 401 || err.status === 403) {
          return this.auth.refresh().pipe(
            switchMap(res => {
              const fresh = this.auth.getAccessToken();
              if (!res || !fresh) {
                // refresh falló → salir a login
                this.auth.logout();
                this.router.navigate(['/login']);
                return throwError(() => err);
              }
              // reintento con nuevo token
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${fresh}` }
              });
              return next.handle(retried);
            }),
            catchError(e2 => {
              // refresh volvió a fallar
              this.auth.logout();
              this.router.navigate(['/login']);
              return throwError(() => e2);
            })
          );
        }
        // otros errores tal cual
        return throwError(() => err);
      })
    );
  }
}
