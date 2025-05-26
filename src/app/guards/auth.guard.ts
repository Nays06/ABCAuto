import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.getUserID().pipe(
      map((res: any) => {
        const isAuthenticated = !!res.id && !res.isNotExists;
        if (!isAuthenticated) {
          this.router.navigate(['/register']);
        }
        return isAuthenticated;
      }),
      catchError((err) => {
        this.router.navigate(['/register']);
        return of(false);
      })
    );
  }
}