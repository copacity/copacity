import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { User, StorePoint } from '../app-intefaces';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private collectionName: string = 'users';
  private usersCollection: AngularFirestoreCollection<any>;
  
  constructor(public angularFirestore: AngularFirestore) { }

  public getById(id: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection(this.collectionName).doc(id).ref.get().then(
        function (doc) {
          if (doc.exists) {
            const data = doc.data() as User;
            const id = doc.id;
            resolve( { id, ...data });
          } else {
            console.log("No such document!");
          }
        }).catch(function (error) {
          console.log("Error getting document:", error);
        });
    });
  }

  public update(id: string, data: any) {
    return this.angularFirestore.collection(this.collectionName).doc(id).update(data);
  }

  // --------------------- USER POINTS

  public createStorePoint(idUser: string, storePoint: StorePoint): Promise<DocumentReference> {
    return this.angularFirestore
      .collection('users').doc(idUser)
      .collection('points').add(storePoint);
  }

  public getStorePoints(idUser:string): Observable<StorePoint[]> {
    let storePointsCollection = this.angularFirestore.collection('users').doc(idUser)
      .collection('storePoints');

    return storePointsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StorePoint;
        data.id = a.payload.doc.id;

        return data;
      }))
    );
  }
}
