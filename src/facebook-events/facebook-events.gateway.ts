import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

type AppWebSocket = WebSocket & { userId: string };

@Injectable()
export class FacebookEventsGateway implements OnModuleInit {
  private server: WebSocket.Server;
  private readonly logger = new Logger(FacebookEventsGateway.name);
  private clients: Map<string, AppWebSocket> = new Map();

  onModuleInit() {
    this.server = new WebSocket.Server({
      port: +process.env.WS_SERVER_PORT,
      path: '/facebook-events',
      transports: ['websocket'],
      connectTimeout: 30000,
    });

    this.server.on(
      'connection',
      (socket: AppWebSocket, request: IncomingMessage) => {
        // Extract userId from the token payload
        const userId = this.getUserIdFromRequest(request);

        if (!userId) {
          this.logger.warn('Connection attempt without userId');
          socket.close(1008, 'accessToken with valid userId is required');
          return;
        }

        // Store the socket using userId
        this.clients.set(userId, socket);
        socket.userId = userId; // Attach userId to socket for reference

        this.logger.log(`Client connected with userId: ${userId}`);

        // Handle client disconnection
        socket.on('close', () => {
          this.logger.log(`Client disconnected: ${userId}`);
          this.clients.delete(userId);
        });

        // Handle errors
        socket.on('error', (error) => {
          this.logger.error(`Error from client ${userId}:`, error);
          this.clients.delete(userId);
        });
      },
    );
  }

  private getUserIdFromRequest(request: IncomingMessage): string | null {
    const url = new URL(request.url, `https://${request.headers.host}`);
    const userId = url.searchParams.get('userId');

    return userId;
  }

  // Send message to a specific client
  public sendToClient(userId: string, data: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    } else {
      this.logger.warn(`Client ${userId} not found or not connected`);
    }
  }

  // Broadcast message to all clients
  public broadcast(data: any, excludeUserId?: string) {
    const message = JSON.stringify(data);
    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN && clientId !== excludeUserId) {
        client.send(message);
      }
    });
  }

  // Get all connected client IDs
  public getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  // Check if a client is connected
  public isClientConnected(userId: string): boolean {
    const client = this.clients.get(userId);
    return client !== undefined && client.readyState === WebSocket.OPEN;
  }

  // Close connection for a specific client
  public disconnectClient(userId: string) {
    const client = this.clients.get(userId);
    if (client) {
      client.close();
      this.clients.delete(userId);
    }
  }

  // Close the WebSocket server
  private close() {
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
    this.server.close();
  }
}
