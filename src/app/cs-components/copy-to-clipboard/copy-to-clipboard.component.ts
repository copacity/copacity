import { Component, OnInit } from '@angular/core';
import { ToastController, NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-copy-to-clipboard',
  templateUrl: './copy-to-clipboard.component.html',
  styleUrls: ['./copy-to-clipboard.component.scss'],
})
export class CopyToClipboardComponent implements OnInit {
  linkText:string;

  constructor(public toastController: ToastController, private popoverCtrl: PopoverController, private navParams: NavParams) {
    this.linkText = this.navParams.data.textLink;
   }

  ngOnInit() {}

  copyToClipBoard() {
    let copyText: any = document.getElementById("textLink");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  
    /* Copy the text inside the text field */
    document.execCommand("copy");
  
    /* Alert the copied text */
    this.presentToast("Texto copiado exitosamente");
    this.popoverCtrl.dismiss();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      duration:2000,
      message: message,
      position: 'top',
      buttons: ['Cerrar']
    });

    toast.present();
  }
}
