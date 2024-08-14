import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway(81, { cors: { origin: "*" } })
export class MoviesGateway {
  @SubscribeMessage("likeToggle")
  handleMessage(): void {}
}
