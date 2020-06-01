import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderCreatePageRoutingModule } from './order-create-routing.module';

import { OrderCreatePage } from './order-create.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    SuperTabsModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    OrderCreatePageRoutingModule,
    ComponentsModule
  ],
  declarations: [OrderCreatePage]
})
export class OrderCreatePageModule {}
