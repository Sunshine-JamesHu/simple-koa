import 'reflect-metadata';
import Program, { Container, GetEventKey, IQueueManagerFactory, QMF_INJECT_TOKEN } from '../index';
import { QueueSubTest } from './eventHandlers/QueueSubTest';

class App extends Program {
  override StartQueues() {
    const factory = Container.resolve<IQueueManagerFactory>(QMF_INJECT_TOKEN);
    const subQueueManager = factory.GetQueueManager('sub');

    const testTopic = GetEventKey(QueueSubTest);
    subQueueManager.Subscription(testTopic, testTopic);

    super.StartQueues();
  }
}

const app = new App(__dirname);
app.Start();
