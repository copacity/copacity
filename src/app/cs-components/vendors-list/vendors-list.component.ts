import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { User } from 'src/app/app-intefaces';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss'],
})
export class VendorsListComponent implements OnInit {
  users: User[];
  @Input() usersAtt: User[];

  constructor(
    private popoverCtrl: PopoverController,
    public appService: AppService,
    private navParams: NavParams) {

    if (this.navParams.data.users) {
      this.users = this.navParams.data.users;
    } else {
      this.users = this.usersAtt;
    }
  }

  ngOnInit() { }

  close() {
    this.popoverCtrl.dismiss();
  }

  async openImageViewer(img: string) {
    let images: string[] = [];
    images.push(img);

    let modal = await this.popoverCtrl.create({
      component: ImageViewerComponent,
      componentProps: { images: images },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }

  chat(url: string){
    window.open(url, 'popup', 'width=450,height=600');
  }
}
