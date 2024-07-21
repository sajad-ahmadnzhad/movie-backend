import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { CreateCommentDto } from "../dto/comments/create-comment.dot";
import { MoviesService } from "./movies.service";
import { CommentsMessages } from "../../../common/enums/moviesMessages.enum";
import { ReplyCommentDto } from "../dto/comments/reply-comment.dto";
import { PaginatedList } from "../../../common/interfaces/public.interface";
import { UpdateCommentDto } from "../dto/comments/update-comment.dto";
import { typeORMPagination } from "../../../common/utils/pagination.util";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "../entities/comment.entity";
import { Repository } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Movie } from "../entities/movie.entity";
import { Roles } from "../../../common/enums/roles.enum";

@Injectable()
export class CommentsService {
  constructor(
    @Inject(forwardRef(() => MoviesService))
    private readonly moviesService: MoviesService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {}
  async create(
    createCommentDto: CreateCommentDto,
    user: User
  ): Promise<string> {
    const { body, rating, movieId } = createCommentDto;

    const movie = await this.moviesService.checkExistMovieById(movieId);

    const isAdminMovie = movie.createdBy.id == user.id;

    const comment = this.commentRepository.create({
      creator: user,
      isAccept: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      isReviewed: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      body,
      movie,
      rating,
    });

    await this.commentRepository.save(comment);

    return CommentsMessages.CreatedCommentSuccess;
  }

  async reply(
    id: number,
    replyCommentDto: ReplyCommentDto,
    user: User
  ): Promise<string> {
    const existingComment = await this.checkExistCommentById(id);

    if (!existingComment.isAccept) {
      throw new ConflictException(CommentsMessages.NotAcceptedComment);
    }

    const movie = await this.moviesService.checkExistMovieById(
      existingComment.movie.id
    );

    const isAdminMovie = movie.createdBy.id == user.id;

    const reply = this.commentRepository.create({
      ...replyCommentDto,
      parentComment: existingComment,
      creator: user,
      movie,
      isAccept: isAdminMovie || user.role == Roles.SUPER_ADMIN,
      isReviewed: isAdminMovie || user.role == Roles.SUPER_ADMIN,
    });

    await this.commentRepository.save(reply);

    return CommentsMessages.ReplyCommentSuccess;
  }

  async accept(id: number, user: User): Promise<string> {
    const comment = await this.checkExistCommentById(id);

    if (comment.isAccept) {
      throw new ConflictException(CommentsMessages.AlreadyAcceptedComment);
    }

    if (
      user.id !== comment.movie?.createdBy.id &&
      user.role !== Roles.SUPER_ADMIN
    ) {
      throw new ForbiddenException(CommentsMessages.CannotAcceptComment);
    }

    await this.commentRepository.update(
      { id },
      { isReject: false, isAccept: true }
    );

    return CommentsMessages.AcceptedCommentSuccess;
  }

  async reject(id: number, user: User): Promise<string> {
    const comment = await this.checkExistCommentById(id);

    if (comment.isReject) {
      throw new ConflictException(CommentsMessages.AlreadyRejectedComment);
    }

    if (
      user.id !== comment.movie?.createdBy.id &&
      user.role !== Roles.SUPER_ADMIN
    ) {
      throw new ForbiddenException(CommentsMessages.CannotRejectComment);
    }

    await this.commentRepository.update(
      { id },
      {
        isReject: true,
        isAccept: false,
      }
    );

    return CommentsMessages.RejectedCommentSuccess;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: User
  ): Promise<string> {
    const { body, movieId, rating } = updateCommentDto;

    const comment = await this.checkExistCommentById(id);

    if (user.id !== comment.movie.createdBy.id)
      if (user.id !== comment.creator.id && user.role !== Roles.SUPER_ADMIN) {
        throw new ForbiddenException(CommentsMessages.CannotUpdateComment);
      }

    const movie: null | Movie = null;

    if (movieId) await this.moviesService.checkExistMovieById(movieId);

    await this.commentRepository.update(
      { id },
      {
        movie: movie || undefined,
        body,
        rating,
        isAccept: false,
        isEdit: true,
      }
    );

    return CommentsMessages.UpdatedCommentSuccess;
  }

  async getMovieComments(
    movieId: number,
    limit?: number,
    page?: number
  ): Promise<any> {
    const movie = await this.moviesService.checkExistMovieById(movieId);

    const rootComments = await this.commentRepository
      .createQueryBuilder("comment")
      .where("comment.movie.id = :movieId", { movieId })
      .andWhere("comment.isAccept = :isAccept", { isAccept: true })
      .andWhere("comment.parentCommentId IS NULL")
      .getMany();

    const acceptedCommentsTree = await Promise.all(
      rootComments.map(async (rootComment) => {
        // ساختن QueryBuilder برای یافتن نوادگان
        const qb = this.commentRepository.manager
          .getTreeRepository(Comment)
          .createDescendantsQueryBuilder(
            "comment",
            "commentClosure",
            rootComment
          )
          .andWhere("comment.isAccept = :isAccept", { isAccept: true })
          .leftJoinAndSelect("comment.creator", "creator");

        const descendants = await qb.getMany();
        rootComment.replies = descendants;
        return rootComment;
      })
    );

    return acceptedCommentsTree;
  }

  // async getUnacceptedComments(
  //   user: User,
  //   limit?: number,
  //   page?: number
  // ): Promise<PaginatedList<Comment>> {
  //   const movies = await this.movieModel.find({ createdBy: user._id });

  //   const movieIds = movies.map((movie) => String(movie._id));

  //   const query = this.populateComments(
  //     this.commentModel.find({ isAccept: false, movieId: { $in: movieIds } })
  //   );

  //   const paginatedComments = await mongoosePagination(
  //     limit,
  //     page,
  //     query,
  //     this.commentModel
  //   );

  //   const commentIds = paginatedComments.data.map((comment) =>
  //     String(comment._id)
  //   );

  //   await this.commentModel.updateMany(
  //     {
  //       _id: {
  //         $in: commentIds,
  //       },
  //     },
  //     {
  //       isReviewed: true,
  //     }
  //   );

  //   return paginatedComments;
  // }

  async remove(id: number, user: User): Promise<string> {
    const comment = await this.checkExistCommentById(id);

    if (user.id !== comment.movie.createdBy.id)
      if (user.id !== comment.creator.id && user.role == Roles.SUPER_ADMIN) {
        throw new ForbiddenException(CommentsMessages.CannotRemoveComment);
      }

    await this.commentRepository.remove(comment);

    return CommentsMessages.RemovedCommentSuccess;
  }

  private async checkExistCommentById(id: number): Promise<Comment> {
    const existingComment = await this.commentRepository.findOne({
      where: { id },
      relations: ["movie"],
    });

    if (!existingComment) {
      throw new NotFoundException(CommentsMessages.NotFoundComment);
    }

    return existingComment;
  }
}
