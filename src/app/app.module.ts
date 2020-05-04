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
} from "@nebular/theme";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { ChatRoomsLlistComponent } from "./components/chat-rooms-llist/chat-rooms-llist.component";
import { ChatRoomItemComponent } from "./components/chat-rooms-llist/chat-room-item/chat-room-item.component";
import { AngularFireModule } from "angularfire2";
import { AngularFirestoreModule } from "angularfire2/firestore";
import { envFire } from "../environments/environment";
import { NotesListComponent } from "./components/notes-list/notes-list.component";
import { NotesListItemComponent } from "./components/notes-list/notes-list-item/notes-list-item.component";
import { FormsModule } from "@angular/forms";
import { UserHookService } from "./services/userHook.service";
import { VideoChatComponent } from "./components/video-chat/video-chat.component";

@NgModule({
  declarations: [
    AppComponent,
    ChatRoomsLlistComponent,
    ChatRoomItemComponent,
    NotesListComponent,
    NotesListItemComponent,
    VideoChatComponent,
  ],
  imports: [
    BrowserModule,
    NbThemeModule.forRoot(),
    NbChatModule,
    NbLayoutModule,
    NbSidebarModule,
    NbButtonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(envFire.firebase),
    AngularFirestoreModule,
    NbInputModule,
    FormsModule,
    NbActionsModule,
    NbIconModule,
    NbEvaIconsModule,
  ],
  providers: [NbSidebarService, UserHookService],
  bootstrap: [AppComponent],
  entryComponents: [ChatRoomItemComponent],
})
export class AppModule {}
