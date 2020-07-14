import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: "app-video-chat",
  templateUrl: "./video-chat.component.html",
  styleUrls: ["./video-chat.component.scss"],
})
export class VideoChatComponent implements OnInit, OnChanges {
  @Output() expandFrame = new EventEmitter<boolean>();
  @Output() inviteUserToVideoChat = new EventEmitter<any>();
  @Input() url: string;
  videChatFrameUrl: any;
  afterShare: boolean = false;
  constructor(private sanitizer: DomSanitizer, public http: HttpService) { }
  ngOnInit() { }
  shareLink() {
    this.inviteUserToVideoChat.emit();
    this.afterShare = true
  }
  ngOnChanges() {
    this.videChatFrameUrl = this.url;

    this.videChatFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.videChatFrameUrl
    );
  }
}
