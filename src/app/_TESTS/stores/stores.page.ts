import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Router } from '@angular/router';
import { Store } from 'src/app/app-intefaces';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.page.html',
  styleUrls: ['./stores.page.scss'],
})
export class StoresPage implements OnInit {
  items: Observable<any[]>;


  itemsCollection: AngularFirestoreCollection<any>;

  constructor(
    private router: Router,
    public angularFirestore: AngularFirestore
  ) {

    //this.items = this.angularFirestore.collection("orders").doc('uLAWyudeGyedT5TmMAPP').collection('products', ref => ref.where('price', '<', 20000).orderBy('name', 'desc')).valueChanges()

  
  
  //   return this.angularFirestore.collection(this.collectionName, ref => ref.where('storeId', '==', id))
  //     .snapshotChanges().pipe(
  //       map(actions => actions.map(a => {
  //         const data = a.payload.doc.data() as iProduct;
  //         const id = a.payload.doc.id;
  //         return { id, ...data };
  //       }))
  //     ); 
  // }
  }

  ngOnInit() {
  }

  addStore() {
    this.router.navigateByUrl("/add-store");
  }
}
