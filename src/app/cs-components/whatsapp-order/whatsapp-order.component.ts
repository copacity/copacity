import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { FormControl, Validators } from '@angular/forms';
import { User, Vendor } from 'src/app/app-intefaces';
import { UsersService } from 'src/app/cs-services/users.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-whatsapp-order',
  templateUrl: './whatsapp-order.component.html',
  styleUrls: ['./whatsapp-order.component.scss'],
})
export class WhatsappOrderComponent implements OnInit {
  idVendor: FormControl;
  users: User[];
  selectedUser: User;
  validationMessage: string = ''

  constructor(
    public popoverController: PopoverController,
    public appService: AppService,
    private usersService: UsersService,
    private navParams: NavParams,
    private storesService: StoresService) {
    this.idVendor = new FormControl('', [Validators.required]);

    let subs = this.storesService.getActiveVendors().subscribe(result => {

      let vendorPromises = [];
      result.forEach(vendor => {
        vendorPromises.push(this.fillUsers(vendor));
      });

      Promise.all(vendorPromises).then(users => {
        this.users = users;
      });

      subs.unsubscribe();
    });
  }

  vendorChange(event: any) {
    this.validationMessage = "";

    if (this.idVendor.value != 1) {
      this.users.forEach(user => {
        if (user.id == this.idVendor.value) {
          this.selectedUser = user
        }
      });
    }
  }

  fillUsers(vendor: Vendor) {
    return new Promise((resolve, reject) => {
      this.usersService.getById(vendor.idUser).then(user => {
        resolve(user);
      });
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'fillUsers', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  sendToWhatssApp() {
    this.validationMessage = "";

    if (this.idVendor.valid) {
      let selectedUser;
      this.users.forEach(user => {
        if (user.id == this.idVendor.value) {
          selectedUser = user;
        }
      });

      if (!selectedUser && this.idVendor.value == 1) {
        this.popoverController.dismiss("Copacity");
      } else {
        this.popoverController.dismiss(selectedUser);
      }
    } else {
      this.validationMessage = "Debes seleccionar un asesor";
      this.idVendor.markAllAsTouched();
    }
  }

  login() {
    this.popoverController.dismiss("Login");
  }

  async openImageViewer(img: string) {
    let images: string[] = [];
    images.push(img);

    let modal = await this.popoverController.create({
      component: ImageViewerComponent,
      componentProps: { images: images },
      cssClass: 'cs-popovers',
    });

    modal.onDidDismiss()
      .then((data) => {
        const updated = data['data'];
      });

    modal.present();
  }
}
