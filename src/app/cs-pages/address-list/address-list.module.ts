import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressListPageRoutingModule } from './address-list-routing.module';

import { AddressListPage } from './address-list.page';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddressListPageRoutingModule,
    PipesModule
  ],
  declarations: [AddressListPage]
})
export class AddressListPageModule {}
