import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { UserHookService } from '../services/userHook.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LoginGuard {
    constructor(
        private router: Router,
        private hook: UserHookService,
        private auth: AuthService
    ) { }
    canActivate(
    ): Observable<boolean> | boolean {
        setTimeout(() => {
            var user = firebase.auth().currentUser;
            if (!user) {
                firebase.auth().signOut().then(() => {
                    this.router.navigate(['login'])
                    localStorage.setItem('user', '')
                }).catch(error => alert(error))
            } else {
                this.auth.setUserInfo(this.hook.getUserByEmail(user.email))
            }
        }, 1500);
        if (localStorage.getItem('loggedIn')) {
            return true;
        } else {
            return false;
        }

    }
}
