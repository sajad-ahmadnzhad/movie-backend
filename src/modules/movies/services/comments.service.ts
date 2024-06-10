import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { User } from "../../../modules/users/schemas/User.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie } from "../schemas/Movie.schema";
import { MoviesService } from "./movies.service";
import { Comment } from "../schemas/Comment.schema";
import { CommentsMessages } from "../../../common/enum/moviesMessages.enum";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";
import { ICreatedBy } from "src/common/interfaces/public.interface";

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    private readonly moviesService: MoviesService
  ) {}
  async create(
    createCommentDto: CreateCommentDto,
    user: User
  ): Promise<string> {
    await this.moviesService.checkExistMovieById(createCommentDto.movieId);

    await this.commentModel.create({
      ...createCommentDto,
      userId: user._id,
    });

    return CommentsMessages.CreatedCommentSuccess;
  }

  async reply(
    id: string,
    replyCommentDto: ReplyCommentDto,
    user: User
  ): Promise<string> {
    const existingComment = await this.checkExistComment(id);

    if (!existingComment.isAccept) {
      throw new ConflictException(CommentsMessages.NotAcceptedComment);
    }

    const reply = await this.commentModel.create({
      ...replyCommentDto,
      parentId: id,
      userId: user._id,
      movieId: existingComment.movieId,
    });

    await existingComment.updateOne({
      $push: { replies: reply._id },
    });

    return CommentsMessages.ReplyCommentSuccess;
  }

  async accept(id: string, user: User): Promise<string> {
    const existingComment = await this.checkExistComment(id);

    if (existingComment.isAccept) {
      throw new ConflictException(CommentsMessages.AlreadyAcceptedComment);
    }

    const movie = (await this.movieModel.findById(
      existingComment.movieId
    )) as ICreatedBy<Movie>;

    if (String(user._id) !== String(movie?.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(CommentsMessages.CannotAcceptComment);
    }

    await existingComment.updateOne({
      isReject: false,
      isAccept: true,
    });

    return CommentsMessages.AcceptedCommentSuccess;
  }

  private async checkExistComment(id: string): Promise<Comment> {
    const existingComment = await this.commentModel.findById(id);
    if (!existingComment) {
      throw new NotFoundException(CommentsMessages.NotFoundComment);
    }

    return existingComment;
  }
}
