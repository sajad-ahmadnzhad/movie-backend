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
