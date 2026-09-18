import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.html',   // ya lo tienes en esta carpeta
  styleUrls: ['./loading.css']     // idem
})
export class LoadingComponent{
  @Input() percent: number | null = null;
}