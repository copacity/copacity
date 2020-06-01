import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsServicePageRoutingModule } from './terms-service-routing.module';

import { TermsServicePage } from './terms-service.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsServicePageRoutingModule
  ],
  declarations: [TermsServicePage]
})
export class TermsServicePageModule {}
