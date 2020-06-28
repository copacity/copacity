import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StorePqrsfPageRoutingModule } from './store-pqrsf-routing.module';

import { StorePqrsfPage } from './store-pqrsf.page';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StorePqrsfPageRoutingModule,
    PipesModule
  ],
  declarations: [StorePqrsfPage]
})
export class StorePqrsfPageModule {}
