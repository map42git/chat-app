import { User } from "./../models/user.model";
import { Component } from "@angular/core";
import { NbSidebarService } from "@nebular/theme";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
} from "angularfire2/firestore";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { ChatRecord } from "src/models/message.model";
import { Chat } from "src/models/chat.model";
import { Note } from "src/models/note.model";
import { ThrowStmt } from "@angular/compiler";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  usersCollection: AngularFirestoreCollection<User>;
  users: BehaviorSubject<User[]>;
  messagesCollection: AngularFirestoreCollection<ChatRecord>;
  messages: BehaviorSubject<ChatRecord[]>;
  notesCollection: AngularFirestoreCollection<Note>;
  notes: BehaviorSubject<Note[]>;
  chatsCollection: AngularFirestoreCollection<Chat>;
  chats: BehaviorSubject<Chat[]>;
  sortedMessages: ChatRecord[];
  readyChats: Chat[];
  activeChatId: any;
  actualUserId: string;
  actualUser: User;
  constructor(
    private sidebarService: NbSidebarService,
    private afs: AngularFirestore
  ) {
    this.messagesCollection = this.afs.collection<ChatRecord>("ChatRecords");
    this.usersCollection = this.afs.collection<User>("Users");
    this.messages = new BehaviorSubject([]);
    this.users = new BehaviorSubject([]);
    this.notes = new BehaviorSubject([]);
    this.chats = new BehaviorSubject([]);
  }
  ngOnInit() {
    this.getChats();
    this.getNotes();
    this.getUsers();
  }
  //USERS
  getUsers() {
    this.usersCollection = this.afs.collection<User>("Users");
    this.usersCollection
      .valueChanges<string>({
        idField: "id",
      })
      .subscribe((_users) => {
        this.users.next(_users);
      });
    this.actualUserId = "0AM5UiukN4IBk0cYRTjN";
  }
  getUserById(id) {
    return this.users.value.find((_user) => _user.id === id);
  }

  // newUser() {
  //   const userModel = new User();
  //   userModel.createdOn = new Date().getTime().toString();
  //   userModel.facebookEmail = userModel.createdOn + "facebook@email.test";
  //   userModel.id = "";
  //   userModel.isHomeUser = true;
  //   userModel.mobileNumber = "0552323233";
  //   userModel.name = "Batman";
  //   this.usersCollection.add({ ...userModel });
  // }
  //

  // notes

  getNotes() {
    this.notesCollection = this.afs.collection<Note>("Notes");
    this.notesCollection
      .valueChanges<string>({
        idField: "chatNoteId",
      })
      .subscribe((_notes) => {
        this.notes.next(_notes);
      });
  }
  newNote(note) {
    if (this.activeChatId) {
      const noteModel = new Note();
      noteModel.chatId = this.activeChatId;
      noteModel.chatNoteId = "";
      noteModel.createdOn = new Date().getTime().toString();
      noteModel.details = note;
      noteModel.userId = this.actualUserId;
      this.notesCollection.add({ ...noteModel });
    } else {
      alert("choose or create chat fisrt!");
    }
  }
  removeNote(event) {
    this.afs.collection<Note>("Notes").doc(event).delete();
  }
  //

  //messages
  getRoomMesages(event) {
    this.activeChatId = event;
    this.messagesCollection
      .valueChanges<string>({
        idField: "chatRecordId",
      })
      .pipe(
        map((messages) => {
          return messages
            .filter((msg) => msg.chatId === event)
            .sort(this.compare);
        })
      )
      .subscribe((_messages) => {
        this.messages.next(_messages);
      });
  }
  newMessage(message) {
    if (this.activeChatId) {
      const messsageModel = new ChatRecord();
      messsageModel.details = message.message;
      messsageModel.createdOn = new Date().getTime().toString();
      messsageModel.userId = this.actualUserId;
      messsageModel.chatRecordId = "";
      messsageModel.chatId = this.activeChatId;
      //mock
      messsageModel.isHomeRecord = true;
      this.messagesCollection.add({ ...messsageModel });
    } else {
      alert("choose or create chat fisrt!");
    }
  }
  //

  // chats
  newChat() {
    const chatModel = new Chat();
    chatModel.chatChannelId = "";
    chatModel.chatId = "";
    chatModel.chatStatusId = "";
    chatModel.createdOn = new Date().getTime().toString();
    chatModel.userId = "";
    this.chatsCollection.add({ ...chatModel });
  }
  getChats() {
    this.chatsCollection = this.afs.collection<Chat>("Chats");
    this.chatsCollection
      .valueChanges<string>({
        idField: "chatId",
      })
      .subscribe((_chats) => {
        this.chats.next(_chats);
      });
  }
  //

  // helpers
  toggle() {
    this.sidebarService.toggle(false, "left");
  }
  toggleNotes() {
    this.sidebarService.toggle(false, "right");
  }
  compare(a, b) {
    if (a.createdOn > b.createdOn) return 1;
    if (b.createdOn > a.createdOn) return -1;
    return 0;
  }
  //
}
