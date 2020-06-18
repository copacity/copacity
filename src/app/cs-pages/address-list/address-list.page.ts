import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { AddressCreatePage } from '../address-create/address-create.page';
import { Address } from 'src/app/app-intefaces';
import { AddressesService } from 'src/app/cs-services/addresses.service';
import { LoaderComponent } from 'src/app/cs-components/loader/loader.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.page.html',
  styleUrls: ['./address-list.page.scss'],
})
export class AddressListPage implements OnInit {
  idAddressChecked: FormControl;

  constructor(
    private popoverCtrl: PopoverController,
    public alertController: AlertController,
    private addressesService: AddressesService,
    private loader: LoaderComponent,
    public appService: AppService,
  ) {
     
    this.idAddressChecked = new FormControl(this.appService.idAddressChecked); 
     
   }


  ngOnInit() {

  }

  close() {
    this.popoverCtrl.dismiss();
  }

  deleteAddress(address: Address) {
     
    this.presentConfirm('Esta seguro que desea eliminar esta direccion?', () => {
      this.addressesService.update(this.appService.currentUser.id, address.id, { deleted: true, checked: false }).then(() => {
        this.appService.addressCount --;

        if(this.appService.addressChecked && this.appService.addressChecked.id == address.id){
          this.appService.addressChecked = null;
        }

        this.presentAlert("Direccion eliminada exitosamente!", '', () => { });
      });
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

  async openAddressCreatePage(idAddress?: string) {
     
    let modal = await this.popoverCtrl.create({
      component: AddressCreatePage,
      componentProps: { id: idAddress },
      cssClass: 'cs-popovers',
      backdropDismiss: false,
    });

    modal.onDidDismiss()
      .then((data) => {
        const idAddress = data['data'];

        if(idAddress) {
          if(this.appService.addressCount <= 1){
            this.addressesService.update(this.appService.currentUser.id, idAddress , { checked: true}).then(() => {
              this.appService.addressCount ++;
              this.appService.idAddressChecked =  idAddress;
              this.idAddressChecked = new FormControl(this.appService.idAddressChecked); 
            });
          }
        }
      });

    modal.present();
  }

  addressChecked(event) {
     
    this.loader.startLoading("Actualizando Direcciones, por favor espere un momento...");
    setTimeout(() => {
      if(this.appService.idAddressChecked != ''){
        this.addressesService.update(this.appService.currentUser.id, this.appService.idAddressChecked , { checked: false}).then(() =>{
          this.addressesService.update(this.appService.currentUser.id, event.target.value, { checked: true}).then(() =>{
            this.addressesService.getById(this.appService.currentUser.id, event.target.value).then((address:Address) => {
              this.appService.addressChecked = address;
              this.appService.idAddressChecked =  event.target.value;
              this.loader.stopLoading();
            });
          });
        });

      }  else {
        this.addressesService.update(this.appService.currentUser.id, event.target.value , { checked: true}).then(() =>{
          this.addressesService.getById(this.appService.currentUser.id, event.target.value).then((address:Address) => {
            this.appService.addressChecked = address;
            this.appService.idAddressChecked =  event.target.value;
            this.loader.stopLoading();
          });
        });
      }
    }, 500);
  }
}