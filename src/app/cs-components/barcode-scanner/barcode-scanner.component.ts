import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PopoverController, NavParams, ToastController, LoadingController } from '@ionic/angular';
import jsQR from 'jsqr';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss'],
})
export class BarcodeScannerComponent implements OnInit {
  message = '';
  scanActive = false;
  scanResult = null;

  @ViewChild('video', { static: false }) video: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  videoElement: any;
  canvasElement: any;
  canvasContext: any;

  loading: HTMLIonLoadingElement;

  constructor(
    public popoverController: PopoverController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.message = ''
    this.videoElement = this.video.nativeElement;
    this.canvasElement = this.canvas.nativeElement;
    this.canvasContext = this.canvasElement.getContext('2d');

    setTimeout(() => {
      this.startScan();
    }, 300);
  }

  close() {
    this.scanActive = false;
    this.popoverController.dismiss();
  }

  async startScan() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      this.videoElement.srcObject = stream;
      this.videoElement.setAttribute('playsinline', true);
      this.videoElement.play();


      this.loading = await this.loadingCtrl.create({});
      this.loading.present();

      requestAnimationFrame(this.scan.bind(this));
    } catch (error) {
      if (error.toString().indexOf('NotFoundError') != -1) {
        this.message = "No encontramos respuesta de alguna cámara en tu dispositivo";
      } else {
        if (error.toString().indexOf('NotAllowedError') != -1) {
          this.message = "Los permisos para acceder a la cámara del dispositivo han sido denegados, para permitir su uso debes cambiar los permisos manualmente en la configuración del navegador/app";
        } else {
          this.message = error;
        }
      }
    }
  }

  async scan() {
    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
        this.scanActive = true;
      }

      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;

      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code) {
        this.scanActive = false;
        this.scanResult = code.data;
        this.popoverController.dismiss(code.data);
      } else {
        if (this.scanActive) {
          requestAnimationFrame(this.scan.bind(this));
        }

      }
    } else {
      requestAnimationFrame(this.scan.bind(this));
    }
  }

  stopScan() {
    this.scanActive = false;
  }

  reset() {
    this.scanResult = null;
  }

  // async showQRToast() {
  //   const toast = await this.toastCtrl.create({
  //     message: `Open ${this.scanResult}`,
  //     position: 'top',
  //     buttons: [
  //       {
  //         text: 'Open',
  //         handler: () => {
  //           window.open(this.scanResult, '_system', 'location=yes');
  //         }
  //       }
  //     ]

  //   });

  //   toast.present();
  // }
}
