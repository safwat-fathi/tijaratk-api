import { Global, Module } from '@nestjs/common';

import { FacebookEventsGateway } from './facebook-events.gateway';

@Global() // This decorator makes the module global
@Module({
  providers: [FacebookEventsGateway],
  exports: [FacebookEventsGateway],
})
export class FacebookEventsModule {}
