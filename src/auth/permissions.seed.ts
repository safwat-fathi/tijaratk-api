import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

const logger = new Logger('PermissionsSeed');

/**
 * Default permissions organized by resource
 */
const defaultPermissions = [
  // Store permissions
  { key: 'store.view', description: 'View store details' },
  { key: 'store.update', description: 'Update store settings' },
  { key: 'store.delete', description: 'Delete store' },

  // Product permissions
  { key: 'product.view', description: 'View products' },
  { key: 'product.add', description: 'Add new products' },
  { key: 'product.edit', description: 'Edit products' },
  { key: 'product.delete', description: 'Delete products' },

  // Order permissions
  { key: 'order.view', description: 'View orders' },
  { key: 'order.update', description: 'Update order status' },
  { key: 'order.cancel', description: 'Cancel orders' },
  { key: 'order.refund', description: 'Process refunds' },

  // Customer permissions
  { key: 'customer.view', description: 'View customers' },
  { key: 'customer.update', description: 'Update customer details' },

  // Admin permissions (global scope)
  { key: 'admin.users.view', description: 'View all users' },
  { key: 'admin.users.update', description: 'Update users' },
  { key: 'admin.users.block', description: 'Block/unblock users' },
  { key: 'admin.stores.view', description: 'View all stores' },
  { key: 'admin.stores.update', description: 'Update any store' },
  { key: 'admin.stores.delete', description: 'Delete any store' },
  { key: 'admin.products.view', description: 'View all products' },
  { key: 'admin.products.update', description: 'Update any product' },
  { key: 'admin.products.delete', description: 'Delete any product' },
  { key: 'admin.orders.view', description: 'View all orders' },
  { key: 'admin.dashboard', description: 'Access admin dashboard' },
];

/**
 * Default role-permission mappings
 */
const rolePermissions: Record<string, string[]> = {
  admin: [
    // Admin has all permissions
    'admin.users.view',
    'admin.users.update',
    'admin.users.block',
    'admin.stores.view',
    'admin.stores.update',
    'admin.stores.delete',
    'admin.products.view',
    'admin.products.update',
    'admin.products.delete',
    'admin.orders.view',
    'admin.dashboard',
  ],
  merchant_owner: [
    'store.view',
    'store.update',
    'store.delete',
    'product.view',
    'product.add',
    'product.edit',
    'product.delete',
    'order.view',
    'order.update',
    'order.cancel',
    'order.refund',
    'customer.view',
    'customer.update',
  ],
  merchant_staff: [
    'store.view',
    'product.view',
    'product.add',
    'product.edit',
    'order.view',
    'order.update',
    'customer.view',
  ],
  user: [],
};

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);
  const roleRepository = dataSource.getRepository(Role);

  // 1. Seed permissions
  for (const permData of defaultPermissions) {
    const exists = await permissionRepository.findOne({
      where: { key: permData.key },
    });

    if (!exists) {
      const permission = permissionRepository.create(permData);
      await permissionRepository.save(permission);
      logger.log(`Created permission: ${permData.key}`);
    }
  }

  // 2. Assign permissions to roles
  for (const [roleName, permissionKeys] of Object.entries(rolePermissions)) {
    const role = await roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      logger.warn(`Role not found: ${roleName}`);
      continue;
    }

    const permissions = await permissionRepository.find({
      where: permissionKeys.map((key) => ({ key })),
    });

    // Only add permissions that aren't already assigned
    const existingKeys = new Set(role.permissions?.map((p) => p.key) || []);
    const newPermissions = permissions.filter((p) => !existingKeys.has(p.key));

    if (newPermissions.length > 0) {
      role.permissions = [...(role.permissions || []), ...newPermissions];
      await roleRepository.save(role);
      logger.log(
        `Assigned ${newPermissions.length} permissions to role: ${roleName}`,
      );
    }
  }
}
