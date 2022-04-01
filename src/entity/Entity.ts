import { Column } from './Column';

export interface IEntity {
  GetKeys(): string[];
}

export interface IEntityWithPrimaryKey<TPrimaryKey> extends IEntity {
  id?: TPrimaryKey;
}

export abstract class Entity implements IEntity {
  abstract GetKeys(): string[];
}

export abstract class EntityWithPrimaryKey<TPrimaryKey> implements IEntityWithPrimaryKey<TPrimaryKey> {
  @Column('id')
  id?: TPrimaryKey;

  GetKeys(): string[] {
    return ['id'];
  }
}
