import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { UsersMessages } from "../../common/enums/usersMessages.enum";
import { pagination } from "../../common/utils/pagination.util";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import * as bcrypt from "bcrypt";
import { ChangeSuperAdminDto } from "./dto/change-super-admin.dto";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { BanUserDto } from "./dto/ban-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../auth/entities/user.entity";
import { FindManyOptions, Like, Repository } from "typeorm";
import { AuthMessages } from "../../common/enums/authMessages.enum";
import { BanUser } from "../auth/entities/banUser.entity";
import { Bookmark } from "../movies/entities/bookmark.entity";
import { Roles } from "../../common/enums/roles.enum";
import { ChangeRoleDto } from "./dto/change-role.dto";
import { S3Service } from "../s3/s3.service";

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(BanUser)
    private readonly banUserRepository: Repository<BanUser>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @Inject(forwardRef(() => S3Service)) private readonly s3Service: S3Service
  ) {}

  async findAllUsers(
    page?: number,
    limit?: number
  ): Promise<PaginatedList<User>> {
    const usersCache: User[] | undefined = await this.redisCache.get("users");

    if (usersCache) {
      return pagination(limit, page, usersCache);
    }

    const options: FindManyOptions<User> = {
      order: { createdAt: "DESC" },
    };

    const users = await this.userRepository.find(options);

    await this.redisCache.set("users", users, 30_000);

    return pagination(limit, page, users);
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
    if (!Object.keys(updateUserDto).length && !file) {
      throw new BadRequestException(AuthMessages.BodyCannotBeEmpty);
    }

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

    let avatarURL: string | null = null;

    if (file) {
      const avatar = await this.s3Service.uploadFile(file, "users-avatar");
      avatarURL = avatar.Location;
    }

    await this.userRepository.update(
      { id: user.id },
      {
        ...updateUserDto,
        avatarURL: avatarURL || undefined,
      }
    );

    if (file && !user.avatarURL.includes("custom-avatar")) {
      await this.s3Service.deleteFile(user.avatarURL);
    }

    return UsersMessages.UpdatedSuccess;
  }

  async removeUser(userId: number, user: User): Promise<string> {
    const foundUser = await this.userRepository.findOneBy({ id: userId });

    if (!foundUser) throw new NotFoundException(UsersMessages.NotFound);

    if (foundUser.role == Roles.ADMIN && user.role !== Roles.SUPER_ADMIN) {
      throw new BadRequestException(UsersMessages.CannotRemoveAdmin);
    }

    if (foundUser.role == Roles.SUPER_ADMIN) {
      throw new BadRequestException(UsersMessages.CannotRemoveSuperAdmin);
    }

    await this.userRepository.remove(foundUser);

    if (!user.avatarURL.includes("custom-avatar")) {
      await this.s3Service.deleteFile(user.avatarURL);
    }

    await this.redisCache.del(`userRefreshToken:${userId}`);

    return UsersMessages.RemovedSuccess;
  }

  async changeRoleUser(
    userId: number,
    changeRoleDto: ChangeRoleDto
  ): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException(UsersMessages.NotFound);

    if (user.role == Roles.SUPER_ADMIN) {
      throw new BadRequestException(UsersMessages.CannotChangeRoleSuperAdmin);
    }

    if (changeRoleDto.role === Roles.SUPER_ADMIN) {
      throw new ForbiddenException(UsersMessages.SuperAdminRoleNotAllowed);
    }

    user.role = changeRoleDto.role;

    await this.userRepository.save(user);

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

    const cacheKey = `searchUsers_${userQuery}`;

    const usersCache = await this.redisCache.get<User[] | undefined>(cacheKey);

    if (usersCache) {
      return pagination(limit, page, usersCache);
    }

    const options: FindManyOptions<User> = {
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
      order: { createdAt: "DESC" },
    };

    const users = await this.userRepository.find(options);
    await this.redisCache.set(cacheKey, users, 30_000);

    return pagination(limit, page, users);
  }

  async deleteAccount(user: User, dto: DeleteAccountDto): Promise<string> {
    const foundUser = (await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      select: ["id", "password"],
    })) as User;

    if (user.role == Roles.SUPER_ADMIN) {
      throw new BadRequestException(
        UsersMessages.TransferOwnershipForDeleteAccount
      );
    }

    const comparePassword = bcrypt.compareSync(
      dto.password,
      foundUser.password ?? ""
    );

    if (!comparePassword) {
      throw new BadRequestException(UsersMessages.InvalidPassword);
    }

    await this.userRepository.remove(user);
    if (!user.avatarURL.includes("custom-avatar")) {
      await this.s3Service.deleteFile(user.avatarURL);
    }
    await this.redisCache.del(`userRefreshToken:${user.id}`);

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

    if (existingUser.role == Roles.SUPER_ADMIN) {
      throw new BadRequestException(UsersMessages.EnteredIdIsSuperAdmin);
    }

    const comparePassword = bcrypt.compareSync(
      dto.password,
      currentSuperAdmin.password ?? ""
    );

    if (!comparePassword) {
      throw new BadRequestException(UsersMessages.InvalidPassword);
    }

    await this.userRepository.update(
      { id: userId },
      { role: Roles.SUPER_ADMIN }
    );

    await this.userRepository.update(
      { id: currentSuperAdmin.id },
      { role: Roles.ADMIN }
    );

    return UsersMessages.OwnershipTransferSuccess;
  }

  async banUser(banUserDto: BanUserDto, user: User): Promise<string> {
    const existingUser = await this.userRepository.findOneBy(banUserDto);

    if (!existingUser) {
      throw new NotFoundException(UsersMessages.NotFound);
    }

    if (existingUser.role == Roles.SUPER_ADMIN) {
      throw new ForbiddenException(UsersMessages.CannotBanSuperAdmin);
    }

    if (user.role !== Roles.SUPER_ADMIN && existingUser.role == Roles.ADMIN) {
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

    if (!existingBanUser.bannedBy && user.role !== Roles.SUPER_ADMIN) {
      throw new ConflictException(UsersMessages.OnlySuperAdminCanUnbanUser);
    }

    if (existingBanUser.bannedBy)
      if (
        user.id !== existingBanUser.bannedBy.id &&
        user.role !== Roles.SUPER_ADMIN
      ) {
        throw new ForbiddenException(UsersMessages.CannotUnbanUser);
      }

    await this.banUserRepository.delete({ id });

    return UsersMessages.BanUserSuccess;
  }

  async findAllBan(
    limit?: number,
    page?: number
  ): Promise<PaginatedList<BanUser>> {
    const usersCache: BanUser[] | undefined = await this.redisCache.get(
      "banUsers"
    );

    if (usersCache) {
      return pagination(limit, page, usersCache);
    }

    const options: FindManyOptions<BanUser> = {
      relations: ["bannedBy"],
      order: { createdAt: "DESC" },
    };

    const users = await this.banUserRepository.find(options);

    await this.redisCache.set("banUsers", users, 30_000);

    return pagination(limit, page, users);
  }

  async getMyBookmarks(
    user: User,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Bookmark>> {
    const bookmarksCache = await this.redisCache.get<Bookmark[] | undefined>(
      `userBookmarks:${user.id}`
    );

    if (bookmarksCache) {
      return pagination(limit, page, bookmarksCache);
    }

    const bookmarks = await this.bookmarkRepository
      .createQueryBuilder("bookmarks")
      .leftJoinAndSelect("bookmarks.movie", "bookmark")
      .getMany();

    await this.redisCache.set(`userBookmarks:${user.id}`, bookmarks);

    return pagination(limit, page, bookmarks);
  }
}
