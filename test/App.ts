import 'reflect-metadata';
import Program from '../src/Program';
import { Container } from '../src/di/Dependency';
import { EVENT_KEY, QueueSubTest } from './eventHandlers/QueueSubTest';
import { IQueueManagerFactory, INJECT_TOKEN as QMF_INJECT_TOKEN } from '../src/queue/QueueManagerFactory';
import { GetEventKey } from '../src/event/EventHandler';

class App extends Program {
  override StartQueues() {
    const factory = Container.resolve<IQueueManagerFactory>(QMF_INJECT_TOKEN);
    const subQueueManager = factory.GetQueueManager('sub');

    // subQueueManager.Subscription('simple_koa_test', EVENT_KEY);
    subQueueManager.Subscription('simple_koa_test', GetEventKey(QueueSubTest));

    super.StartQueues();
  }
}

const app = new App(__dirname);
app.Start();
