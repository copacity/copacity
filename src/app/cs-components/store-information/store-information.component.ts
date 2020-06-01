import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Store } from 'src/app/app-intefaces';
import { LoaderComponent } from '../loader/loader.component';
import { StoreStatus } from 'src/app/app-enums';
import { StoresService } from 'src/app/cs-services/stores.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-store-information',
  templateUrl: './store-information.component.html',
  styleUrls: ['./store-information.component.scss'],
})
export class StoreInformationComponent implements OnInit {
  isAdmin: boolean = false;
  storeCategoryName: string;
  store: Store;

  constructor(public popoverController: PopoverController, 
    public navParams: NavParams,
    private loaderComponent: LoaderComponent,
    private route: ActivatedRoute,
    private storesService: StoresService,
    ) {
    this.isAdmin = this.navParams.data.isAdmin;
    this.storeCategoryName = this.navParams.data.storeCategoryName;

    this.store = {
      id: this.navParams.data.store.id,
      address: this.navParams.data.store.address,
      dateCreated: this.navParams.data.store.dateCreated,
      deleted: this.navParams.data.store.deleted,
      deliveryPrice: this.navParams.data.store.deliveryPrice,
      description: this.navParams.data.store.description,
      facebook: this.navParams.data.store.facebook,
      idSector: this.navParams.data.store.idSector,
      idStoreCategory: this.navParams.data.store.idStoreCategory,
      idUser: this.navParams.data.store.idUser,
      lastUpdated: this.navParams.data.store.lastUpdated,
      logo: this.navParams.data.store.logo,
      name: this.navParams.data.store.name,
      orderMinAmount: this.navParams.data.store.orderMinAmount,
      phone1: this.navParams.data.store.phone1,
      phone2: this.navParams.data.store.phone2,
      productsCount: this.navParams.data.store.productsCount,
      productsLimit: this.navParams.data.store.productsLimit,
      status: this.navParams.data.store.status,
      visits: this.navParams.data.store.visits,
      whatsapp: this.navParams.data.store.whatsapp
    }
  }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  sendToPublish() {

    this.loaderComponent.startLoading("Enviando Tienda para revision. por favor espere un momento...");
    setTimeout(() => {
      this.storesService.update(this.store.id, { status: StoreStatus.Pending }).then(result => {
        this.storesService.getById(this.store.id).then(result => {
          this.loaderComponent.stopLoading();
          this.popoverController.dismiss(result);
        });
      });
    }, 3000);
  }
}
