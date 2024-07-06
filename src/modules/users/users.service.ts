import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { UsersMessages } from "../../common/enum/usersMessages.enum";
import {
  cachePagination,
  typeORMPagination,
} from "../../common/utils/pagination.util";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import * as bcrypt from "bcrypt";
import { ChangeSuperAdminDto } from "./dto/change-super-admin.dto";
import { saveFile } from "../../common/utils/upload-file.util";
import { removeFile, sendError } from "../../common/utils/functions.util";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { BanUserDto } from "./dto/ban-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../auth/entities/User.entity";
import { Like, Repository } from "typeorm";
import { AuthMessages } from "../../common/enum/authMessages.enum";
import { BanUser } from "../auth/entities/banUser.entity";

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(BanUser)
    private readonly banUserRepository: Repository<BanUser>
  ) {}

  async findAllUsers(
    page?: number,
    limit?: number
  ): Promise<PaginatedList<User>> {
    const usersCache: User[] | undefined = await this.redisCache.get("users");

    if (usersCache) {
      return cachePagination(limit, page, usersCache);
    }

    const paginatedUsers = await typeORMPagination(
      limit,
      page,
      this.userRepository
    );

    const users = await this.userRepository.find();

    await this.redisCache.set("users", users, 30_000);

    return paginatedUsers;
  }

  async findUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

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
    const findDuplicatedKey = await this.userRepository
      .createQueryBuilder("user")
      .where("user.email = :email OR user.username = :username", {
        email: updateUserDto.email,
        username: updateUserDto.username,
      })
      .andWhere("user.id != :id", { id: user.id })
      .getOne();

    if (findDuplicatedKey) {
      throw new ConflictException(AuthMessages.AlreadyRegistered);
    }

    let avatarURL: string | undefined = file && saveFile(file, "user-avatar");

    if (avatarURL) avatarURL = `/uploads/user-avatar/${avatarURL}`;

    try {
      await this.userRepository.update(
        { id: user.id },
        {
          ...updateUserDto,
          avatarURL,
        }
      );
    } catch (error) {
      removeFile(avatarURL);
      throw sendError(error.message, error.status);
    }

    return UsersMessages.UpdatedSuccess;
  }

  async removeUser(userId: number, user: User): Promise<string> {
    const foundUser = await this.userRepository.findOneBy({ id: userId });

    if (!foundUser) throw new NotFoundException(UsersMessages.NotFound);

    if (foundUser.isAdmin && !user.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.CannotRemoveAdmin);
    }

    if (foundUser.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.CannotRemoveSuperAdmin);
    }

    await this.userRepository.remove(foundUser);

    return UsersMessages.RemovedSuccess;
  }

  async changeRoleUser(userId: number): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException(UsersMessages.NotFound);

    if (user.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.CannotChangeRoleSuperAdmin);
    }

    await this.userRepository.update(
      { id: user.id },
      { isAdmin: !user.isAdmin }
    );

    return UsersMessages.ChangeRoleSuccess;
  }

  async searchUser(
    userQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<User>> {
    if (!userQuery?.trim()) {
      throw new BadRequestException(UsersMessages.RequiredUser);
    }

    const options = {
      where: [
        {
          name: Like(`%${userQuery}%`),
        },
        {
          username: Like(`%${userQuery}%`),
        },
        {
          email: Like(`%${userQuery}%`),
        },
      ],
    };

    const paginatedUsers = typeORMPagination(
      limit,
      page,
      this.userRepository,
      options
    );

    return paginatedUsers;
  }

  async deleteAccount(user: User, dto: DeleteAccountDto): Promise<string> {
    const foundUser = (await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      select: ["id", "password"],
    })) as User;

    if (user.isSuperAdmin) {
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

    await this.userRepository.delete({ id: foundUser.id });
    await this.redisCache.del(`userRefreshToken:${foundUser.id}`);

    return UsersMessages.DeletedAccountSuccess;
  }

  async changeSuperAdmin(
    userId: number,
    dto: ChangeSuperAdminDto,
    user: User
  ): Promise<string> {
    const existingUser = await this.userRepository.findOneBy({ id: userId });

    if (!existingUser) throw new NotFoundException(UsersMessages.NotFound);

    const currentSuperAdmin = (await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      select: ["id", "password"],
    })) as User;

    if (existingUser.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.EnteredIdIsSuperAdmin);
    }

    const comparePassword = bcrypt.compareSync(
      dto.password,
      currentSuperAdmin.password
    );

    if (!comparePassword) {
      throw new BadRequestException(UsersMessages.InvalidPassword);
    }

    await this.userRepository.update(
      { id: userId },
      { isAdmin: true, isSuperAdmin: true }
    );
    await this.userRepository.update(
      { id: currentSuperAdmin.id },
      { isSuperAdmin: false }
    );

    return UsersMessages.OwnershipTransferSuccess;
  }

  async banUser(banUserDto: BanUserDto, user: User): Promise<string> {
    const existingUser = await this.userRepository.findOneBy(banUserDto);

    if (!existingUser) {
      throw new NotFoundException(UsersMessages.NotFound);
    }

    if (existingUser.isSuperAdmin) {
      throw new ForbiddenException(UsersMessages.CannotBanSuperAdmin);
    }

    if (!user.isSuperAdmin && existingUser.isAdmin) {
      throw new ForbiddenException(UsersMessages.CannotBanAdmin);
    }

    const alreadyBanUser = await this.banUserRepository.findOneBy(banUserDto);

    if (alreadyBanUser) {
      throw new ConflictException(UsersMessages.AlreadyBannedUser);
    }

    const newBanUser = this.banUserRepository.create({
      ...banUserDto,
      bannedBy: user,
    });

    await this.banUserRepository.save(newBanUser);

    return UsersMessages.BanUserSuccess;
  }

  async unbanUser(id: number, user: User): Promise<string> {
    const existingBanUser = await this.banUserRepository.findOne({
      where: { id },
      relations: ["bannedBy"],
    });

    if (!existingBanUser) {
      throw new NotFoundException(UsersMessages.NotFound);
    }

    if (!existingBanUser.bannedBy && !user.isSuperAdmin) {
      //TODO: Add a good message for this error
      throw new ConflictException(
        "Access to remove this user only for super admin"
      );
    }

    if (existingBanUser.bannedBy)
      if (user.id !== existingBanUser.bannedBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(UsersMessages.CannotUnbanUser);
      }

    await this.banUserRepository.delete({ id });

    return UsersMessages.BanUserSuccess;
  }

  async findAllBan(
    limit?: number,
    page?: number
  ): Promise<PaginatedList<BanUser>> {
    const usersCache: BanUser[] | undefined =
      await this.redisCache.get("banUsers");

    if (usersCache) {
      return cachePagination(limit, page, usersCache);
    }

    const options = {
      relations: ["bannedBy"],
    };

    const paginatedUsers = await typeORMPagination(
      limit,
      page,
      this.banUserRepository,
      options
    );

    const users = await this.banUserRepository.find(options);

    await this.redisCache.set("banUsers", users, 30_000);

    return paginatedUsers;
  }

  //TODO: Create bookmark table
  // getMyBookmarks(
  //   user: MongooseUser,
  //   limit?: number,
  //   page?: number
  // ): Promise<PaginatedList<Bookmark>> {
  // const query = this.bookmarkModel.find({ userId: user._id });
  //   const paginatedBookmarks = mongoosePagination(
  //     limit,
  //     page,
  //     query,
  //     // this.bookmarkModel
  //   );

  //   return paginatedBookmarks;
  // }
}
