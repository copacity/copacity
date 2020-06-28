import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { PQRSF } from 'src/app/app-intefaces';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';
import { StorePqrsfCreatePage } from '../store-pqrsf-create/store-pqrsf-create.page';

@Component({
  selector: 'app-store-pqrsf',
  templateUrl: './store-pqrsf.page.html',
  styleUrls: ['./store-pqrsf.page.scss'],
})
export class StorePqrsfPage implements OnInit {
  pqrsfCollection: Observable<PQRSF[]>;
  searchingPqrsf: boolean = false;
  pqrsfSearchHits: number = 0;

  constructor(
    public popoverController: PopoverController,
    public appService: AppService,
    private navParams: NavParams,
    private storesService: StoresService,
  ) {
    this.getPqrsf();
  }

  getPqrsf() {
    this.pqrsfCollection = null;
    this.searchingPqrsf = true;
    this.pqrsfSearchHits = 0;

    setTimeout(() => {

      if (this.navParams.data.isAdmin) {
        this.pqrsfCollection = this.storesService.getStorePQRSF(this.appService.currentStore.id);

        this.pqrsfCollection.subscribe((products) => {
          this.pqrsfSearchHits = 0;
          this.searchingPqrsf = false;
          products.forEach(product => {
            if (product) {
              this.pqrsfSearchHits++;
            }
          });
        });
      } else {
        this.pqrsfCollection = this.storesService.getStorePQRSFByUser(this.appService.currentStore.id, this.appService.currentUser.id);

        this.pqrsfCollection.subscribe((products) => {
          this.pqrsfSearchHits = 0;
          this.searchingPqrsf = false;
          products.forEach(product => {
            if (product) {
              this.pqrsfSearchHits++;
            }
          });
        });
      }
    }, 500);
  }

  async openImageViewer(img: string) {
    let images: string[] = [];
    images.push(img);

    let modal = await this.popoverController.create({
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

  async openStorePqrsfCreatePage() {
    let modal = await this.popoverController.create({
      component: StorePqrsfCreatePage,
      componentProps: {},
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }

}
