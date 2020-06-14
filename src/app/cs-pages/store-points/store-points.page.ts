import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams, AlertController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { ProductCreatePage } from '../product-create/product-create.page';
import { Observable } from 'rxjs';
import { Product, StorePoint } from 'src/app/app-intefaces';
import { ProductsService } from 'src/app/cs-services/products.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { ProductUpdatePage } from '../product-update/product-update.page';
import { UsersService } from 'src/app/cs-services/users.service';
import { CartService } from 'src/app/cs-services/cart.service';

@Component({
  selector: 'app-store-points',
  templateUrl: './store-points.page.html',
  styleUrls: ['./store-points.page.scss'],
})
export class StorePointsPage implements OnInit {
  isAdmin: boolean;
  products: Observable<Product[]>;
  searchingProducts: boolean = false;
  productSearchHits: number = 0;
  points: number = 0;

  constructor(public popoverController: PopoverController,
    public appService: AppService,
    public cartService: CartService,
    private usersService: UsersService,
    public alertController: AlertController,
    public navParams: NavParams,
    private storesService: StoresService,
    private productsService: ProductsService) {
    this.isAdmin = this.navParams.data.isAdmin;
    this.getProducts();
    this.GetPoints();
  }

  ngOnInit() {
  }

  async presentDeleteProductPrompt(product: Product) {
    this.presentConfirm('Esta seguro que desea eliminar el regalo: ' + product.name + '?', () => {
      this.productsService.update(this.appService.currentStore.id, product.id, { deleted: true }).then(() => {
        this.appService.currentStore.productsCount = this.appService.currentStore.productsCount - 1
        this.storesService.update(this.appService.currentStore.id, { productsCount: this.appService.currentStore.productsCount }).then(() => {
          this.presentAlert("Regalo eliminado exitosamente!", '', () => { });
        });
      });
    });
  }

  async openProductUpdatePage(product: Product) {
    let modal = await this.popoverController.create({
      component: ProductUpdatePage,
      componentProps: product,
      backdropDismiss: false,
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }

  productSoldOut(e: any, product: Product) {
    this.productsService.update(this.appService.currentStore.id, product.id, { soldOut: !e.detail.checked });
  }

  GetPoints() {
    return new Promise(resolve => {
      let subscribe = this.usersService.getStorePoints(this.appService.currentUser.id).subscribe(StorePoints => {
        let hasStorepoints: boolean = false;

        let currentStorePoint: StorePoint = {
          id: '',
            idStore: this.appService.currentStore.id,
            points: 0,
            deleted: false,
            dateCreated: new Date(),
            lastUpdated: new Date(),
        };

        StorePoints.forEach(storePoint => {
          if (storePoint.idStore === this.appService.currentStore.id) {
            currentStorePoint = storePoint
            hasStorepoints = true;
          }
        });

        this.points = currentStorePoint.points - this.cartService.getPoints();

        subscribe.unsubscribe();
      });
    });
  }

  async presentAlert(title: string, message: string, done: Function) {

    const alert = await this.alertController.create({
      header: title,
      message: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: ['Aceptar!']
    });

    alert.onDidDismiss().then(done());
    await alert.present();
  }

  async presentConfirm(message: string, done: Function, cancel?: Function) {

    const alert = await this.alertController.create({
      header: message,
      mode: 'ios',
      translucent: true,
      animated: true,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => cancel ? cancel() : null
        },
        { text: 'Estoy Seguro!', handler: () => done() }
      ]
    });

    await alert.present();
  }

  getProducts() {
    //this.lastProductToken = (this.products.length != 0 ? this.products[this.products.length - 1].name : '');
    this.products = null;
    this.searchingProducts = true;
    this.productSearchHits = 0;

    setTimeout(() => {
      this.products = this.productsService.getByProductGift(this.appService.currentStore.id);

      this.products.subscribe((products) => {
        this.searchingProducts = false;
        products.forEach(product => {
          if (product) {
            this.productSearchHits++;
          }
        });
      });
    }, 2000);
  }

  async openProductCreatePage() {
    let modal = await this.popoverController.create({
      component: ProductCreatePage,
      componentProps: { isGift: true },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }

  close() {
    this.popoverController.dismiss();
  }
}
