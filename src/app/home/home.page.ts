import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { Gesture, GestureController, IonItem } from "@ionic/angular";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements AfterViewInit {
  teamBlue = [];
  teamRed = [];
  myArray = Array.from(Array(30).keys());
  contentScrollActive = true;
  gestureArray: Gesture[] = [];

  @ViewChild("dropzoneA") dropA: ElementRef;
  @ViewChild("dropzoneB") dropB: ElementRef;

  @ViewChildren(IonItem, { read: ElementRef }) items: QueryList<ElementRef>;

  constructor(private gestureCtrl: GestureController) {}

  // View child elements are only available after viewinit
  ngAfterViewInit() {
    this.updateGestures();
  }

  // Remove and add gestures based on ViewChildren Querylist
  updateGestures() {
    this.gestureArray.map((gesture) => gesture.destroy());
    this.gestureArray = [];

    const arr = this.items.toArray();

    for (let i = 0; i < arr.length; i++) {
      const oneItem = arr[i];

      const drag = this.gestureCtrl.create({
        el: oneItem.nativeElement,
        threshold: 1,
        gestureName: "drag",
        onStart: (ev) => {
          oneItem.nativeElement.style.transition = "";
          oneItem.nativeElement.style.opacity = "0.8";
          oneItem.nativeElement.style.fontWeight = "bold";
          this.contentScrollActive = false;
        },
        onMove: (ev) => {
          oneItem.nativeElement.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          oneItem.nativeElement.style.zIndex = 10;
        },
        onEnd: (ev) => {},
      });
      drag.enable();
      this.gestureArray.push(drag);
    }

    this.items.changes.subscribe((res) => {
      console.log("items changed: ", res);
    });
  }

  // Check if we are dragging above a dropzone
}
