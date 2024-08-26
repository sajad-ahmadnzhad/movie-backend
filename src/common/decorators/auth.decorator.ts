import {
  HttpCode,
  HttpStatus,
  UseGuards,
  applyDecorators,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  BadRequestBodySchema,
  BadRequestParamSchema,
  ConflictSchema,
  ForbiddenSchema,
  InternalServerErrorSchema,
  JwtExpiredSchema,
  NotFoundSchema,
  SuccessSchema,
  TooManyRequests,
  UnauthorizedSchema,
} from "../swagger/schemas/public.schema";
import { JwtGuard } from "../guards/jwt.guard";
import { AuthGuard } from "@nestjs/passport";

//* Signup user decorator
export const SignUpUserDecorator = applyDecorators(
  HttpCode(HttpStatus.CREATED),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConflictResponse({
    description: "Already registered user",
    schema: ConflictSchema,
  }),
  ApiCreatedResponse({
    description: "Sign Up user success",
    schema: SuccessSchema,
  }),
  ApiBadRequestResponse({
    description: "Signin validation error",
    schema: BadRequestBodySchema,
  }),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
  ApiOperation({ summary: "signup" })
);

//* Signin user decorator
export const SignInUserDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiNotFoundResponse({
    description: "Not found user",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Invalid password or identifier | banned Account",
    schema: ForbiddenSchema,
  }),
  ApiOkResponse({ description: "Signin success", schema: SuccessSchema }),
  ApiBadRequestResponse({
    description: "Signin validation error",
    schema: BadRequestBodySchema,
  }),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
  ApiOperation({ summary: "signin" })
);

//* Signout user decorator
export const SignoutUserDecorator = applyDecorators(
  UseGuards(JwtGuard),
  ApiBearerAuth("Authorization"),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiForbiddenResponse({
    description: "This path is protected !!",
    schema: ForbiddenSchema,
  }),
  ApiUnauthorizedResponse({
    schema: UnauthorizedSchema,
    description: "Invalid refresh token",
  }),
  ApiOkResponse({ description: "Sign out success", schema: SuccessSchema }),
  ApiOperation({ summary: "signout" }),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  })
);

//* Refresh token decorator
export const RefreshTokenDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  ApiBearerAuth("Authorization"),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiUnauthorizedResponse({
    schema: UnauthorizedSchema,
    description: "Invalid refresh token",
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOkResponse({
    description: "Refreshed token success",
    schema: SuccessSchema,
  }),
  ApiOperation({ summary: "refresh access token" })
);

//* Forgot password Decorator
export const ForgotPasswordDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiConflictResponse({
    description: "Already send mail",
    schema: ConflictSchema,
  }),
  ApiOkResponse({
    description: "Sended reset password",
    schema: SuccessSchema,
  }),
  ApiOperation({ summary: "forgot password" })
);

//* Reset password decorator
export const ResetPasswordDecorator = applyDecorators(
  ApiNotFoundResponse({
    description: "Token not found",
    schema: NotFoundSchema,
  }),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOkResponse({
    description: "Reset password success",
    schema: SuccessSchema,
  }),
  ApiParam({
    name: "userId",
    description: "The userId of the token",
    type: "number",
  }),
  ApiParam({ name: "token", description: "The token", type: "string" }),
  ApiOperation({ summary: "reset password" }),
  HttpCode(HttpStatus.OK)
);

//* Send verify email decorator
export const SendVerifyEmailDecorator = applyDecorators(
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConflictResponse({
    description: "Already verify email",
    schema: ConflictSchema,
  }),
  ApiOkResponse({
    description: "Send verify email success",
    schema: SuccessSchema,
  }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestBodySchema,
  }),
  ApiOperation({ summary: "verify email" }),
  HttpCode(HttpStatus.OK)
);

//* Verify email decorator
export const VerifyEmailDecorator = applyDecorators(
  ApiNotFoundResponse({
    description: "Token not found | User not found",
    schema: NotFoundSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConflictResponse({
    description: "Already verify email",
    schema: ConflictSchema,
  }),
  ApiOkResponse({
    description: "Verified email success",
    schema: SuccessSchema,
  }),
  ApiParam({
    name: "userId",
    description: "The userId of the token",
    type: "number",
  }),
  ApiParam({ name: "token", description: "The token", type: "string" }),
  ApiOperation({ summary: "verified user email by token" })
);

//* Google auth decorator
export const GoogleAuthDecorator = applyDecorators(
  UseGuards(AuthGuard("google")),
  ApiOperation({ summary: "authentication with google" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Google redirect decorator
export const GoogleRedirectDecorator = applyDecorators(
  UseGuards(AuthGuard("google")),
  ApiUnauthorizedResponse({
    schema: UnauthorizedSchema,
    description: "unauthorized",
  }),
  ApiInternalServerErrorResponse({
    schema: InternalServerErrorSchema,
    description: "Internal Server Error",
  }),
  ApiOkResponse({ description: "Authorized success", schema: SuccessSchema }),
  ApiOperation({ summary: "redirect user from google" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);
