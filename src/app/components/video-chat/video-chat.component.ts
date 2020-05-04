import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-video-chat",
  templateUrl: "./video-chat.component.html",
  styleUrls: ["./video-chat.component.scss"],
})
export class VideoChatComponent implements OnInit {
  @Output() expandFrame = new EventEmitter<boolean>();
  videChatFrameUrl: any;
  isMicrophoneActive: boolean = true;
  isFrameExpanded: boolean = false;
  constructor(private sanitizer: DomSanitizer) {
    this.videChatFrameUrl = "https://sc.crm42.com/";
    this.videChatFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.videChatFrameUrl
    );
  }
  expandAction() {
    this.isFrameExpanded = !this.isFrameExpanded;
    this.expandFrame.emit(this.isFrameExpanded);
  }
  microphoneAction() {
    this.isMicrophoneActive = !this.isMicrophoneActive;
  }
  ngOnInit() {}
}
