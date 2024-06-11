export enum MoviesMessages {
  CreatedMovieSuccess = "Movies created successfully",
  NotFoundMovie = "Movie not found",
  RequiredMovieQuery = "Movie query is required",
  CannotRemoveMovie = "You are not allowed to remove this movie",
  RemovedMovieSuccess = "Movie removed successfully",
  UpdatedMovieSuccess = "Movie updated successfully",
  RequiredPosterAndVideo = "Poster and video is required",
  LikedMovieSuccess = "Movie liked successfully",
  UnlikedMovieSuccess = "Movie unliked successfully",
  UnBookmarkMovieSuccess = "Movie unBookmarked successfully",
  BookmarkMovieSuccess = "Movie bookmarked successfully",
  VisitMovieSuccess = "Movie was successfully visited",
}

export enum CommentsMessages {
  CreatedCommentSuccess = "Comment created successfully",
  NotFoundComment = "Comment not found",
  ReplyCommentSuccess = "Comment replied successfully",
  NotAcceptedComment = "This comment is not accepted",
  AlreadyAcceptedComment = "This comment already accepted",
  AcceptedCommentSuccess = "Comment accepted successfully",
  CannotAcceptComment = "You cannot accept this comment",
  CannotRejectComment = "You cannot reject this comment",
  RejectedCommentSuccess = "Comment rejected successfully",
  AlreadyRejectedComment = "This comment already rejected",
}
