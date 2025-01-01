import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/messages/entities/message.entity';
import { Customer } from './entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Customer])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService], // <-- IMPORTANT
})
export class CustomersModule {}
