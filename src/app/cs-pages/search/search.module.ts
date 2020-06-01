import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search-routing.module';

import { SearchPage } from './search.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuperTabsModule,
    IonicModule,
    SearchPageRoutingModule
  ],
  declarations: [SearchPage]
})
export class SearchPageModule {}
