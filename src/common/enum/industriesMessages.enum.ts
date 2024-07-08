export enum IndustriesMessages {
  CreatedIndustrySuccess = "Industry created successfully",
  AlreadyExistsIndustry = "Industry with this name already exists",
  NotFoundIndustry = "Industry not found",
  UpdatedIndustrySuccess = "Industry updated successfully",
  CannotUpdateIndustry = "You are not allowed to update this industry",
  CannotRemoveIndustry = "You are not allowed to remove this industry",
  RemoveIndustrySuccess = "Industry removed successfully",
  RequiredIndustryQuery = "Industry query is required",
  OnlySuperAdminCanUpdateIndustry = "Only a super admin can update a industry when the main admin has been deleted",
  OnlySuperAdminCanRemoveIndustry = "Only a super admin can remove a industry when the main admin has been deleted",
}
