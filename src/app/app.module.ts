import { NbEvaIconsModule } from "@nebular/eva-icons";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  NbThemeModule,
  NbChatModule,
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbSidebarService,
  NbInputModule,
  NbActionsModule,
  NbIconModule,
  NbLayoutDirection,
  NbLayoutDirectionService,
  NbSelectComponent,
  NbSelectModule,
  NbCardModule,
  NbToggleModule,
  NbSearchModule,
  NbFormFieldModule,
  NbPopoverModule,
  NbTabsetModule,
  NbRouteTabsetModule,
} from "@nebular/theme";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { ChatRoomsLlistComponent } from "./components/chat-rooms-llist/chat-rooms-llist.component";
import { ChatRoomItemComponent } from "./components/chat-rooms-llist/chat-room-item/chat-room-item.component";
import { AngularFireModule } from "angularfire2";
import { AngularFirestoreModule } from "angularfire2/firestore";
import { environment } from "../environments/environment";
import { NotesListComponent } from "./components/notes-list/notes-list.component";
import { NotesListItemComponent } from "./components/notes-list/notes-list-item/notes-list-item.component";
import { FormsModule } from "@angular/forms";
import { UserHookService } from "./services/userHook.service";
import { VideoChatComponent } from "./components/video-chat/video-chat.component";
import { HttpService } from "./services/http.service";
import { HttpModule } from "@angular/http";
import {
  HttpClient,
  HttpHandler,
  HttpClientModule,
} from "@angular/common/http";
import { ChatService } from './services/chat.service';
import { ChatComponent } from './components/chat/chat.component';
import { LoginGuard } from './guards/login.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AngularFireAuthModule } from '@angular/fire/auth';

import * as firebase from 'firebase';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

firebase.initializeApp(environment.firebase);
@NgModule({
  declarations: [
    AppComponent,
    ChatRoomsLlistComponent,
    ChatRoomItemComponent,
    NotesListComponent,
    NotesListItemComponent,
    VideoChatComponent,
    ChatComponent,
    LoginComponent,
    RegisterComponent,
    AdminPanelComponent,
  ],
  imports: [
    AngularFireAuthModule,
    BrowserModule,
    NbThemeModule.forRoot({ name: "default" }),
    NbChatModule,
    NbLayoutModule,
    NbSidebarModule,
    NbButtonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    NbInputModule,
    FormsModule,
    NbActionsModule,
    NbIconModule,
    NbEvaIconsModule,
    NbSelectModule,
    HttpModule,
    NbCardModule,
    NbToggleModule,
    HttpClientModule,
    NbSearchModule,
    NbFormFieldModule,
    NbPopoverModule,
    NbTabsetModule
  ],
  providers: [
    NbSidebarService,
    UserHookService,
    NbLayoutDirectionService,
    HttpService,
    HttpClient,
    ChatService,
    LoginGuard
  ],
  bootstrap: [AppComponent],
  entryComponents: [ChatRoomItemComponent],
})
export class AppModule { }
