import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/cs-services/app.service';

@Component({
  selector: 'app-barcode-generator',
  templateUrl: './barcode-generator.component.html',
  styleUrls: ['./barcode-generator.component.scss'],
})
export class BarcodeGeneratorComponent implements OnInit {
  qrcodename: string;
  title: string;
  elementType: 'url' | 'canvas' | 'img' = 'url';
  value: string;
  href: string;

  constructor(public popoverController: PopoverController,
    public navParams: NavParams,
    public appService: AppService) {
    this.value = this.navParams.data.value;
    this.title = this.navParams.data.title;
  }

  ngOnInit() { }

  downloadImage() {
    this.href = document.getElementsByClassName("qrcode ")[0].getElementsByTagName('img')[0].src;
  }

  close() {
    this.popoverController.dismiss();
  }
}
