import { Injectable } from "@angular/core";
import {
  AngularFirestoreCollection,
  AngularFirestore,
} from "angularfire2/firestore";
import { User } from "src/models/user.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserHookService {
  usersCollection: AngularFirestoreCollection<User>;
  users: BehaviorSubject<User[]>;
  constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection<User>("Users");
    this.users = new BehaviorSubject([]);

  }
  public getUsers(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.usersCollection = this.afs.collection<User>("Users");
      this.usersCollection
        .get()
        .subscribe((_users) => {
          let user = [];
          _users.docs.forEach(x => {
            user.push({ ...x.data(), id: x.id })
          })
          this.users.next(user);
          resolve(true)
        });
    })
  }
  getUserById(id) {
    return this.users.value.find((_user) => _user.id === id);
  }
  async getUserByEmail(email) {
    return this.getUsers().then(x => {
      return this.users.value.find((_user) => _user.email === email);
    })
  }
}
