import { Injectable } from "@angular/core";
import { User } from 'src/models/user.model';
import { UserHookService } from './userHook.service';
import { LoadingService } from './loading.service';
@Injectable({
    providedIn: "root",
})
export class AuthService {
    currentUser: User;
    constructor(
        private hook: UserHookService,
        private loading: LoadingService
    ) { }
    // setUserInfo(user) {
    //     if (user.id) {
    //         this.currentUser = user;
    //     } else {
    //         this.hook.getUserByEmail(user.email).then(user => {
    //             this.currentUser = user
    //         })
    //     }
    //     console.log(this.currentUser);
    // }
    getUserInfo() {
        return this.currentUser
    }
    async setUser(user): Promise<boolean> {
        return new Promise(async resolve => {
            this.loading.startSpinner();
            if (user?.id) {
                this.currentUser = user;
                resolve(true);
                this.loading.stopSpinner();
            } else {
                this.hook.getUserByEmail(user?.email).then(user => {
                    this.currentUser = user
                    resolve(true);
                    this.loading.stopSpinner();
                })
            }
        });
    }

}