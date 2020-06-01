import { Component, OnInit } from '@angular/core';
import { Store } from 'src/app/app-intefaces';
//import { File, Store } from '../../app-intefaces';

@Component({
  selector: 'cs-add-store',
  templateUrl: './add-store.page.html',
  styleUrls: ['./add-store.page.scss'],
})
export class AddStorePage implements OnInit {
  store: Store;
  file: File;

  constructor() { 
  }

  ngOnInit() { }

  nameChange(ev: any) {
    this.store.name = ev.detail.value;
  }

  addressChange(ev: any) {
    this.store.address = ev.detail.value;
  }

  phoneChange(ev: any) {
    this.store.phone1 = ev.detail.value;
  }

  // addStore() {
  //   if(this.store.validate()){
  //     this.store.create(this.store, this.file).then(function(success) { 
  //       console.log(success); 
  //       alert(success);
  //     }) 
  //     .catch(function(error) { 
  //       console.log(error); 
  //       alert(error);
  //     });
  //   }
  // }

  // async uploadLogo(event: any) {
  //   this.file.file = event.target.files[0];
  // }
}
