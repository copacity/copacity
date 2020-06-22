import { Observable } from 'rxjs';

export interface AppInfo {
  id: string;
  facebook: string;
  phone: number;
  whatsapp: number;
  domain: string;
  termsServiceTemplate: string;
  privacyPolicyTemplate: string;
  tax: number;
}

export interface File {
  downloadURL: Observable<string>;
  file: any;
  filePath: string;
}

export interface AppMessage {
  id: string;
  idUser: string;
  title: string;
  message: string;
  dateCreated: Date;
  deleted: boolean;
}

export interface Store {
  id: string;
  idStoreCategory: string;
  idSector: string;
  idUser: string;
  name: string;
  address: string;
  phone1: number;
  phone2: number;
  logo: string;
  status: number;
  description: string;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
  visits: number;
  deliveryPrice: number;
  orderMinAmount: number;
  facebook: string;
  whatsapp: number;
  productsCount: number;
  productsLimit: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
}

export interface ProductProperty {
  id: string;
  name: string;
  isMandatory: boolean;
  userSelectable: boolean;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;

  // Options array
  productPropertyOptions: ProductPropertyOption[];
}

export interface ProductPropertyOption {
  id: string;
  name: string;
  price: number;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
}

export interface StoreCategory {
  id: string;
  name: string;
  description: string;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
}

export interface Product {
  id: string;
  idProductCategory: string;
  name: string;
  description: string;
  price: number;
  image: string;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
  discount: number;
  soldOut: boolean;
  isGift: boolean;
  isFeatured: boolean;
}

export interface ProductImage {
  id: string;
  image: string;
  dateCreated: Date;
  deleted: boolean;
}

export interface CartProduct {
  id: string;
  product: Product;
  quantity: number;
  maxLimit: number;
  checked: boolean;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
  propertiesSelection: PropertiesSelection[];
}

export interface PropertiesSelection {
  idProperty: string,
  idPropertyOption: string,
  propertyName: string,
  propertyOptionName: string,
  price: number,
}

export interface Banner {
  id: string;
  image: string;
}

export interface Sector {
  id: string;
  name: string;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  phone1: number;
  phone2: number;
  whatsapp: number;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
  isAdmin:boolean;
}

export interface StorePoint {
  id: string;
  idStore: string;
  points: number;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
}

export interface StoreCoupon {
  id: string;
  idStore: string;
  discount: number;
  dateExpiration: Date;
  minAmount: number;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  lastName: string;
  address: string;
  description: string;
  phone1: number;
  phone2: number;
  idSector: string;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
  checked: boolean;
}

export interface Order {
  id: string;
  ref: number;
  idStore: String;
  idUser: string;
  status: number;
  lastUpdated: Date;
  dateCreated: Date;
  deleted: boolean;
  photoUrl:string;
  userName:string;
  message:string;
  messageRejected:string;
}

export interface Notification {
  id: string;
  idUserNotification: string;
  type: number;
  status: number;
  description: string;
  idUser: string;
  photoUrl: string;
  userName: string;
  idStore: string;
  idOrder: string;
  dateCreated: Date;
  deleted: boolean;
}