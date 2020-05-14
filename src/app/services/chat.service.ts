import { Injectable } from "@angular/core";
import {
    AngularFirestoreCollection,
    AngularFirestore,
} from "angularfire2/firestore";
import { User } from "src/models/user.model";
import { BehaviorSubject } from "rxjs";
import { Chat } from 'src/models/chat.model';

@Injectable({
    providedIn: "root",
})
export class ChatService {
    chatsCollection: AngularFirestoreCollection<Chat>;
    chats: BehaviorSubject<Chat[]>;
    chatsWithNeededStatus: Chat[] = [];
    constructor(private afs: AngularFirestore) {
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
    getChatsCountByStatus(status) {
        this.chatsWithNeededStatus = this.chats.value.filter(chat => chat.chatStatusId === status);
        return this.chatsWithNeededStatus.length;
    }
}
