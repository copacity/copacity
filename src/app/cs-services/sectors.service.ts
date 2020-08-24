import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SectorsService {
  private collectionName: string = 'sectors';
  private sectorsCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

  // public getAll(): Observable<Sector[]> {
  //   this.sectorsCollection = this.angularFirestore.collection<Sector>(this.collectionName, ref => ref.orderBy('name'));
  //   return this.sectorsCollection.snapshotChanges().pipe(
  //     map(actions => actions.map(a => {
  //       const data = a.payload.doc.data() as Sector;
  //       const id = a.payload.doc.id;

  //       return { id, ...data };
  //     }))
  //   );
  // }
}
