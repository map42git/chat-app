import { Injectable } from "@angular/core";
import {
    AngularFirestoreCollection,
    AngularFirestore,
} from "angularfire2/firestore";
import { User } from "src/models/user.model";
import { BehaviorSubject } from "rxjs";
import { Chat } from 'src/models/chat.model';
import { AuthService } from './auth.service';
import { error } from 'protractor';

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
    hasNotificationByStatus(status, actualUserId): boolean {
        let hasNotification: boolean = false;
        let filterebByStatusChatsWithDefinedUserRole: Chat[];
        const role = this.auth.getUserInfo()?.role
        if (role == 'admin' || role == 'manager') {
            filterebByStatusChatsWithDefinedUserRole = this.chats.value.filter(chat => chat.chatStatusId === status)
            hasNotification = this.loop(filterebByStatusChatsWithDefinedUserRole)
        } else {
            filterebByStatusChatsWithDefinedUserRole = this.chats.value.filter(chat => chat.chatStatusId === status && chat.assignedUserId === actualUserId)
            hasNotification = this.loop(filterebByStatusChatsWithDefinedUserRole)
        }        
        console.log("hasNotification: ", hasNotification)
        return hasNotification;
    }
    loop(arrayOfChats: Chat[]) {
        for (let index = 0; index < arrayOfChats.length; index++) {
            if (arrayOfChats[index].unreadMessages > 0) {
                return true
            }
        }
    }
}
