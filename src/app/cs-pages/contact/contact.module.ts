import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactPageRoutingModule } from './contact-routing.module';

import { ContactPage } from './contact.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    SuperTabsModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ContactPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ContactPage]
})
export class ContactPageModule {}
