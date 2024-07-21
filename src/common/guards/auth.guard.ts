import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/role.decorator";
import { Roles } from "../enums/roles.enum";
import { Request } from "express";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {

    const roles = this.reflector.get<Roles[]>(ROLES_KEY, context.getHandler());

    if (!roles) return true;

    const req = context.switchToHttp().getRequest() as Request;

    const { user } = req;

    return roles.some((role) => role == user?.role);
  }
}
