import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFirestore, DocumentReference, AngularFirestoreCollection } from '@angular/fire/firestore';
import { StoreCategory } from '../app-intefaces';

@Injectable({
  providedIn: 'root'
})
export class StoreCategoriesService {
  private collectionName: string = 'storeCategories';
  private storeCategoryCollection: AngularFirestoreCollection<StoreCategory>;

  constructor(public angularFirestore: AngularFirestore, ) { }

  public create(storeCategory: StoreCategory): Promise<DocumentReference> {
    return this.angularFirestore.collection(this.collectionName).add(storeCategory);
  }

  // public getById(Id: string) {
  //   return this.angularFirestore.collection(this.collectionName).doc(Id).snapshotChanges();
  // }

  // public getAll(): Observable<StoreCategory[]> {
  //   this.storeCategoryCollection = this.angularFirestore.collection<StoreCategory>(this.collectionName, ref => ref.orderBy('name'));
  //   return this.storeCategoryCollection.snapshotChanges().pipe(
  //     map(actions => actions.map(a => {
  //       const data = a.payload.doc.data() as StoreCategory;
        
  //       data.id = a.payload.doc.id;

  //       return data;
  //     }))
  //   );
  // }

  // public set(id: string, data: any) {
  //   return this.angularFirestore.collection(this.collectionName).doc(id).set(data);
  // }
}
