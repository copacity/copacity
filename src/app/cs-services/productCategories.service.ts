import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFirestore, DocumentReference, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ProductCategory } from '../app-intefaces';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoriesService {
  private collectionName: string = 'productCategories';
  private productCategoryCollection: AngularFirestoreCollection<ProductCategory>;

  constructor(public angularFirestore: AngularFirestore, private appService: AppService) { }

  public create(idStore: string, productCategory: ProductCategory): Promise<DocumentReference> {
    return this.angularFirestore.collection('stores').doc(idStore).collection(this.collectionName).add(productCategory);
  }

  public getById(idStore:string, id: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection("stores").doc(idStore)
        .collection(this.collectionName).doc(id).ref.get().then(
          function (doc) {
            if (doc.exists) {
              const data = doc.data() as ProductCategory;
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
          this.appService.logError({id:'', message: err, function:'product-categories-getById', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
        });
  }

  public getAll(idStore: string): Observable<ProductCategory[]> {
    this.productCategoryCollection = this.angularFirestore.collection('stores').doc(idStore).collection<ProductCategory>(this.collectionName, ref => ref.where('deleted', '==', false));
    return this.productCategoryCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ProductCategory;
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
}
