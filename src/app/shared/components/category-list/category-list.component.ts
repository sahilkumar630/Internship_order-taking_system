import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';


@Component({
  selector: 'app-category-list',

  imports: [],

  templateUrl:
    './category-list.component.html',

  styleUrl:
    './category-list.component.css'
})
export class CategoryListComponent {


  // =========================================
  // CATEGORY LIST
  // =========================================

  @ViewChild('categoryList')
  categoryList!: ElementRef<HTMLDivElement>;


  // =========================================
  // CATEGORIES
  // =========================================

  categories = [

    {
      name: 'Fast Food',
      icon: '🍟',
      image:
        'https://images.deliveryhero.io/image/fd-pk/Products/97755546.jpg'
    },

    {
      name: 'Biryani',
      icon: '🍛',
      image:
        'https://images.deliveryhero.io/image/fd-pk/LH/idop-listing.jpg'
    },

    {
      name: 'Pizza',
      icon: '🍕',
      image:
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80'
    },

    {
      name: 'BBQ',
      icon: '🍗',
      image:
        'https://images.deliveryhero.io/image/fd-pk/Products/97755546.jpg'
    },

    {
      name: 'Burgers',
      icon: '🍔',
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'
    },

    {
      name: 'Halwa Puri',
      icon: '🥘',
      image:
        'https://www.thebrokebackpacker.com/wp-content/uploads/2022/04/Shutterstock-Pakistan-Halwa-Puri.jpg'
    },

    {
      name: 'Paratha',
      icon: '🫓',
      image:
        'https://images.deliveryhero.io/image/fd-pk/products/98716233.jpg'
    },

    {
      name: 'Desserts',
      icon: '🍮',
      image:
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80'
    },

    {
      name: 'Drinks',
      icon: '🥤',
      image:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80'
    }

  ];


  // =========================================
  // SCROLL RIGHT
  // =========================================

  scrollRight(): void {

    const element =
      this.categoryList?.nativeElement;


    if (!element) {

      console.warn(
        'Category list element not available.'
      );

      return;

    }


    const scrollAmount =
      element.clientWidth * 0.75;


    element.scrollTo({

      left:
        element.scrollLeft +
        scrollAmount,

      behavior:
        'smooth'

    });


    console.log(
      'Scrolling right:',
      element.scrollLeft +
      scrollAmount
    );

  }


  // =========================================
  // SCROLL LEFT
  // =========================================

  scrollLeft(): void {

    const element =
      this.categoryList?.nativeElement;


    if (!element) {

      console.warn(
        'Category list element not available.'
      );

      return;

    }


    const scrollAmount =
      element.clientWidth * 0.75;


    element.scrollTo({

      left:
        element.scrollLeft -
        scrollAmount,

      behavior:
        'smooth'

    });


    console.log(
      'Scrolling left:',
      element.scrollLeft -
      scrollAmount
    );

  }


  // =========================================
  // SELECT CATEGORY
  // =========================================

  selectCategory(
    category: string
  ): void {

    console.log(
      'Selected category:',
      category
    );

  }

}