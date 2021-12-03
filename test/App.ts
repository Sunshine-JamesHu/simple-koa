import "reflect-metadata";
import { container } from 'tsyringe';
import Program from '../src/Program';
import { IQueueManagerFactory, INJECT_TOKEN as QMF_INJECT_TOKEN } from '../src/queue/QueueManagerFactory';

class App extends Program {
  override StartQueues() {
    const factory = container.resolve<IQueueManagerFactory>(QMF_INJECT_TOKEN);
    const subQueueManager = factory.GetQueueManager('sub');

    subQueueManager.Subscription('simple_koa_test', 'SubTest');

    super.StartQueues();
  }
}

const app = new App(__dirname);
app.Start();
