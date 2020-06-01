import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { IonicModule } from '@ionic/angular';
import { StorePageRoutingModule } from './store-routing.module';
import { StorePage } from './store.page';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';
import { ComponentsModule } from 'src/app/cs-components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuperTabsModule,
    StorePageRoutingModule,
    PipesModule,
    ComponentsModule
  ],
  declarations: [StorePage]
})
export class StorePageModule {}
