import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Store, StoreCoupon } from '../app-intefaces';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoreStatus } from '../app-enums';

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
      .orderBy('name'));

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
      .orderBy('name'));

    return storesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StoreCoupon;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }
}
