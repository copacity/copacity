import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController, NavParams } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ProductProperty, ProductPropertyOption } from 'src/app/app-intefaces';
import { ProductPropertyOptionComponent } from '../product-property-option/product-property-option.component';
import { ProductsService } from 'src/app/cs-services/products.service';

@Component({
  selector: 'app-product-property',
  templateUrl: './product-property.component.html',
  styleUrls: ['./product-property.component.scss'],
})
export class ProductPropertyComponent implements OnInit {
  productProperty: ProductProperty = {
    id: '',
    name: '',
    isMandatory: true,
    userSelectable: false,
    dateCreated: new Date(),
    lastUpdated: new Date(),
    deleted: false,
    productPropertyOptions: [],
  };

  form: FormGroup;

  constructor(private popoverCtrl: PopoverController,
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    public alertController: AlertController,
    private navParams: NavParams) {

    if (this.navParams.data.productProperty) {
      this.productProperty = this.navParams.data.productProperty;
    }
    this.buildForm();
  }

  ngOnInit() { }

  close() {
    this.popoverCtrl.dismiss();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [this.productProperty.name, [Validators.required, Validators.maxLength(50)]],
      isMandatory: [this.productProperty.isMandatory],
      userSelectable: [this.productProperty.userSelectable]
    });
  }

  saveProductProperty() {
    if (this.form.valid && this.productProperty.productPropertyOptions.length != 0) {
      if (this.navParams.data.idProduct) {
        this.presentConfirm("Si creas o editas una caracteristica, el inventario que tengas del producto se borrará automaticamente y tendrás que agregarlo de nuevo, Estás seguro de continuar con esta acción?", () => {
          this.productProperty.name = this.form.value.name;
          this.productProperty.isMandatory = this.form.value.isMandatory;
          this.productProperty.userSelectable = this.form.value.userSelectable;
          this.productsService.deleteCartInventory(this.navParams.data.idProduct);
          this.productsService.update(this.navParams.data.idProduct, { soldOut: true });
          this.popoverCtrl.dismiss(this.productProperty);
        });
      } else {
        this.productProperty.name = this.form.value.name;
        this.productProperty.isMandatory = this.form.value.isMandatory;
        this.productProperty.userSelectable = this.form.value.userSelectable;
        this.popoverCtrl.dismiss(this.productProperty);
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  async openProductPropertyOption(e) {
    let modal = await this.popoverCtrl.create({
      component: ProductPropertyOptionComponent,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          this.productProperty.productPropertyOptions.push(result);
        }
      });

    modal.present();
  }

  async productPropertyOptionUpdate(productPropertyOption: ProductPropertyOption) {
    let modal = await this.popoverCtrl.create({
      component: ProductPropertyOptionComponent,
      componentProps: { productPropertyOption: productPropertyOption },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          for (let [index, p] of this.productProperty.productPropertyOptions.entries()) {
            if (p === productPropertyOption) {
              p.name = result.name;
              p.price = result.price;
              p.deleted = result.deleted;
            }
          }
        }
      });

    modal.present();
  }

  productPropertyOptionDelete(productPropertyOption: ProductPropertyOption) {
    this.presentConfirm('Esta seguro que desea eliminar la opción: ' + productPropertyOption.name + '?', () => {
      if (!productPropertyOption.id) {
        for (let [index, p] of this.productProperty.productPropertyOptions.entries()) {
          if (p === productPropertyOption) {
            this.productProperty.productPropertyOptions.splice(index, 1);
          }
        }
      } else {
        for (let [index, p] of this.productProperty.productPropertyOptions.entries()) {
          if (p === productPropertyOption) {
            p.deleted = true;
          }
        }
      }
    });
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
}
