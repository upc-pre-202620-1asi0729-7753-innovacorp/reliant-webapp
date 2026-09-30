import { Component } from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  imports: [
    TranslatePipe
  ],
  selector: 'app-hvof-system-list',
  styleUrl: './hvof-system-list.css',
  templateUrl: './hvof-system-list.html',
})
export class HvofSystemList {}
