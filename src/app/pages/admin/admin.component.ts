import { Component, inject, ApplicationRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../../layouts/header/header.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './admin.component.html'
})
export class AdminComponent {}
