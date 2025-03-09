import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { FacebookEventsGateway } from './facebook-events.gateway';

@Global()
@Module({
  imports: [JwtModule],
  providers: [FacebookEventsGateway],
  exports: [FacebookEventsGateway],
})
export class FacebookEventsModule {}
