import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-chat-room-item",
  templateUrl: "./chat-room-item.component.html",
  styleUrls: ["./chat-room-item.component.scss"],
})
export class ChatRoomItemComponent implements OnInit {
  @Input() room: any;
  @Output() roomChanged = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {}
  getMessages(id) {
    this.roomChanged.emit(id);
  }
}
