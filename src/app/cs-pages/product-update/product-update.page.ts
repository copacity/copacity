import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, AlertController, PopoverController, ToastController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { ProductCategory, File, Product, ProductImage, ProductPropertyOption, ProductProperty } from 'src/app/app-intefaces';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { ProductCategoriesService } from 'src/app/cs-services/productCategories.service';
import { AppService } from 'src/app/cs-services/app.service';
import { ProductsService } from 'src/app/cs-services/products.service';
import { StorageService } from 'src/app/cs-services/storage.service';
import { CropperImageComponent } from 'src/app/cs-components/cropper-image/cropper-image.component';
import { StoreStatus } from 'src/app/app-enums';
import { CartService } from 'src/app/cs-services/cart.service';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { CopyToClipboardComponent } from 'src/app/cs-components/copy-to-clipboard/copy-to-clipboard.component';
import { ProductPropertyComponent } from 'src/app/cs-components/product-property/product-property.component';

@Component({
  selector: 'app-product-update',
  templateUrl: './product-update.page.html',
  styleUrls: ['./product-update.page.scss'],
})
export class ProductUpdatePage implements OnInit {
  @ViewChild('sliderProductUpdate', null) slider: any;
  @ViewChild('sliderImageProductUpdate', null) sliderProducts: any;

  isAdmin: boolean = false;
  productCategories: Observable<ProductCategory[]> = null;
  form: FormGroup;
  productImageCollection: ProductImage[] = [];
  file: File;
  public imagePath;
  productProperties: ProductProperty[] = []

  productPropertySubs: Subscription;
  productPropertyOptionSubs: Subscription;

  constructor(private popoverCtrl: PopoverController,
    public toastController: ToastController,
    private ngNavigatorShareService: NgNavigatorShareService,
    private storageService: StorageService,
    private formBuilder: FormBuilder,
    public alertController: AlertController,
    private productCategoriesService: ProductCategoriesService,
    private productService: ProductsService,
    public cartService: CartService,
    public appService: AppService,
    private navParams: NavParams,
    private loader: LoaderComponent) {

    this.buildForm();
    this.productCategories = this.productCategoriesService.getAll(this.appService.currentStore.id);

    let productPropertiesResult = this.productService.getAllProductProperties(this.appService.currentStore.id, this.navParams.data.id);

    let subscribe = productPropertiesResult.subscribe(productProperties => {
      productProperties.forEach(productProperty => {
        let productPropertyOptionsResult = this.productService.getAllProductPropertyOptions(this.appService.currentStore.id, this.navParams.data.id, productProperty.id);
        let subscribe2 = productPropertyOptionsResult.subscribe(productPropertyOptions => {
          productProperty.productPropertyOptions = productPropertyOptions;
          subscribe2.unsubscribe();
        });
      });

      this.productProperties = productProperties;
      subscribe.unsubscribe();
    });

    let result = this.productService.getProductImages(this.appService.currentStore.id, this.navParams.data.id);
    result.subscribe((productImageResult: ProductImage[]) => {

      setTimeout(() => {
        if (productImageResult.length != 0) {
          this.productImageCollection = productImageResult
          this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: productImageResult[productImageResult.length - 1].image });
        } else {
          this.productImageCollection = productImageResult
        }
      }, 300);
    });
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

  ngOnInit() {

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

  getImage(img, resolve) {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    let context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    canvas.toBlob(function (blob) {

      let metadata = {
        type: 'image/png'
      };

      resolve(new File([blob], "data.png", metadata));

    }, 'image/png')
  }

  createFile() {
    return new Promise(resolve => {
      if (this.navParams.data.image) {
        let img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
          setTimeout(() => {
            this.getImage(img, resolve)
          }, 300);
        };

        img.src = this.navParams.data.image;
      } else {
        resolve("");
      }
    });
  }

  shareProduct(e) {
    if (this.appService.currentStore.status == StoreStatus.Published) {
      this.createFile().then(file => {
        let navigator: any = window.navigator;
        let filesArray = [];

        if (file) {
          filesArray.push(file);
        }

        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
          navigator.share({
            files: filesArray,
            title: this.appService.currentStore.name,
            text: "Aprovecha y adquiere aquí " + this.navParams.data.name + ((this.navParams.data.discount && this.navParams.data.discount > 0) ? (" con el " +
              this.navParams.data.discount + "% de descuento!!") : "") + ". Visita nuestra tienda virtual " + this.appService.currentStore.name + " en CopaCity. Para ver mas detalles de este producto ingresa a: ",
            url: this.appService._appInfo.domain + "/product-detail/" + this.navParams.data.id + "&" + this.appService.currentStore.id
          })
            .then(() => console.log('Share was successful.'))
            .catch((error) => console.log('Sharing failed', error));
        } else {
          console.log(`Your system doesn't support sharing files.`);
          this.openCopyToClipBoardProduct(e);
        }
      });
    } else {
      this.presentAlert("Solo puedes compartir tu tienda cuando este aprobada y publicada. Gracias", "", () => { });
    }
  }

  async openCopyToClipBoardProduct(e) {

    let text = "Aprovecha y adquiere aquí " + this.navParams.data.name + ((this.navParams.data.discount && this.navParams.data.discount > 0) ? (" con el " +
      this.navParams.data.discount + "% de descuento!!") : "") + ". Visita nuestra tienda virtual " + this.appService.currentStore.name + " en CopaCity. Para ver mas detalles de este producto ingresa a: " + this.appService._appInfo.domain + "/product-detail/" + this.navParams.data.id + "&" + this.appService.currentStore.id;

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

  shareApp(e) {
    this.ngNavigatorShareService.share({
      title: "COPACITY",
      text: 'Hola ingresa a copacity.net y podrás buscar tiendas en Copacabana, comprar productos y recibirlos a domicilio!',
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
    let text = 'Hola ingresa a copacity.net, y podrás buscar tiendas en Copacabana, comprar productos y recibirlos a domicilio! ' + this.appService._appInfo.domain;

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

  async presentToast(message: string, image: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: message,
      position: 'bottom',
    });
    toast.present();
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
    this.popoverCtrl.dismiss();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [this.navParams.data.name, [Validators.required, Validators.maxLength(30)]],
      category: [this.navParams.data.idProductCategory.toString(), [Validators.required]],
      price: [this.navParams.data.price, [Validators.required]],
      description: [this.navParams.data.description, [Validators.maxLength(500)]],
      discount: [this.navParams.data.discount ? this.navParams.data.discount.toString() : '0'],
    });
  }

  updateProduct() {

    if (this.form.valid) {
      this.loader.startLoading("Estamos actualizando su producto por favor espere un momento...");

      let data = {
        name: this.form.value.name,
        idProductCategory: this.form.value.category,
        price: this.form.value.price,
        description: this.form.value.description,
        discount: this.form.value.discount,
      }

      setTimeout(() => {
        this.productService.update(this.appService.currentStore.id, this.navParams.data.id, data).then(async (doc) => {
          this.saveProperties().then(() => {
            this.loader.stopLoading();
            this.presentAlert("El producto ha sido actualizado exitosamente", "", () => {
              this.popoverCtrl.dismiss(true);
            });
          });
        })
          .catch(function (error) {
            this.presentAlert("Ocurrio un error mientras se actualizaba la foto", error, () => { }),
              console.log(error);
          });
      }, 2000); // Animation Delay
    } else {
      this.form.markAllAsTouched();
    }
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
            let newImg: ProductImage = {
              id: '',
              dateCreated: new Date(),
              deleted: false,
              image: ''
            }

            this.productService.addProductImage(this.appService.currentStore.id, this.navParams.data.id, newImg).then((doc) => {
              newImg.id = doc.id;
              this.storageService.ResizeImage(image, doc.id, 500, 500).then((url) => {

                this.productService.updateProductImage(this.appService.currentStore.id, this.navParams.data.id, doc.id, { id: doc.id, image: url }).then((doc) => {
                  this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: url });
                  this.navParams.data.image = url.toString();
                  this.loader.stopLoading();

                  setTimeout(() => {
                    if (this.productImageCollection.length > 1) {
                      this.sliderProducts.slideTo(this.productImageCollection.length);
                    }
                  }, 300);
                });
              });
            });
          }, 2000);
        }
      });

    modal.present();
  }

  removeProductImage(productImage: ProductImage) {
    this.presentConfirm("Estas seguro que deseas eliminar la imagen?", () => {
      if (this.productImageCollection.length == 1) {
        this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: "" }).then(() => {
          this.navParams.data.image = '';
          this.productService.deleteProductImage(this.appService.currentStore.id, this.navParams.data.id, productImage.id).then(() => {
            this.storageService.deleteImageFromStorage(productImage.id);
          });
        });
      } else {
        this.productService.deleteProductImage(this.appService.currentStore.id, this.navParams.data.id, productImage.id).then(() => {
          this.storageService.deleteImageFromStorage(productImage.id);
        });
      }
    });
  }

  async uploadImageProduct(event: any) {
    if (this.productImageCollection.length < 10) {


      var mimeType = event.target.files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        this.presentAlert("Solo se admiten imagenes", "", () => { });
        return;
      }

      var reader = new FileReader();
      this.imagePath = event.target.files;
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        this.storageService.ResizeImage2(reader.result.toString(), this.appService.currentUser.id, 500, 500).then((image) => {
          this.openCropperImageComponent(image);
        });
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
            this.productService.updateProductProperty(this.appService.currentStore.id, this.navParams.data.id, this.productProperties[index].id, { name: this.productProperties[index].name, isMandatory: this.productProperties[index].isMandatory, userSelectable: this.productProperties[index].userSelectable, deleted: this.productProperties[index].deleted }).then(() => {
              this.savePropertyOptions(this.productProperties[index]).then(() => {
                addProdcutProperty(++index);
              });
            });
          } else {
            this.productService.createProductProperty(this.appService.currentStore.id, this.navParams.data.id, this.productProperties[index]).then((doc) => {
              this.productService.updateProductProperty(this.appService.currentStore.id, this.navParams.data.id, doc.id, { id: doc.id }).then(() => {
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
            this.productService.updateProductPropertyOption(this.appService.currentStore.id, this.navParams.data.id, productProperty.id, productProperty.productPropertyOptions[index].id, productProperty.productPropertyOptions[index]).then(() => {
              addProdcutPropertyOption(++index);
            });
          } else {
            this.productService.createProductPropertyOption(this.appService.currentStore.id, this.navParams.data.id, productProperty.id, productProperty.productPropertyOptions[index]).then((doc) => {
              productProperty.productPropertyOptions[index].id = doc.id;
              this.productService.updateProductPropertyOption(this.appService.currentStore.id, this.navParams.data.id, productProperty.id, doc.id, productProperty.productPropertyOptions[index]).then(() => {
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
