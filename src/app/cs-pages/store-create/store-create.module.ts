import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreCreatePageRoutingModule } from './store-create-routing.module';

import { StoreCreatePage } from './store-create.page';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreCreatePageRoutingModule,
    ComponentsModule
  ],
  declarations: [StoreCreatePage]
})
export class StoreCreatePageModule {}
