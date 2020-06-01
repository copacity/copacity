import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuperTabsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ComponentsModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
