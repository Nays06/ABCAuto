import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(clonedReq).pipe(
    catchError((error) => {
      if (
        error.status === 403 &&
        !req.url.includes('login') &&
        !req.url.includes('refresh')
      ) {
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            localStorage.setItem('token', res.accessToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`,
              },
            });

            return next(retryReq);
          }),
          catchError((err) => {
            localStorage.removeItem('token');
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
