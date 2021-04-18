import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Store, StoreCoupon, PQRSF, ShippingMethod, PlatformFee, Vendor, ErrorMessage } from '../app-intefaces';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoreStatus, VendorStatus } from '../app-enums';
import { error } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  option: number = 0;
  private collectionName: string = 'stores';
  private storesCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

  // public createTest(value: string) {
  //   debugger;



  //   this.angularFirestore.firestore.runTransaction(transaction => {
  //     // This code may get re-run multiple times if there are conflicts.



  //     // Create a reference to a document that doesn't exist yet, it has a random id
  //     const newOrderRef = this.angularFirestore.firestore.collection('Test').doc("BvtueF5DUs5ZmVBuuCZI");
  //     const newOrderRef2 = this.angularFirestore.firestore.collection('Test').doc()

  //     let test1 = transaction.get(newOrderRef).then(function (sfDoc) {
  //       if (!sfDoc.exists) {
  //         throw "Document does not exist!";
  //       }

  //       // Add one person to the city population.
  //       // Note: this could be done without a transaction
  //       //       by updating the population using FieldValue.increment()

  //       transaction.update(newOrderRef, { newId: newOrderRef2.id });
  //       transaction.set(newOrderRef2, { value: value });
  //     }).then(result => {
  //       return transaction.get(newOrderRef).then(function (sfDoc) {
  //         if (!sfDoc.exists) {
  //           throw "Document does not exist!";
  //         }
  
  //         let newOrderRef2_SubColletionDoc = newOrderRef2.collection("sub").doc();
  //         transaction.set(newOrderRef2_SubColletionDoc, { value: value });
  
  //         //throw new Error("UPS");
  //       });

  //     });

      
  //   }).then(function () {
  //     console.log("Transaction successfully committed!");
  //   }).catch(function (error) {
  //     console.log("Transaction failed: ", error);
  //   });

  //   // Then, later in a transaction:
  //   //transaction.set(newDocRef, { ... });
  // }

  public create(store: Store): Promise<DocumentReference> {
    return this.angularFirestore.collection(this.collectionName).add(store);
  }

  public createPlatformFess(idStore: string, platformFee: PlatformFee): Promise<DocumentReference> {
    return this.angularFirestore.collection(this.collectionName).doc(idStore).collection('platformFees').add(platformFee);
  }

  public getPlatformFess(idStore: string) {
    this.storesCollection;

    this.storesCollection = this.angularFirestore.collection(this.collectionName).doc(idStore).collection<PlatformFee>('platformFees');

    return this.storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as PlatformFee;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  public getById(id: string): Promise<Store> {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection("stores").doc(id).ref.get().then(
        function (doc) {
          if (doc.exists) {
            const data = doc.data() as Store;
            const id = doc.id;
            resolve({ id, ...data });
          } else {
            console.log("No such document!");
          }
        }).catch(function (error) {
          console.log("Error getting document:", error);
        });
    });
  }

  public getByUserId(idUser: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let storesCollection = this.angularFirestore.collection(this.collectionName, ref => ref
        .where('idUser', '==', idUser)
        .where('deleted', '==', false));

      let subscribe = storesCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Store;
          const id = a.payload.doc.id;

          return { id, ...data };
        }))
      ).subscribe((res: Array<Store>) => {
        subscribe.unsubscribe();
        resolve(res);
      });
    });
  }

  public getByIdStoreCategory(id: string, searchText: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let storesCollection = this.angularFirestore.collection(this.collectionName, ref => ref
        .where('idStoreCategory', '==', id)
        .where('deleted', '==', false)
        .where('status', '==', StoreStatus.Published)
        .orderBy('productsCount', 'desc'));

      let subscribe = storesCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Store;
          const id = a.payload.doc.id;

          if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
            return { id, ...data };
          }
        }))
      ).subscribe((res: Array<Store>) => {
        subscribe.unsubscribe();
        resolve(res);
      });
    });
  }

  public getByIdSector(id: string, searchText: string): Promise<any> {

    return new Promise((resolve, reject) => {
      let storesCollection = this.angularFirestore.collection(this.collectionName, ref => ref
        .where('idSector', '==', id)
        .where('deleted', '==', false)
        .where('status', '==', StoreStatus.Published)
        .orderBy('productsCount', 'desc'));

      let subscribe = storesCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Store;
          const id = a.payload.doc.id;

          if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
            return { id, ...data };
          }
        }))
      ).subscribe((res: Array<Store>) => {
        subscribe.unsubscribe();
        resolve(res);
      });
    });
  }

  public getByFilterSearch(idSector: string, idStoreCategory: string, searchText: string): Promise<any> {

    return new Promise((resolve, reject) => {
      let storesCollection = this.angularFirestore.collection(this.collectionName, ref => ref
        .where('idStoreCategory', '==', idStoreCategory)
        .where('idSector', '==', idSector)
        .where('deleted', '==', false)
        .where('status', '==', StoreStatus.Published)
        .orderBy('productsCount', 'desc'));

      let subscribe = storesCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Store;
          const id = a.payload.doc.id;

          if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
            return { id, ...data };
          }
        }))
      ).subscribe((res: Array<Store>) => {
        subscribe.unsubscribe();
        resolve(res);
      });
    });
  }

  public getAllSearch(searchText: string): Promise<any> {

    return new Promise((resolve, reject) => {
      let storesCollection = this.angularFirestore.collection<Store>(this.collectionName, ref => ref
        .where('deleted', '==', false)
        .where('status', '==', StoreStatus.Published));

      let subscribe = storesCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Store;
          const id = a.payload.doc.id;

          if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
            return { id, ...data };
          }
        }))
      ).subscribe((res: Array<Store>) => {
        subscribe.unsubscribe();
        resolve(res);
      });
    });
  }

  public getAll(searchText: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let storesCollection = this.angularFirestore.collection<Store>(this.collectionName, ref => ref
        .where('deleted', '==', false)
        .where('status', '==', StoreStatus.Published)
        .orderBy('productsCount', 'desc'));

      let subscribe = storesCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Store;
          const id = a.payload.doc.id;

          if (data.name.trim().toUpperCase().indexOf(searchText.toString().trim().toUpperCase()) != -1) {
            return { id, ...data };
          }
        }))
      ).subscribe((res: Array<Store>) => {
        subscribe.unsubscribe();
        resolve(res);
      });
    });
  }

  public getAllStores(): Observable<Store[]> {
    this.storesCollection = this.angularFirestore.collection<Store>(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .where('status', '==', StoreStatus.Published)
          .orderBy('productsCount', 'desc'));

    return this.storesCollection.snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as Store;
            
            data.id = a.payload.doc.id;
    
            return data;
          }))
        );
  }

  public set(id: string, data: any) {
    return this.angularFirestore.collection(this.collectionName).doc(id).set(data);
  }

  public update(id: string, data: any) {
    return this.angularFirestore.collection(this.collectionName).doc(id).update(data);
  }

  // --------------------- STORE COUPONS
  public createStoreCoupon(idStore: string, storeCoupon: StoreCoupon): Promise<DocumentReference> {
    return this.angularFirestore
      .collection(this.collectionName).doc(idStore)
      .collection('coupons').add(storeCoupon);
  }

  public updateStoreCoupon(idStoreCoupon: string, data: any) {
    return this.angularFirestore
      .collection('coupons').doc(idStoreCoupon).update(data);
  }

  public getAllStoreCoupons(): Observable<StoreCoupon[]> {
    let storesCollection = this.angularFirestore.collection("coupons", ref => ref
      .where('deleted', '==', false)
      .orderBy('minAmount'));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StoreCoupon;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getStoreCouponsXStore(idStore: string, top: number): Observable<StoreCoupon[]> {
    let storesCollection = this.angularFirestore.collection<Store>(this.collectionName).doc(idStore).collection("coupons", ref => ref
      .where('deleted', '==', false)
      .limit(top));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StoreCoupon;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getStoreCouponsNoVIP(): Observable<StoreCoupon[]> {
    let storesCollection = this.angularFirestore.collection("coupons", ref => ref
      .where('deleted', '==', false)
      .where('isVIP', '==', false)
      .orderBy('minAmount'));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StoreCoupon;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getCouponById(idStoreCoupon: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore
        .collection("coupons").doc(idStoreCoupon).ref.get().then(
          function (doc) {
            if (doc.exists) {
              const data = doc.data() as StoreCoupon;
              const id = doc.id;
              resolve({ id, ...data });
            } else {
              resolve('');
            }
          }).catch(function (error) {
            console.log("Error getting document:", error);
            throw error;
          });
    }).catch(err => {
      alert(err);
      this.logError({ id: '', message: err, function: 'stores-getById', idUser: '0', dateCreated: new Date() });
    });
  }

  //------------------------------- PQRSF

  public createPQRSF(pqrsf: PQRSF): Promise<DocumentReference> {
    return this.angularFirestore
      .collection("pqrsf").add(pqrsf);
  }

  public getStorePQRSF(idStore: string): Observable<PQRSF[]> {
    let storesCollection = this.angularFirestore
      .collection<Store>(this.collectionName).doc(idStore)
      .collection("pqrsf", ref => ref
        .where('deleted', '==', false)
        .orderBy('dateCreated', 'desc'));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as PQRSF;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getStorePQRSFByUser(idStore: string, idUser: string): Observable<PQRSF[]> {
    let storesCollection = this.angularFirestore
      .collection<Store>(this.collectionName).doc(idStore)
      .collection("pqrsf", ref => ref
        .where('deleted', '==', false)
        .where('idUser', '==', idUser)
        .orderBy('dateCreated', 'desc'));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as PQRSF;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  //------------------------------- Shipping Methods
  public createShippingMethod(shippingMethod: ShippingMethod): Promise<DocumentReference> {
    return this.angularFirestore
      .collection("shippingMethods").add(shippingMethod);
  }

  public updateShippingMethod(idShippingMethod: string, data: any) {
    return this.angularFirestore
      .collection("shippingMethods").doc(idShippingMethod).update(data);
  }

  public getShippingMethods(): Observable<ShippingMethod[]> {
    let storesCollection = this.angularFirestore
      .collection("shippingMethods", ref => ref
        .where('deleted', '==', false)
        .orderBy('name', 'desc'));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ShippingMethod;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  //------------------------------- Vendors
  public createVendor(idStore: string, vendor: Vendor): Promise<DocumentReference> {
    return this.angularFirestore
      .collection(this.collectionName).doc(idStore)
      .collection("vendors").add(vendor);
  }

  public updateVendor(idStore: string, idVendor: string, data: any) {
    return this.angularFirestore
      .collection(this.collectionName).doc(idStore)
      .collection("vendors").doc(idVendor).update(data);
  }

  public getVendors(idStore: string): Observable<Vendor[]> {
    let storesCollection = this.angularFirestore
      .collection<Store>(this.collectionName).doc(idStore)
      .collection("vendors", ref => ref
        .where('deleted', '==', false));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Vendor;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getActiveVendors(): Observable<Vendor[]> {
    let storesCollection = this.angularFirestore
      .collection("vendors", ref => ref
        .where('status', '==', VendorStatus.Confirmed)
        .where('active', '==', true)
        .where('deleted', '==', false));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Vendor;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  public getVendorsByIdUser(idStore: string, idUser: string): Observable<Vendor[]> {
    let storesCollection = this.angularFirestore
      .collection<Store>(this.collectionName).doc(idStore)
      .collection("vendors", ref => ref
        .where('deleted', '==', false)
        .where('idUser', '==', idUser));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Vendor;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }

  // --- Error Log
  public logError(error: ErrorMessage): Promise<DocumentReference> {
    return this.angularFirestore
      .collection("appErrors").add(error);
  }
}
