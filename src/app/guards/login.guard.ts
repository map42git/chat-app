import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

@Injectable()
export class LoginGuard {
    constructor(
        private router: Router
    ) { }
    canActivate(
    ): Observable<boolean> | boolean {
        var user = firebase.auth().currentUser;
        if (user) {
            return true;
        } else {
            this.router.navigate(['login'])
            return false;
        }
    }
}
