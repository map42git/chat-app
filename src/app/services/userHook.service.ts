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
    this.getUsers();
  }
  getUsers() {
    this.usersCollection = this.afs.collection<User>("Users");
    this.usersCollection
      .valueChanges<string>({
        idField: "id",
      })
      .subscribe((_users) => {
        this.users.next(_users);
      });
  }
  getUserById(id) {
    return this.users.value.find((_user) => _user.id === id);
  }
}
