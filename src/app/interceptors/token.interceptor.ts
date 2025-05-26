import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  // Добавляем токен к каждому запросу
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(clonedReq).pipe(
    catchError((error) => {
      // Обрабатываем только 401 ошибки и не делай refresh на /login
      if (
        error.status === 403 &&
        !req.url.includes('login') &&
        !req.url.includes('refresh')
      ) {
        // Логика обновления токена
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            // Сохраняем новый токен
            localStorage.setItem('token', res.accessToken);

            // Клонируем запрос с новым токеном
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`,
              },
            });

            // Повторяем запрос
            return next(retryReq);
          }),
          catchError((err) => {
            // Если refresh тоже упал — выкидываем ошибку
            localStorage.removeItem('token');
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};