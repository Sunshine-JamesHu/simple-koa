import { Logger } from "../logger/Logger";
import { Inject } from "../di/Injector";
import SettingManager from "../setting/SettingManager";

export default class Controller {
    @Inject()
    protected readonly Logger: Logger;

    @Inject()
    protected readonly SettingManager: SettingManager;
}