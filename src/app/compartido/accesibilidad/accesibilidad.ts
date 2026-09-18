import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';

type FieldSelector = string;

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accesibilidad.html',
  styleUrls: ['./accesibilidad.css']
})
export class Accesibilidad implements OnInit, OnDestroy {
  private recognition: any;
  private darkMode = false;
  private fontBase = 16;
  showBack = false;

  private sub?: Subscription;
  // rutas donde NO se muestra "volver"
  private HIDE_BACK_ON = new Set<string>(['/','/login','/principal']);

  // Diccionario de aliases → selectores de campos comunes
  private fieldMap: Record<string, FieldSelector[]> = {
    usuario:     ['#username','[name="usuario"]','[aria-label="Usuario"]','input[autocomplete="username"]'],
    contraseña:  ['#password','[name="contrasena"]','[aria-label="Contraseña"]','input[autocomplete="current-password"]','input[type="password"]'],
    correo:      ['input[type="email"]','[name="correo"]','[aria-label="Correo"]','[placeholder*="correo" i]'],
    documento:   ['[name="documento"]','[aria-label="Documento"]'],
    teléfono:    ['[name="celular"]','[aria-label="Celular"]','[placeholder*="tel" i]'],
    nombres:     ['[name="nombres"]','[aria-label="Nombres"]'],
    apellidos:   ['[name="apellidos"]','[aria-label="Apellidos"]'],
    búsqueda:    ['input[type="search"]','[role="searchbox"]','[placeholder*="buscar" i]']
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    const setBack = (url: string) => {
      const clean = (url || '').split('?')[0];
      this.showBack = !this.HIDE_BACK_ON.has(clean);
    };
    setBack(this.router.url);
    this.sub = this.router.events.pipe(
      filter((e: any) => e instanceof NavigationEnd) // Especificamos que 'e' es de tipo NavigationEnd
    ).subscribe((e: NavigationEnd) => setBack(e.urlAfterRedirects || e.url));
  }

  ngOnDestroy(): void { 
    this.sub?.unsubscribe(); 
  }

  /* ================= Acciones FAB ================= */
  startDictation() {
    const w: any = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { alert('Tu navegador no soporta dictado por voz.'); return; }

    this.recognition = new SR();
    this.recognition.lang = 'es-PE';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (ev: any) => {
      const text = (ev.results?.[0]?.[0]?.transcript || '').trim();
      this.handleVoiceCommand(text.toLowerCase());
    };
    this.recognition.onerror = (err: any) => console.error('Dictado error:', err);
    this.recognition.start();
  }

  readPage() {
    if (!('speechSynthesis' in window)) { alert('Tu navegador no soporta síntesis de voz.'); return; }
    const utter = new SpeechSynthesisUtterance(document.body.innerText);
    utter.lang = 'es-PE';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  toggleFontSize() {
    const body = document.body;
    const current = parseInt(getComputedStyle(body).fontSize, 10) || this.fontBase;
    const next = current <= this.fontBase ? this.fontBase + 4 : this.fontBase; // 16↔20
    body.style.fontSize = `${next}px`;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('prefers-dark', this.darkMode);
  }

  resetAccesibilidad() {
    document.body.style.fontSize = '';
    document.documentElement.classList.remove('prefers-dark');
    window.speechSynthesis?.cancel();
    const el = document.getElementById('live-captions');
    if (el) el.textContent = '';
  }

  goBack() { this.router.navigate(['/principal']); }

  /* =============== Core de comandos de voz =============== */

  private handleVoiceCommand(cmd: string): void {
  const go = (path: string): void => { this.router.navigate([path]); };

  // 1) Navegación
  if (/^ir a (configuracion|configuración)$/i.test(cmd)) { go('/configuracion'); return; }
  if (/^ir a (nuevo ticket|crear)$/i.test(cmd))          { go('/crear');         return; }
  if (/^ir a (mis tickets|lista)$/i.test(cmd))           { go('/listatickets');  return; }
  if (/^ir a (estadisticas|estadísticas)$/i.test(cmd))   { go('/tickets');       return; }

  // 2) Enviar / Guardar
  if (/^(enviar|guardar|iniciar sesión|iniciar sesion)$/i.test(cmd)) {
    this.clickSubmitButton();
    return;
  }

  // 3) Limpiar
  if (/^limpiar$/i.test(cmd)) { this.clearForm(); return; }

  // 4) Foco <campo>
  const foco = cmd.match(/^foco (.+)$/i);
  if (foco) { this.focusField(foco[1].trim()); return; }

  // 5) Escribir <campo> <valor>
  const escribir = cmd.match(/^escribir\s+(\w+)\s+(.+)$/i);
  if (escribir) {
    const field = escribir[1].normalize('NFD').replace(/\p{Diacritic}/gu,'');
    const value = escribir[2];
    this.fillField(field, value);
    return;
  }

  // 6) Atajos específicos: "usuario ..." / "contraseña ..." etc.
  for (const key of Object.keys(this.fieldMap)) {
    const re = new RegExp(`^${key}\\s+(.+)$`, 'i');
    const m = cmd.match(re);
    if (m) { this.fillField(key, m[1]); return; }
  }

  console.log('Comando no reconocido:', cmd);
}
  /* Helpers para formularios */
  private findField(alias: string): HTMLInputElement | null {
    const selectors = this.fieldMap[alias] || [];
    for (const sel of selectors) {
      const el = document.querySelector<HTMLInputElement>(sel);
      if (el) return el;
    }
    // fallback: busca por placeholder aproximado
    const approx = document.querySelector<HTMLInputElement>(`input[placeholder*="${alias}" i]`);
    return approx || null;
  }

  private fillField(alias: string, value: string) {
    const input = this.findField(alias);
    if (!input) return;
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true })); // notifica a Angular ngModel
  }

  private focusField(alias: string) {
    const input = this.findField(alias);
    if (input) input.focus();
  }

  private clickSubmitButton() {
    // intenta con type=submit primero
    let btn = document.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!btn) {
      // por texto común
      btn = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
        .find(b => /iniciar sesión|guardar|enviar/i.test(b.textContent || '')) || null;
    }
    btn?.click();
  }

  private clearForm() {
    const form = document.querySelector('form');
    if (!form) return;
    form.querySelectorAll<HTMLInputElement>('input')
      .forEach(i => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
  }
}
