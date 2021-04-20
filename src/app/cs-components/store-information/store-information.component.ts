import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { User } from 'src/app/app-intefaces';
import { LoaderComponent } from '../loader/loader.component';
import { StoresService } from 'src/app/cs-services/stores.service';
import { BarcodeGeneratorComponent } from '../barcode-generator/barcode-generator.component';
import { AppService } from 'src/app/cs-services/app.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-store-information',
  templateUrl: './store-information.component.html',
  styleUrls: ['./store-information.component.scss'],
})
export class StoreInformationComponent implements OnInit {
  safeSrc1: SafeResourceUrl;
  safeSrc2: SafeResourceUrl;
  safeSrc3: SafeResourceUrl;

  isAdmin: boolean = false;
  storeCategoryName: string;
  users: User[];

  constructor(public popoverController: PopoverController,
    public navParams: NavParams,
    public appService: AppService,
    private loaderComponent: LoaderComponent,
    private sanitizer: DomSanitizer,
    private storesService: StoresService,
  ) {
    this.isAdmin = this.navParams.data.isAdmin;
    this.users = this.navParams.data.users;

    this.safeSrc1 = this.sanitizer.bypassSecurityTrustResourceUrl(this.appService._appInfo.video1);
    this.safeSrc2 = this.sanitizer.bypassSecurityTrustResourceUrl(this.appService._appInfo.video2);
    this.safeSrc3 = this.sanitizer.bypassSecurityTrustResourceUrl(this.appService._appInfo.video3);
  }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  // sendToPublish() {

  //   this.loaderComponent.startLoading("Enviando Tienda para revisión. por favor espere un momento...");
  //   setTimeout(() => {
  //     this.storesService.update(this.store.id, { status: StoreStatus.Pending }).then(result => {
  //       this.storesService.getById(this.store.id).then(result => {
  //         this.loaderComponent.stopLoading();
  //         this.popoverController.dismiss(result);
  //       });
  //     });
  //   }, 500);
  // }

  async openBarCodeGenerator() {
    let value = this.appService._appInfo.domain;

    let modal = await this.popoverController.create({
      component: BarcodeGeneratorComponent,
      backdropDismiss: false,
      componentProps: { value: value, title: "CopaCity" },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }
}
