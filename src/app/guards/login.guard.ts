import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class LoginGuard {
    constructor(
        private router: Router
    ) { }
    canActivate(
    ): Observable<boolean> | boolean {
        if (
            // logged in
            localStorage.getItem('loggedIn') == '1'
        ) {
            return true;
        } else {
            this.router.navigate(['login'])
            return false;
        }
    }
}
