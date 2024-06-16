import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { User } from "../../../modules/users/schemas/User.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model } from "mongoose";
import { Movie } from "../schemas/Movie.schema";
import { MoviesService } from "./movies.service";
import { Comment } from "../schemas/Comment.schema";
import { CommentsMessages } from "../../../common/enum/moviesMessages.enum";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";
import {
  ICreatedBy,
  PaginatedList,
} from "../../../common/interfaces/public.interface";
import { UpdateCommentDto } from "../dto/comments/update-comment.dto";
import { mongoosePagination } from "../../../common/utils/pagination.util";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @Inject(forwardRef(() => MoviesService))
    private readonly moviesService: MoviesService
  ) {}
  async create(
    createCommentDto: CreateCommentDto,
    user: User
  ): Promise<string> {
    await this.moviesService.checkExistMovieById(createCommentDto.movieId);

    await this.commentModel.create({
      ...createCommentDto,
      creator: user._id,
    });

    return CommentsMessages.CreatedCommentSuccess;
  }

  async reply(
    id: string,
    replyCommentDto: ReplyCommentDto,
    user: User
  ): Promise<string> {
    const existingComment = await this.checkExistCommentById(id);

    if (!existingComment.isAccept) {
      throw new ConflictException(CommentsMessages.NotAcceptedComment);
    }

    const reply = await this.commentModel.create({
      ...replyCommentDto,
      parentComment: id,
      creator: user._id,
      movieId: existingComment.movieId,
    });

    await existingComment.updateOne({
      $push: { replies: reply._id },
    });

    return CommentsMessages.ReplyCommentSuccess;
  }

  async accept(id: string, user: User): Promise<string> {
    const existingComment = await this.checkExistCommentById(id);

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

  async reject(id: string, user: User): Promise<string> {
    const existingComment = await this.checkExistCommentById(id);

    if (existingComment.isReject) {
      throw new ConflictException(CommentsMessages.AlreadyRejectedComment);
    }

    const movie = (await this.movieModel.findById(
      existingComment.movieId
    )) as ICreatedBy<Movie>;

    if (String(user._id) !== String(movie?.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(CommentsMessages.CannotRejectComment);
    }

    await existingComment.updateOne({
      isReject: true,
      isAccept: false,
    });

    return CommentsMessages.RejectedCommentSuccess;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User
  ): Promise<string> {
    if (updateCommentDto.movieId)
      await this.moviesService.checkExistMovieById(updateCommentDto.movieId);

    const existingComment = await this.commentModel.findOne({
      _id: id,
      userId: user._id,
    });

    if (!existingComment) {
      throw new NotFoundException(CommentsMessages.NotFoundComment);
    }

    await existingComment.updateOne({
      ...updateCommentDto,
      isAccept: false,
      isEdit: true,
    });

    return CommentsMessages.UpdatedCommentSuccess;
  }

  async getMovieComments(
    movieId: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Comment>> {
    await this.moviesService.checkExistMovieById(movieId);

    const query = this.populateComments(
      this.commentModel.find({ movieId, isAccept: true })
    );

    const paginatedComments = await mongoosePagination(
      limit,
      page,
      query,
      this.commentModel
    );

    paginatedComments.data.flatMap((comment: any) => {
      comment.replies = comment.replies.filter((reply: any) => reply.isAccept);
      return comment;
    });

    return paginatedComments;
  }

  async getUnacceptedComments(
    user: User,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Comment>> {
    const movies = await this.movieModel.find({ createdBy: user._id });

    const moviesIds = movies.map((movie) => String(movie._id));

    const query = this.populateComments(
      this.commentModel.find({ isAccept: false, movieId: { $in: moviesIds } })
    );

    const paginatedComments = await mongoosePagination(
      limit,
      page,
      query,
      this.commentModel
    );

    return paginatedComments;
  }

  private async checkExistCommentById(id: string): Promise<Comment> {
    const existingComment = await this.commentModel.findById(id);
    if (!existingComment) {
      throw new NotFoundException(CommentsMessages.NotFoundComment);
    }

    return existingComment;
  }

  private populateComments(query: any) {
    return query
      .populate({
        path: "parentComment",
        select: "body creator",
        populate: { path: "creator", select: "name username avatarURL" },
      })
      .populate({
        path: "replies",
        select: "body creator isAccept",
        populate: { path: "creator", select: "name username avatarURL" },
      })
      .populate({
        path: "creator",
        select: "name username avatarURL",
      })
      .select("-movieId")
      .lean();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async removeRejectedComments(): Promise<void> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await this.commentModel
      .deleteMany({
        isReject: true,
        createdAt: { $lt: oneMonthAgo },
      })
      .exec();
  }
}
