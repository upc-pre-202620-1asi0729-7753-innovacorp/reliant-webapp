import { Component } from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  imports: [
    TranslatePipe
  ],
  selector: 'app-spray-session-list',
  styleUrl: './spray-session-list.css',
  templateUrl: './spray-session-list.html',
})
export class SpraySessionList {}
