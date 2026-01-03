import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Server, WebSocket } from 'ws';

// Extend WebSocket to include userId
type AppWebSocket = WebSocket & { userId: number };

@WebSocketGateway({ path: '/notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Map<number, AppWebSocket> = new Map();

  handleConnection(client: AppWebSocket, request: IncomingMessage) {
    if (!request.url) return;
    const url = new URL(request.url, `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (userId) {
      client.userId = Number(userId);
      this.clients.set(client.userId, client);
      // console.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: AppWebSocket) {
    if (client.userId) {
      this.clients.delete(client.userId);
      // console.log(`Client disconnected: ${client.userId}`);
    }
  }

  sendNotification(userId: number, payload: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}
