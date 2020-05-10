import { HttpClient, HttpHandler } from "@angular/common/http";
import { HttpService } from "./services/http.service";
import { User } from "./../models/user.model";
import { Component } from "@angular/core";
import {
  NbSidebarService,
  NbLayoutDirectionService,
  NbLayoutDirection,
  NbThemeService,
} from "@nebular/theme";
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
  videoChatMode: Boolean = false;
  chatSize: any;
  isFrameExpanded: any;
  darkMode: Boolean = false;
  roomUrl: string;
  constructor(
    private sidebarService: NbSidebarService,
    private afs: AngularFirestore,
    private directionService: NbLayoutDirectionService,
    private themeService: NbThemeService,
    private http: HttpService
  ) {
    this.directionService.setDirection(NbLayoutDirection.RTL);
    this.messagesCollection = this.afs.collection<ChatRecord>(
      "ChatRecords",
      (ref) => ref.orderBy("createdOn", "asc")
    );
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
    this.http.getAccessToken().then(() => {
      this.http.get("room", "create").subscribe((res) => {
        console.log(res);

        this.roomUrl = `${res.roomUrl}?pwd=${this.http.accessToken}`;
      });
    });
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
    //mock
    // oFIqqOb9dY9B6x595BgS שולמית אלוני
    // 0AM5UiukN4IBk0cYRTjN בן גוריון
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
          return messages.filter((msg) => msg.chatId === event);
        })
      )
      .subscribe((_messages) => {
        this.messages.next(_messages);
      });
  }
  newMessage(message) {
    const files = !message.files
      ? []
      : message.files.map((file) => {
          return {
            url: file.src,
            type: file.type,
            icon: "file-text-outline",
          };
        });
    if (this.activeChatId) {
      const messsageModel = new ChatRecord();
      messsageModel.details = message.message;
      messsageModel.createdOn = new Date().getTime().toString();
      messsageModel.userId = this.actualUserId;
      messsageModel.chatRecordId = "";
      messsageModel.chatId = this.activeChatId;
      messsageModel.files = files.length ? files : null;
      (messsageModel.type = files.length ? "file" : "text"),
        //mock
        (messsageModel.isHomeRecord = true);
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
    chatModel.chatStatusId = "";
    chatModel.createdOn = new Date().getTime().toString();
    chatModel.userId = this.actualUserId;
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
  removeChat(event) {
    this.afs.collection<Chat>("Chats").doc(event).delete();
  }
  //

  // helpers
  expandFrame(event) {
    this.isFrameExpanded = event;
  }
  toggle() {
    this.sidebarService.toggle(false, "right");
  }
  toggleNotes() {
    this.sidebarService.toggle(false, "left");
  }
  toVideoChat() {
    this.videoChatMode = !this.videoChatMode;
  }
  switchTheme() {
    var theme: string;
    this.darkMode = !this.darkMode;
    this.darkMode ? (theme = "cosmic") : (theme = "default"),
      this.themeService.changeTheme(theme);
  }
  // compare(a, b) {
  //   if (a.createdOn > b.createdOn) return 1;
  //   if (b.createdOn > a.createdOn) return -1;
  //   return 0;
  // }
  //
}
