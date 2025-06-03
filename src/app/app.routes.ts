import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AddCarComponent } from './pages/add-car/add-car.component';
import { CarDetailsComponent } from './pages/car-details/car-details.component';
import { EditCarComponent } from './pages/edit-car/edit-car.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { AuthGuard } from './guards/auth.guard';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { EmptyChatComponent } from './components/empty-chat/empty-chat.component';
import { CompilationComponent } from './pages/compilation/compilation.component';
import { HackSystemComponent } from './pages/hack-system/hack-system.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "catalog", component: CatalogComponent },
    { path: "compilation/:type", component: CompilationComponent },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
    { path: "profile/:id", component: ProfileComponent },
    { path: "car/add", component: AddCarComponent, canActivate: [AuthGuard] },
    { path: "car/:id", component: CarDetailsComponent },
    { path: "car/edit/:id", component: EditCarComponent, canActivate: [AuthGuard] },
    { path: 'chats', component: ChatsComponent, children: [{ path: '', component: EmptyChatComponent }, { path: ':id', component: ChatWindowComponent }], canActivate: [AuthGuard] },
    { path: "favorites", component: FavoritesComponent, canActivate: [AuthGuard] },
    { path: 'hack', component: HackSystemComponent, data: { hideHeaderFooter: true }, canActivate: [AuthGuard] }
];
