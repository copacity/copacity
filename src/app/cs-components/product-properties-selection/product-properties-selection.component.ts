import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { CartProduct, ProductProperty, PropertiesSelection } from 'src/app/app-intefaces';
import { Subscription } from 'rxjs';
import { ProductsService } from 'src/app/cs-services/products.service';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-product-properties-selection',
  templateUrl: './product-properties-selection.component.html',
  styleUrls: ['./product-properties-selection.component.scss'],
})
export class ProductPropertiesSelectionComponent implements OnInit {
  productProperties: ProductProperty[] = [];
  propertiesSelection: PropertiesSelection[] = [];
  validationMessage: string;
  quantity: number = 1;

  constructor(private popoverCtrl: PopoverController,
    public navParams: NavParams) {
    this.productProperties = this.navParams.data.productProperties;
  }

  ngOnInit() { }

  close() {
    this.popoverCtrl.dismiss();
  }

  propertyChange(e: any, productProperty: ProductProperty) {
    let propertySelection: PropertiesSelection = {
      idProperty: productProperty.id,
      propertyName: productProperty.name,
      propertyOptionName: e.detail.value.split("|")[0],
      idPropertyOption: e.detail.value.split("|")[1],
      price: parseInt(e.detail.value.split("|")[2])
    }

    for (let [index, p] of this.propertiesSelection.entries()) {
      if (p.idProperty === productProperty.id) {
        this.propertiesSelection.splice(index, 1);
      }
    }

    this.propertiesSelection.push(propertySelection);
  }

  quantityChange(e: any) {
    this.quantity = parseInt(e.detail.value);
  }

  accept() {
    if (this.formIsValid()) {
      let cartProduct: CartProduct = {
        id: '',
        product: this.navParams.data.product,
        quantity: this.quantity,
        checked: true,
        dateCreated: new Date(),
        lastUpdated: new Date(),
        deleted: false,
        propertiesSelection: this.propertiesSelection
      };

      this.popoverCtrl.dismiss(cartProduct);
    }
  }

  getNumbers() {
    let numbers = [];

    for (let i = 1; i <= this.navParams.data.limitQuantity; i++) {
      numbers.push(i);
    }

    return numbers;
  }

  formIsValid(): boolean {
    this.validationMessage = '';
    let isValid = true;

    this.productProperties.forEach(property => {
      if (property.isMandatory) {
        let isSelected = false;
        this.propertiesSelection.forEach(propertyOptionSelected => {
          if (property.id == propertyOptionSelected.idProperty) {
            isSelected = true;
          }
        });

        if (!isSelected) {
          this.validationMessage = "Debe seleccionar: " + property.name;
          isValid =  false;
        }
      }
    });

    return isValid;
  }
}
