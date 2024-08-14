import { UseFilters, UseGuards, UsePipes } from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { AllExceptionsFilter } from "src/common/filters/wsException.filter";
import { WsJwtGuard } from "src/common/guards/wsJwt.guard";
import { WsValidationPipe } from "src/common/pipes/wsValidation.pipe";

@WebSocketGateway(81, { cors: { origin: "*" } })
export class CommentsGateway {
  @SubscribeMessage("addComment")
  @UseGuards(WsJwtGuard)
  @UseFilters(AllExceptionsFilter)
  @UsePipes(WsValidationPipe)
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ): void {
    console.log(payload);
  }
}
