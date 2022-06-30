import { Photo } from '../../domain/entities/Photo';
import { DbContext, DB_CONTEXT_INJECT_TOKEN } from '../../../src/typeorm/DbContext';
import { Singleton } from '../../../src/di/Dependency';

const SOURCE = 'test1';

@Singleton(DB_CONTEXT_INJECT_TOKEN)
export class Test1DbContext extends DbContext {
  GetEntities(): any[] {
    return [Photo];
  }

  override GetDbSource(): string {
    return SOURCE;
  }
}
