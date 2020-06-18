import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductCategory, Product, File, ProductImage, ProductProperty } from 'src/app/app-intefaces';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, PopoverController, ToastController, NavParams } from '@ionic/angular';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { ProductCategoriesService } from 'src/app/cs-services/productCategories.service';
import { ProductsService } from 'src/app/cs-services/products.service';
import { AppService } from 'src/app/cs-services/app.service';
import { StorageService } from 'src/app/cs-services/storage.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { CropperImageComponent } from 'src/app/cs-components/cropper-image/cropper-image.component';
import { CartService } from 'src/app/cs-services/cart.service';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuNotificationsComponent } from 'src/app/cs-components/menu-notifications/menu-notifications.component';
import { MenuUserComponent } from 'src/app/cs-components/menu-user/menu-user.component';
import { CartPage } from '../cart/cart.page';
import { ProductPropertyComponent } from 'src/app/cs-components/product-property/product-property.component';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.page.html',
  styleUrls: ['./product-create.page.scss'],
})
export class ProductCreatePage implements OnInit {
  @ViewChild('sliderProductCreate', null) slider: any;
  @ViewChild('sliderImageProductCreate', null) sliderProducts: any;

  productCategories: Observable<ProductCategory[]> = null;
  form: FormGroup;
  file: File;
  isAdmin: boolean = false;
  productProperties: ProductProperty[] = [];
  productId: string;

  imgURL: any[] = [];
  isGift: boolean;

  constructor(private popoverCtrl: PopoverController,
    public alertController: AlertController,
    private router: Router,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private angularFireAuth: AngularFireAuth,
    private productsService: ProductsService,
    public toastController: ToastController,
    private storageService: StorageService,
    private ngNavigatorShareService: NgNavigatorShareService,
    public cartSevice: CartService,
    private storesService: StoresService,
    private productCategoriesService: ProductCategoriesService,
    public appService: AppService,
    private loader: LoaderComponent) {

    this.isGift = this.navParams.data.isGift;
    this.buildForm();
    this.productCategories = this.productCategoriesService.getAll(this.appService.currentStore.id);
  }

  ngOnInit() {

  }

  slideOpts = {
    // initialSlide: 0,
    // slidesPerView: 1,
    // autoplay: true,
    pager: true,
    // loop: true,
    // speed: 3000
    pagination: {
      el: '.swiper-pagination',
      type: 'fraction',
      renderFraction: function (currentClass, totalClass) {
        return '<div style="font-weight:bolder;font-size: 1.5em;text-align: -webkit-center;"><div style="width:70px;background-color: white;">' +
          '<span  class="' + currentClass + '"></span>' +
          ' / ' +
          '<span class="' + totalClass + '"></span></div></div>';
      }
    }
  };

  async SignIn() {
    const popover = await this.popoverCtrl.create({
      component: SigninComponent,
      cssClass: "signin-popover",
    });
    return await popover.present();
  }


  signOut() {
    this.presentConfirm("Estas seguro que deseas cerrar la sesion?", () => {
      this.loader.startLoading("Cerrando Sesion, por favor espere un momento...")
      setTimeout(() => {
        this.angularFireAuth.auth.signOut();
        //this.popoverCtrl.dismiss();
        this.presentToast("Has abandonado la sesión!");
        this.loader.stopLoading();
      }, 500);
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
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

  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola! Somos copacity.net, tu Centro Comercial Virtual, allí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa!',
      url: this.appService._appInfo.domain
    }).then((response) => {
      console.log(response);
    })
      .catch((error) => {
        console.log(error);

        if (error.error.toString().indexOf("not supported") != -1) {
          this.openCopyToClipBoard(e);
        }
      });
  }

  async openCopyToClipBoard(e) {
    let text = 'Hola! Somos copacity.net, tu Centro Comercial Virtual, allí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, tambien podrás acumular puntos y obtener regalos, y lo mejor!, todo te lo llevamos hasta la puerta de tu casa! ' + this.appService._appInfo.domain;

    let modal = await this.popoverCtrl.create({
      component: CopyToClipboardComponent,
      cssClass: 'notification-popover',
      componentProps: { textLink: text },
      event: e
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

      });

    modal.present();
  }

  async presentMenuUser(e) {
    const popover = await this.popoverCtrl.create({
      component: MenuUserComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e
    });

    return await popover.present();
  }

  async presentMenuNotifications(e) {
    const popover = await this.popoverCtrl.create({
      component: MenuNotificationsComponent,
      animated: false,
      showBackdrop: true,
      mode: 'ios',
      translucent: false,
      event: e,
      cssClass: 'notification-popover'
    });

    return await popover.present();
  }

  ionViewDidEnter() {
    try { this.slider.startAutoplay(); } catch (error) { }
  }

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

  async goToCreateOrder() {
    this.router.navigate(['/order-create']);
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

  close() {
    //this.router.navigate(['/store', this.appService.currentStore.id]);
    this.popoverCtrl.dismiss();
  }

  private buildForm() {

    if (!this.isGift) {
      this.form = this.formBuilder.group({
        name: ['', [Validators.required, Validators.maxLength(50)]],
        category: ['', [Validators.required]],
        price: ['', [Validators.required]],
        description: ['', [Validators.maxLength(500)]],
        discount: ['0'],
      });
    } else {
      this.form = this.formBuilder.group({
        name: ['', [Validators.required, Validators.maxLength(50)]],
        category: [''],
        price: ['', [Validators.required]],
        description: ['', [Validators.maxLength(500)]],
        discount: ['0'],
      });
    }

  }

  createProduct() {

    if (this.form.valid) {
      this.loader.startLoading("Estamos creando su producto por favor espere un momento...");

      setTimeout(() => {

        let newProduct: Product =
        {
          id: '',
          deleted: false,
          image: '',
          lastUpdated: new Date(),
          dateCreated: new Date(),
          name: this.form.value.name,
          description: this.form.value.description,
          price: this.form.value.price,
          idProductCategory: this.form.value.category,
          discount: this.form.value.discount,
          soldOut: true,
          isGift: this.isGift
        }

        this.productsService.create(this.appService.currentStore.id, newProduct).then(async (doc) => {
          this.productId = doc.id;
          this.productsService.update(this.appService.currentStore.id, doc.id, { id: doc.id }).then(() => {
            this.saveProperties().then(() => {
              this.appService.currentStore.productsCount = this.appService.currentStore.productsCount + 1;
              this.storesService.update(this.appService.currentStore.id, { productsCount: this.appService.currentStore.productsCount }).then(() => {
                if (this.imgURL.length != 0) {
                  this.saveImages(doc.id, 0).then(() => {
                    this.loader.stopLoading();
                    this.presentAlert("El producto ha sido creado exitosamente", "", () => {
                      //this.router.navigate(['/store', this.appService.currentStore.id]);
                      this.popoverCtrl.dismiss(doc.id);
                    })
                  });
                } else {
                  this.loader.stopLoading();
                  this.presentAlert("El producto ha sido creado exitosamente", "", () => {
                    this.popoverCtrl.dismiss(doc.id);
                    //this.router.navigate(['/store', this.appService.currentStore.id]);
                  });
                }
              });
            });
          });
        })
          .catch(function (error) {
            console.log(error);
            alert(error);
          });
      }, 500); // Animation Delay
    } else {
      this.form.markAllAsTouched();
    }
  }

  saveImages(idProduct: string, index: number) {
    return new Promise(resolve => {
      let addProdcutImage = (index: number, lastImageUrl: String) => {
        if (this.imgURL.length == index) {
          this.productsService.update(this.appService.currentStore.id, idProduct, { image: lastImageUrl }).then(result => {
            resolve(true);
          });
        }
        else {

          let img: ProductImage = {
            id: '',
            dateCreated: new Date(),
            deleted: false,
            image: ''
          }

          this.productsService.addProductImage(this.appService.currentStore.id, idProduct, img).then((doc) => {
            this.storageService.ResizeImage(this.imgURL[index], doc.id, 500, 500).then((url) => {
              this.productsService.updateProductImage(this.appService.currentStore.id, idProduct, doc.id, { id: doc.id, image: url }).then((doc) => {
                addProdcutImage(++index, url);
              });
            });
          });
        }
      };

      addProdcutImage(index, '');
    });
  }

  async openCropperImageComponent(imageUrl: any) {

    let modal = await this.popoverCtrl.create({
      component: CropperImageComponent,
      cssClass: 'cs-popovers',
      componentProps: { image: imageUrl },
      backdropDismiss: false
    });

    modal.onDidDismiss()
      .then((data) => {
        const image = data['data'];
        if (image) {
          this.loader.startLoading("Actualizando imagen, por favor espere un momento...");
          setTimeout(() => {
            this.loader.stopLoading();
            this.storageService.ResizeImage2(image.toString(), this.appService.currentUser.id, 500, 500).then((image) => {
              this.imgURL.push(image);

              setTimeout(() => {
                if (this.imgURL.length > 1) {
                  this.sliderProducts.slideTo(this.imgURL.length);
                }
              }, 300);
            });
          }, 500);
        }
      });

    modal.present();
  }

  removeProductImage(img: string) {
    for (let [index, image] of this.imgURL.entries()) {
      if (image === img) {
        this.presentConfirm("Estas seguro que deseas eliminar la imagen?", () => {
          this.imgURL.splice(index, 1);
        });
        break;
      }
    }
  }

  async uploadFileCreateProduct(event: any) {
    if (this.imgURL.length < 10) {
      var mimeType = event.target.files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        this.presentAlert("Solo se admiten imagenes", "", () => { });
        return;
      }

      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        // this.storageService.ResizeImage2(reader.result.toString(), this.appService.currentUser.id, 500, 500).then((image) => {
        //   this.openCropperImageComponent(image);
        // });
        this.openCropperImageComponent(reader.result);
      }
    } else {
      this.presentAlert("No puedes subir mas de 10 imagenes para el mismo producto", "", () => { });
    }
  }

  getNumbers() {

    let numbers = [];

    for (let i = 0; i <= 100; i++) {
      numbers.push(i);
    }

    return numbers;
  }

  async openProductProperty(e) {
    let modal = await this.popoverCtrl.create({
      component: ProductPropertyComponent,
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          this.productProperties.push(result);
        }
      });

    modal.present();
  }

  productPropertyDelete(productProperty: ProductProperty) {
    this.presentConfirm('Esta seguro que desea eliminar la caracteristica: ' + productProperty.name + '?', () => {
      if (!productProperty.id) {
        for (let [index, p] of this.productProperties.entries()) {
          if (p === productProperty) {
            this.productProperties.splice(index, 1);
          }

        }
      } else {
        for (let [index, p] of this.productProperties.entries()) {
          if (p === productProperty) {
            p.deleted = true;
          }
        }
      }
    });
  }

  async productPropertyUpdate(productProperty: ProductProperty) {
    let modal = await this.popoverCtrl.create({
      component: ProductPropertyComponent,
      cssClass: 'cs-popovers',
      componentProps: { productProperty: productProperty },
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const result = data['data'];

        if (result) {
          for (let [index, p] of this.productProperties.entries()) {
            if (p === productProperty) {
              p = result;
            }
          }
        }
      });

    modal.present();
  }

  saveProperties() {
    return new Promise(resolve => {
      let addProdcutProperty = (index: number) => {
        if (this.productProperties.length == index) {
          resolve(true);
        }
        else {
          if (this.productProperties[index].id) {
            this.productsService.updateProductProperty(this.appService.currentStore.id, this.productId, this.productProperties[index].id, { name: this.productProperties[index].name, isMandatory: this.productProperties[index].isMandatory, userSelectable: this.productProperties[index].userSelectable, deleted: this.productProperties[index].deleted }).then(() => {
              this.savePropertyOptions(this.productProperties[index]).then(() => {
                addProdcutProperty(++index);
              });
            });
          } else {
            this.productsService.createProductProperty(this.appService.currentStore.id, this.productId, this.productProperties[index]).then((doc) => {
              this.productsService.updateProductProperty(this.appService.currentStore.id, this.productId, doc.id, { id: doc.id }).then(() => {
                this.productProperties[index].id = doc.id;
                this.savePropertyOptions(this.productProperties[index]).then(() => {
                  addProdcutProperty(++index);
                });
              });
            });
          }
        }
      };

      addProdcutProperty(0);
    });
  }

  savePropertyOptions(productProperty: ProductProperty) {
    return new Promise(resolve => {
      let addProdcutPropertyOption = (index: number) => {
        if (productProperty.productPropertyOptions.length == index) {
          resolve(true);
        }
        else {
          if (productProperty.productPropertyOptions[index].id) {
            this.productsService.updateProductPropertyOption(this.appService.currentStore.id, this.productId, productProperty.id, productProperty.productPropertyOptions[index].id, productProperty.productPropertyOptions[index]).then(() => {
              addProdcutPropertyOption(++index);
            });
          } else {
            this.productsService.createProductPropertyOption(this.appService.currentStore.id, this.productId, productProperty.id, productProperty.productPropertyOptions[index]).then((doc) => {
              productProperty.productPropertyOptions[index].id = doc.id;
              this.productsService.updateProductPropertyOption(this.appService.currentStore.id, this.productId, productProperty.id, doc.id, productProperty.productPropertyOptions[index]).then(() => {
                addProdcutPropertyOption(++index);
              });
            });
          }
        }
      };

      addProdcutPropertyOption(0);
    });
  }
}
