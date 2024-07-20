export enum GenresMessages {
  CreatedGenreSuccess = "Genre created successfully",
  AlreadyExistsGenre = "Genre with this name already exists",
  NotFoundGenre = "Genre not found",
  UpdatedGenreSuccess = "Genre updated successfully",
  CannotUpdateGenre = "You are not allowed to update this genre",
  CannotRemoveGenre = "You are not allowed to remove this genre",
  RemoveGenreSuccess = "Genre removed successfully",
  RequiredGenreQuery = 'Genre query is required',
  OnlySuperAdminCanUpdateGenre = 'Only a super admin can update a genre when the main admin has been deleted',
  OnlySuperAdminCanRemoveGenre = 'Only a super admin can remove a genre when the main admin has been deleted'
}
