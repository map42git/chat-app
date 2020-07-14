
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import * as firebase from "firebase";
import { UserHookService } from "../services/userHook.service";
import { AuthService } from "../services/auth.service";
import { LoadingService } from '../services/loading.service';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs';




@Injectable()
export class LoginGuard {
  fooSubject: Subject<any> = new Subject<any>();
  fooStream: Observable<any> = this.fooSubject.asObservable();

  constructor(
    private router: Router,
    private hook: UserHookService,
    private auth: AuthService,
    private loading: LoadingService,
  ) {
  }
  canActivate(): Promise<boolean> | boolean {
    return this.getUserAuthenticated();
  }
  async getUserAuthenticated(): Promise<boolean> {
    return new Promise(async resolve => {
      this.loading.startSpinner();
      firebase.auth().onAuthStateChanged((user) => {
        this.auth.setUser(user).then(() => {
          if (user) {
            resolve(true);
            this.loading.stopSpinner();
          } else {
            this.router.navigate(["login"]);
            resolve(false);
            this.loading.stopSpinner()
          }
        }).catch(() => {
          this.router.navigate(["login"]);
          resolve(false);
          this.loading.stopSpinner()
        })
      });
    });
  }
}
