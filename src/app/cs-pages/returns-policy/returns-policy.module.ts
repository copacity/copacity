import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReturnsPolicyPageRoutingModule } from './returns-policy-routing.module';

import { ReturnsPolicyPage } from './returns-policy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReturnsPolicyPageRoutingModule
  ],
  declarations: [ReturnsPolicyPage]
})
export class ReturnsPolicyPageModule {}
