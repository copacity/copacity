import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreUpdatePageRoutingModule } from './store-update-routing.module';

import { StoreUpdatePage } from './store-update.page';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreUpdatePageRoutingModule,
    ComponentsModule
  ],
  declarations: [StoreUpdatePage]
})
export class StoreUpdatePageModule {}
