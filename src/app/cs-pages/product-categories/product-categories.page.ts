import { Component, OnInit, Input } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ProductCategory } from 'src/app/app-intefaces';
import { ProductCategoriesService } from 'src/app/cs-services/productCategories.service';
import { AppService } from 'src/app/cs-services/app.service';
import { Validators, FormControl } from '@angular/forms';
import { ProductCategoriesCreatePage } from '../product-categories-create/product-categories-create.page';

@Component({
  selector: 'app-product-categories',
  templateUrl: './product-categories.page.html',
  styleUrls: ['./product-categories.page.scss'],
})
export class ProductCategoriesPage implements OnInit {
  categoryName = new FormControl('', [Validators.required]);

  subCategories: Observable<ProductCategory[]>;

  constructor(private popoverCtrl: PopoverController,
    public alertController: AlertController,
    private productCategoriesService: ProductCategoriesService,
    private appService: AppService) {

    this.subCategories = this.productCategoriesService.getAll(this.appService.currentCategory.id)
  }

  ngOnInit() {
  }

  close() {
     
    this.popoverCtrl.dismiss();
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

  async presentDeleteProductCategoryPrompt(productCategory: ProductCategory) {
     
    this.presentConfirm('Esta seguro que desea eliminar la sección: ' + productCategory.name + '?', () => {
      this.productCategoriesService.update(this.appService.currentCategory.id, productCategory.id, { deleted: true }).then(() => {
        this.presentAlert("Sección eliminada exitosamente!", '', () => { });
      });
    });
  }

  async openProductCategoriesCreatePage(idProductCategory?: string) {
     
    let modal = await this.popoverCtrl.create({
      component: ProductCategoriesCreatePage,
      componentProps: { id: idProductCategory },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const idAddress = data['data'];
      });

    modal.present();
  }
}
