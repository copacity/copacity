import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { ComponentsModule } from 'src/app/cs-components/components.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuperTabsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]), 
    ComponentsModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
