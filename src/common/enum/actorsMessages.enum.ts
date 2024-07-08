export enum ActorsMessages {
  CreatedActorSuccess = "Actor created successfully",
  AlreadyExistsActor = "Actor with this name already exists",
  NotFoundActor = "Actor not found",
  UpdatedActorSuccess = "Actor updated successfully",
  CannotUpdateActor = "You are not allowed to update this actor",
  CannotRemoveActor = "You are not allowed to remove this actor",
  RemoveActorSuccess = "Actor removed successfully",
  RequiredActorQuery = "Actor query is required",
  OnlySuperAdminCanUpdateActor = "Only a super admin can update a Actor when the main admin has been deleted",
  OnlySuperAdminCanRemoveActor = "Only a super admin can remove a Actor when the main admin has been deleted",
}
