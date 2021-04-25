import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplitLayoutPageRoutingModule } from './split-layout-routing.module';

import { SplitLayoutPage } from './split-layout.page';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplitLayoutPageRoutingModule,
    ComponentsModule
  ],
  declarations: [SplitLayoutPage]
})
export class SplitLayoutPageModule {}
