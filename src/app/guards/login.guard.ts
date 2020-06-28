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
        setTimeout(() => {
            var user = firebase.auth().currentUser;
            if (!user) {
                firebase.auth().signOut().then(() => {
                    this.router.navigate(['login'])
                    localStorage.setItem('loggedIn', '0')
                }).catch(error => alert(error))
            }
        }, 1500);
        if (localStorage.getItem('loggedIn') === '1') {
            return true;
        } else {
            return false;
        }

    }
}
