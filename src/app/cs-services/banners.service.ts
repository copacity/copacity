import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Banner } from '../app-intefaces';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private bannersCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

  public getAll(): Observable<Banner[]> {
    this.bannersCollection = this.angularFirestore.collection<Banner>('banners', ref => ref.orderBy('name'));
    return this.bannersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Banner;
        const id = a.payload.doc.id;
        
        return { id, ...data };
      }))
    );
  }
}
