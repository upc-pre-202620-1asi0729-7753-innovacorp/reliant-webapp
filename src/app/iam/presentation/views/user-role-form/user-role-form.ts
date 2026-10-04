import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';

@Component({
  selector: 'app-user-role-form',
  imports: [MatListModule, MatButtonModule, TranslatePipe],
  templateUrl: './user-role-form.html',
  styleUrl: './user-role-form.css'
})
export class UserRoleForm implements OnInit {
  readonly store = inject(IamStore);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  readonly userId = toSignal(this.#route.params.pipe(map(p => +p['id'])), {initialValue: 0});
  readonly user = computed(() => this.store.users().find(u => u.id === this.userId()));
  readonly selected = signal<number[]>([]);

  ngOnInit() {
    this.store.loadUsersAndRoles();
  }

  toggle(roleId: number, checked: boolean) {
    this.selected.update(list => checked ? [...new Set([...list, roleId])] : list.filter(id => id !== roleId));
  }

  isSelected(roleId: number): boolean {
    const current = this.selected().length ? this.selected() : (this.user()?.roleIds.map(r => r.roleId) ?? []);
    return current.includes(roleId);
  }

  save() {
    const roleIds = this.selected().length ? this.selected() : (this.user()?.roleIds.map(r => r.roleId) ?? []);
    this.store.updateUserRoles(this.userId(), roleIds);
    this.back();
  }

  back() {
    this.#router.navigate(['iam/users']).then();
  }
}
