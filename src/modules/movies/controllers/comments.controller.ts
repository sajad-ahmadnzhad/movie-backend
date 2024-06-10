import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { UserDecorator } from "../../../modules/users/decorators/currentUser.decorator";
import { User } from "../../../modules/users/schemas/User.schema";
import { CommentsService } from "../services/comments.service";
import { CreateCommentDecorator } from "../../../common/decorators/comments.decorator";
import { IsValidObjectIdPipe } from "../../../common/pipes/isValidObjectId.pipe";

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
    

    @Post('reply/:id')
    reply(
        @Param('id', IsValidObjectIdPipe) id: string,
        
    ) {
        
    }
}
