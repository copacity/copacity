import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Store, StoreCoupon, PQRSF, ShippingMethod, PlatformFee, Vendor, ErrorMessage } from '../app-intefaces';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoreStatus, VendorStatus } from '../app-enums';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private collectionName: string = 'stores';
  private storesCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

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

  public updateStoreCoupon(idStore: string, idStoreCoupon: string, data: any) {
    return this.angularFirestore
      .collection(this.collectionName).doc(idStore)
      .collection('coupons').doc(idStoreCoupon).update(data);
  }

  public getAllStoreCoupons(idStore: string): Observable<StoreCoupon[]> {
    let storesCollection = this.angularFirestore.collection<Store>(this.collectionName).doc(idStore).collection("coupons", ref => ref
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

  public getStoreCouponsNoVIP(idStore: string): Observable<StoreCoupon[]> {
    let storesCollection = this.angularFirestore.collection<Store>(this.collectionName).doc(idStore).collection("coupons", ref => ref
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

  public getCouponById(idStore: string, idStoreCoupon: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection("stores").doc(idStore)
        .collection("coupons").doc(idStoreCoupon).ref.get().then(
          function (doc) {
            if (doc.exists) {
              const data = doc.data() as StoreCoupon;
              const id = doc.id;
              resolve({ id, ...data });
            } else {
              resolve();
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

  public createPQRSF(idStore: string, pqrsf: PQRSF): Promise<DocumentReference> {
    return this.angularFirestore
      .collection(this.collectionName).doc(idStore)
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
  public createShippingMethod(idStore: string, shippingMethod: ShippingMethod): Promise<DocumentReference> {
    return this.angularFirestore
      .collection(this.collectionName).doc(idStore)
      .collection("shippingMethods").add(shippingMethod);
  }

  public updateShippingMethod(idStore: string, idShippingMethod: string, data: any) {
    return this.angularFirestore
      .collection(this.collectionName).doc(idStore)
      .collection("shippingMethods").doc(idShippingMethod).update(data);
  }

  public getShippingMethods(idStore: string): Observable<ShippingMethod[]> {
    let storesCollection = this.angularFirestore
      .collection<Store>(this.collectionName).doc(idStore)
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

  public getActiveVendors(idStore: string): Observable<Vendor[]> {
    let storesCollection = this.angularFirestore
      .collection<Store>(this.collectionName).doc(idStore)
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
