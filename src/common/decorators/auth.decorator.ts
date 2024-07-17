import {
  HttpCode,
  HttpStatus,
  UseGuards,
  applyDecorators,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "../../modules/auth/guards/auth.guard";
import {
  BadRequestBodySchema,
  BadRequestParamSchema,
  ConflictSchema,
  ForbiddenSchema,
  JwtExpiredSchema,
  NotFoundSchema,
  SuccessSchema,
  TooManyRequests,
} from "../swagger/schemas/public.schema";

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
  ApiOperation({ summary: "Sign Up new user" })
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
  ApiOperation({ summary: "User signin" })
);

//* Signout user decorator
export const SignoutUserDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiCookieAuth(),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiBadRequestResponse({
    description: "Invalid access token",
    schema: BadRequestParamSchema,
  }),
  ApiForbiddenResponse({
    description: "This path is protected !!",
    schema: ForbiddenSchema,
  }),
  ApiOkResponse({ description: "Sign out success", schema: SuccessSchema }),
  ApiOperation({ summary: "User signout" }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
);

//* Refresh token decorator
export const RefreshTokenDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiBadRequestResponse({
    description: "Invalid access token",
    schema: BadRequestParamSchema,
  }),
  ApiNotFoundResponse({
    description: "Refresh token not found",
    schema: NotFoundSchema,
  }),
  ApiOkResponse({
    description: "Refreshed token success",
    schema: SuccessSchema,
  }),
  ApiOperation({ summary: "Refresh access token" })
);

//* Forgot password Decorator
export const ForgotPasswordDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
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
  ApiOperation({ summary: "User forgot password" })
);

//* Reset password decorator
export const ResetPasswordDecorator = applyDecorators(
  ApiNotFoundResponse({
    description: "Token not found",
    schema: NotFoundSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOkResponse({
    description: "Reset password success",
    schema: SuccessSchema,
  }),
  ApiParam({ name: "userId", description: "The userId of the token", type: 'number' }),
  ApiParam({ name: "token", description: "The token" , type: 'string' }),
  ApiOperation({ summary: "User reset password" }),
  HttpCode(HttpStatus.OK)
);

//* Send verify email decorator
export const SendVerifyEmailDecorator = applyDecorators(
  ApiNotFoundResponse({
    description: "User not found",
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
    description: "Send verify email success",
    schema: SuccessSchema,
  }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestBodySchema,
  }),
  ApiOperation({ summary: "Send email for verify user" }),
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
  ApiParam({ name: "userId", description: "The userId of the token" , type: 'number' }),
  ApiParam({ name: "token", description: "The token" , type: 'string' }),
  ApiOperation({ summary: "Verified user by token" })
);
