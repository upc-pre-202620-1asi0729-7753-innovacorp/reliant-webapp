import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-page-not-found',
  imports: [MatButton],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css'
})
export class PageNotFound implements OnInit {
  protected invalidPath = '';
  #route: ActivatedRoute = inject(ActivatedRoute);
  #router: Router = inject(Router);

  ngOnInit() {
    this.invalidPath = this.#route.snapshot.url.map(url => url.path).join('/');
  }

  protected navigateToHome() {
    this.#router.navigate(['home']).then();
  }
}
