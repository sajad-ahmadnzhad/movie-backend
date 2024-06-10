import { Body, Controller, Param, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { UserDecorator } from "../../../modules/users/decorators/currentUser.decorator";
import { User } from "../../../modules/users/schemas/User.schema";
import { CommentsService } from "../services/comments.service";
import {
  AcceptCommentDecorator,
  CreateCommentDecorator,
  ReplyCommentDecorator,
} from "../../../common/decorators/comments.decorator";
import { IsValidObjectIdPipe } from "../../../common/pipes/isValidObjectId.pipe";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";

@Controller("comments")
@ApiTags("movies")
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
}
