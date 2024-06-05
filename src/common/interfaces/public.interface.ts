import { ObjectId } from "mongoose";
import { Document } from "mongoose";

export interface PaginatedList<T> {
  count: number;
  page: number;
  pages: number;
  data: T[];
}

export interface ICreatedBy<T> extends Document<T> {
  createdBy: {
    _id: ObjectId;
    name: string;
    username: string;
    avatarURL: string;
  };
}
export interface IIndustry<T> extends Document<T> {
  country: {
    _id: ObjectId;
    name: string;
    description: string
    flag_image_URL: string
  };
}
