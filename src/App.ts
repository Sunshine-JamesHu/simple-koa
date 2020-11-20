import * as path from 'path';
import Startup from "./Startup";

const controllerPath = './controller';
const app = new Startup(path.join(__dirname, controllerPath));
app.StartServer();
