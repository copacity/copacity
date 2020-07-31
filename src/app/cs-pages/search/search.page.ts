import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSearchbar, PopoverController, ToastController } from '@ionic/angular';
import { StoresService } from 'src/app/cs-services/stores.service';
import { Store, Product, ProductImage } from 'src/app/app-intefaces';
import { AppService } from 'src/app/cs-services/app.service';
import { ProductsService } from 'src/app/cs-services/products.service';
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
              if (this.removeAccents(product.name).toUpperCase().indexOf(this.removeAccents(this.searchService.searchText).toUpperCase()) != -1 || this.searchInText(product.name.split(" "), this.searchService.searchText)) {
                this.searchService.products.push({ product: product, idStore: store.id, storeName: store.name });
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

  searchInText(array: string[], text: string) {
    let result = false;
    array.forEach(word => {
      if (text.toUpperCase().indexOf(this.removeAccents(word).trim().toUpperCase()) != -1 && this.removeAccents(word).trim()) {
        result = true;
      }
    });

    return result;
  }

  removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

  goToProductDetail(product: any) {
    this.router.navigate(['product-detail', product.product.id + "&" + product.idStore]);
    this.popoverCtrl.dismiss();
  }

  ionViewDidEnter() {
    this.loadSearchbar(() => { });
  }

  loadSearchbar(callBack1) {
    setTimeout(() => {
      if (this.searchbar) {
        if (!this.searchService.products || this.searchService.products.length == 0) {
          this.searchbar.setFocus();
        }
        callBack1();
      } else {
        this.loadSearchbar(callBack1);
      }
    }, 500);
  }
}