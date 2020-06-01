import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-password-reset-email',
  templateUrl: './password-reset-email.component.html',
  styleUrls: ['./password-reset-email.component.scss'],
})
export class PasswordResetEmailComponent implements OnInit {

  constructor(private angularFireAuth: AngularFireAuth,
    public toastController: ToastController,
    public popoverController: PopoverController, ) { }

  ngOnInit() { }

  async presentToast(message: string, color:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position:'top',
      buttons: ['Cerrar']
      // color: color
    });
    toast.present();
  }

  close() {
    this.popoverController.dismiss();
  }

  sendPasswordResetEmail() {
    let email = document.getElementById("email")['value'];
    if (!email) {
      this.presentToast("Por favor ingrese el correo.", "danger");      
      return;
    }
    
    this.angularFireAuth.auth.sendPasswordResetEmail(email).then(() => {
      this.presentToast("Se envió un correo de recuperación de contraseña.","light");
      this.popoverController.dismiss(true);
    })
  }
}
