import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto) {
    const customer = this.customerRepo.create(dto);
    return this.customerRepo.save(customer);
  }

  async findAll() {
    return this.customerRepo.find();
  }

  async findOne(id: number) {
    return this.customerRepo.findOneBy({ id });
  }
}
