import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { request } from 'http';

@Injectable()
export class AuthGuard implements CanActivate {
  //inject authservice
  constructor(private authService: AuthService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
  }
    const token = this.extractTokenFromHeader(request);
}
