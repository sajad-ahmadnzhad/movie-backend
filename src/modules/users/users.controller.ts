import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Query,
  ParseIntPipe,
  Res,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { User } from "./schemas/User.schema";
import { IsValidObjectIdPipe } from "../../common/pipes/isValidObjectId.pipe";
import { UserDecorator } from "./decorators/currentUser.decorator";
import { Express, Response } from "express";
import {
  BanUserDecorator,
  ChangeRoleUserDecorator,
  ChangeSuperAdminDecorator,
  DeleteAccountUserDecorator,
  GetAllBanUserDecorator,
  GetAllUsersDecorator,
  GetMeDecorator,
  GetMyBookmarksDecorator,
  GetOneUserDecorator,
  RemoveUserDecorator,
  SearchUserDecorator,
  UnbanUserDecorator,
  UpdateUserDecorator,
} from "../../common/decorators/users.decorator";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import { ChangeSuperAdminDto } from "./dto/change-super-admin.dto";
import { Throttle } from "@nestjs/throttler";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { BanUserDto } from "./dto/ban-user.dto";
import { BanUser } from "./schemas/BanUser.schema";
import { Bookmark } from "../movies/schemas/Bookmark.schema";

@Controller("users")
@ApiTags("users")
@ApiCookieAuth()
@Throttle({ default: { limit: 20, ttl: 60_000 } })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @GetMeDecorator
  getMe(@UserDecorator() user: User): User {
    return user;
  }

  @Get()
  @GetAllUsersDecorator
  findAllUsers(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<User>> {
    return this.usersService.findAllUsers(page, limit);
  }

  @Get("search")
  @SearchUserDecorator
  searchUser(
    @Query("user") user: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<User>> {
    return this.usersService.searchUser(user, limit, page);
  }

  @Patch("ban")
  @BanUserDecorator
  async banUser(
    @UserDecorator() user: User,
    @Body() banUserDto: BanUserDto
  ): Promise<{ message: string }> {
    const success = await this.usersService.banUser(banUserDto, user);
    return { message: success };
  }

  @Patch("unban/:id")
  @UnbanUserDecorator
  async unbanUser(
    @UserDecorator() user: User,
    @Param("id", IsValidObjectIdPipe) id: string
  ): Promise<{ message: string }> {
    const success = await this.usersService.unbanUser(id, user);
    return { message: success };
  }

  @Get("ban")
  @GetAllBanUserDecorator
  getAllBans(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<BanUser>> {
    return this.usersService.findAllBan(limit, page);
  }

  @Get("bookmark")
  @GetMyBookmarksDecorator
  getMyBookmarks(
    @UserDecorator() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Bookmark>> {
    return this.usersService.getMyBookmarks(user, limit, page);
  }

  @Get(":userId")
  @GetOneUserDecorator
  findUser(
    @Param("userId", IsValidObjectIdPipe) userId: string
  ): Promise<User> {
    return this.usersService.findUser(userId);
  }

  @Patch()
  @UpdateUserDecorator
  async update(
    @UserDecorator() user: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<{ message: string }> {
    const success = await this.usersService.update(user, updateUserDto, file);

    return { message: success };
  }

  @Delete("delete-account")
  @DeleteAccountUserDecorator
  async deleteAccount(
    @UserDecorator() user: User,
    @Body() deleteAccountDto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const success = await this.usersService.deleteAccount(
      user,
      deleteAccountDto
    );

    res.clearCookie("accessToken");
    return { message: success };
  }

  @Delete(":userId")
  @RemoveUserDecorator
  async removeUser(
    @Param("userId", IsValidObjectIdPipe) userId: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.usersService.removeUser(userId, user);

    return { message: success };
  }

  @Patch("change-role/:userId")
  @ChangeRoleUserDecorator
  async changeRoleUser(
    @Param("userId", IsValidObjectIdPipe) userId: string
  ): Promise<{ message: string }> {
    const success = await this.usersService.changeRoleUser(userId);

    return { message: success };
  }

  @Patch("change-super-admin/:userId")
  @ChangeSuperAdminDecorator
  async changeSuperAdmin(
    @Param("userId", IsValidObjectIdPipe) userId: string,
    @Body() changeSuperAdminDto: ChangeSuperAdminDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.usersService.changeSuperAdmin(
      userId,
      changeSuperAdminDto,
      user
    );

    return { message: success };
  }
}
