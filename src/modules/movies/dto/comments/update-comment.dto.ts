import { CreateCommentDto } from "./create-comment.dot";
import { PartialType } from "@nestjs/swagger";

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
