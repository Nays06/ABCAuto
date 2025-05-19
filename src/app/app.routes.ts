import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AddCarComponent } from './pages/add-car/add-car.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { EditCarComponent } from './pages/edit-car/edit-car.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "catalog", component: CatalogComponent },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "profile", component: ProfileComponent },
    { path: "car/add", component: AddCarComponent },
    { path: "car/:id", component: CarDetailsComponent },
    { path: "car/edit/:id", component: EditCarComponent },
];
