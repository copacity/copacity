import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { PaymentMethod } from '../app-intefaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  private collectionName: string = 'paymentMethods';
  private ordersCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

  public getAll(): Observable<PaymentMethod[]> {
    this.ordersCollection;

    this.ordersCollection = this.angularFirestore
      .collection<PaymentMethod>(this.collectionName, ref => ref
        .where('deleted', '==', false)
        .orderBy('name'));

    return this.ordersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as PaymentMethod;
        const id = a.payload.doc.id;

        return { id, ...data };
      })));
  }

  public getById(idPaymentMethod: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection(this.collectionName).doc(idPaymentMethod).ref.get().then(
          function (doc) {
            if (doc.exists) {
              const data = doc.data() as PaymentMethod;
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
}
