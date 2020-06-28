import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { User } from 'src/models/user.model';
import { BehaviorSubject } from 'rxjs';
import { ChatRecord } from 'src/models/message.model';
import { Note } from 'src/models/note.model';
import { Chat } from 'src/models/chat.model';
import { NbSidebarService, NbLayoutDirectionService, NbThemeService, NbLayoutDirection } from '@nebular/theme';
import { HttpService } from 'src/app/services/http.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Http } from '@angular/http';
import { TimeService } from 'src/app/services/time.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserHookService } from 'src/app/services/userHook.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
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
    public hook: UserHookService
  ) {
    this.auth.getUserInfo()?.role == 'manager' || this.auth.getUserInfo()?.role == 'admin' ? this.adminAccess = true : this.adminAccess = false
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
    this.getUsers();
    this.http.getAccessToken().then(() => {
      this.http.get("room", "create").subscribe((res) => {
        this.roomUrl = res.roomUrl;
        this.roomUrlWithToken = `${res.roomUrl}?pwd=${this.http.accessToken}`;
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
        this.usersWithRoles = this.users.value.filter(x => x.role == 'admin' || x.role == 'manager' || x.role == 'employee')
        this.actualUserId = this.auth.getUserInfo()?.id;
        this.getChats();
        this.getNotes();
      });

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
    this.notesCollection = this.afs.collection<Note>("Notes", (ref) =>
      ref.orderBy("createdOn", "desc")
    );
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
        this.scrollChatAreaToTheBottom();
        this.activeChat = this.chats.getValue().filter((x) => x.chatId == event)[0];
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
      this.httpClient.post('https://us-central1-upstartchat.cloudfunctions.net/addMessageToUser', messsageModel).subscribe(() => {
      })
      this.messagesCollection.add({ ...messsageModel });
      this.afs.collection("Chats").doc(this.activeChatId).update({
        lastActivity: new Date().getTime().toString(),
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
    this.chatsCollection
      .valueChanges<string>({
        idField: "chatId",
      })
      .subscribe((_chats) => {
        this.activeChatId = _chats[0].chatId;
        this.chats.next(_chats.filter((x) => x.chatStatusId == status));
        this.chats.getValue()[0]
          ? this.getRoomMesages(this.chats.getValue()[0].chatId)
          : (this.messages.next(null),
            (this.activeChat = null),
            (this.activeChatId = null));
      });
  }
  getChats() {
    this.chatsCollection = this.afs.collection<Chat>("Chats", (ref) =>
      ref.orderBy("lastActivity", "desc"));
    this.chatsCollection
      .valueChanges<string>({
        idField: "chatId",
      })
      .subscribe((_chats) => {
        if (this.auth.getUserInfo()?.role == 'manager' || this.auth.getUserInfo()?.role == "admin") {
          this.activeChatId = _chats[0].chatId;
        } else {
          this.activeChatId = _chats.filter(x => x.assignedUserId == this.actualUserId)[0]?.chatId;
        }
        this.getRoomMesages(this.activeChatId);
        this.chats.next(_chats);
      });
    // new active resolved archived
  }
  removeChat(event) {
    this.afs.collection<Chat>("Chats").doc(event).delete();
  }
  //

  //helpers
  assignTo(userId) {
    this.afs.collection("Chats").doc(this.activeChatId).update({
      assignedUserId: userId,
    });
  }
  scrollChatAreaToTheBottom() {
    setTimeout(() => {
      document.getElementsByClassName('scrollable')[0] ? document.getElementsByClassName('scrollable')[0].scroll(0, 5000) : ''
      console.log('scrolled')
    }, 100);
  }
  toConsole() {
    this.router.navigate(['console'])
  }
  logout() {
    firebase.auth().signOut().then(() => {
      this.router.navigate(['login'])
      localStorage.setItem('loggedIn', '0')
    }).catch(error => alert(error))
  }
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
