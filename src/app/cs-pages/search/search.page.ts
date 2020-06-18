import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, AfterContentInit, AfterContentChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSearchbar, PopoverController, AlertController, ToastController } from '@ionic/angular';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Store, Product, CartProduct } from 'src/app/app-intefaces';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AppService } from 'src/app/cs-services/app.service';
import { ProductsService } from 'src/app/cs-services/products.service';
import { CartService } from '../../cs-services/cart.service';
import { CartPage } from '../cart/cart.page';
import { ProductDetailPage } from '../product-detail/product-detail.page';
import { ProductUpdatePage } from '../product-update/product-update.page';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {

  @ViewChild(IonSearchbar, { static: false }) searchbar: IonSearchbar;
  @ViewChild('cart', { static: false, read: ElementRef }) shoppingCart: ElementRef;
  searchId: string;
  searchText: string = '';
  showShoppingCart: boolean = false;
  isAdmin: boolean = false;
  stores: Observable<Store[]> = null;
  store: Store;
  products: Observable<Product[]> = null;
  cartItemCount: BehaviorSubject<number>;
  subscription: Subscription[] = [];
  hits;
  searching: boolean = false;

  constructor(private router: Router,
    private cartSevice: CartService,
    public alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private storesService: StoresService,
    private popoverCtrl: PopoverController,
    public toastController: ToastController,
    private productsService: ProductsService,
    private loaderComponent: LoaderComponent,
    public appService: AppService) {

    this.searchId = this.activatedRoute.snapshot.params.id;
    this.stores = null;
    this.products = null;

    if (this.searchId != "0" && this.appService.currentUser && this.appService.currentUser.id != this.appService.currentStore.idUser)
      this.showShoppingCart = true

    this.cartItemCount = this.cartSevice.getCartItemCount();

    this.storesService.getById(this.searchId).then(result => {
      this.store = result;

      if (this.appService.currentUser && this.store.idUser == this.appService.currentUser.id) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
  }

  async openProductUpdatePage(product: Product) {

    let modal = await this.popoverCtrl.create({
      component: ProductUpdatePage,
      componentProps: product,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
        //this.searchTextFunc(this.searchText);
      });

    modal.present();
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

  async presentDeleteProductPrompt(product: Product) {

    this.presentConfirm('Esta seguro que desea eliminar el producto: ' + product.name + '?', () => {
      this.productsService.update(this.appService.currentStore.id, product.id, { deleted: true }).then(() => {
        this.presentAlert("Producto eliminado exitosamente!", '', () => { });
        //this.searchTextFunc(this.searchText);
      });
    });
  }

  // ngAfterContentChecked(): void {
  //   setTimeout(() => {
  //     this.searchbar.setFocus();
  //   }, 150);
  // }

  async openCart() {

    let modal = await this.popoverCtrl.create({
      component: CartPage,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        let result = data['data'];

        if (result) {
          this.goToCreateOrder();
        }
      });

    modal.present();
  }

  search(e: any) {
    this.searchText = e.target.value;
    //this.searchTextFunc(e.target.value);
  }


  // searchTextFunc(searchText: string) {
  //   this.stores = null;
  //   this.products = null;
  //   this.searching = true;
  //   this.hits = null;

  //   setTimeout(() => {
  //     if (searchText.toString().trim()) {
  //       if (this.activatedRoute.snapshot.params.id == 0) {
  //         this.stores = this.storesService.getAllSearch(this.searchText);
  //         this.stores.subscribe(stores => {
  //           this.hits = 0;
  //           this.searching = false;
  //           stores.forEach(store => {
  //             if (store) {
  //               this.hits++;
  //             }
  //           });
  //         });
  //       }
  //       else {
  //         this.products = this.productsService.getBySearch(this.searchId, this.searchText);
  //           this.products.subscribe((products) => {
  //             this.hits = 0;
  //             this.searching = false;
  //             products.forEach(product => {
                
  //               if (product) {
  //                 this.hits++;
  //               }
  //             });
  //           });
  //       }
  //     } else{
  //       this.searching = false;
  //     }
  //   }, 1000);
  // }

  closeAppSubcription() {
    this.subscription.forEach(x => { if (!x.closed) x.unsubscribe(); });
  }

  goToStore(e: any, store: Store) {
    this.loaderComponent.start(store.logo ? store.logo : "../../assets/icon/no-image.png").then(result => {
      this.router.navigate(['/store', store.id]);
      this.loaderComponent.stop();
    });
  }


  async goToCreateOrder() {
    this.router.navigate(['/order-create']);
  }

  addToCart(e: any, product: any) {

    e.preventDefault();
    e.stopPropagation();
    this.animateCSS('tada');

    let cartProduct: CartProduct = {
      id: '',
      product: product,
      quantity: 1,
      checked: true,
      dateCreated: new Date(),
      lastUpdated: new Date(),
      deleted: false,
      propertiesSelection: []
    };

    this.cartSevice.addProduct(cartProduct);

    this.presentToast(product.name + ' ha sido agregado al carrito!', cartProduct.product.image);
  }


  async presentToast(message: string, image: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: message,
      position: 'bottom',
    });
    toast.present();
  }

  animateCSS(animationName: any, keepAnimated = false) {

    const node = this.shoppingCart.nativeElement;
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
      if (!keepAnimated) {
        node.classList.remove('animated', animationName);
      }

      node.removeEventListener('animationend', handleAnimationEnd)
    }

    node.addEventListener('animationend', handleAnimationEnd)
  }

  doRefresh(event) {
    setTimeout(() => {
      //this.searchTextFunc(this.searchText);
      event.target.complete();
    }, 500);
  }

  async openProductDetailPage(idProduct: string) {
    let modal = await this.popoverCtrl.create({
      component: ProductDetailPage,
      componentProps: { id: idProduct, isAdmin: this.isAdmin },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];

        if (updated) {
          this.animateCSS('tada');
        }
      });

    modal.present();
  }
}
