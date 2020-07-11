import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Order, CartProduct, Address, StoreCoupon, ShippingMethod } from '../app-intefaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderStatus } from '../app-enums';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private collectionName: string = 'orders';
  private ordersCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

  public create(idStore: string, order: Order): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName).add(order);
  }

  public createOrderAddress(idStore: string, idOrder: string, address: Address): Promise<DocumentReference> {
    return this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('addresses').add(address);
  }

  public getById(idStore: string, idOrder: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection("stores").doc(idStore)
        .collection(this.collectionName).doc(idOrder).ref.get().then(
          function (doc) {
            if (doc.exists) {
              const data = doc.data() as Order;
              const id = doc.id;
              resolve({ id, ...data });
            } else {
              console.log("No such document!");
            }
          }).catch(function (error) {
            console.log("Error getting document:", error);
          });
    }).catch(err => alert(err));
  }

  public addCartProduct(idStore: string, idOrder: string, cartProduct: CartProduct): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('cartProducts').add(cartProduct);
  }

  public getCartProducts(idStore: string, idOrder: string): Observable<CartProduct[]> {
    this.ordersCollection;

    this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('cartProducts');

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as CartProduct;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getAddresses(idStore: string, idOrder: string): Observable<Address[]> {
    this.ordersCollection;

    this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('addresses');

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Address;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getByStore(idStore: string, searchText: string): Observable<Order[]> {
    this.ordersCollection;

    this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
      .collection<Order>(this.collectionName, ref => ref
        .where('deleted', '==', false)
        // .where('status', '==', status)
        .orderBy('lastUpdated', "desc")
        .limit(100));

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Order;
        const id = a.payload.doc.id;

        if (data.ref.toString().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
          return { id, ...data };
        }
      })));
  }

  public getByDateRange(idStore: string, startDate: any, endDate: any): Observable<Order[]> {
    this.ordersCollection;
    
    this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
      .collection<Order>(this.collectionName, ref => ref
        .where('deleted', '==', false)
        .where('status', '==', OrderStatus.Sent)
        .where('lastUpdated', '>=', startDate)
        .where('lastUpdated', '<', endDate)
        .orderBy('lastUpdated', "desc")
        );

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Order;
        const id = a.payload.doc.id;

        return { id, ...data };
      })));
  }

  public getByStoreAndUser(idStore: string, idUser: string, searchText: string): Observable<Order[]> {
    this.ordersCollection;

    this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
      .collection<Order>(this.collectionName, ref => ref
        .where('deleted', '==', false)
        // .where('status', '==', status)
        .where('idUser', '==', idUser)
        .orderBy('lastUpdated', "desc")
        .limit(100));

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Order;
        const id = a.payload.doc.id;

        if (data.ref.toString().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
          return { id, ...data };
        }
      })));
  }

  public getByState(idStore: string, status: number, searchText: string /*, ordersBatch: number, lastOrderToken: Date*/): Observable<Order[]> {
    this.ordersCollection;

    if (status != 0) {

      this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
        .collection<Order>(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .where('status', '==', status)
          .orderBy('dateCreated', "desc")
          .limit(100));
    }
    else {
      this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
        .collection<Order>(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .orderBy('dateCreated', "desc")
          .limit(100));
    }

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Order;
        const id = a.payload.doc.id;

        if (data.ref.toString().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
          return { id, ...data };
        }
      }))
    );
  }

  public getByUserAndState(idUser: string, idStore: string, status: number, searchText: string/*, ordersBatch: number, lastOrderToken: Date*/): Observable<Order[]> {
    this.ordersCollection;

    if (status != 0) {

      this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
        .collection<Order>(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .where('status', '==', status)
          .where('idUser', '==', idUser)
          .orderBy('dateCreated', "desc")
          .limit(100));

    } else {
      this.ordersCollection = this.angularFirestore.collection('stores').doc(idStore)
        .collection<Order>(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .where('idUser', '==', idUser)
          .orderBy('dateCreated', "desc")
          .limit(100));
    }

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Order;
        const id = a.payload.doc.id;

        if (data.ref.toString().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
          return { id, ...data };
        }
      }))
    );
  }

  public update(idStore: string, id: string, data: any) {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName).doc(id).update(data);
  }

  public updateCartProduct(idStore: string, idOrder: string, idCartProduct, data: any) {
    return this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('cartProducts').doc(idCartProduct)
      .update(data);
  }

  //------------------------------------- Coupons

  public async addOrderCoupon(idStore: string, idOrder: string, storeCoupon: StoreCoupon): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('coupons').add(storeCoupon);
  }

  public getOrderCoupons(idStore: string, idOrder: string): Observable<StoreCoupon[]> {
    this.ordersCollection;

    this.ordersCollection = this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('coupons', ref => ref
        .where('deleted', '==', false));

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StoreCoupon;
        //const id = a.payload.doc.id;

        return data;

      })));
  }

  // -------------------------------- Order Shipping Methods

  public async addOrderShippingMethod(idStore: string, idOrder: string, shippingMethod: ShippingMethod): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('shippingMethods').add(shippingMethod);
  }

  public getOrderShippingMethods(idStore: string, idOrder: string): Observable<ShippingMethod[]> {
    this.ordersCollection;

    this.ordersCollection = this.angularFirestore
      .collection('stores').doc(idStore)
      .collection(this.collectionName).doc(idOrder)
      .collection('shippingMethods', ref => ref
        .where('deleted', '==', false));

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ShippingMethod;
        const id = a.payload.doc.id;

        return { id, ...data };
      })));
  }
}
