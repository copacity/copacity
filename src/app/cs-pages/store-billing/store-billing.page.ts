import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/cs-services/app.service';
import { StoresService } from 'src/app/cs-services/stores.service';
import { PlatformFee } from 'src/app/app-intefaces';

@Component({
  selector: 'app-store-billing',
  templateUrl: './store-billing.page.html',
  styleUrls: ['./store-billing.page.scss'],
})
export class StoreBillingPage implements OnInit {
  form: FormGroup;
  billingDate: any;
  minDate: any;
  maxDate: any;
  years: string = "";
  platformFee: PlatformFee;

  constructor(
    public popoverController: PopoverController,
    private formBuilder: FormBuilder,
    private storesService: StoresService,
    public appService: AppService,
  ) {

    let storeCreated: any = this.appService.currentStore.dateCreated;
    storeCreated = storeCreated.toDate();
    
    // min date
    let dd = String(storeCreated.getDay()).padStart(2, '0');
    let mm = String(storeCreated.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = storeCreated.getFullYear();
    this.minDate = yyyy + '-' + mm + '-' + dd;

    // max date
    let date = new Date();
    dd = String(date.getDate()).padStart(2, '0');
    mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    yyyy = date.getFullYear();
    this.maxDate = yyyy + '-' + mm + '-' + dd;

    this.buildForm();

    let subs = this.storesService.getPlatformFess(this.appService.currentStore.id).subscribe(pfArray => {
      pfArray.forEach(pf => {
        this.platformFee = pf;
      });
      
      subs.unsubscribe();
    });
  }

  ngOnInit() {

  }

  private buildForm() {
    this.form = this.formBuilder.group({
      billingDate: [this.billingDate, [Validators.required]],
    });
  }

  close() {
    this.popoverController.dismiss();
  }

  generate() {

  }
}
