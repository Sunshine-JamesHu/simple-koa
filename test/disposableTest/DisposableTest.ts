import { IAsyncDisposable, IDisposable } from '../../src/core/Disposable';

export class DisposableTest implements IDisposable {
  Dispose(): void {
    console.log('已经被释放');
  }
}

export class AsyncDisposableTest implements IAsyncDisposable {
  DisposeAsync(): Promise<void> {
    console.log('已经被释放Async');
    return Promise.resolve();
  }
}
