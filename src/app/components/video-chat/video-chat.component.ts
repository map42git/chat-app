import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-video-chat",
  templateUrl: "./video-chat.component.html",
  styleUrls: ["./video-chat.component.scss"],
})
export class VideoChatComponent implements OnInit {
  videChatFrameUrl: any;
  isMicrophoneActive: Boolean = true;
  constructor(private sanitizer: DomSanitizer) {
    this.videChatFrameUrl = "https://sc.crm42.com/";
    this.videChatFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.videChatFrameUrl
    );
  }
  microphoneAction() {
    this.isMicrophoneActive = !this.isMicrophoneActive;
  }
  ngOnInit() {}
}
