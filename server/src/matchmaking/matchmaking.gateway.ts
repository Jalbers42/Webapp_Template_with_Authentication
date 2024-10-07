import { SocketGateway } from "src/socket/socket.gateway";
import { MatchmakingService } from "./matchmaking.service";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Player } from "src/app.types";
import { Socket } from "socket.io";

@WebSocketGateway()
export class MatchMakingGateway {
    constructor(private socketGateway : SocketGateway, private matchMakingService : MatchmakingService) {}

    @SubscribeMessage('addToQueue')
    addToQueue(@MessageBody() username : string, @ConnectedSocket() socket : Socket) {
        const   player : Player = {username, socket_id: socket.id}
        this.matchMakingService.addToQueue(player);
    }
}