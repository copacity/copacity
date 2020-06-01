import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import Cropper from 'cropperjs';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'cs-cropper-image',
  templateUrl: './cropper-image.component.html',
  styleUrls: ['./cropper-image.component.scss'],
})
export class CropperImageComponent implements OnInit, AfterViewInit {

  @ViewChild("image", { static: false })
  public imageElement: ElementRef;

  public imageSource: string;

  private imageDestination: string;
  private cropper: Cropper;

  public constructor(private popoverCtrl: PopoverController, private navParams: NavParams) {
    this.imageSource = this.navParams.data.image;
    this.imageDestination = '';
  }

  public ngOnInit() { }

  public ngAfterViewInit(): void {
    this.cropper = new Cropper(this.imageElement.nativeElement, {
      aspectRatio: 1/1,
      zoomable: true,
      scalable: true,
      crop: (event) => {
        const canvas = this.cropper.getCroppedCanvas({ 
          fillColor: '#ffffff' 
        });
        this.imageDestination = canvas.toDataURL("image/png");
      }
    });
  }

  close() {
    this.popoverCtrl.dismiss();
  }

  acceptCropper() {
    this.popoverCtrl.dismiss(this.imageDestination);
  }

  zoom(value: number){
    this.cropper.zoom(value);
  }

  rotate(value: number) {
    this.cropper.rotate(value);
  }
}
