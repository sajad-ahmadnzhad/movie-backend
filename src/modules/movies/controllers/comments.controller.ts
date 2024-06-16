import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { UserDecorator } from "../../../modules/users/decorators/currentUser.decorator";
import { User } from "../../../modules/users/schemas/User.schema";
import { CommentsService } from "../services/comments.service";
import {
  AcceptCommentDecorator,
  CreateCommentDecorator,
  ReplyCommentDecorator,
  RejectCommentDecorator,
  UpdateCommentDecorator,
} from "../../../common/decorators/comments.decorator";
import { IsValidObjectIdPipe } from "../../../common/pipes/isValidObjectId.pipe";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";
import { UpdateCommentDto } from "../dto/comments/update-comment.dto";
import { AuthGuard } from "../../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../../modules/auth/guards/isAdmin.guard";

@Controller("comments")
@ApiTags("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Post()
  @CreateCommentDecorator
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.create(createCommentDto, user);

    return { message: success };
  }

  @Post("reply/:id")
  @ReplyCommentDecorator
  async reply(
    @Param("id", IsValidObjectIdPipe) id: string,
    @Body() replyCommentDto: ReplyCommentDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.reply(id, replyCommentDto, user);

    return { message: success };
  }

  @Put("accept/:id")
  @AcceptCommentDecorator
  async accept(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.accept(id, user);

    return { message: success };
  }

  @Put("reject/:id")
  @RejectCommentDecorator
  async reject(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.reject(id, user);

    return { message: success };
  }

  @Get("movie-comments/:id")
  getMoviesComments(
    @Param("id", IsValidObjectIdPipe) id: string,
    @Query("page", new ParseIntPipe({ optional: true })) page: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number
  ) {
    return this.commentsService.getMovieComments(id, limit, page);
  }

  @Get("unaccepted-comments/:id")
  @UseGuards(AuthGuard, IsAdminGuard)
  getUnacceptedComments(
    @Query("page", new ParseIntPipe({ optional: true })) page: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number,
    @UserDecorator() user: User
  ) {
    return this.commentsService.getUnacceptedComments(user, limit, page);
  }

  @Patch(":id")
  @UpdateCommentDecorator
  async update(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User,
    @Body() updateCommentDto: UpdateCommentDto
  ): Promise<{ message: string }> {
    const success = await this.commentsService.update(
      id,
      updateCommentDto,
      user
    );

    return { message: success };
  }
}
