import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

type AppWebSocket = WebSocket & { facebookId: string };

@Injectable()
export class FacebookEventsGateway implements OnModuleInit {
  private server: WebSocket.Server;
  private readonly logger = new Logger(FacebookEventsGateway.name);
  private clients: Map<string, AppWebSocket> = new Map();

  onModuleInit() {
    this.server = new WebSocket.Server({
      port: Number(process.env.WS_SERVER_PORT),
    });

    this.server.on(
      'connection',
      (socket: AppWebSocket, request: IncomingMessage) => {
        // Extract facebookId from the token payload
        const facebookId = this.getFacebookIdFromRequest(request);

        if (!facebookId) {
          this.logger.warn('Connection attempt without facebookId');
          socket.close(1008, 'accessToken with valid facebookId is required');
          return;
        }

        // Store the socket using facebookId
        this.clients.set(facebookId, socket);
        socket.facebookId = facebookId; // Attach facebookId to socket for reference

        this.logger.log(`Client connected with facebookId: ${facebookId}`);

        // Handle incoming messages
        // socket.on('message', (message: string) => {
        //   try {
        //     const parsedMessage = JSON.parse(message.toString());
        //     this.logger.log(
        //       `Received message from ${facebookId}:`,
        //       parsedMessage,
        //     );

        //     // Handle different message types
        //     if (parsedMessage.type === 'auth') {
        //       // Handle authentication
        //       this.handleAuth(socket, parsedMessage);
        //     } else {
        //       // Handle other message types
        //       this.handleMessage(facebookId, parsedMessage);
        //     }
        //   } catch (error) {
        //     this.logger.error('Error processing message:', error);
        //   }
        // });

        // Handle client disconnection
        socket.on('close', () => {
          this.logger.log(`Client disconnected: ${facebookId}`);
          this.clients.delete(facebookId);
        });

        // Handle errors
        socket.on('error', (error) => {
          this.logger.error(`Error from client ${facebookId}:`, error);
          this.clients.delete(facebookId);
        });
      },
    );
  }

  private getFacebookIdFromRequest(request: IncomingMessage): string | null {
    const url = new URL(request.url, `https://${request.headers.host}`);
    const facebookId = url.searchParams.get('facebookId');

    return facebookId;
  }

  // Send message to a specific client
  public sendToClient(facebookId: string, data: any) {
    const client = this.clients.get(facebookId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    } else {
      this.logger.warn(`Client ${facebookId} not found or not connected`);
    }
  }

  // Broadcast message to all clients
  public broadcast(data: any, excludeFacebookId?: string) {
    const message = JSON.stringify(data);
    this.clients.forEach((client, userId) => {
      if (
        client.readyState === WebSocket.OPEN &&
        userId !== excludeFacebookId
      ) {
        client.send(message);
      }
    });
  }

  // Get all connected client IDs
  public getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  // Check if a client is connected
  public isClientConnected(facebookId: string): boolean {
    const client = this.clients.get(facebookId);
    return client !== undefined && client.readyState === WebSocket.OPEN;
  }

  // Close connection for a specific client
  public disconnectClient(facebookId: string) {
    const client = this.clients.get(facebookId);
    if (client) {
      client.close();
      this.clients.delete(facebookId);
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
