import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RolesEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    // enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;
}
