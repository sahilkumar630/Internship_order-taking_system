import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Restaurant }
  from '../../../shared/models/restaurant.model';

import { RestaurantService }
  from '../../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurant-details',

  imports: [
    RouterLink
  ],

  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css'
})
export class RestaurantDetailsComponent implements OnInit {

  restaurantId!: number;

  restaurant?: Restaurant;


  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {

        return;

      }


      this.restaurantId = Number(id);


      this.restaurant =
        this.restaurantService.getRestaurantById(
          this.restaurantId
        );

    });

  }

}