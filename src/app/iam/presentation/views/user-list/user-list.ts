import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';

@Component({
  selector: 'app-user-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, TranslatePipe],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {
  readonly store = inject(IamStore);
  #router = inject(Router);
  displayedColumns = ['fullName', 'email', 'roles', 'status', 'actions'];

  ngOnInit() {
    this.store.loadUsersAndRoles();
  }

  editRoles(userId: number) {
    this.#router.navigate(['iam/users', userId, 'roles']).then();
  }
}
