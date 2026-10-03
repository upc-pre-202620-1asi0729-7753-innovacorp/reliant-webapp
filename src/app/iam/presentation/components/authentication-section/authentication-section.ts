import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';

@Component({
  selector: 'app-authentication-section',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe],
  templateUrl: './authentication-section.html',
  styleUrl: './authentication-section.css'
})
export class AuthenticationSection {
  #router = inject(Router);
  protected store = inject(IamStore);

  performSignIn() {
    this.#router.navigate(['/iam/sign-in']).then();
  }

  performSignUp() {
    this.#router.navigate(['/iam/sign-up']).then();
  }

  performSignOut() {
    this.store.signOut();
  }
}
