import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Notification } from '../app-intefaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private collectionName: string = 'notifications';
  private notificationsCollection: AngularFirestoreCollection<any>;

  constructor(public angularFirestore: AngularFirestore) { }

  public create(idUser: string, notification: Notification): Promise<DocumentReference> {
    return this.angularFirestore.collection('users').doc(idUser).collection(this.collectionName).add(notification);
  }

  public getById(id: string): Promise<Notification> {
    return new Promise((resolve, reject) => {
      this.angularFirestore.collection(this.collectionName).doc(id).ref.get().then(
        function (doc) {
          if (doc.exists) {
            const data = doc.data() as Notification;
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

  public getByUser(idUser: string): Observable<Notification[]> {
    this.notificationsCollection = this.angularFirestore.collection('users').doc(idUser)
      .collection<Notification>(this.collectionName, ref => ref
        .where('deleted', '==', false)
        .where('status', '==', 1)
        .orderBy('dateCreated', 'desc')
      );

    return this.notificationsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Notification;
        data.id = a.payload.doc.id;
        return data;
      })));
  }

  public getGetAllByUser(idUser: string): Observable<Notification[]> {
    this.notificationsCollection = this.angularFirestore.collection('users').doc(idUser)
        .collection<Notification>(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .orderBy('dateCreated', "desc")
          .limit(100));

    return this.notificationsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Notification;
        data.id = a.payload.doc.id;
        return data;
      })));
  }

  public getGetByIdOrder(idUser: string, idOrder:String): Observable<Notification[]> {
    this.notificationsCollection = this.angularFirestore.collection('users').doc(idUser)
        .collection<Notification>(this.collectionName, ref => ref
          .where('deleted', '==', false)
          .where('idOrder', '==', idOrder)
          .orderBy('dateCreated', "desc"));

    return this.notificationsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Notification;
        data.id = a.payload.doc.id;
        return data;
      })));
  }

  public update(idUser: string, id: string, data: any) {
    return this.angularFirestore
      .collection('users').doc(idUser)
      .collection(this.collectionName).doc(id).update(data);
  }
}