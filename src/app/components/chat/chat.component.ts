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
    this.messagesCollection = this.afs.collection<ChatRecord>(
      "ChatRecords",
      (ref) => ref.orderBy("createdOn", "desc").limit(25)
    );
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
    this.usersCollection = this.afs.collection<User>("Users");
    this.usersCollection
      .valueChanges<string>({
        idField: "id",
      })
      .pipe(
        tap((arr) => console.log(arr.length)),
        shareReplay(1)
      )
      .subscribe((_users) => {
        this.users.next(_users);
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
      });
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
    this.notesCollection = this.afs.collection<Note>("Notes", (ref) =>
      ref.orderBy("createdOn", "desc")
    );
    this.notesCollection
      .valueChanges<string>({
        idField: "chatNoteId",
      })
      .pipe(
        tap((arr) => console.log(arr.length)),
        shareReplay(1)
      )
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
  getMoreMessages() {
    this.db
      .collection("ChatRecords")
      .where("chatId", "==", this.activeChatId)
      .orderBy("createdOn", "desc")
      .limit(25)
      .get()
      .then((querrySnapshot) => {
        this.lastVisible = querrySnapshot.docs[querrySnapshot.docs.length - 1];
        var next = this.db
          .collection("ChatRecords")
          .where("chatId", "==", this.activeChatId)
          .orderBy("createdOn", "desc")
          .startAfter(this.lastVisible)
          .limit(25);
        next.get().then((querySnapshot) => {
          if (querySnapshot.length > 0) {
            this.lastVisible =
              querySnapshot.docs[querrySnapshot.docs.length - 1];
          }
          querySnapshot.forEach((doc) => {
            this ? console.log(this.messages.value) : "";

            // doc.data() is never undefined for query doc snapshots
            this.messages.value.push(doc.data());
          });
        });

        //   this.db.collection("ChatRecords").get().then(function(querySnapshot) {
        //     querySnapshot.forEach(function(doc) {
        //         // doc.data() is never undefined for query doc snapshots
        //         console.log(doc.id, " => ", doc.data());
        //     });
        // });
        // querrySnapshot.forEach(doc => {
        //   console.log(doc.data());
        // })
      });

    // this.lastVisible = this.messages.getValue()[this.messages.getValue().length - 1]
    // // var next = this.afs.collection("ChatRecords", (ref) => ref.orderBy("createdOn", "desc").startAt(this.lastVisible).limit(25));
    // // next.valueChanges().subscribe(messages => {
    // //   // this.lastVisible = messages[messages.length - 1];
    // // });
    // console.log(this.messages.getValue());
    // this.messagesCollection = this.afs.collection<ChatRecord>(
    //   "ChatRecords",
    //   (ref) => ref.orderBy("createdOn", "desc").startAfter(this.lastVisible).limit(25)
    // );
  }

  //messages
  getRoomMesages(chatId) {
    if (this.activeChatId != chatId) {
      if (this.messagesCollectionRequest) {
        this.messagesCollectionRequest.unsubscribe();
      }
      this.messagesCollectionRequest = this.messagesCollection
        .valueChanges<string>({
          idField: "chatRecordId",
        })
        .pipe(
          map((messages) => {
            return messages?.filter((msg) => msg.chatId === chatId);
          }),
          tap((arr) => console.log(arr))
          // shareReplay(1)
        )
        .subscribe((_messages) => {
          this.lastVisible = _messages[_messages.length - 1];
          console.log("this.lastVisible", this.lastVisible);

          this.activeChatId = chatId;

          this.messages.next(_messages);
          this.scrollChatAreaToTheBottom();
          this.activeChat = this.chats
            .getValue()
            ?.filter((x) => x.chatId == chatId)[0];
        });
    }
  }
  getMessagesss() {
    console.log(
      this.db
        .collection("ChatRecords")
        .orderBy("createdOn")
        .startAfter(this.lastVisible)
        .limit(25)
    );
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
          this.messagesCollection.add({ ...messsageModel });
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
  newChat() {
    const chatModel = new Chat();
    chatModel.chatChannelId = "";
    chatModel.chatStatusId = "new";
    chatModel.createdOn = new Date().getTime().toString();
    chatModel.userId = this.actualUserId;
    this.chatsCollection.add({ ...chatModel });
  }
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
    this.chatsCollection = this.afs.collection<Chat>("Chats", (ref) =>
      ref.orderBy("lastActivity", "desc")
    );
    this.chatsCollection
      .valueChanges<string>({
        idField: "chatId",
      })
      .pipe(
        tap((arr) => console.log(arr)),
        shareReplay(1)
      )
      .subscribe((_chats) => {
        this.chats.next(_chats);
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
