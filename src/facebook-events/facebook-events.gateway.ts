// src/facebook-events/facebook-events.gateway.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

// @Injectable()
// export class FacebookEventsGateway implements OnModuleInit {
//   private server: WebSocket.Server;
//   private readonly logger = new Logger(FacebookEventsGateway.name);

//   onModuleInit() {
//     this.server = new WebSocket.Server({
//       port: (process.env.WS_SERVER_PORT),
//     });
//     this.server.on('connection', (socket: WebSocket) => {
//       this.logger.log('Client connected');

//       // Listen for messages from the client
//       socket.on('message', (message: string) => {
//         this.logger.log(`Received message: ${message}`);
//         // For demonstration, send a response back
//         socket.send('Hello world!');
//       });
//     });

// 		this.server.on('close', () => {
// 			this.logger.log('WebSocket server closed');
// 		})

// 		this.server.on('error', (error) => {
// 			this.logger.error('WebSocket server error:', error);
// 			this.close();
// 		})

//     this.logger.log(`WebSocket server running on port ${process.env.WS_SERVER_PORT}`);
//   }

//   // Optionally, add a method to broadcast messages to all clients
//   broadcast(data: any) {
//     const message = JSON.stringify(data);
//     this.server.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   }

// 	// Optionally, add a method to send messages to a specific client
// 	sendToClient(clientId: string, data: any) {
// 		const message = JSON.stringify(data);
// 		const client = this.server.clients.find((client) => client.id === clientId);
// 		if (client) {
// 			client.send(message);
// 		}
// 	}

// 	// Optionally, add a method to close the WebSocket server
// 	private close() {
// 		this.server.close();
// 	}
// }
@Injectable()
export class FacebookEventsGateway implements OnModuleInit {
  private server: WebSocket.Server;
  private readonly logger = new Logger(FacebookEventsGateway.name);
  private clients: Map<string, WebSocket> = new Map();

  onModuleInit() {
    this.server = new WebSocket.Server({
      port: Number(process.env.WS_SERVER_PORT),
    });

    this.server.on(
      'connection',
      (socket: WebSocket, request: IncomingMessage) => {
        // Extract userId from query parameters
        const userId = this.getUserIdFromRequest(request);

        if (!userId) {
          this.logger.warn('Connection attempt without userId');
          socket.close(1008, 'userId is required');
          return;
        }

        // Store the socket with its userId
        this.clients.set(userId, socket);
        (socket as any).userId = userId; // Attach userId to socket for reference

        this.logger.log(`Client connected with userId: ${userId}`);

        // Handle incoming messages
        socket.on('message', (message: string) => {
          try {
            const parsedMessage = JSON.parse(message.toString());
            this.logger.log(`Received message from ${userId}:`, parsedMessage);

            // Handle different message types
            if (parsedMessage.type === 'auth') {
              // Handle authentication
              this.handleAuth(socket, parsedMessage);
            } else {
              // Handle other message types
              this.handleMessage(userId, parsedMessage);
            }
          } catch (error) {
            this.logger.error('Error processing message:', error);
          }
        });

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

    this.server.on('close', () => {
      this.logger.log('WebSocket server closed');
      this.clients.clear();
    });

    this.server.on('error', (error) => {
      this.logger.error('WebSocket server error:', error);
      this.close();
    });

    this.logger.log(
      `WebSocket server running on port ${process.env.WS_SERVER_PORT}`,
    );
  }

  private getUserIdFromRequest(request: IncomingMessage): string | null {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    return url.searchParams.get('userId');
  }

  private handleAuth(socket: WebSocket, message: any) {
    // check if user exists
    this.logger.log('Auth message received:', message);
  }

  private handleMessage(userId: string, message: any) {
    // Add your message handling logic here
    this.logger.log(`Processing message from ${userId}:`, message);
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
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN && userId !== excludeUserId) {
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
