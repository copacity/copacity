import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressCreatePageRoutingModule } from './address-create-routing.module';

import { AddressCreatePage } from './address-create.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    AddressCreatePageRoutingModule
  ],
  declarations: [AddressCreatePage]
})
export class AddressCreatePageModule {}
