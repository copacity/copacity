import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { CartProduct, ProductProperty, PropertiesSelection } from 'src/app/app-intefaces';
import { ProductsService } from 'src/app/cs-services/products.service';
import { AppService } from 'src/app/cs-services/app.service';
import { CartInventoryService } from 'src/app/cs-services/cart-inventory.service';

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
  quantityDisabled = true;

  constructor(
    private popoverCtrl: PopoverController,
    public appService: AppService,
    public navParams: NavParams,
    public cartInventoryService: CartInventoryService) {


    if (this.navParams.data.isInventory) {
      this.productProperties = this.navParams.data.productProperties;
      this.quantityDisabled = false;
    } else {
      this.productProperties = this.navParams.data.productProperties;
      this.cartInventoryService.setCart(this.navParams.data.cart);
      this.cartInventoryService.cartQuantity();
      this.validateQuantity();
    }
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

    if (!this.navParams.data.isInventory) {
      this.validateQuantity();
    }
  }

  validateQuantity(): boolean {
    if (this.formIsValidToQuantity()) {

      let cartProductTemp: CartProduct = {
        id: '',
        product: this.navParams.data.product,
        quantity: this.quantity,
        checked: true,
        dateCreated: new Date(),
        lastUpdated: new Date(),
        deleted: false,
        propertiesSelection: this.propertiesSelection
      };

      let soldOut = true;
      for (let [index, p] of this.cartInventoryService.cart.entries()) {
        if (cartProductTemp.product.id == p.product.id && this.cartInventoryService.compareProducts(p, cartProductTemp)) {
          if (p.quantity == 0) {
            soldOut = true;
            this.quantityDisabled = true;
            this.validationMessage = "Producto Agotado";
            this.navParams.data.limitQuantity = 0;
          } else {
            soldOut = false;
            this.quantityDisabled = false;
            this.navParams.data.limitQuantity = p.quantity
          }
        }
      }

      if (soldOut) {
        this.quantityDisabled = true;
        this.validationMessage = "Producto Agotado";
        this.navParams.data.limitQuantity = 0;
        return false
      }

      return true;
    }
  }

  quantityChange(e: any) {
    this.quantity = parseInt(e.detail.value);
  }

  accept() {
    if (this.formIsValid() && ((this.navParams.data.isInventory) ? true : this.validateQuantity())) {
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

    debugger;
    if (this.navParams.data.quantityByPoints != -1 && this.navParams.data.limitQuantity > this.navParams.data.quantityByPoints) {
      this.navParams.data.limitQuantity = this.navParams.data.quantityByPoints;
    }

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
          isValid = false;
        }
      }
    });

    return isValid;
  }

  formIsValidToQuantity(): boolean {
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
          //this.validationMessage = "Debe seleccionar: " + property.name;
          isValid = false;
        }
      }
    });

    return isValid;
  }
}
