import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StorePqrsfCreatePageRoutingModule } from './store-pqrsf-create-routing.module';

import { StorePqrsfCreatePage } from './store-pqrsf-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StorePqrsfCreatePageRoutingModule
  ],
  declarations: [StorePqrsfCreatePage]
})
export class StorePqrsfCreatePageModule {}
