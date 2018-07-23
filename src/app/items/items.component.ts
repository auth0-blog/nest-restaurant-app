import { Component, OnInit } from '@angular/core';
import { Item } from './item.interface';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { ItemsService } from './items.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  items: Item [];
  itemSubmitted = false;
  itemForm: FormGroup;

  constructor(public authService: AuthService, private itemService: ItemsService, private formBuilder: FormBuilder) {}

  addToCart() {
    this.itemService.postToShoppingCart().subscribe(response => {
    }, error => {
      window.alert(error.error.message || error.error.text);
      console.log(error);
    });
  }

  ngOnInit() {
    this.itemService.getItems().subscribe(items => this.items = items);

    // initiating the form with the fields and the required validators
    this.itemForm = this.formBuilder.group({
      name: ['', Validators.required], // Name is required
      price: ['', [Validators.required, Validators.min(0)]] // Price is required and must be a positive number
    });
  }

  get getItemForm() {
    return this.itemForm.controls;
  }

  addNewItem() {
    this.itemSubmitted = true;

    if (!this.itemForm.invalid) {
      this.itemService.postItems(this.itemForm.value).subscribe(() => {
        this.itemService.getItems().subscribe(items => this.items = items);
      }, error => {
        window.alert(error.error.message);
      });
    }
  }

  isAdmin() {
    return this.authService.isAdmin();
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }
}
