export enum UsersMessages {
  NotFound = "User not found",
  UpdatedSuccess = "User updated successfully",
  RemovedSuccess = "Removed user successfully",
  CannotRemoveAdmin = "You do not have permission to remove the administrator",
  CannotRemoveSuperAdmin = "You cannot remove super admin",
  CannotChangeRoleSuperAdmin = "You cannot change your role",
  ChangeRoleSuccess = "Changed role successfully",
  RequiredUser = "Required user query",
  InvalidPassword = "Password is not valid",
  DeletedAccountSuccess = "Deleted account successfully",
  TransferOwnershipForDeleteAccount = "To delete your account, transfer ownership first",
  OwnershipTransferSuccess = "The ownership transfer was successful",
  EnteredIdIsSuperAdmin = "The entered ID is super admin",
  BanUserSuccess = "User banned successfully",
  UnBanUserSuccess = "User unbanned successfully",
  CannotBanAdmin = "You cannot ban admin",
  CannotBanSuperAdmin = "You cannot ban super admin",
  CannotUnbanUser = "You cannot unban user",
  AlreadyBannedUser = "This user already banned",
}
