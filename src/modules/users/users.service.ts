import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/User.schema";
import { Model } from "mongoose";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { UsersMessages } from "../../common/enum/usersMessages.enum";
import {
  cachePagination,
  mongoosePagination,
} from "../../common/utils/pagination.util";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import * as bcrypt from "bcrypt";
import { ChangeSuperAdminDto } from "./dto/change-super-admin.dto";
import { saveFile } from "../../common/utils/upload-file.util";
import { removeFile, sendError } from "../../common/utils/functions.util";
import { PaginatedList } from "../../common/interfaces/public.interface";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<User>,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache
  ) {}

  async findAllUsers(
    page?: number,
    limit?: number
  ): Promise<PaginatedList<User>> {
    const usersCache: User[] | undefined = await this.redisCache.get("users");

    if (usersCache) {
      return cachePagination(limit, page, usersCache);
    }

    const query = this.usersModel.find();

    const searchResult = await mongoosePagination(
      limit,
      page,
      query,
      this.usersModel
    );

    const users = await this.usersModel.find();

    await this.redisCache.set("users", users, 30_000);

    return searchResult;
  }

  async findUser(userId: string): Promise<User> {
    const user = await this.usersModel.findById(userId);

    if (!user) {
      throw new NotFoundException(UsersMessages.NotFound);
    }

    return user;
  }

  async update(
    user: User,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File
  ): Promise<string> {
    let avatarURL: string | undefined = file && saveFile(file, "user-avatar");

    if (avatarURL) avatarURL = `/uploads/user-avatar/${avatarURL}`;

    try {
      await this.usersModel.updateOne(
        { email: user.email },
        {
          $set: { ...updateUserDto, avatarURL },
        }
      );
    } catch (error) {
      removeFile(avatarURL);
      throw sendError(error.message, error.status);
    }

    return UsersMessages.UpdatedSuccess;
  }

  async removeUser(userId: string, user: User): Promise<string> {
    const foundUser = await this.usersModel.findById(userId);

    if (!foundUser) throw new NotFoundException(UsersMessages.NotFound);

    if ((foundUser.isAdmin && !user.isSuperAdmin) || foundUser.isAdmin) {
      throw new BadRequestException(UsersMessages.CannotRemoveAdmin);
    }

    if (foundUser.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.CannotRemoveSuperAdmin);
    }

    await foundUser.deleteOne();

    return UsersMessages.RemovedSuccess;
  }

  async changeRoleUser(userId: string): Promise<string> {
    const user = await this.usersModel.findById(userId);

    if (!user) throw new NotFoundException(UsersMessages.NotFound);

    if (user.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.CannotChangeRoleSuperAdmin);
    }

    await user.updateOne({ isAdmin: !user.isAdmin });

    return UsersMessages.ChangeRoleSuccess;
  }

  async searchUser(user: string): Promise<Array<User>> {
    if (!user) {
      throw new BadRequestException(UsersMessages.RequiredUser);
    }

    const foundUsers = await this.usersModel.find({
      $or: [
        {
          name: { $regex: user },
          username: { $regex: user },
          email: { $regex: user },
        },
      ],
    });

    return foundUsers;
  }

  async deleteAccount(user: User, dto: DeleteAccountDto): Promise<string> {
    const foundUser = (await this.usersModel
      .findOne({ email: user.email })
      .select("password")) as User;

    if (foundUser.isSuperAdmin) {
      throw new BadRequestException(
        UsersMessages.TransferOwnershipForDeleteAccount
      );
    }

    const comparePassword = bcrypt.compareSync(
      dto.password,
      foundUser.password
    );

    if (!comparePassword) {
      throw new BadRequestException(UsersMessages.InvalidPassword);
    }

    await foundUser.deleteOne();

    return UsersMessages.DeletedAccountSuccess;
  }

  async changeSuperAdmin(
    userId: string,
    dto: ChangeSuperAdminDto,
    user: User
  ): Promise<string> {
    const existingUser = await this.usersModel.findById(userId);

    if (!existingUser) throw new NotFoundException(UsersMessages.NotFound);

    const foundUser = (await this.usersModel
      .findById(user._id)
      .select("password")) as User;

    if (existingUser.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.EnteredIdIsSuperAdmin);
    }

    const comparePassword = bcrypt.compareSync(
      dto.password,
      foundUser.password
    );

    if (!comparePassword) {
      throw new BadRequestException(UsersMessages.InvalidPassword);
    }

    await existingUser.updateOne({ isAdmin: true, isSuperAdmin: true });
    await foundUser.updateOne({ isSuperAdmin: false });

    return UsersMessages.OwnershipTransferSuccess;
  }
}
