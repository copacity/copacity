import { Component, OnInit } from '@angular/core';
import { SigninComponent } from 'src/app/cs-components/signin/signin.component';
import { PopoverController } from '@ionic/angular';
import { SignupComponent } from 'src/app/cs-components/signup/signup.component';
import { PasswordResetEmailComponent } from 'src/app/cs-components/password-reset-email/password-reset-email.component';




@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {

  constructor(public popoverController: PopoverController,) { }

  ngOnInit() {
  }

  async notifications() {
    const popover = await this.popoverController.create({
      component: PasswordResetEmailComponent,      
      animated: false,
      showBackdrop: true,
      mode: 'ios',     
      translucent: false,      
      cssClass:"recoverPassword-popover"      
    });
    return await popover.present();
  }

}
