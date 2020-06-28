import { Injectable } from "@angular/core";
import {
    AngularFirestoreCollection,
    AngularFirestore,
} from "angularfire2/firestore";
import { User } from "src/models/user.model";
import { BehaviorSubject } from "rxjs";
import { Chat } from 'src/models/chat.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: "root",
})
export class ChatService {
    chatsCollection: AngularFirestoreCollection<Chat>;
    chats: BehaviorSubject<Chat[]>;
    chatsWithNeededStatus: Chat[] = [];
    constructor(private afs: AngularFirestore, private auth: AuthService) {
        this.chatsCollection = this.afs.collection<Chat>("Chats");
        this.chats = new BehaviorSubject([]);
        this.getChats();
    }
    getChats() {
        this.chatsCollection = this.afs.collection<Chat>("Chats");
        this.chatsCollection
            .valueChanges<string>({
                idField: "id",
            })
            .subscribe((_chats) => {
                this.chats.next(_chats);
            });
    }
    getChatsCountByStatus(status, actualUserId) {
        const role = this.auth.getUserInfo()?.role
        role == 'admin' || role == 'manager' ?
            this.chatsWithNeededStatus = this.chats.value.filter(chat => chat.chatStatusId === status) :
            this.chatsWithNeededStatus = this.chats.value.filter(chat => chat.chatStatusId === status && chat.assignedUserId === actualUserId)
        return this.chatsWithNeededStatus.length;
    }
}
