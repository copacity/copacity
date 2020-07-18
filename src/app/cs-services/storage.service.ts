import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

import { Plugins, CameraResultType, CameraSource, CameraPhoto } from '@capacitor/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { AppService } from './app.service';


export const fileToBase64 = (filename, filepath) => {
  return new Promise((resolve, reject) => {
    var file = new File([filename], filepath);
    var reader = new FileReader();
    reader.onload = function (event) {

      // resolve(event.target.result);
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  }).catch(err => {
    alert(err);
    this.appService.logError({ id: '', message: err, idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
  });
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public Imagen: SafeResourceUrl;
  private base64ResizedImage: string = null;

  constructor(
    private angularFireStorage: AngularFireStorage,
    private appService: AppService,
    private sanitizer: DomSanitizer
  ) { }

  public async takePhoto(id: string, width: number, height: number): Promise<String> {
    let promise = new Promise<String>(async (resolve, reject) => {
      const image = await Plugins.Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      resolve(await this.ResizeImage(image.dataUrl, id, width, height));
    });
    return await promise;
  }

  public async loadImage(file: File, id: string, width: number, height: number): Promise<String> {
    let promise = new Promise<String>((resolve, reject) => {
      fileToBase64(file, id).then(async (data: string) => {
        resolve(await this.ResizeImage(data, id, width, height));
      })
    });
    return await promise;
  }

  public async ResizeImage(base64image: string, id: string, width: number = 1080, height: number = 1080): Promise<String> {
    let img = new Image();
    img.src = base64image;

    let promise = new Promise<String>((resolve, reject) => {
      img.onload = async () => {

        // Make sure the width and height preserve the original aspect ratio and adjust if needed
        if (img.height > img.width) {
          width = Math.floor(height * (img.width / img.height));
        }
        else {
          height = Math.floor(width * (img.height / img.width));
        }

        let resizingCanvas: HTMLCanvasElement = document.createElement('canvas');
        let resizingCanvasContext = resizingCanvas.getContext("2d");

        // Start with original image size
        resizingCanvas.width = img.width;
        resizingCanvas.height = img.height;


        // Draw the original image on the (temp) resizing canvas
        resizingCanvasContext.drawImage(img, 0, 0, resizingCanvas.width, resizingCanvas.height);

        let curImageDimensions = {
          width: Math.floor(img.width),
          height: Math.floor(img.height)
        };

        let halfImageDimensions = {
          width: null,
          height: null
        };

        // Quickly reduce the dize by 50% each time in few iterations until the size is less then
        // 2x time the target size - the motivation for it, is to reduce the aliasing that would have been
        // created with direct reduction of very big image to small image
        while (curImageDimensions.width * 0.5 > width) {
          // Reduce the resizing canvas by half and refresh the image
          halfImageDimensions.width = Math.floor(curImageDimensions.width * 0.5);
          halfImageDimensions.height = Math.floor(curImageDimensions.height * 0.5);

          resizingCanvasContext.drawImage(resizingCanvas, 0, 0, curImageDimensions.width, curImageDimensions.height,
            0, 0, halfImageDimensions.width, halfImageDimensions.height);

          curImageDimensions.width = halfImageDimensions.width;
          curImageDimensions.height = halfImageDimensions.height;
        }

        // Now do final resize for the resizingCanvas to meet the dimension requirments
        // directly to the output canvas, that will output the final image
        let outputCanvas: HTMLCanvasElement = document.createElement('canvas');
        let outputCanvasContext = outputCanvas.getContext("2d");

        outputCanvas.width = width;
        outputCanvas.height = height;

        outputCanvasContext.drawImage(resizingCanvas, 0, 0, curImageDimensions.width, curImageDimensions.height,
          0, 0, width, height);

        // output the canvas pixels as an image. params: format, quality
        this.base64ResizedImage = outputCanvas.toDataURL('image/jpeg', 1.0);

        this.Imagen = this.sanitizer.bypassSecurityTrustResourceUrl(this.base64ResizedImage);
        //this.Imagen = this.base64ResizedImage;
        const filePath = id;

        const ref = this.angularFireStorage.ref(filePath);
        const task = await ref.putString(this.base64ResizedImage, 'data_url');

        ref.getDownloadURL().subscribe((url) => {
          resolve(url);
        });

      };
    });
    return await promise;
  }

  public async ResizeImage2(base64image: string, id: string, width: number = 1080, height: number = 1080): Promise<String> {
    let img = new Image();
    img.src = base64image;

    let promise = new Promise<String>((resolve, reject) => {
      img.onload = async () => {

        // Make sure the width and height preserve the original aspect ratio and adjust if needed
        if (img.height > img.width) {
          width = Math.floor(height * (img.width / img.height));
        }
        else {
          height = Math.floor(width * (img.height / img.width));
        }

        let resizingCanvas: HTMLCanvasElement = document.createElement('canvas');
        let resizingCanvasContext = resizingCanvas.getContext("2d");

        // Start with original image size
        resizingCanvas.width = img.width;
        resizingCanvas.height = img.height;


        // Draw the original image on the (temp) resizing canvas
        resizingCanvasContext.drawImage(img, 0, 0, resizingCanvas.width, resizingCanvas.height);

        let curImageDimensions = {
          width: Math.floor(img.width),
          height: Math.floor(img.height)
        };

        let halfImageDimensions = {
          width: null,
          height: null
        };

        // Quickly reduce the dize by 50% each time in few iterations until the size is less then
        // 2x time the target size - the motivation for it, is to reduce the aliasing that would have been
        // created with direct reduction of very big image to small image
        while (curImageDimensions.width * 0.5 > width) {
          // Reduce the resizing canvas by half and refresh the image
          halfImageDimensions.width = Math.floor(curImageDimensions.width * 0.5);
          halfImageDimensions.height = Math.floor(curImageDimensions.height * 0.5);

          resizingCanvasContext.drawImage(resizingCanvas, 0, 0, curImageDimensions.width, curImageDimensions.height,
            0, 0, halfImageDimensions.width, halfImageDimensions.height);

          curImageDimensions.width = halfImageDimensions.width;
          curImageDimensions.height = halfImageDimensions.height;
        }

        // Now do final resize for the resizingCanvas to meet the dimension requirments
        // directly to the output canvas, that will output the final image
        let outputCanvas: HTMLCanvasElement = document.createElement('canvas');
        let outputCanvasContext = outputCanvas.getContext("2d");

        outputCanvas.width = width;
        outputCanvas.height = height;

        outputCanvasContext.drawImage(resizingCanvas, 0, 0, curImageDimensions.width, curImageDimensions.height,
          0, 0, width, height);

        // output the canvas pixels as an image. params: format, quality
        this.base64ResizedImage = outputCanvas.toDataURL('image/jpeg', 1.0);

        this.Imagen = this.sanitizer.bypassSecurityTrustResourceUrl(this.base64ResizedImage);
        //this.Imagen = this.base64ResizedImage;
        const filePath = id;

        resolve(this.base64ResizedImage);
      };
    });
    return await promise;
  }

  deleteImageFromStorage(url: string) {
    const ref = this.angularFireStorage.ref(url);
    ref.delete();
  }

  getThumbUrl(idImage: string, _resolve: any) {
    return new Promise((resolve, reject) => {
      const ref = this.angularFireStorage.ref('thumb_' + idImage);
      let meta = ref.getDownloadURL().subscribe(result => {

        if (_resolve) {
          _resolve(result);
        } else {
          resolve(result);
        }
      }, err => {
        this.getThumbUrl(idImage, resolve);
      });

    }).catch(err => {
      alert(err);
      this.appService.logError({ id: '', message: err, function: 'getThumbUrl', idUser: (this.appService.currentUser.id ? this.appService.currentUser.id : '0'), dateCreated: new Date() });
    });
  }
}
