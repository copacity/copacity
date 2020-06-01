import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoaderComponent } from './loader/loader.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { MenuNotificationsComponent } from './menu-notifications/menu-notifications.component';
import { MenuUserComponent } from './menu-user/menu-user.component';
import { PasswordResetEmailComponent } from './password-reset-email/password-reset-email.component';
import { RouterModule } from '@angular/router';
import { CopyToClipboardComponent } from './copy-to-clipboard/copy-to-clipboard.component';
import { CropperImageComponent } from './cropper-image/cropper-image.component';
import { PopoverMessageComponent } from './popover-message/popover-message.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreInformationComponent } from './store-information/store-information.component';
import { ProductPropertyComponent } from './product-property/product-property.component';
import { ProductPropertyOptionComponent } from './product-property-option/product-property-option.component';
import { ProductPropertiesSelectionComponent } from './product-properties-selection/product-properties-selection.component';

@NgModule({
  declarations: [
    LoaderComponent,
    SigninComponent,
    SignupComponent,
    PasswordResetEmailComponent,
    MenuNotificationsComponent,
    MenuUserComponent,
    CopyToClipboardComponent,
    CropperImageComponent,
    PopoverMessageComponent,
    StoreInformationComponent,
    ProductPropertyComponent,
    ProductPropertyOptionComponent,
    ProductPropertiesSelectionComponent
  ],
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule],
  exports: [
    LoaderComponent,
    SigninComponent,
    SignupComponent,
    PasswordResetEmailComponent,
    MenuNotificationsComponent,
    MenuUserComponent,
    CopyToClipboardComponent,
    CropperImageComponent,
    PopoverMessageComponent,
    StoreInformationComponent,
    ProductPropertyComponent,
    ProductPropertyOptionComponent,
    ProductPropertiesSelectionComponent
  ],
  entryComponents: [
    SigninComponent,
    SignupComponent,
    PasswordResetEmailComponent,
    MenuNotificationsComponent,
    MenuUserComponent,
    CopyToClipboardComponent,
    CropperImageComponent,
    PopoverMessageComponent,
    StoreInformationComponent,
    ProductPropertyComponent,
    ProductPropertyOptionComponent,
    ProductPropertiesSelectionComponent
  ]
})
export class ComponentsModule { }