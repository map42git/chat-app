import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-chat-rooms-llist",
  templateUrl: "./chat-rooms-llist.component.html",
  styleUrls: ["./chat-rooms-llist.component.scss"],
})
export class ChatRoomsLlistComponent {
  @Input() rooms: any;
  @Output() roomChanged = new EventEmitter<any>();
  @Output() removeChat = new EventEmitter<string>();
  @Output() filterStatus = new EventEmitter<string>();
  constructor() {}

  ngOnInit() {}
  showByStatus(status) {
    this.filterStatus.emit(status);
  }
  deleteChat(id) {
    this.removeChat.emit(id);
  }
  chatRoomChanged(id) {
    this.roomChanged.emit(id);
  }
}
