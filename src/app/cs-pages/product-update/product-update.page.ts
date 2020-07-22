import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, AlertController, PopoverController, ToastController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { ProductCategory, ProductImage, ProductProperty } from 'src/app/app-intefaces';
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
  isGift: boolean;
  productCategories: Observable<ProductCategory[]> = null;
  form: FormGroup;
  productImageCollection: ProductImage[] = [];
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
    public navParams: NavParams,
    private loader: LoaderComponent) {

    this.isGift = navParams.data.isGift;

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
    let subs = result.subscribe((productImageResult: ProductImage[]) => {
      setTimeout(() => {
        this.productImageCollection = productImageResult
        // if (productImageResult.length != 0) {
        //   this.productImageCollection = productImageResult
        //   this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: productImageResult[productImageResult.length - 1].image });
        //   this.navParams.data.image = productImageResult[productImageResult.length - 1].image;
        // } else {
        //   this.productImageCollection = productImageResult
        // }
      }, 300);

      subs.unsubscribe();
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
        return '<div style="font-weight:bolder;font-size: 1.5em;text-align: -webkit-center;"><div style="width:70px;background-color: white;;opacity:.8">' +
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

  changeCoverImage(img: string) {
    this.storageService.getThumbUrl(this.appService.getImageIdByUrl(img), (thumbUrl: string) => {
      this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: thumbUrl }).then(() => {
        this.presentToast("La foto de portada fue cambiada", "");
        this.navParams.data.image = thumbUrl;
      });
    });
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
    return new Promise((resolve, reject) => {
      if (this.navParams.data.image) {
        let img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
          setTimeout(() => {
            this.getImage(img, resolve)
          }, 300);
        };

        console.log(this.navParams.data.image);
        img.src = this.navParams.data.image;
      } else {
        resolve("");
      }
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'createFile', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  shareProduct(e) {
    if (this.appService.currentStore.status == StoreStatus.Published) {
      this.createFile().then(file => {
        let navigator: any = window.navigator;
        let filesArray = [];
        filesArray.push(file);

        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
          navigator.share({
            files: filesArray,
            title: this.appService.currentStore.name,
            text: "Aprovecha y adquiere en Copacity.net " + this.navParams.data.name + ((this.navParams.data.discount && this.navParams.data.discount > 0) ? (" con el " +
              this.navParams.data.discount + "% de descuento!!") : "") + ". Tenemos muchos mas productos relacionados en la tienda " + this.appService.currentStore.name + " para tí. Si quieres ver mas detalles de este producto ingresa a: ",
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

    let text = "Aprovecha y adquiere en Copacity.net " + this.navParams.data.name + ((this.navParams.data.discount && this.navParams.data.discount > 0) ? (" con el " +
      this.navParams.data.discount + "% de descuento!!") : "") + ". Tenemos muchos mas productos relacionados en la tienda " + this.appService.currentStore.name + " para tí. Si quieres ver mas detalles de este producto ingresa a: " + this.appService._appInfo.domain + "/product-detail/" + this.navParams.data.id + "&" + this.appService.currentStore.id;

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
      text: 'Hola! Somos copacity.net, tu Centro Comercial Virtual, aquí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, también podrás acumular puntos y obtener regalos!',
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
    let text = 'Hola! Somos copacity.net, tu Centro Comercial Virtual, aquí podrás ver nuestras tiendas con una gran variedad de productos para tí, promociones, cupones con descuentos, también podrás acumular puntos y obtener regalos! ' + this.appService._appInfo.domain;

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

    if (!this.isGift) {
      this.form = this.formBuilder.group({
        name: [this.navParams.data.name, [Validators.required, Validators.maxLength(50)]],
        category: [this.navParams.data.idProductCategory.toString(), [Validators.required]],
        price: [this.navParams.data.price, [Validators.required]],
        description: [this.navParams.data.description, [Validators.maxLength(500)]],
        discount: [this.navParams.data.discount ? this.navParams.data.discount.toString() : '0'],
      });
    } else {
      this.form = this.formBuilder.group({
        name: [this.navParams.data.name, [Validators.required, Validators.maxLength(50)]],
        category: [this.navParams.data.idProductCategory.toString()],
        price: [this.navParams.data.price, [Validators.required]],
        description: [this.navParams.data.description, [Validators.maxLength(500)]],
        discount: [this.navParams.data.discount ? this.navParams.data.discount.toString() : '0'],
      });
    }
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
      }, 500); // Animation Delay
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

                  setTimeout(() => {
                    this.storageService.getThumbUrl(this.appService.getImageIdByUrl(url.toString()), (thumbUrl: string) => {
                      this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: thumbUrl });
                      this.navParams.data.image = thumbUrl;
                      this.loader.stopLoading();

                      let result = this.productService.getProductImages(this.appService.currentStore.id, this.navParams.data.id);
                      let subs = result.subscribe((productImageResult: ProductImage[]) => {
                          if (productImageResult.length != 0) {
                            this.productImageCollection = productImageResult;
                            
                            this.storageService.getThumbUrl(this.appService.getImageIdByUrl(productImageResult[productImageResult.length - 1].image.toString()), (thumbUrl: string) => {
                              this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: thumbUrl }).then(() => {
                                this.navParams.data.image = thumbUrl;
                                if (this.productImageCollection.length > 1) {
                                  this.sliderProducts.slideTo(this.productImageCollection.length);
                                }
                              });
                            });

                          } else {
                            this.productImageCollection = productImageResult
                            if (this.productImageCollection.length > 1) {
                              this.sliderProducts.slideTo(this.productImageCollection.length);
                            }
                          }

                        subs.unsubscribe();
                      });
                    });
                  }, 300);
                });
              });
            });
          }, 500);
        }
      });

    modal.present();
  }

  removeProductImage(productImage: ProductImage) {
    this.presentConfirm("Estás seguro que deseas eliminar la imagen?", () => {
      if (this.productImageCollection.length == 1) {
        this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: "" }).then(() => {
          this.navParams.data.image = '';
          this.productService.deleteProductImage(this.appService.currentStore.id, this.navParams.data.id, productImage.id).then(() => {
            this.storageService.deleteImageFromStorage(productImage.id);

            let result = this.productService.getProductImages(this.appService.currentStore.id, this.navParams.data.id);
            let subs = result.subscribe((productImageResult: ProductImage[]) => {
              setTimeout(() => {
                if (productImageResult.length != 0) {
                  this.productImageCollection = productImageResult
                  if (this.appService.getImageIdByUrl(productImage.image) === this.appService.getImageIdByUrl(this.navParams.data.image).replace('thumb_', '')) {
                    this.storageService.getThumbUrl(this.appService.getImageIdByUrl(productImageResult[productImageResult.length - 1].image.toString()), (thumbUrl: string) => {
                      this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: thumbUrl });
                      this.navParams.data.image = thumbUrl;
                    });
                  }
                } else {
                  this.productImageCollection = productImageResult
                }
              }, 300);

              subs.unsubscribe();
            });
          });
        });
      } else {
        this.productService.deleteProductImage(this.appService.currentStore.id, this.navParams.data.id, productImage.id).then(() => {
          this.storageService.deleteImageFromStorage(productImage.id);

          let result = this.productService.getProductImages(this.appService.currentStore.id, this.navParams.data.id);
          let subs = result.subscribe((productImageResult: ProductImage[]) => {
            setTimeout(() => {
              if (productImageResult.length != 0) {
                this.productImageCollection = productImageResult

                if (this.appService.getImageIdByUrl(productImage.image).replace('thumb_', '') === this.appService.getImageIdByUrl(this.navParams.data.image).replace('thumb_', '')) {
                  this.storageService.getThumbUrl(this.appService.getImageIdByUrl(productImageResult[productImageResult.length - 1].image.toString()), (thumbUrl: string) => {
                    this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { image: thumbUrl });
                    this.navParams.data.image = thumbUrl;
                  });
                }
              } else {
                this.productImageCollection = productImageResult
              }
            }, 300);

            subs.unsubscribe();
          });

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
      componentProps: { idStore: this.appService.currentStore.id, idProduct: this.navParams.data.id },
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

    this.presentConfirm('Si eliminas una caracteristica, el inventario que tengas del producto se borrará automaticamente y tendrás que agregarlo de nuevo, Estás seguro que deseas eliminar la caracteristica: ' + productProperty.name + '?', () => {
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

      this.productService.deleteCartInventory(this.appService.currentStore.id, this.navParams.data.id);
      this.productService.update(this.appService.currentStore.id, this.navParams.data.id, { soldOut: true });
    });
  }

  async productPropertyUpdate(productProperty: ProductProperty) {
    let modal = await this.popoverCtrl.create({
      component: ProductPropertyComponent,
      cssClass: 'cs-popovers',
      componentProps: { idStore: this.appService.currentStore.id, idProduct: this.navParams.data.id, productProperty: productProperty },
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
    return new Promise((resolve, reject) => {
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
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'saveProperties', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  savePropertyOptions(productProperty: ProductProperty) {
    return new Promise((resolve, reject) => {
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
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'savePropertyOptions', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }
}
