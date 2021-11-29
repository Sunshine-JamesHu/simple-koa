import * as fs from "fs";
import { Singleton } from "../di/Dependency";
const APP_CONFIG: { [key: string]: any } = {};
const SetConfig = (cfg: any) => {
  for (const key in cfg) {
    if (cfg.hasOwnProperty(key)) {
      APP_CONFIG[key] = cfg[key];
    }
  }
};

export const INJECT_TOKEN = "ISettingManager";

export function LoadAppConfig() {
  try {
    let appConfig = "";
    if (process.env.Config_FILE && fs.existsSync(process.env.Config_FILE)) {
      appConfig = fs.readFileSync(process.env.Config_FILE, "utf-8");
    } else {
      appConfig = fs.readFileSync("./app.config.json", "utf-8");
    }
    if (!appConfig) throw new Error();
    SetConfig(JSON.parse(appConfig));
  } catch (error) {
    console.warn("App配置为空,采用默认配置");
    SetConfig({
      port: 30000,
    });
  }
}

@Singleton(INJECT_TOKEN)
export class SettingManager implements ISettingManager {
  GetConfig<TConfig = any>(key: string): TConfig {
    const keyPath = key.split(":");
    let cfg: any = APP_CONFIG[keyPath[0]];
    for (let index = 1; index < keyPath.length; index++) {
      const element = keyPath[index];
      cfg = cfg[element];
    }
    return cfg;
  }
}

export interface ISettingManager {
  GetConfig<TConfig = any>(key: string): TConfig;
}
