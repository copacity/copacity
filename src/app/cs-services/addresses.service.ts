

import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Address } from '../app-intefaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AddressesService {
  private collectionName: string = 'addresses';
  private addressCollection: AngularFirestoreCollection<Address>;

  constructor(public angularFirestore: AngularFirestore, ) { }

  public create(idUser: string, address: Address): Promise<DocumentReference> {
    return this.angularFirestore.collection('users').doc(idUser).collection(this.collectionName).add(address);
  }

  public getById(idUser: string, id: string) {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection("users").doc(idUser)
        .collection(this.collectionName).doc(id).ref.get().then(
          function (doc) {
            if (doc.exists) {
              const data = doc.data() as Address;
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

  public getAll(idUser: string): Observable<Address[]> {
    this.addressCollection = this.angularFirestore.collection('users').doc(idUser).collection<Address>(this.collectionName, ref => 
      ref.where('deleted', '==', false));
    
    return this.addressCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Address;
        const id = a.payload.doc.id;

        return { id, ...data };
      }))
    );
  }

  public getAddressChecked(idUser: string): Observable<string[]> {
    this.addressCollection = this.angularFirestore.collection('users').doc(idUser)
    .collection<Address>(this.collectionName, ref => ref
      .where('deleted', '==', false)
      .where('checked', '==', true)
      .orderBy('name')
      .limit(1)
      );
    
    return this.addressCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Address;
        const id = a.payload.doc.id;
        console.log("Addresses getAddressChecked");
        return id;
      })));
  }

  public update(idUser: string, id: string, data: any) {
    return this.angularFirestore.collection('users').doc(idUser).collection(this.collectionName).doc(id).update(data);
  }
}
