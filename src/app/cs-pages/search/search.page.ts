import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, AfterContentInit, AfterContentChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSearchbar, PopoverController, AlertController, ToastController } from '@ionic/angular';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Store, Product, CartProduct, ProductImage } from 'src/app/app-intefaces';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { AppService } from 'src/app/cs-services/app.service';
import { ProductsService } from 'src/app/cs-services/products.service';
import { CartService } from '../../cs-services/cart.service';
import { CartPage } from '../cart/cart.page';
import { ProductDetailPage } from '../product-detail/product-detail.page';
import { ProductUpdatePage } from '../product-update/product-update.page';
import { SearchService } from 'src/app/cs-services/search.service';
import { ImageViewerComponent } from 'src/app/cs-components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {

  @ViewChild(IonSearchbar, { static: false }) searchbar: IonSearchbar;

  constructor(private router: Router,
    private popoverCtrl: PopoverController,
    public toastController: ToastController,
    private productsService: ProductsService,
    private storesService: StoresService,
    public searchService: SearchService,
    public appService: AppService) {

  }

  search(e: any) {
    this.searchService.searchText = e.target.value.toString().trim();
    this.searchTextFunc();
  }

  searchTextFunc() {
    this.searchService.products = [];
    this.searchService.searching = true;

    if (this.searchService.searchText) {
      this.storesService.getAll("").then(stores => {
        stores.forEach((store: Store) => {
          let subs = this.productsService.getAll(store.id).subscribe(products => {
            products.forEach((product: Product) => {
              if (product.name.toUpperCase().indexOf(this.searchService.searchText.toUpperCase()) != -1) {
                this.searchService.products.push({ product: product, idStore: store.id });
              }

              this.searchService.searching = false;
              subs.unsubscribe();
            });
          });
        });
      });
    } else {
      this.searchService.searching = false;
    }
  }

  async openImageViewer(product: Product, storeId: string) {
    let images: string[] = [];

    let result = this.productsService.getProductImages(storeId, product.id);

    let subs = result.subscribe(async (productImages: ProductImage[]) => {
      productImages.forEach(img => {
        images.push(img.image);
      });

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
      subs.unsubscribe();
    });
  }

  goToProductDetail(product: any){
    this.router.navigate(['product-detail', product.product.id + "&" + product.idStore]);
    this.popoverCtrl.dismiss();
  }
}
