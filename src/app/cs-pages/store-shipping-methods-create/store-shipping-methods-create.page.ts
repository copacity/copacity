import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-store-shipping-methods-create',
  templateUrl: './store-shipping-methods-create.page.html',
  styleUrls: ['./store-shipping-methods-create.page.scss'],
})
export class StoreShippingMethodsCreatePage implements OnInit {

  form: FormGroup;
  
  constructor(
    public popoverController: PopoverController,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
  }

  close() {
    this.popoverController.dismiss();
  }

  // private buildForm() {
  //   this.form = this.formBuilder.group({
  //     name: [this.storeCoupon.name, [Validators.required, Validators.maxLength(50)]],
  //     discount: [this.storeCoupon.discount, [Validators.required]],
  //     minAmount: [this.storeCoupon.minAmount, [Validators.required]],
  //     quantity: [this.storeCoupon.quantity, [Validators.required, Validators.min(1), Validators.max(50)]],
  //     dateExpiration: [this.editDate],
  //     isVIP: [this.storeCoupon.isVIP],
  //   });
  // }

}
