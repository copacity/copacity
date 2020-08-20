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
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { BarcodeScannerComponent } from './barcode-scanner/barcode-scanner.component';
import { BarcodeGeneratorComponent } from './barcode-generator/barcode-generator.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { MenuCartComponent } from './menu-cart/menu-cart.component';
import { WhatsappOrderComponent } from './whatsapp-order/whatsapp-order.component';
import { AskForAccountComponent } from './ask-for-account/ask-for-account.component';
import { VendorsListComponent } from './vendors-list/vendors-list.component';

@NgModule({
  declarations: [
    LoaderComponent,
    SigninComponent,
    SignupComponent,
    PasswordResetEmailComponent,
    MenuNotificationsComponent,
    MenuUserComponent,
    MenuCartComponent,
    CopyToClipboardComponent,
    CropperImageComponent,
    PopoverMessageComponent,
    StoreInformationComponent,
    ProductPropertyComponent,
    ProductPropertyOptionComponent,
    ProductPropertiesSelectionComponent,
    ImageViewerComponent,
    BarcodeScannerComponent,
    BarcodeGeneratorComponent,
    SubscriptionPlansComponent,
    VideoPlayerComponent,
    WhatsappOrderComponent,
    AskForAccountComponent,
    VendorsListComponent
  ],
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    NgxQRCodeModule,
    RouterModule],
  exports: [
    LoaderComponent,
    SigninComponent,
    SignupComponent,
    PasswordResetEmailComponent,
    MenuNotificationsComponent,
    MenuUserComponent,
    MenuCartComponent,
    CopyToClipboardComponent,
    CropperImageComponent,
    PopoverMessageComponent,
    StoreInformationComponent,
    ProductPropertyComponent,
    ProductPropertyOptionComponent,
    ProductPropertiesSelectionComponent,
    ImageViewerComponent,
    BarcodeScannerComponent,
    BarcodeGeneratorComponent,
    SubscriptionPlansComponent,
    VideoPlayerComponent,
    WhatsappOrderComponent,
    AskForAccountComponent,
    VendorsListComponent
  ],
  entryComponents: [
    SigninComponent,
    SignupComponent,
    PasswordResetEmailComponent,
    MenuNotificationsComponent,
    MenuUserComponent,
    MenuCartComponent,
    CopyToClipboardComponent,
    CropperImageComponent,
    PopoverMessageComponent,
    StoreInformationComponent,
    ProductPropertyComponent,
    ProductPropertyOptionComponent,
    ProductPropertiesSelectionComponent,
    ImageViewerComponent,
    BarcodeScannerComponent,
    BarcodeGeneratorComponent,
    SubscriptionPlansComponent,
    VideoPlayerComponent,
    WhatsappOrderComponent,
    AskForAccountComponent,
    VendorsListComponent
  ]
})
export class ComponentsModule { }