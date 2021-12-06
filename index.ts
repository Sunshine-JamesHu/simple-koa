import { Transient, Singleton, Injectable, Inject } from './src/di/Dependency';
import { ISettingManager, SettingManager } from './src/setting/SettingManager';
import { Router } from './src/router/Router';
import { RequestBody, RequestQuery } from './src/router/RequestData';
import { HttpRequest, HttpGet, HttpDelete, HttpPut, HttpOptions, HttpPost } from './src/router/Request';
import { IService, Service } from './src/service/Service';
import { IController, Controller } from './src/controller/Controller';
import Program from './src/Program'; // 这一句必须放在最后面,否则打出来的包就会有问题

export {
  Transient,
  Singleton,
  Injectable,
  Inject,
  IController,
  Controller,
  IService,
  Service,
  ISettingManager,
  SettingManager,
  HttpRequest,
  HttpGet,
  HttpDelete,
  HttpPut,
  HttpOptions,
  HttpPost,
  Router,
  RequestBody,
  RequestQuery,
};

export default Program;
