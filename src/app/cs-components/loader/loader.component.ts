import { Component, OnInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import * as $ from 'jquery'

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  image: string;
  loadingMessage: string;

  constructor() {
  }

  ngOnInit() { }

  start(image: string) {
    return new Promise(resolve => {
      $("#store-splash").show();
      $("#store-splash-logo").show();
      $("#splash").attr("src", image);
      this.animateCSS('zoomIn');
      $($("#store-splash-logo img")[0]).on('animationend', animation => {
        $($("#store-splash-logo img")[0]).off("animationend");
        resolve();
      });
    });
  }

  stop() {
    return new Promise(resolve => {
      this.animateCSS('bounceOutRight');
      $($("#store-splash-logo img")[0]).on('animationend', animation => {
        $($("#store-splash-logo img")[0]).off("animationend");
        $("#store-splash-logo").hide();
        $("#store-splash").hide();
        resolve();
      });
    });
  }

  startLoading(loadingMessage: string) {
    $("#loading-message").text(loadingMessage);
    $("#loading").show();
    $("#loading-logo").show();
  }

  stopLoading() {
    $("#loading").hide();
    $("#loading-logo").hide();
  }

  animateCSS(animationName: any, keepAnimated = false) {
    const node = document.querySelector("#splash");
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
      if (!keepAnimated) {
        node.classList.remove('animated', animationName);
      }

      node.removeEventListener('animationend', handleAnimationEnd)
    }

    node.addEventListener('animationend', handleAnimationEnd);
  }
}
