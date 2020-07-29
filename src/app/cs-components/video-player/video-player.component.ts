import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
})
export class VideoPlayerComponent implements OnInit {
  safeSrc: SafeResourceUrl;
  constructor(private popoverCtrl: PopoverController, 
    public navParams: NavParams,
    private sanitizer: DomSanitizer) {
      this.safeSrc =  this.sanitizer.bypassSecurityTrustResourceUrl(this.navParams.data.url);
   }

  ngOnInit() { }

  close() {
    this.popoverCtrl.dismiss();
  }
}
