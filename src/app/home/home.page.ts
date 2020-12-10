import {
  AfterViewInit,
  ChangeDetectorRef,
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

  constructor(
    private gestureCtrl: GestureController,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

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
          // Disable scrolling the list
          this.contentScrollActive = false;
          // Updates view if some updates aren't picked up
          this.changeDetectorRef.detectChanges();
        },
        onMove: (ev) => {
          oneItem.nativeElement.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          oneItem.nativeElement.style.zIndex = 11;
          this.checkDropzoneHover(ev.currentX, ev.currentY);
        },
        onEnd: (ev) => {
          this.contentScrollActive = true;
          this.handleDrop(oneItem, ev.currentX, ev.currentY, i);
        },
      });
      drag.enable();
      this.gestureArray.push(drag);
    }

    this.items.changes.subscribe((res) => {
      // console.log("items changed: ", res);
      if (this.gestureArray.length != this.items.length) {
        this.updateGestures();
      }
    });
  }

  // Check if we are dragging above a dropzone
  checkDropzoneHover(x, y) {
    const dropA = this.dropA.nativeElement.getBoundingClientRect();
    const dropB = this.dropB.nativeElement.getBoundingClientRect();

    if (this.isInZone(x, y, dropA)) {
      this.dropA.nativeElement.style.backgroundColor = "blue";
    } else {
      this.dropA.nativeElement.style.backgroundColor = "white";
    }

    if (this.isInZone(x, y, dropB)) {
      this.dropB.nativeElement.style.backgroundColor = "red";
    } else {
      this.dropB.nativeElement.style.backgroundColor = "white";
    }
  }

  // Check if coordinates are within a dropzone rect
  isInZone(x, y, dropzone) {
    if (x < dropzone.left || x >= dropzone.right) {
      return false;
    }
    if (y < dropzone.top || y >= dropzone.bottom) {
      return false;
    }
    return true;
  }

  // Decide what to do with dropped item
  handleDrop(item, endX, endY, index) {
    const dropA = this.dropA.nativeElement.getBoundingClientRect();
    const dropB = this.dropB.nativeElement.getBoundingClientRect();

    if (this.isInZone(endX, endY, dropA)) {
      // Dropped in Zone A
      const removedItem = this.myArray.splice(index, 1);
      this.teamBlue.push(removedItem[0]);
      item.nativeElement.remove();
      // Sort to show the values in increasing order
      this.teamBlue.sort(function (a, b) {
        return a - b;
      });
    } else if (this.isInZone(endX, endY, dropB)) {
      // Dropped in Zone B
      const removedItem = this.myArray.splice(index, 1);
      this.teamRed.push(removedItem[0]);
      item.nativeElement.remove();
      // Sort to show the values in increasing order
      this.teamRed.sort(function (a, b) {
        return a - b;
      });
    } else {
      // Don't drop the item into a zone
      // Simply bring it back to the initial position
      item.nativeElement.style.transition = ".2s ease-out";
      item.nativeElement.style.zIndex = "inherit";
      item.nativeElement.style.transform = `translate(0,0)`;
      item.nativeElement.style.opacity = "1";
      item.nativeElement.style.fontWeight = "normal";
    }

    this.dropA.nativeElement.style.backgroundColor = "white";
    this.dropB.nativeElement.style.backgroundColor = "white";
    this.changeDetectorRef.detectChanges();
  }
}
