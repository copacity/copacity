import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
})
export class ImageViewerComponent implements OnInit {
  images: string[];
  constructor(public popoverController: PopoverController, 
    public navParams: NavParams) { 
      setTimeout(() => {
        this.images = this.navParams.data.images
      }, 300);
    }

  ngOnInit() {}

  close() {
    this.popoverController.dismiss();
  }

  slideOpts = {
    // initialSlide: 0,
    // slidesPerView: 1,
    // autoplay: true,
    pager: true,
    // loop: true,
    // speed: 3000
    // pagination: {
    //   el: '.swiper-pagination',
    //   type: 'fraction',
    //   renderFraction: function (currentClass, totalClass) {
    //     return '<div style="font-weight:bolder;font-size: 1.5em;text-align: -webkit-center;"><div style="width:70px;background-color: white;">' +
    //       '<span  class="' + currentClass + '"></span>' +
    //       ' / ' +
    //       '<span class="' + totalClass + '"></span></div></div>';
    //   }
    // }
  };
}
