import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Role, RoleScope } from './entities/role.entity';

const logger = new Logger('RolesSeed');

/**
 * Default roles to seed
 */
const defaultRoles = [
  {
    name: 'admin',
    display_name: 'Administrator',
    scope: RoleScope.GLOBAL,
  },
  {
    name: 'user',
    display_name: 'User',
    scope: RoleScope.GLOBAL,
  },
  {
    name: 'merchant_owner',
    display_name: 'Store Owner',
    scope: RoleScope.STORE,
  },
  {
    name: 'merchant_staff',
    display_name: 'Store Staff',
    scope: RoleScope.STORE,
  },
];

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);

  for (const roleData of defaultRoles) {
    const exists = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!exists) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      logger.log(`Created role: ${roleData.name}`);
    } else {
      logger.log(`Role already exists: ${roleData.name}`);
    }
  }
}
