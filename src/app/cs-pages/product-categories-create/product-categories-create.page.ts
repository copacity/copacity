import { Component, OnInit } from '@angular/core';
import { AlertController, NavParams, PopoverController } from '@ionic/angular';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { ProductCategory } from 'src/app/app-intefaces';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductCategoriesService } from 'src/app/cs-services/productCategories.service';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-product-categories-create',
  templateUrl: './product-categories-create.page.html',
  styleUrls: ['./product-categories-create.page.scss'],
})
export class ProductCategoriesCreatePage implements OnInit {
  productCategory: ProductCategory = {
    id: '',
    name: '',
    description: '',
    dateCreated: new Date(),
    lastUpdated: new Date(),
    deleted: false,
  };

  form: FormGroup;

  constructor(
    private popoverCtrl: PopoverController,
    public alertController: AlertController,
    private navParams: NavParams,
    private formBuilder: FormBuilder,
    private productCategoriesService: ProductCategoriesService,
    private loader: LoaderComponent,
    public appService: AppService) {
     
    if (this.navParams.data.id) {
      this.productCategoriesService.getById(this.appService.currentStore.id, this.navParams.data.id).then((productCategory: ProductCategory) => {
        this.productCategory = productCategory;
        this.buildForm();
      });
    }

    this.buildForm();
  }

  ngOnInit() {
  }

  close() {
     
    this.popoverCtrl.dismiss();
  }

  private buildForm() {
     
    this.form = this.formBuilder.group({
      name: [this.productCategory.name, [Validators.required, Validators.maxLength(50)]],
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

  createProductCategory() {
     
    if (this.form.valid) {
      this.loader.startLoading("Guardando cambios, por favor espere un momento...");

      setTimeout(() => {
        this.productCategory.name = this.form.value.name;

        if (this.productCategory.id != '') {
          this.productCategoriesService.update(this.appService.currentStore.id, this.productCategory.id, this.productCategory).then(() => {
            this.loader.stopLoading();
            this.presentAlert("Sección actualizada exitosamente", "", () => {
              this.popoverCtrl.dismiss();
            });
          });
        } else {
          this.productCategoriesService.create(this.appService.currentStore.id, this.productCategory).then(async (doc) => {
            this.productCategoriesService.update(this.appService.currentStore.id, doc.id, { id: doc.id }).then(() => {
              this.loader.stopLoading();
              this.presentAlert("Sección creada exitosamente", "", () => {
                this.popoverCtrl.dismiss(doc.id);
              });
            });
          })
            .catch(function (error) {
              console.log(error);
              alert(error);
            });
        }
      }, 500);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
