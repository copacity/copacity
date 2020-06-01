import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Sector } from '../app-intefaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SectorsService {
  private collectionName: string = 'sectors';
  private sectorsCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

  public getAll(): Observable<Sector[]> {
    this.sectorsCollection = this.angularFirestore.collection<Sector>(this.collectionName, ref => ref.orderBy('name'));
    return this.sectorsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Sector;
        const id = a.payload.doc.id;

        return { id, ...data };
      }))
    );
  }
}
