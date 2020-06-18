import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductPropertyOption } from 'src/app/app-intefaces';

@Component({
  selector: 'app-product-property-option',
  templateUrl: './product-property-option.component.html',
  styleUrls: ['./product-property-option.component.scss'],
})
export class ProductPropertyOptionComponent implements OnInit {
  productPropertyOption: ProductPropertyOption = {
    id: '',
    name: '',
    price: 0,
    dateCreated: new Date(),
    lastUpdated: new Date(),
    deleted: false
  };;

  form: FormGroup;

  constructor(private popoverCtrl: PopoverController, 
    private formBuilder: FormBuilder,
    private navParams: NavParams) {

      if(this.navParams.data.productPropertyOption){
        this.productPropertyOption = this.navParams.data.productPropertyOption;
      }

    this.buildForm();
  }

  ngOnInit() { }

  close() {
    this.popoverCtrl.dismiss();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [this.productPropertyOption.name, [Validators.required, Validators.maxLength(100)]],
      price: [this.productPropertyOption.price, [Validators.max(9999999999)]]
    });
  }

  saveProductProperty() {
    if (this.form.valid) {
      this.productPropertyOption.name = this.form.value.name;
      this.productPropertyOption.price = this.form.value.price;
      this.popoverCtrl.dismiss(this.productPropertyOption);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
