import { Component, OnInit } from "@angular/core";
import {
  AngularFirestoreCollection,
  AngularFirestore,
} from "angularfire2/firestore";
// import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { User } from "src/models/user.model";
import { BehaviorSubject } from "rxjs";
import { ChatRecord } from "src/models/message.model";
import { Note } from "src/models/note.model";
import { Chat } from "src/models/chat.model";
import {
  NbSidebarService,
  NbLayoutDirectionService,
  NbThemeService,
  NbLayoutDirection,
  NB_DEFAULT_ROW_LEVEL,
} from "@nebular/theme";
import { HttpService } from "src/app/services/http.service";
import { map, shareReplay, tap, take } from "rxjs/operators";
import { Router } from "@angular/router";
import * as firebase from "firebase";
import { Http } from "@angular/http";
import { TimeService } from "src/app/services/time.service";
import { AuthService } from "src/app/services/auth.service";
import { UserHookService } from "src/app/services/userHook.service";
import { TextcutterService } from "src/app/services/textcutter.service";
import { getLocaleFirstDayOfWeek } from "@angular/common";
import { LoginComponent } from "../login/login.component";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  usersCollection: any;
  users: BehaviorSubject<User[]>;
  messagesCollection: AngularFirestoreCollection<ChatRecord>;
  messages: BehaviorSubject<ChatRecord[]>;
  notesCollection: AngularFirestoreCollection<Note>;
  notes: BehaviorSubject<Note[]>;
  chatsCollection: any;
  chats: BehaviorSubject<Chat[]>;
  sortedMessages: ChatRecord[];
  readyChats: Chat[];
  activeChatId: any;
  actualUserId: string;
  actualUser: User;
  videoChatMode: Boolean = true;
  chatSize: any;
  isFrameExpanded: any;
  darkMode: Boolean = false;
  roomUrlWithToken: string;
  shareUrl: any;
  roomUrl: any;
  activeChat: Chat;
  adminAccess: boolean;
  usersWithRoles: User[];
  tempChatsFilteredByStatus: Chat[];
  messagesCollectionRequest: any;
  lastVisible: any;
  lastVisibleInit: any;
  db: any;
  constructor(
    private sidebarService: NbSidebarService,
    private afs: AngularFirestore,
    private directionService: NbLayoutDirectionService,
    private themeService: NbThemeService,
    private http: HttpService,
    private router: Router,
    private httpClient: Http,
    public time: TimeService,
    private auth: AuthService,
    public hook: UserHookService,
    public text: TextcutterService // public db: AngularFireDatabase
  ) {
    // var config = {
    //   apiKey: "AIzaSyAqd50KL19k7O-Zj3usDafq9Y7zVZ_4ghQ",
    //   authDomain: "upstartchat.firebaseapp.com",
    //   projectId: "upstartchat"
    // };
    // var app = firebase.initializeApp(config);
    this.db = firebase.firestore();
    this.directionService.setDirection(NbLayoutDirection.RTL);
    this.usersCollection = this.afs.collection<User>("Users");
    this.messages = new BehaviorSubject([]);
    this.users = new BehaviorSubject([]);
    this.notes = new BehaviorSubject([]);
    this.chats = new BehaviorSubject([]);
  }
  ngOnInit() {
    this.getUsers();
    this.http.getAccessToken().then(() => {
      this.http.get("room", "create").subscribe((res) => {
        this.roomUrl = res.roomUrl;
        this.roomUrlWithToken = `${res.roomUrl}?pwd=${this.http.accessToken}`;
      });
    });
    // this.getMessages().valueChanges().subscribe(res => console.log(res));
    //
    // this.newUser()
  }
  // getMessages(): AngularFireList<ChatRecord[]> {
  //   return this.db.collection('ChatRecords', ref => {
  //     return ref.limitToLast(25).orderByKey()
  //   })
  // }
  //USERS
  getUsers() {
    this.db
      .collection("Users").onSnapshot((querySnapshot) => {
        let users = [];
        querySnapshot.docs.forEach((doc) => {

          users.push({ ...doc.data(), id: doc.id });
        });
        console.log(users)
        this.users.next(users);
        console.log(this.users.value);

      });
    this.usersWithRoles = this.users?.value?.filter(
      (x) =>
        x.role == "admin" || x.role == "manager" || x.role == "employee"
    );
    this.actualUserId = localStorage.getItem("user");
    this.hook.getUserById(this.actualUserId)?.role == "manager" ||
      this.hook.getUserById(this.actualUserId)?.role == "admin"
      ? (this.adminAccess = true)
      : (this.adminAccess = false);
    this.getChats();
    this.getNotes();
  }
  getUserById(id) {
    return this.users.value.find((_user) => _user.id === id);
  }

  newUser() {
    const userModel = new User();
    userModel.createdOn = new Date().getTime().toString();
    userModel.facebookEmail = userModel.createdOn + "facebook@email.test";
    userModel.email = "aksm@x42.com";
    userModel.id = "";
    userModel.mobileNumber = "0552323233";
    userModel.name = "Batman";
    userModel.role = "manager";
    this.usersCollection.add({ ...userModel });
  }

  getNotes() {
    this.db.collection('Notes').orderBy("createdOn", "desc").onSnapshot((querySnapshot) => {
      let notes = [];
      querySnapshot.docs.forEach((doc) => {
        notes.push({ ...doc.data(), chatNoteId: doc.id });
      });
      this.notes.next(notes);

    });
    // this.notesCollection = this.afs.collection<Note>("Notes", (ref) =>
    //   ref.orderBy("createdOn", "desc")
    // );
    // this.notesCollection
    //   .valueChanges<string>({
    //     idField: "chatNoteId",
    //   })
    //   .pipe(
    //     tap((arr) => console.log(arr.length)),
    //     shareReplay(1)
    //   )
    //   .subscribe((_notes) => {
    //     this.notes.next(_notes);
    //   });
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

  //messages
  getMoreMessages() {
    this.db
      .collection("ChatRecords")
      .where("chatId", "==", this.activeChatId)
      .orderBy("createdOn", "desc")
      .startAt(this.lastVisible)
      .limit(25).get().then((querySnapshot) => {
        if (
          querySnapshot.docs.length > 0
        ) {
          this.lastVisible =
            querySnapshot.docs[querySnapshot.docs.length - 1];
          this.lastVisible.chatRecordId = querySnapshot.docs[querySnapshot.docs.length - 1].id;
          querySnapshot.forEach((doc) => {
            let item = doc.data();
            item.chatRecordId = doc.id;
            if (item.chatRecordId != this.lastVisible.chatRecordId) {
              this.messages.value.unshift(doc.data());
            } else {
              // ! unsubscrive from scroll listener !
            }
          });
        }
      });
  }

  getRoomMesages(chatId) {
    if (this.activeChatId != chatId) {
      this.db
        .collection("ChatRecords")
        .where("chatId", "==", chatId)
        .orderBy("createdOn", "desc")
        .limit(25).onSnapshot((querySnapshot) => {
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          var messages = [];
          querySnapshot.docs.forEach((doc) => {
            messages.unshift(doc.data());
          });
          this.messages.next(messages);
          console.log(this.lastVisible)
          this.activeChatId = chatId;
          this.scrollChatAreaToTheBottom();
          this.activeChat = this.chats
            .getValue()
            ?.filter((x) => x.chatId == chatId)[0];
        });
    }
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
      this.httpClient
        .post(
          "https://us-central1-upstartchat.cloudfunctions.net/addMessageToUser",
          messsageModel
        )
        .subscribe(() => {
          this.db.collection("ChatRecords").add({ ...messsageModel });
          this.afs.collection("Chats").doc(this.activeChatId).update({
            lastActivity: new Date().getTime().toString(),
          });
        });
    } else {
      alert("Choose or create chat first!");
    }
  }
  //

  // chats
  changeStatus(status) {
    this.activeChat.chatStatusId = status;
    this.afs.collection("Chats").doc(this.activeChatId).update({
      chatStatusId: status,
    });
  }
  filterStatus(status) {
    this.tempChatsFilteredByStatus = this.chats?.value?.filter(
      (x) => x.chatStatusId == status
    );
    this.getRoomMesages(this.tempChatsFilteredByStatus[0]?.chatId);
  }
  getChats() {
    this.db
      .collection("Chats")
      .orderBy("lastActivity", "desc").onSnapshot((querySnapshot) => {
        let chats = [];
        querySnapshot.docs.forEach((doc) => {
          chats.push({ chatId: doc.id, ...doc.data() });
        });
        console.log(chats)
        this.chats.next(chats);
        this.tempChatsFilteredByStatus = this.chats.value;
        !this.activeChatId ? this.filterStatus("new") : "";

      });
  }

  //helpers
  assignTo(userId) {
    this.afs.collection("Chats").doc(this.activeChatId).update({
      assignedUserId: userId,
    });
  }
  scrollChatAreaToTheBottom() {
    setTimeout(() => {
      document.getElementsByClassName("scrollable")[0]?.scroll(0, 50000);
      this.afs.collection("Chats").doc(this.activeChatId).update({
        unreadMessages: 0,
      });
    }, 200);
  }
  toConsole() {
    this.router.navigate(["console"]);
  }
  logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.router.navigate(["login"]);
        localStorage.setItem("loggedIn", "");
      })
      .catch((error) => alert(error));
  }
  // removeChat(event) {
  //   this.afs.collection<Chat>("Chats").doc(event).delete();
  // }
  // expandFrame(event) {
  //   this.isFrameExpanded = event;
  // }
  // toggle() {
  //   this.sidebarService.toggle(false, "right");
  // }
  // toggleNotes() {
  //   this.sidebarService.toggle(false, "left");
  // }
  // toVideoChat() {
  //   this.videoChatMode = !this.videoChatMode;
  // }
  // switchTheme() {
  //   var theme: string;
  //   this.darkMode = !this.darkMode;
  //   this.darkMode ? (theme = "cosmic") : (theme = "default"),
  //     this.themeService.changeTheme(theme);
  // }
  putShareLink() {
    this.shareUrl = null;
    setTimeout(() => {
      this.shareUrl = this.roomUrl;
    }, 100);
  }
}
