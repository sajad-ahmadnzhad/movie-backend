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
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { UserDecorator } from "../../../modules/users/decorators/currentUser.decorator";
import { CommentsService } from "../services/comments.service";
import {
  AcceptCommentDecorator,
  CreateCommentDecorator,
  ReplyCommentDecorator,
  RejectCommentDecorator,
  UpdateCommentDecorator,
  GetUnacceptedCommentDecorator,
  RemoveCommentDecorator,
  GetMovieCommentsDecorator,
  MarkAsReviewedDecorator,
} from "../../../common/decorators/comments.decorator";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";
import { UpdateCommentDto } from "../dto/comments/update-comment.dto";
import { User } from "../../auth/entities/user.entity";
import { Throttle } from "@nestjs/throttler";

@Controller({
  path: "comments",
  version: "1",
})
@ApiTags("comments")
@Throttle({ default: { ttl: 60_000, limit: 50 } })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Post()
  @CreateCommentDecorator
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.create(createCommentDto, user);

    return { message: success };
  }

  @Post("reply/:id")
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ReplyCommentDecorator
  async reply(
    @Param("id", ParseIntPipe) id: number,
    @Body() replyCommentDto: ReplyCommentDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.reply(id, replyCommentDto, user);

    return { message: success };
  }

  @Put("accept/:id")
  @AcceptCommentDecorator
  async accept(
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.accept(id, user);

    return { message: success };
  }

  @Put("reject/:id")
  @RejectCommentDecorator
  async reject(
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.reject(id, user);

    return { message: success };
  }

  @Get("movie-comments/:id")
  @GetMovieCommentsDecorator
  getMoviesComments(
    @Param("id", ParseIntPipe) id: number,
    @Query("page", new ParseIntPipe({ optional: true })) page: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number
  ) {
    return this.commentsService.getMovieComments(id, limit, page);
  }

  @Get("unaccepted-comments")
  @GetUnacceptedCommentDecorator
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
    @Param("id", ParseIntPipe) id: number,
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

  @Patch(":id/review")
  @MarkAsReviewedDecorator
  async markAsReviewed(
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ) {
    const success = await this.commentsService.markAsReviewed(id, user);

    return { message: success };
  }

  @Delete(":id")
  @RemoveCommentDecorator
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.commentsService.remove(id, user);
    return { message: success };
  }
}
