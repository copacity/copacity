import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { auth } from 'firebase/app';
import { AppService } from 'src/app/cs-services/app.service';
import { PopoverController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { User } from 'src/app/app-intefaces';
import { SignupComponent } from '../signup/signup.component';
import { PasswordResetEmailComponent } from '../password-reset-email/password-reset-email.component';
import { LoaderComponent } from '../loader/loader.component';
import { TermsServicePage } from 'src/app/cs-pages/terms-service/terms-service.page';
import { PrivacyPolicyPage } from 'src/app/cs-pages/privacy-policy/privacy-policy.page';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {

  constructor(
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private appService: AppService,
    private loaderComponent: LoaderComponent,
    public popoverController: PopoverController,
    public popoverControllerAdd: PopoverController,
    public toastController: ToastController

  ) { }

  ngOnInit() { }

  createAccount() {
    this.popoverSignup();
  }

  async popoverPasswordResetEmail() {
    this.close();
    const popover = await this.popoverControllerAdd.create({
      component: PasswordResetEmailComponent,
      cssClass: "recoverPassword-popover"
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
        if (result) {
          this.popoverController.dismiss();
        }
      });

    return await popover.present();
  }

  async popoverSignup() {
    this.close();
    const popover = await this.popoverControllerAdd.create({
      component: SignupComponent,
      cssClass: "signup-popover"
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
        if (result) {
          this.close();
        }
      });
    return await popover.present();
  }

  async popoverTermsService() {
    const popover = await this.popoverControllerAdd.create({
      component: TermsServicePage,
      cssClass: "cs-popovers"
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
      });

    return await popover.present();
  }

  async popoverPrivacyPolicy() {
    const popover = await this.popoverControllerAdd.create({
      component: PrivacyPolicyPage,
      cssClass: "cs-popovers"
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
      });

    return await popover.present();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      position: 'top',
      buttons: ['Cerrar']
      // color: color
    });

    toast.present();
  }

  close() {
    this.popoverController.dismiss();
  }

  public signinEmail() {
    let email = document.getElementById("email")['value'];
    let password = document.getElementById("password")['value'];

    if (!email) {
      this.presentToast("Por favor ingrese el email.", "danger");
      this.loaderComponent.stopLoading();
      return;
    }

    if (!password) {
      this.presentToast("Por favor ingrese la contraseña.", "danger");
      this.loaderComponent.stopLoading();
      return;
    }

    this.loaderComponent.startLoading("Autenticando...");
    this.angularFireAuth.auth.signInWithEmailAndPassword(email, password).then(async (userCredential) => {
      this.angularFirestore.collection('users').doc(userCredential.user.uid).get().toPromise().then((result) => {
        if (result.exists) {
          this.appService.setuserCredential(userCredential.user.uid).then(() => {
            this.presentToast("Bienvenido a CopaCity!", "light");
            this.popoverController.dismiss(true);
            this.loaderComponent.stopLoading();
          });
        }
        else {
          this.popoverSignup();
          this.presentToast("Usuario no  registrado. Cree una cuenta por favor para continuar", "danger");
          this.appService.setuserCredential(null);
          this.loaderComponent.stopLoading();
        }
      })
    }).catch(async (error) => {
      this.presentToast(error['message'], "danger");
      this.appService.setuserCredential(null);
      this.loaderComponent.stopLoading();
    });
  }

  public signinGoogle() {
    let provider = new auth.GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: 'select_account'
    });

    this.angularFireAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL).then(() => {

      this.loaderComponent.startLoading("Autenticando...");
      return this.angularFireAuth.auth.signInWithPopup(provider).then(userCredential => {
        if (userCredential.user) {
          this.angularFirestore.collection('users').doc(userCredential.user.uid).get().toPromise().then(async (result) => {

            if (result.exists) {
              this.appService.setuserCredential(userCredential.user.uid).then(() => {
                this.popoverController.dismiss(true);
                this.presentToast("Bienvenido a CopaCity!", "light");
                this.loaderComponent.stopLoading();
              });
            }
            else {
              let newUser: User = {
                name: userCredential.user.displayName,
                email: userCredential.user.email,
                photoUrl: userCredential.user.photoURL,
                thumb_photoUrl: userCredential.user.photoURL,
                phone1: 0,
                phone2: 0,
                whatsapp: 0,
                dateCreated: new Date(),
                deleted: false,
                id: userCredential.user.uid,
                lastUpdated: new Date(),
                isAdmin: false,
                isSuperUser: false
              }

              await this.angularFirestore.collection('users').doc(userCredential.user.uid).set(newUser).then(() => {
                this.appService.setuserCredential(userCredential.user.uid).then(() => {
                  this.presentToast("Bienvenido a CopaCity!", "light");
                  this.popoverController.dismiss(true);
                  this.loaderComponent.stopLoading();
                });
              })
            }
          });
        }
      }).catch((error) => {
        this.presentToast(error['message'], "danger");
        this.appService.setuserCredential(null);
        this.loaderComponent.stopLoading();
      });
    })
      .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        this.presentToast(errorMessage + " " + errorCode, "danger");
        this.loaderComponent.stopLoading();
      });
  }

  public signinFacebook() {
    let provider = new auth.FacebookAuthProvider();

    this.angularFireAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL).then(() => {

      this.loaderComponent.startLoading("Autenticando...");
      return this.angularFireAuth.auth.signInWithPopup(provider).then(userCredential => {
        if (userCredential.user) {
          this.angularFirestore.collection('users').doc(userCredential.user.uid).get().toPromise().then(async (result) => {

            if (result.exists) {
              this.appService.setuserCredential(userCredential.user.uid).then(() => {
                this.popoverController.dismiss(true);
                this.presentToast("Bienvenido a CopaCity!", "light");
                this.loaderComponent.stopLoading();
              });
            }
            else {
              let newUser: User = {
                name: userCredential.user.displayName,
                email: userCredential.user.email,
                photoUrl: userCredential.user.photoURL,
                thumb_photoUrl: userCredential.user.photoURL,
                phone1: 0,
                phone2: 0,
                whatsapp: 0,
                dateCreated: new Date(),
                deleted: false,
                id: userCredential.user.uid,
                lastUpdated: new Date(),
                isAdmin: false,
                isSuperUser: false
              }

              await this.angularFirestore.collection('users').doc(userCredential.user.uid).set(newUser).then(() => {
                this.appService.setuserCredential(userCredential.user.uid).then(() => {
                  this.presentToast("Bienvenido a CopaCity!", "light");
                  this.popoverController.dismiss(true);
                  this.loaderComponent.stopLoading();
                });
              })
            }
          });
        }
      }).catch((error) => {
        this.presentToast(error['message'], "danger");
        this.appService.setuserCredential(null);
        this.loaderComponent.stopLoading();
      });
    })
      .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        this.presentToast(errorMessage + " " + errorCode, "danger");
        this.loaderComponent.stopLoading();
      });
  }
}
