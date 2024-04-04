import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../entity/users.entity';

export const ROLES_KEY = 'user_roles';

// @Roles(RolesEnum.ADMIN) → admin 사용자만!! 사용할 수 있게 할 것이다.
export const Roles = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);
