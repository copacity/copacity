import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { User } from '../app-intefaces';

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
}
