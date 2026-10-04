import {computed, inject, Injectable, Injector, signal} from '@angular/core';
import {Router} from '@angular/router';
import {IamApi} from '../infrastructure/iam-api';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignInCommand} from '../domain/model/sign-in.command';
import {OrganizationType} from '../domain/model/organization.entity';
import {TraceabilityStore} from '../../traceability/application/traceability.store';
import {EquipmentStore} from '../../equipment/application/equipment.store';
import {User} from '../domain/model/user.entity';
import {Role} from '../domain/model/role.entity';

const TOKEN_KEY = 'reliant.token';
const SESSION_KEY = 'reliant.session';

interface StoredSession {
  userId: number;
  email: string;
  fullName: string;
  organizationId: number;
  organizationType: OrganizationType;
  roleIds: number[];
}

export const ROLE = {
  ORG_ADMIN: 1,
  QUALITY_ENGINEER: 2,
  MAINTENANCE_SUPERVISOR: 3,
  HVOF_OPERATOR: 4,
  RELIABILITY_ENGINEER: 5,
  OPERATIONS_SUPERVISOR: 6,
  PROCUREMENT_ANALYST: 7
} as const;

function restoreSession(): StoredSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw || !localStorage.getItem(TOKEN_KEY)) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

@Injectable({providedIn: 'root'})
export class IamStore {
  readonly #iamApi = inject(IamApi);
  readonly #router = inject(Router);
  readonly #injector = inject(Injector);

  readonly #sessionSignal = signal<StoredSession | null>(restoreSession());
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  readonly isSignedIn = computed(() => this.#sessionSignal() !== null);
  readonly userId = computed(() => this.#sessionSignal()?.userId ?? null);
  readonly email = computed(() => this.#sessionSignal()?.email ?? null);
  readonly fullName = computed(() => this.#sessionSignal()?.fullName ?? null);
  readonly organizationId = computed(() => this.#sessionSignal()?.organizationId ?? null);
  readonly organizationType = computed(() => this.#sessionSignal()?.organizationType ?? null);
  readonly roleIds = computed(() => this.#sessionSignal()?.roleIds ?? []);
  readonly isSupplier = computed(() => this.organizationType() === 'RECUPERATION_SUPPLIER');
  readonly isAssetOwner = computed(() => this.organizationType() === 'ASSET_OWNER');
  readonly isAdmin = computed(() => this.hasRole(ROLE.ORG_ADMIN));
  readonly currentToken = computed(() => this.isSignedIn() ? localStorage.getItem(TOKEN_KEY) : null);
  readonly #usersSignal = signal<User[]>([]);
  readonly users = this.#usersSignal.asReadonly();
  readonly #rolesSignal = signal<Role[]>([]);
  readonly roles = this.#rolesSignal.asReadonly();

  readonly assignableRoles = computed(() => {
    const supplier = ['ROLE_ORG_ADMIN', 'ROLE_QUALITY_ENGINEER', 'ROLE_MAINTENANCE_SUPERVISOR', 'ROLE_HVOF_OPERATOR', 'ROLE_OPERATIONS_SUPERVISOR'];
    const assetOwner = ['ROLE_ORG_ADMIN', 'ROLE_RELIABILITY_ENGINEER', 'ROLE_PROCUREMENT_ANALYST'];
    const allowed = this.isSupplier() ? supplier : assetOwner;
    return this.roles().filter(r => allowed.includes(r.name));
  });

  loadUsersAndRoles() {
    const organizationId = this.organizationId();
    if (!organizationId) return;
    this.#iamApi.getRoles().subscribe({next: roles => this.#rolesSignal.set(roles)});
    this.#iamApi.getUsersByOrganizationId(organizationId).subscribe({next: users => this.#usersSignal.set(users)});
  }

  roleName(roleId: number): string {
    return this.roles().find(r => r.id === roleId)?.name ?? `#${roleId}`;
  }

  updateUserRoles(userId: number, roleIds: number[]) {
    this.#iamApi.updateUserRoles(userId, roleIds.map(roleId => ({roleId}))).subscribe({
      next: updated => this.#usersSignal.update(list => list.map(u => u.id === updated.id ? updated : u)),
      error: (err: Error) => this.#errorSignal.set(err.message)
    });
  }

  hasRole(...roleIds: number[]): boolean {
    return roleIds.some(id => this.roleIds().includes(id));
  }

  signIn(signInCommand: SignInCommand) {
    this.#errorSignal.set(null);
    this.#iamApi.signIn(signInCommand).subscribe({
      next: resource => {
        const session: StoredSession = {
          userId: resource.id,
          email: resource.email,
          fullName: resource.fullName,
          organizationId: resource.organizationId,
          organizationType: resource.organizationType,
          roleIds: resource.roleIds.map(r => r.roleId)
        };
        localStorage.setItem(TOKEN_KEY, resource.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        this.#sessionSignal.set(session);
        this.#reloadStores();
        this.#router.navigate(['/home']).then();
      },
      error: (err: Error) => {
        console.error('Sign-in failed:', err);
        this.#clear();
        this.#errorSignal.set(err.message);
      }
    });
  }

  signUp(signUpCommand: SignUpCommand) {
    this.#errorSignal.set(null);
    this.#iamApi.signUp(signUpCommand).subscribe({
      next: () => this.#router.navigate(['/iam/sign-in']).then(),
      error: (err: Error) => {
        console.error('Sign-up failed:', err);
        this.#clear();
        this.#errorSignal.set(err.message);
      }
    });
  }

  signOut() {
    this.#clear();
    this.#reloadStores();
    this.#router.navigate(['/iam/sign-in']).then();
  }

  #clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.#sessionSignal.set(null);
  }

  #reloadStores() {
    this.#injector.get(TraceabilityStore).reload();
    this.#injector.get(EquipmentStore).reload();
  }



}
