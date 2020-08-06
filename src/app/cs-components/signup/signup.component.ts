import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { PopoverController } from '@ionic/angular';
import { User } from 'src/app/app-intefaces';
import { LoaderComponent } from '../loader/loader.component';
import { ToastController } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';
import { PrivacyPolicyPage } from 'src/app/cs-pages/privacy-policy/privacy-policy.page';
import { TermsServicePage } from 'src/app/cs-pages/terms-service/terms-service.page';
import { ReturnsPolicyPage } from 'src/app/cs-pages/returns-policy/returns-policy.page';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  constructor(
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    public popoverController: PopoverController,
    private loaderComponent: LoaderComponent,
    private appService: AppService,
    public toastController: ToastController
  ) { }

  ngOnInit() { }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      position: 'top',
      buttons: ['Cerrar']
      // color: color
    });
    toast.present();
  }

  public signupEmail() {
    let username = document.getElementById("_user")['value'];
    let email = document.getElementById("_email")['value'];
    let password = document.getElementById("_password")['value'];
    let repatpassword = document.getElementById("_repeatPassword")['value'];

    if (!username) {
      this.presentToast("Por favor ingrese el usuario.", "danger");
      this.loaderComponent.stopLoading();
      return;
    }

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

    if (!repatpassword) {
      this.presentToast("Por favor ingrese repita la contraseña.", "danger");
      this.loaderComponent.stopLoading();
      return;
    }

    if (password != repatpassword) {
      this.presentToast("las contraseñas ingresadas no coinciden.", "danger");
      this.loaderComponent.stopLoading();
      return;
    }

    this.angularFireAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL).then(() => {
      this.loaderComponent.startLoading("Autenticando...");
      this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
        this.angularFirestore.collection('users').doc(userCredential.user.uid).get().toPromise().then(async (result) => {
          if (!result.exists) {
            let newUser: User = {
              name: username,
              email: email,
              photoUrl: '',
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
              this.appService.setuserCredential(userCredential.user.uid).then(async () => {
                this.presentToast("Bienvenido a CopaCity!", "light");
                this.popoverController.dismiss(true);
                this.loaderComponent.stopLoading();
              });
            })
          }
          else {
            //this.presentToast("El usuario ya está registrado.", "danger");
            this.presentToast("Bienvenido a CopaCity!", "light");
            this.popoverController.dismiss(true);
            this.loaderComponent.stopLoading();
          }
        })
      }).catch((error) => {
        this.presentToast(error['message'], "danger");
        console.log(error);
        this.loaderComponent.stopLoading();
      })
    });
  }

  close() {
    this.popoverController.dismiss(true);
  }

  async popoverReturnsPolicy() {
    const popover = await this.popoverController.create({
      component: ReturnsPolicyPage,
      cssClass: "cs-popovers"
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
      });

    return await popover.present();
  }

  async popoverTermsService() {
    const popover = await this.popoverController.create({
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
    const popover = await this.popoverController.create({
      component: PrivacyPolicyPage,
      cssClass: "cs-popovers"
    });

    popover.onDidDismiss()
      .then((data) => {
        let result = data['data'];
      });

    return await popover.present();
  }

  public signupGoogle() {
    let provider = new auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    this.angularFireAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL).then(() => {

      this.loaderComponent.startLoading("Autenticando...");
      return this.angularFireAuth.auth.signInWithPopup(provider).then((userCredential) => {
        if (userCredential.user) {
          this.angularFirestore.collection('users').doc(userCredential.user.uid).get().toPromise().then(async (result) => {
            if (!result.exists) {
              let newUser: User = {
                name: userCredential.user.displayName,
                email: userCredential.user.email,
                photoUrl: userCredential.user.photoURL,
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
                this.appService.setuserCredential(userCredential.user.uid).then(async () => {
                  this.presentToast("Bienvenido a CopaCity!", "light");
                  this.popoverController.dismiss(true);
                  this.loaderComponent.stopLoading();
                });
              })
            }
            else {
              //this.presentToast("El usuario ya está registrado.", "danger");
              this.presentToast("Bienvenido a CopaCity!", "light");
              this.popoverController.dismiss(true);
              this.loaderComponent.stopLoading();
            }
          });
        }
      }).catch((error) => {
        this.presentToast(error['message'], "danger");
        console.log(error);
        this.loaderComponent.stopLoading();
      })
    });
  }

  public signupFacebook() {
    let provider = new auth.FacebookAuthProvider();
    this.angularFireAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL).then(() => {

      this.loaderComponent.startLoading("Autenticando...");
      return this.angularFireAuth.auth.signInWithPopup(provider).then((userCredential) => {
        if (userCredential.user) {
          this.angularFirestore.collection('users').doc(userCredential.user.uid).get().toPromise().then(async (result) => {
            if (!result.exists) {
              let newUser: User = {
                name: userCredential.user.displayName,
                email: userCredential.user.email,
                photoUrl: userCredential.user.photoURL,
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
                this.appService.setuserCredential(userCredential.user.uid).then(async () => {
                  this.presentToast("Bienvenido a CopaCity!", "light");
                  this.popoverController.dismiss(true);
                  this.loaderComponent.stopLoading();
                });
              })
            }
            else {
              //this.presentToast("El usuario ya está registrado.", "danger");
              this.presentToast("Bienvenido a CopaCity!", "light");
              this.popoverController.dismiss(true);
              this.loaderComponent.stopLoading();
            }
          });
        }
      }).catch((error) => {
        this.presentToast(error['message'], "danger");
        console.log(error);
        this.loaderComponent.stopLoading();
      })
    });
  }
}
