import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-video-chat",
  templateUrl: "./video-chat.component.html",
  styleUrls: ["./video-chat.component.scss"],
})
export class VideoChatComponent implements OnInit, OnChanges {
  @Output() expandFrame = new EventEmitter<boolean>();
  @Input() url:string;
  videChatFrameUrl: any;
  isFrameExpanded: boolean = false;
  constructor(private sanitizer: DomSanitizer) {
    
  }
  expandAction() {
    this.isFrameExpanded = !this.isFrameExpanded;
    this.expandFrame.emit(this.isFrameExpanded);
  }
  ngOnInit() {}

  ngOnChanges(){
    this.videChatFrameUrl = this.url;

    this.videChatFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.videChatFrameUrl
    );
  }
}
