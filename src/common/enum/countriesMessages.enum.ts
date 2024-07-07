export enum CountriesMessages {
  CreatedCountrySuccess = "Country created successfully",
  AlreadyExistsCountry = "Country with this name already exists",
  NotFoundCountry = "Country not found",
  UpdatedCountrySuccess = "Country updated successfully",
  CannotUpdateCountry = "You are not allowed to update this country",
  CannotRemoveCountry = "You are not allowed to remove this country",
  RemoveCountrySuccess = "Country removed successfully",
  RequiredCountryQuery = "Country query is required",
  OnlySuperAdminCanRemoveCountry = "Only a super admin can remove a country when the main admin has been deleted",
  OnlySuperAdminCanUpdateCountry = "Only a super admin can update a country when the main admin has been deleted"
}
