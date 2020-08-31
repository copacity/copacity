import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Store, Product, User } from 'src/app/app-intefaces';
import { LoaderComponent } from '../loader/loader.component';
import { StoreStatus } from 'src/app/app-enums';
import { StoresService } from 'src/app/cs-services/stores.service';
import { ActivatedRoute } from '@angular/router';
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
  store: Store;
  users: User[];

  constructor(public popoverController: PopoverController,
    public navParams: NavParams,
    public appService: AppService,
    private loaderComponent: LoaderComponent,
    private sanitizer: DomSanitizer,
    private storesService: StoresService,
  ) {
    this.isAdmin = this.navParams.data.isAdmin;
    this.storeCategoryName = this.navParams.data.storeCategoryName;
    this.users = this.navParams.data.users;

    this.store = {
      id: this.navParams.data.store.id,
      address: this.navParams.data.store.address,
      dateCreated: this.navParams.data.store.dateCreated,
      deleted: this.navParams.data.store.deleted,
      deliveryPrice: this.navParams.data.store.deliveryPrice,
      description: this.navParams.data.store.description,
      facebook: this.navParams.data.store.facebook,
      instagram: this.navParams.data.store.instagram,
      idSector: this.navParams.data.store.idSector,
      idStoreCategory: this.navParams.data.store.idStoreCategory,
      idUser: this.navParams.data.store.idUser,
      lastUpdated: this.navParams.data.store.lastUpdated,
      logo: this.navParams.data.store.logo,
      thumb_logo: this.navParams.data.store.thumb_logo,
      name: this.navParams.data.store.name,
      orderMinAmount: this.navParams.data.store.orderMinAmount,
      phone1: this.navParams.data.store.phone1,
      phone2: this.navParams.data.store.phone2,
      productsCount: this.navParams.data.store.productsCount,
      productsLimit: this.navParams.data.store.productsLimit,
      status: this.navParams.data.store.status,
      visits: this.navParams.data.store.visits,
      whatsapp: this.navParams.data.store.whatsapp,
      couponsLimit: this.navParams.data.store.couponsLimit,
      vendorsLimit: this.navParams.data.store.vendorsLimit,
      returnsPolicyTemplate: this.navParams.data.store.returnsPolicyTemplate,
      video1: this.navParams.data.store.video1,
      video2: this.navParams.data.store.video2,
      video3: this.navParams.data.store.video3
    }

    this.safeSrc1 = this.sanitizer.bypassSecurityTrustResourceUrl(this.store.video1);
    this.safeSrc2 = this.sanitizer.bypassSecurityTrustResourceUrl(this.store.video2);
    this.safeSrc3 = this.sanitizer.bypassSecurityTrustResourceUrl(this.store.video3);
  }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  sendToPublish() {

    this.loaderComponent.startLoading("Enviando Tienda para revisión. por favor espere un momento...");
    setTimeout(() => {
      this.storesService.update(this.store.id, { status: StoreStatus.Pending }).then(result => {
        this.storesService.getById(this.store.id).then(result => {
          this.loaderComponent.stopLoading();
          this.popoverController.dismiss(result);
        });
      });
    }, 500);
  }

  async openBarCodeGenerator() {
    let value = this.appService._appInfo.domain + "/store/" + this.navParams.data.store.id

    let modal = await this.popoverController.create({
      component: BarcodeGeneratorComponent,
      backdropDismiss: false,
      componentProps: { value: value, title: this.navParams.data.store.name },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];
      });

    modal.present();
  }
}
