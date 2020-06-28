import { Injectable } from "@angular/core";
import { User } from 'src/models/user.model';
@Injectable({
    providedIn: "root",
})
export class AuthService {
    currentUser: User;
    constructor() { }
    setUserInfo(user) {
        this.currentUser = user;
        localStorage.setItem('loggedIn', '1')
    }
    getUserInfo() {
        return this.currentUser
    }
}