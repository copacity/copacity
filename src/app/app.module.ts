import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { firebaseConfig, environment } from '../environments/environment';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireMessagingModule } from '@angular/fire/messaging';

import { ComponentsModule } from './cs-components/components.module';
import { CartPageModule } from './cs-pages/cart/cart.module';
import { StoreCreatePageModule } from './cs-pages/store-create/store-create.module';
import { ReactiveFormsModule } from '@angular/forms'
import { StoreUpdatePageModule } from './cs-pages/store-update/store-update.module';
import { ProductCreatePageModule } from './cs-pages/product-create/product-create.module';
import { ProductUpdatePageModule } from './cs-pages/product-update/product-update.module';
import { ProductCategoriesPageModule } from './cs-pages/product-categories/product-categories.module';
import { ProductDetailPageModule } from './cs-pages/product-detail/product-detail.module';
import { OrderDetailPageModule } from './cs-pages/order-detail/order-detail.module';
import { OrderCreatePageModule } from './cs-pages/order-create/order-create.module';
import { AddressListPageModule } from './cs-pages/address-list/address-list.module';
import { AddressCreatePageModule } from './cs-pages/address-create/address-create.module';
import { ProductCategoriesCreatePageModule } from './cs-pages/product-categories-create/product-categories-create.module';
import { PipesModule } from './cs-pipes/pipes.module';
import { ProfileUpdatePageModule } from './cs-pages/profile-update/profile-update.module';
import { TermsServicePageModule } from './cs-pages/terms-service/terms-service.module';
import { PrivacyPolicyPageModule } from './cs-pages/privacy-policy/privacy-policy.module';
import { StorePointsPageModule } from './cs-pages/store-points/store-points.module';
import { StoreCouponsPageModule } from './cs-pages/store-coupons/store-coupons.module';
import { ProductInventoryPageModule } from './cs-pages/product-inventory/product-inventory.module';
import { StoreCouponsCreatePageModule } from './cs-pages/store-coupons-create/store-coupons-create.module';
import { StoreOrdersPageModule } from './cs-pages/store-orders/store-orders.module';
import { StorePqrsfPageModule } from './cs-pages/store-pqrsf/store-pqrsf.module';
import { StorePqrsfCreatePageModule } from './cs-pages/store-pqrsf-create/store-pqrsf-create.module';
import { StorePaymentMethodsCreatePageModule } from './cs-pages/store-payment-methods-create/store-payment-methods-create.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
    /* General Modules */
    IonicModule.forRoot(),
    AppRoutingModule,
    //ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    //ServiceWorkerModule.register('src/firebase-messaging-sw.js', { enabled: environment.production }),
    ServiceWorkerModule.register('combined-sw.js', { enabled: environment.production }),
    ReactiveFormsModule,
    NgxQRCodeModule,

    /* Fire Base Modules */
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    SuperTabsModule.forRoot(),

    /** COMPONENTS*/
    ComponentsModule,
    CartPageModule,
    StoreCreatePageModule,
    StoreUpdatePageModule,
    ProductCreatePageModule,
    ProductUpdatePageModule,
    ProductCategoriesPageModule,
    ProductCategoriesCreatePageModule,
    ProductDetailPageModule,
    ProductInventoryPageModule,
    OrderDetailPageModule,
    OrderCreatePageModule,
    AddressListPageModule,
    AddressCreatePageModule,
    ProfileUpdatePageModule,
    TermsServicePageModule,
    PrivacyPolicyPageModule,
    StorePointsPageModule,
    StoreCouponsPageModule,
    StoreCouponsCreatePageModule,
    StoreOrdersPageModule,
    StorePqrsfPageModule,
    StorePqrsfCreatePageModule,
    StorePaymentMethodsCreatePageModule,
    PipesModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 
