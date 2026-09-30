import { Component } from '@angular/core';
import { TranslatePipe} from '@ngx-translate/core';

@Component({
  imports: [
    TranslatePipe
  ],
  selector: 'app-component-list',
  styleUrl: './component-list.css',
  templateUrl: './component-list.html',
})
export class ComponentList {}
