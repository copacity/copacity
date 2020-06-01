import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddStorePageRoutingModule } from './add-store-routing.module';

import { AddStorePage } from './add-store.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddStorePageRoutingModule
  ],
  declarations: [AddStorePage]
})
export class AddStorePageModule {}
