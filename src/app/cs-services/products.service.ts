import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Product, ProductImage, ProductProperty, ProductPropertyOption, CartProduct } from '../app-intefaces';
import { Observable } from 'rxjs';
import { map, flatMap, filter } from 'rxjs/operators';
import { ProductPropertyOptionComponent } from '../cs-components/product-property-option/product-property-option.component';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private collectionName: string = 'products';
  private productCollection: AngularFirestoreCollection<Product>;

  constructor(public angularFirestore: AngularFirestore, private appService: AppService) { }

  public create(idStore: string, product: Product): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName).add(product);
  }

  public getById(idStore: string, idProduct: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection("stores").doc(idStore)
        .collection(this.collectionName).doc(idProduct).ref.get().then(
          function (doc) {
            if (doc.exists) {
              const data = doc.data() as Product;
              const id = doc.id;
              resolve({ id, ...data });
            } else {
              console.log("No such document!");
            }
          }).catch(function (error) {
            console.log("Error getting document:", error);
          });
    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'products-getById', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }

  public getByProductCategoryId(idStore: string, idProductCategory: string/*, productsBatch: number, lastProductToken: string*/) {
    this.productCollection;

    if (idProductCategory != '0') {
      this.productCollection = this.angularFirestore.collection('stores').doc(idStore).collection<Product>(this.collectionName,
        ref => ref
          .where('idProductCategory', '==', idProductCategory)
          .where('deleted', '==', false)
          .where('isGift', '==', false)
          .orderBy('name'));
    } else {
      this.productCollection = this.angularFirestore.collection('stores').doc(idStore).collection<Product>(this.collectionName,
        ref => ref
          .where('deleted', '==', false)
          .where('isGift', '==', false)
          .orderBy('name'));
    }

    return this.productCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  public getByProductGift(idStore: string) {
    this.productCollection;

    this.productCollection = this.angularFirestore.collection('stores').doc(idStore).collection<Product>(this.collectionName,
      ref => ref
        .where('deleted', '==', false)
        .where('isGift', '==', true)
        .orderBy('price'));

    return this.productCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // public getBySearch(idStore: string, searchText: string) {
  //   return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName, ref => ref
  //     .where('deleted', '==', false))
  //     .snapshotChanges().pipe(
  //      map(actions => actions.map(a => {
  //         const data = a.payload.doc.data() as Product;
  //         const id = a.payload.doc.id;

  //         if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
  //           return { id, ...data };
  //         }
  //       }))
  //     );
  // }

  public getBySearchAndCategory(idStore: string, searchText: string, idProductCategory: string,) {
    if (idProductCategory != '0') {
      if (idProductCategory != '-1') {
        return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName, ref => ref
          .where('idProductCategory', '==', idProductCategory)
          .where('deleted', '==', false)
          .where('isGift', '==', false)
          .orderBy('name'))
          .snapshotChanges().pipe(
            map(actions => actions.map(a => {
              const data = a.payload.doc.data() as Product;
              const id = a.payload.doc.id;

              if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
                return { id, ...data };
              }
            }))
          );
      } else {
        return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .where('isGift', '==', false)
          .where('isFeatured', '==', true)
          .orderBy('name'))
          .snapshotChanges().pipe(
            map(actions => actions.map(a => {
              const data = a.payload.doc.data() as Product;
              const id = a.payload.doc.id;

              if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
                return { id, ...data };
              }
            }))
          );
      }
    } else {
      return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName, ref => ref
        .where('deleted', '==', false)
        .where('isGift', '==', false)
        .orderBy('name'))
        .snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as Product;
            const id = a.payload.doc.id;

            if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
              return { id, ...data };
            }
          }))
        );
    }
  }

  getFeaturedProductsDiscount(idStore: string, top: number) {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName, ref => ref
      .where('deleted', '==', false)
      .where('isGift', '==', false)
      .where('soldOut', '==', false)
      .where('isFeatured', '==', true)
      .where('discount', '>', "0")
      .orderBy('discount')
      .limit(top))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Product;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getFeaturedProductsNoDiscount(idStore: string, top: number) {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName, ref => ref
      .where('deleted', '==', false)
      .where('isGift', '==', false)
      .where('soldOut', '==', false)
      .where('isFeatured', '==', true)
      .where('discount', '<=', "0")
      .orderBy('discount')
      .orderBy('name')
      .limit(top))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Product;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getGifts(idStore: string, top: number) {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName, ref => ref
      .where('deleted', '==', false)
      .where('isGift', '==', true)
      .where('soldOut', '==', false)
      .limit(top))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Product;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  public getAll(idStore: string): Observable<Product[]> {
    this.productCollection = this.angularFirestore.collection('stores').doc(idStore).collection<Product>(this.collectionName, ref => ref
      .where('deleted', '==', false)
      .where('isGift', '==', false)
    );
    return this.productCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        const id = a.payload.doc.id;

        return { id, ...data };
      }))
    );
  }

  public getProductImages(idStore: string, idProduct: string): Observable<ProductImage[]> {
    let productImageCollection = this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection<ProductImage>('images', ref =>
        ref.where('deleted', '==', false).orderBy("dateCreated"));

    return productImageCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        const id = a.payload.doc.id;

        return { id, ...data };
      }))
    );
  }

  public set(id: string, data: any) {
    return this.angularFirestore.collection(this.collectionName).doc(id).set(data);
  }

  public update(idStore: string, id: string, data: any) {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName).doc(id).update(data);
  }

  public addProductImage(idStore: string, idProduct: string, img: ProductImage): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('images').add(img);
  }

  public updateProductImage(idStore: string, idProduct: string, idImage: string, data: any) {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('images').doc(idImage).update(data);
  }

  public deleteProductImage(idStore: string, idProduct: string, idImage: string) {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('images').doc(idImage).delete();
  }

  // --------------------- PROPERTIES

  public createProductProperty(idStore: string, idProduct: string, productProperty: ProductProperty): Promise<DocumentReference> {
    return this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('properties').add(productProperty);
  }

  public updateProductProperty(idStore: string, idProduct: string, idProductProperty: string, data: any) {
    return this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('properties').doc(idProductProperty).update(data);
  }

  // --------------------- PROPERTY OPTIONS

  public createProductPropertyOption(idStore: string, idProduct: string, idProductProperty: string, productPropertyOption: ProductPropertyOption): Promise<DocumentReference> {
    return this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('properties').doc(idProductProperty)
      .collection('propertyOptions').add(productPropertyOption);
  }

  public updateProductPropertyOption(idStore: string, idProduct: string, idProductProperty: string, idProductPropertyOption: string, data: any) {
    return this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('properties').doc(idProductProperty)
      .collection('propertyOptions').doc(idProductPropertyOption).update(data);
  }

  public getAllProductProperties(idStore: string, idProduct: string): Observable<ProductProperty[]> {
    let productProperties = this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('properties', ref => ref
        .where('deleted', '==', false)
        .orderBy("name"))

    return productProperties.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ProductProperty;
        const id = a.payload.doc.id;

        return { id, ...data };
      }))
    );
  }

  public getAllProductPropertiesUserSelectable(idStore: string, idProduct: string): Observable<ProductProperty[]> {
    let productProperties = this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('properties', ref => ref
        .where('userSelectable', '==', true)
        .where('deleted', '==', false)
        .orderBy("name"))

    return productProperties.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ProductProperty;
        const id = a.payload.doc.id;

        return { id, ...data };
      }))
    );
  }

  // --------------------- INVENTORY

  public getAllProductPropertyOptions(idStore: string, idProduct: string, idProductProperty: string): Observable<ProductPropertyOption[]> {
    let productPropertyOptions = this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('properties').doc(idProductProperty)
      .collection('propertyOptions', ref => ref
        .where('deleted', '==', false)
        .orderBy("name"))

    return productPropertyOptions.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ProductPropertyOption;
        const id = a.payload.doc.id;

        return { id, ...data };
      }))
    );
  }

  public updateCartInventory(idStore: string, idProduct: string, idInventory: string, data: any) {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('inventory').doc(idInventory).update(data);
  }

  public addCartInventory(idStore: string, idProduct: string, cartProduct: CartProduct): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('inventory').add(cartProduct);
  }

  public getCartInventory(idStore: string, idProduct: string): Observable<CartProduct[]> {

    let cartInventoryCollection = this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idProduct)
      .collection('inventory', ref => ref
        .where('deleted', '==', false).orderBy("quantity"))

    return cartInventoryCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as CartProduct;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public deleteCartInventory(idStore: string, idProduct: string) {
    let subs = this.getCartInventory(idStore, idProduct).subscribe((cartProduct) => {
      cartProduct.forEach(cart => {
        return this.angularFirestore.collection('stores').doc(idStore)
          .collection(this.collectionName).doc(idProduct)
          .collection('inventory').doc(cart.id).delete();
      });

      subs.unsubscribe();
    });
  }
}
