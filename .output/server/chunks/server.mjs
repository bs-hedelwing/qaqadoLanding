import { v as vue_cjs_prod, s as serverRenderer, r as require$$0 } from './renderer.mjs';
import { hasProtocol, joinURL, isEqual, withBase, withQuery } from 'ufo';
import { defineStore, createPinia, setActivePinia } from 'pinia/dist/pinia.mjs';
import { mdiCheck } from '@mdi/js';
import * as d3 from 'd3';
import { u as useRuntimeConfig$1 } from './node-server.mjs';
import 'h3';
import 'unenv/runtime/mock/proxy';
import 'stream';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'destr';
import 'ohmyfetch';
import 'radix3';
import 'unenv/runtime/fetch/index';
import 'hookable';
import 'scule';
import 'ohash';
import 'unstorage';
import 'fs';
import 'pathe';
import 'url';

const suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^["{[]|^-?[0-9][0-9.]{0,14}$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor") {
    return;
  }
  return value;
}
function destr(val) {
  if (typeof val !== "string") {
    return val;
  }
  const _lval = val.toLowerCase();
  if (_lval === "true") {
    return true;
  }
  if (_lval === "false") {
    return false;
  }
  if (_lval === "null") {
    return null;
  }
  if (_lval === "nan") {
    return NaN;
  }
  if (_lval === "infinity") {
    return Infinity;
  }
  if (_lval === "undefined") {
    return void 0;
  }
  if (!JsonSigRx.test(val)) {
    return val;
  }
  try {
    if (suspectProtoRx.test(val) || suspectConstructorRx.test(val)) {
      return JSON.parse(val, jsonParseTransform);
    }
    return JSON.parse(val);
  } catch (_e) {
    return val;
  }
}
class FetchError extends Error {
  constructor() {
    super(...arguments);
    this.name = "FetchError";
  }
}
function createFetchError(request, error, response) {
  let message = "";
  if (request && response) {
    message = `${response.status} ${response.statusText} (${request.toString()})`;
  }
  if (error) {
    message = `${error.message} (${message})`;
  }
  const fetchError = new FetchError(message);
  Object.defineProperty(fetchError, "request", { get() {
    return request;
  } });
  Object.defineProperty(fetchError, "response", { get() {
    return response;
  } });
  Object.defineProperty(fetchError, "data", { get() {
    return response && response._data;
  } });
  return fetchError;
}
const payloadMethods = new Set(Object.freeze(["PATCH", "POST", "PUT", "DELETE"]));
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(val) {
  if (val === void 0) {
    return false;
  }
  const t = typeof val;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(val)) {
    return true;
  }
  return val.constructor && val.constructor.name === "Object" || typeof val.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*`\-.^~]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift();
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  409,
  425,
  429,
  500,
  502,
  503,
  504
]);
function createFetch(globalOptions) {
  const { fetch: fetch2, Headers: Headers2 } = globalOptions;
  function onError(ctx) {
    if (ctx.options.retry !== false) {
      const retries = typeof ctx.options.retry === "number" ? ctx.options.retry : isPayloadMethod(ctx.options.method) ? 0 : 1;
      const responseCode = ctx.response && ctx.response.status || 500;
      if (retries > 0 && retryStatusCodes.has(responseCode)) {
        return $fetchRaw(ctx.request, {
          ...ctx.options,
          retry: retries - 1
        });
      }
    }
    const err = createFetchError(ctx.request, ctx.error, ctx.response);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, $fetchRaw);
    }
    throw err;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _opts = {}) {
    const ctx = {
      request: _request,
      options: { ...globalOptions.defaults, ..._opts },
      response: void 0,
      error: void 0
    };
    if (ctx.options.onRequest) {
      await ctx.options.onRequest(ctx);
    }
    if (typeof ctx.request === "string") {
      if (ctx.options.baseURL) {
        ctx.request = withBase(ctx.request, ctx.options.baseURL);
      }
      if (ctx.options.params) {
        ctx.request = withQuery(ctx.request, ctx.options.params);
      }
      if (ctx.options.body && isPayloadMethod(ctx.options.method)) {
        if (isJSONSerializable(ctx.options.body)) {
          ctx.options.body = typeof ctx.options.body === "string" ? ctx.options.body : JSON.stringify(ctx.options.body);
          ctx.options.headers = new Headers2(ctx.options.headers);
          if (!ctx.options.headers.has("content-type")) {
            ctx.options.headers.set("content-type", "application/json");
          }
          if (!ctx.options.headers.has("accept")) {
            ctx.options.headers.set("accept", "application/json");
          }
        }
      }
    }
    ctx.response = await fetch2(ctx.request, ctx.options).catch(async (error) => {
      ctx.error = error;
      if (ctx.options.onRequestError) {
        await ctx.options.onRequestError(ctx);
      }
      return onError(ctx);
    });
    const responseType = (ctx.options.parseResponse ? "json" : ctx.options.responseType) || detectResponseType(ctx.response.headers.get("content-type") || "");
    if (responseType === "json") {
      const data = await ctx.response.text();
      const parseFn = ctx.options.parseResponse || destr;
      ctx.response._data = parseFn(data);
    } else {
      ctx.response._data = await ctx.response[responseType]();
    }
    if (ctx.options.onResponse) {
      await ctx.options.onResponse(ctx);
    }
    if (!ctx.response.ok) {
      if (ctx.options.onResponseError) {
        await ctx.options.onResponseError(ctx);
      }
    }
    return ctx.response.ok ? ctx.response : onError(ctx);
  };
  const $fetch2 = function $fetch22(request, opts) {
    return $fetchRaw(request, opts).then((r) => r._data);
  };
  $fetch2.raw = $fetchRaw;
  $fetch2.create = (defaultOptions = {}) => createFetch({
    ...globalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch2;
}
const _globalThis$2 = function() {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
}();
const fetch = _globalThis$2.fetch || (() => Promise.reject(new Error("[ohmyfetch] global.fetch is not supported!")));
const Headers = _globalThis$2.Headers;
const $fetch$1 = createFetch({ fetch, Headers });
const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const publicAssetsURL = (...path) => {
  const publicBase = appConfig.cdnURL || appConfig.baseURL;
  return path.length ? joinURL(publicBase, ...path) : publicBase;
};
function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
function serialCaller(hooks, args) {
  return hooks.reduce((promise, hookFn) => promise.then(() => hookFn.apply(void 0, args)), Promise.resolve(null));
}
function parallelCaller(hooks, args) {
  return Promise.all(hooks.map((hook) => hook.apply(void 0, args)));
}
class Hookable {
  constructor() {
    this._hooks = {};
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, fn) {
    if (!name || typeof fn !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let deprecatedHookObj;
    while (this._deprecatedHooks[name]) {
      const deprecatedHook = this._deprecatedHooks[name];
      if (typeof deprecatedHook === "string") {
        deprecatedHookObj = { to: deprecatedHook };
      } else {
        deprecatedHookObj = deprecatedHook;
      }
      name = deprecatedHookObj.to;
    }
    if (deprecatedHookObj) {
      if (!deprecatedHookObj.message) {
        console.warn(`${originalName} hook has been deprecated` + (deprecatedHookObj.to ? `, please use ${deprecatedHookObj.to}` : ""));
      } else {
        console.warn(deprecatedHookObj.message);
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(fn);
    return () => {
      if (fn) {
        this.removeHook(name, fn);
        fn = null;
      }
    };
  }
  hookOnce(name, fn) {
    let _unreg;
    let _fn = (...args) => {
      _unreg();
      _unreg = null;
      _fn = null;
      return fn(...args);
    };
    _unreg = this.hook(name, _fn);
    return _unreg;
  }
  removeHook(name, fn) {
    if (this._hooks[name]) {
      const idx = this._hooks[name].indexOf(fn);
      if (idx !== -1) {
        this._hooks[name].splice(idx, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = deprecated;
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
    return () => {
      removeFns.splice(0, removeFns.length).forEach((unreg) => unreg());
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  callHook(name, ...args) {
    return serialCaller(this._hooks[name] || [], args);
  }
  callHookParallel(name, ...args) {
    return parallelCaller(this._hooks[name] || [], args);
  }
  callHookWith(caller, name, ...args) {
    return caller(this._hooks[name] || [], args);
  }
}
function createHooks() {
  return new Hookable();
}
function createContext() {
  let currentInstance = null;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  return {
    use: () => currentInstance,
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = null;
      isSingleton = false;
    },
    call: (instance, cb) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return cb();
      } finally {
        if (!isSingleton) {
          currentInstance = null;
        }
      }
    },
    async callAsync(instance, cb) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = cb();
        if (!isSingleton) {
          currentInstance = null;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace() {
  const contexts = {};
  return {
    get(key) {
      if (!contexts[key]) {
        contexts[key] = createContext();
      }
      contexts[key];
      return contexts[key];
    }
  };
}
const _globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis$1[globalKey] || (_globalThis$1[globalKey] = createNamespace());
const getContext = (key) => defaultNamespace.get(key);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis$1[asyncHandlersKey] || (_globalThis$1[asyncHandlersKey] = /* @__PURE__ */ new Set());
function createMock(name, overrides = {}) {
  const fn = function() {
  };
  fn.prototype.name = name;
  const props = {};
  return new Proxy(fn, {
    get(_target, prop) {
      if (prop === "caller") {
        return null;
      }
      if (prop === "__createMock__") {
        return createMock;
      }
      if (prop in overrides) {
        return overrides[prop];
      }
      return props[prop] = props[prop] || createMock(`${name}.${prop.toString()}`);
    },
    apply(_target, _this, _args) {
      return createMock(`${name}()`);
    },
    construct(_target, _args, _newT) {
      return createMock(`[${name}]`);
    },
    enumerate(_target) {
      return [];
    }
  });
}
const mockContext = createMock("mock");
function mock(warning) {
  console.warn(warning);
  return mockContext;
}
const unsupported = /* @__PURE__ */ new Set([
  "store",
  "spa",
  "fetchCounters"
]);
const todo = /* @__PURE__ */ new Set([
  "isHMR",
  "base",
  "payload",
  "from",
  "next",
  "error",
  "redirect",
  "redirected",
  "enablePreview",
  "$preview",
  "beforeNuxtRender",
  "beforeSerialize"
]);
const routerKeys = ["route", "params", "query"];
const staticFlags = {
  isClient: false,
  isServer: true,
  isDev: false,
  isStatic: void 0,
  target: "server",
  modern: false
};
const legacyPlugin = (nuxtApp) => {
  nuxtApp._legacyContext = new Proxy(nuxtApp, {
    get(nuxt, p) {
      if (unsupported.has(p)) {
        return mock(`Accessing ${p} is not supported in Nuxt 3.`);
      }
      if (todo.has(p)) {
        return mock(`Accessing ${p} is not yet supported in Nuxt 3.`);
      }
      if (routerKeys.includes(p)) {
        if (!("$router" in nuxtApp)) {
          return mock("vue-router is not being used in this project.");
        }
        switch (p) {
          case "route":
            return nuxt.$router.currentRoute.value;
          case "params":
          case "query":
            return nuxt.$router.currentRoute.value[p];
        }
      }
      if (p === "$config" || p === "env") {
        return useRuntimeConfig();
      }
      if (p in staticFlags) {
        return staticFlags[p];
      }
      if (p === "ssrContext") {
        return nuxt._legacyContext;
      }
      if (nuxt.ssrContext && p in nuxt.ssrContext) {
        return nuxt.ssrContext[p];
      }
      if (p === "nuxt") {
        return nuxt.payload;
      }
      if (p === "nuxtState") {
        return nuxt.payload.data;
      }
      if (p in nuxtApp.vueApp) {
        return nuxtApp.vueApp[p];
      }
      if (p in nuxtApp) {
        return nuxtApp[p];
      }
      return mock(`Accessing ${p} is not supported in Nuxt3.`);
    }
  });
};
const nuxtAppCtx = getContext("nuxt-app");
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    payload: vue_cjs_prod.reactive({
      data: {},
      state: {},
      _errors: {},
      ...{ serverRendered: true }
    }),
    isHydrating: false,
    _asyncDataPromises: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  if (nuxtApp.ssrContext) {
    nuxtApp.ssrContext.nuxt = nuxtApp;
  }
  {
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    nuxtApp.ssrContext.payload = nuxtApp.payload;
  }
  {
    nuxtApp.payload.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  const compatibilityConfig = new Proxy(runtimeConfig, {
    get(target, prop) {
      var _a;
      if (prop === "public") {
        return target.public;
      }
      return (_a = target[prop]) != null ? _a : target.public[prop];
    },
    set(target, prop, value) {
      {
        return false;
      }
    }
  });
  nuxtApp.provide("config", compatibilityConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin !== "function") {
    return;
  }
  const { provide: provide2 } = await callWithNuxt(nuxtApp, plugin, [nuxtApp]) || {};
  if (provide2 && typeof provide2 === "object") {
    for (const key in provide2) {
      nuxtApp.provide(key, provide2[key]);
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  for (const plugin of plugins2) {
    await applyPlugin(nuxtApp, plugin);
  }
}
function normalizePlugins(_plugins2) {
  let needsLegacyContext = false;
  const plugins2 = _plugins2.map((plugin) => {
    if (typeof plugin !== "function") {
      return () => {
      };
    }
    if (isLegacyPlugin(plugin)) {
      needsLegacyContext = true;
      return (nuxtApp) => plugin(nuxtApp._legacyContext, nuxtApp.provide);
    }
    return plugin;
  });
  if (needsLegacyContext) {
    plugins2.unshift(legacyPlugin);
  }
  return plugins2;
}
function defineNuxtPlugin(plugin) {
  plugin[NuxtPluginIndicator] = true;
  return plugin;
}
function isLegacyPlugin(plugin) {
  return !plugin[NuxtPluginIndicator];
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxtAppCtx.callAsync(nuxt, fn);
  }
}
function useNuxtApp() {
  const vm = vue_cjs_prod.getCurrentInstance();
  if (!vm) {
    const nuxtAppInstance = nuxtAppCtx.use();
    if (!nuxtAppInstance) {
      throw new Error("nuxt instance unavailable");
    }
    return nuxtAppInstance;
  }
  return vm.appContext.app.$nuxt;
}
function useRuntimeConfig() {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var vueRouter_cjs_prod = {};
/*!
  * vue-router v4.0.16
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  var vue = require$$0;
  const hasSymbol = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
  const PolySymbol = (name) => hasSymbol ? Symbol(name) : "_vr_" + name;
  const matchedRouteKey = /* @__PURE__ */ PolySymbol("rvlm");
  const viewDepthKey = /* @__PURE__ */ PolySymbol("rvd");
  const routerKey = /* @__PURE__ */ PolySymbol("r");
  const routeLocationKey = /* @__PURE__ */ PolySymbol("rl");
  const routerViewLocationKey = /* @__PURE__ */ PolySymbol("rvl");
  function isESModule(obj) {
    return obj.__esModule || hasSymbol && obj[Symbol.toStringTag] === "Module";
  }
  const assign = Object.assign;
  function applyToParams(fn, params) {
    const newParams = {};
    for (const key in params) {
      const value = params[key];
      newParams[key] = Array.isArray(value) ? value.map(fn) : fn(value);
    }
    return newParams;
  }
  const noop = () => {
  };
  const TRAILING_SLASH_RE = /\/$/;
  const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
  function parseURL(parseQuery2, location2, currentLocation = "/") {
    let path, query = {}, searchString = "", hash2 = "";
    const searchPos = location2.indexOf("?");
    const hashPos = location2.indexOf("#", searchPos > -1 ? searchPos : 0);
    if (searchPos > -1) {
      path = location2.slice(0, searchPos);
      searchString = location2.slice(searchPos + 1, hashPos > -1 ? hashPos : location2.length);
      query = parseQuery2(searchString);
    }
    if (hashPos > -1) {
      path = path || location2.slice(0, hashPos);
      hash2 = location2.slice(hashPos, location2.length);
    }
    path = resolveRelativePath(path != null ? path : location2, currentLocation);
    return {
      fullPath: path + (searchString && "?") + searchString + hash2,
      path,
      query,
      hash: hash2
    };
  }
  function stringifyURL(stringifyQuery2, location2) {
    const query = location2.query ? stringifyQuery2(location2.query) : "";
    return location2.path + (query && "?") + query + (location2.hash || "");
  }
  function stripBase(pathname, base) {
    if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
      return pathname;
    return pathname.slice(base.length) || "/";
  }
  function isSameRouteLocation(stringifyQuery2, a, b) {
    const aLastIndex = a.matched.length - 1;
    const bLastIndex = b.matched.length - 1;
    return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery2(a.query) === stringifyQuery2(b.query) && a.hash === b.hash;
  }
  function isSameRouteRecord(a, b) {
    return (a.aliasOf || a) === (b.aliasOf || b);
  }
  function isSameRouteLocationParams(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length)
      return false;
    for (const key in a) {
      if (!isSameRouteLocationParamsValue(a[key], b[key]))
        return false;
    }
    return true;
  }
  function isSameRouteLocationParamsValue(a, b) {
    return Array.isArray(a) ? isEquivalentArray(a, b) : Array.isArray(b) ? isEquivalentArray(b, a) : a === b;
  }
  function isEquivalentArray(a, b) {
    return Array.isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
  }
  function resolveRelativePath(to, from) {
    if (to.startsWith("/"))
      return to;
    if (!to)
      return from;
    const fromSegments = from.split("/");
    const toSegments = to.split("/");
    let position = fromSegments.length - 1;
    let toPosition;
    let segment;
    for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
      segment = toSegments[toPosition];
      if (position === 1 || segment === ".")
        continue;
      if (segment === "..")
        position--;
      else
        break;
    }
    return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join("/");
  }
  var NavigationType;
  (function(NavigationType2) {
    NavigationType2["pop"] = "pop";
    NavigationType2["push"] = "push";
  })(NavigationType || (NavigationType = {}));
  var NavigationDirection;
  (function(NavigationDirection2) {
    NavigationDirection2["back"] = "back";
    NavigationDirection2["forward"] = "forward";
    NavigationDirection2["unknown"] = "";
  })(NavigationDirection || (NavigationDirection = {}));
  const START = "";
  function normalizeBase(base) {
    if (!base) {
      {
        base = "/";
      }
    }
    if (base[0] !== "/" && base[0] !== "#")
      base = "/" + base;
    return removeTrailingSlash(base);
  }
  const BEFORE_HASH_RE = /^[^#]+#/;
  function createHref(base, location2) {
    return base.replace(BEFORE_HASH_RE, "#") + location2;
  }
  const computeScrollPosition = () => ({
    left: window.pageXOffset,
    top: window.pageYOffset
  });
  let createBaseLocation = () => location.protocol + "//" + location.host;
  function createCurrentLocation(base, location2) {
    const { pathname, search, hash: hash2 } = location2;
    const hashPos = base.indexOf("#");
    if (hashPos > -1) {
      let slicePos = hash2.includes(base.slice(hashPos)) ? base.slice(hashPos).length : 1;
      let pathFromHash = hash2.slice(slicePos);
      if (pathFromHash[0] !== "/")
        pathFromHash = "/" + pathFromHash;
      return stripBase(pathFromHash, "");
    }
    const path = stripBase(pathname, base);
    return path + search + hash2;
  }
  function useHistoryListeners(base, historyState, currentLocation, replace) {
    let listeners = [];
    let teardowns = [];
    let pauseState = null;
    const popStateHandler = ({ state }) => {
      const to = createCurrentLocation(base, location);
      const from = currentLocation.value;
      const fromState = historyState.value;
      let delta = 0;
      if (state) {
        currentLocation.value = to;
        historyState.value = state;
        if (pauseState && pauseState === from) {
          pauseState = null;
          return;
        }
        delta = fromState ? state.position - fromState.position : 0;
      } else {
        replace(to);
      }
      listeners.forEach((listener) => {
        listener(currentLocation.value, from, {
          delta,
          type: NavigationType.pop,
          direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
        });
      });
    };
    function pauseListeners() {
      pauseState = currentLocation.value;
    }
    function listen(callback) {
      listeners.push(callback);
      const teardown = () => {
        const index2 = listeners.indexOf(callback);
        if (index2 > -1)
          listeners.splice(index2, 1);
      };
      teardowns.push(teardown);
      return teardown;
    }
    function beforeUnloadListener() {
      const { history: history2 } = window;
      if (!history2.state)
        return;
      history2.replaceState(assign({}, history2.state, { scroll: computeScrollPosition() }), "");
    }
    function destroy() {
      for (const teardown of teardowns)
        teardown();
      teardowns = [];
      window.removeEventListener("popstate", popStateHandler);
      window.removeEventListener("beforeunload", beforeUnloadListener);
    }
    window.addEventListener("popstate", popStateHandler);
    window.addEventListener("beforeunload", beforeUnloadListener);
    return {
      pauseListeners,
      listen,
      destroy
    };
  }
  function buildState(back, current, forward, replaced = false, computeScroll = false) {
    return {
      back,
      current,
      forward,
      replaced,
      position: window.history.length,
      scroll: computeScroll ? computeScrollPosition() : null
    };
  }
  function useHistoryStateNavigation(base) {
    const { history: history2, location: location2 } = window;
    const currentLocation = {
      value: createCurrentLocation(base, location2)
    };
    const historyState = { value: history2.state };
    if (!historyState.value) {
      changeLocation(currentLocation.value, {
        back: null,
        current: currentLocation.value,
        forward: null,
        position: history2.length - 1,
        replaced: true,
        scroll: null
      }, true);
    }
    function changeLocation(to, state, replace2) {
      const hashIndex = base.indexOf("#");
      const url = hashIndex > -1 ? (location2.host && document.querySelector("base") ? base : base.slice(hashIndex)) + to : createBaseLocation() + base + to;
      try {
        history2[replace2 ? "replaceState" : "pushState"](state, "", url);
        historyState.value = state;
      } catch (err) {
        {
          console.error(err);
        }
        location2[replace2 ? "replace" : "assign"](url);
      }
    }
    function replace(to, data) {
      const state = assign({}, history2.state, buildState(historyState.value.back, to, historyState.value.forward, true), data, { position: historyState.value.position });
      changeLocation(to, state, true);
      currentLocation.value = to;
    }
    function push(to, data) {
      const currentState = assign({}, historyState.value, history2.state, {
        forward: to,
        scroll: computeScrollPosition()
      });
      changeLocation(currentState.current, currentState, true);
      const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
      changeLocation(to, state, false);
      currentLocation.value = to;
    }
    return {
      location: currentLocation,
      state: historyState,
      push,
      replace
    };
  }
  function createWebHistory(base) {
    base = normalizeBase(base);
    const historyNavigation = useHistoryStateNavigation(base);
    const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
    function go(delta, triggerListeners = true) {
      if (!triggerListeners)
        historyListeners.pauseListeners();
      history.go(delta);
    }
    const routerHistory = assign({
      location: "",
      base,
      go,
      createHref: createHref.bind(null, base)
    }, historyNavigation, historyListeners);
    Object.defineProperty(routerHistory, "location", {
      enumerable: true,
      get: () => historyNavigation.location.value
    });
    Object.defineProperty(routerHistory, "state", {
      enumerable: true,
      get: () => historyNavigation.state.value
    });
    return routerHistory;
  }
  function createMemoryHistory(base = "") {
    let listeners = [];
    let queue = [START];
    let position = 0;
    base = normalizeBase(base);
    function setLocation(location2) {
      position++;
      if (position === queue.length) {
        queue.push(location2);
      } else {
        queue.splice(position);
        queue.push(location2);
      }
    }
    function triggerListeners(to, from, { direction, delta }) {
      const info = {
        direction,
        delta,
        type: NavigationType.pop
      };
      for (const callback of listeners) {
        callback(to, from, info);
      }
    }
    const routerHistory = {
      location: START,
      state: {},
      base,
      createHref: createHref.bind(null, base),
      replace(to) {
        queue.splice(position--, 1);
        setLocation(to);
      },
      push(to, data) {
        setLocation(to);
      },
      listen(callback) {
        listeners.push(callback);
        return () => {
          const index2 = listeners.indexOf(callback);
          if (index2 > -1)
            listeners.splice(index2, 1);
        };
      },
      destroy() {
        listeners = [];
        queue = [START];
        position = 0;
      },
      go(delta, shouldTrigger = true) {
        const from = this.location;
        const direction = delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
        position = Math.max(0, Math.min(position + delta, queue.length - 1));
        if (shouldTrigger) {
          triggerListeners(this.location, from, {
            direction,
            delta
          });
        }
      }
    };
    Object.defineProperty(routerHistory, "location", {
      enumerable: true,
      get: () => queue[position]
    });
    return routerHistory;
  }
  function createWebHashHistory(base) {
    base = location.host ? base || location.pathname + location.search : "";
    if (!base.includes("#"))
      base += "#";
    return createWebHistory(base);
  }
  function isRouteLocation(route) {
    return typeof route === "string" || route && typeof route === "object";
  }
  function isRouteName(name) {
    return typeof name === "string" || typeof name === "symbol";
  }
  const START_LOCATION_NORMALIZED = {
    path: "/",
    name: void 0,
    params: {},
    query: {},
    hash: "",
    fullPath: "/",
    matched: [],
    meta: {},
    redirectedFrom: void 0
  };
  const NavigationFailureSymbol = /* @__PURE__ */ PolySymbol("nf");
  exports.NavigationFailureType = void 0;
  (function(NavigationFailureType) {
    NavigationFailureType[NavigationFailureType["aborted"] = 4] = "aborted";
    NavigationFailureType[NavigationFailureType["cancelled"] = 8] = "cancelled";
    NavigationFailureType[NavigationFailureType["duplicated"] = 16] = "duplicated";
  })(exports.NavigationFailureType || (exports.NavigationFailureType = {}));
  const ErrorTypeMessages = {
    [1]({ location: location2, currentLocation }) {
      return `No match for
 ${JSON.stringify(location2)}${currentLocation ? "\nwhile being at\n" + JSON.stringify(currentLocation) : ""}`;
    },
    [2]({ from, to }) {
      return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
    },
    [4]({ from, to }) {
      return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
    },
    [8]({ from, to }) {
      return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
    },
    [16]({ from, to }) {
      return `Avoided redundant navigation to current location: "${from.fullPath}".`;
    }
  };
  function createRouterError(type, params) {
    {
      return assign(new Error(ErrorTypeMessages[type](params)), {
        type,
        [NavigationFailureSymbol]: true
      }, params);
    }
  }
  function isNavigationFailure(error, type) {
    return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
  }
  const propertiesToLog = ["params", "query", "hash"];
  function stringifyRoute(to) {
    if (typeof to === "string")
      return to;
    if ("path" in to)
      return to.path;
    const location2 = {};
    for (const key of propertiesToLog) {
      if (key in to)
        location2[key] = to[key];
    }
    return JSON.stringify(location2, null, 2);
  }
  const BASE_PARAM_PATTERN = "[^/]+?";
  const BASE_PATH_PARSER_OPTIONS = {
    sensitive: false,
    strict: false,
    start: true,
    end: true
  };
  const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
  function tokensToParser(segments, extraOptions) {
    const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
    const score = [];
    let pattern = options.start ? "^" : "";
    const keys = [];
    for (const segment of segments) {
      const segmentScores = segment.length ? [] : [90];
      if (options.strict && !segment.length)
        pattern += "/";
      for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
        const token = segment[tokenIndex];
        let subSegmentScore = 40 + (options.sensitive ? 0.25 : 0);
        if (token.type === 0) {
          if (!tokenIndex)
            pattern += "/";
          pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
          subSegmentScore += 40;
        } else if (token.type === 1) {
          const { value, repeatable, optional, regexp } = token;
          keys.push({
            name: value,
            repeatable,
            optional
          });
          const re2 = regexp ? regexp : BASE_PARAM_PATTERN;
          if (re2 !== BASE_PARAM_PATTERN) {
            subSegmentScore += 10;
            try {
              new RegExp(`(${re2})`);
            } catch (err) {
              throw new Error(`Invalid custom RegExp for param "${value}" (${re2}): ` + err.message);
            }
          }
          let subPattern = repeatable ? `((?:${re2})(?:/(?:${re2}))*)` : `(${re2})`;
          if (!tokenIndex)
            subPattern = optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
          if (optional)
            subPattern += "?";
          pattern += subPattern;
          subSegmentScore += 20;
          if (optional)
            subSegmentScore += -8;
          if (repeatable)
            subSegmentScore += -20;
          if (re2 === ".*")
            subSegmentScore += -50;
        }
        segmentScores.push(subSegmentScore);
      }
      score.push(segmentScores);
    }
    if (options.strict && options.end) {
      const i = score.length - 1;
      score[i][score[i].length - 1] += 0.7000000000000001;
    }
    if (!options.strict)
      pattern += "/?";
    if (options.end)
      pattern += "$";
    else if (options.strict)
      pattern += "(?:/|$)";
    const re = new RegExp(pattern, options.sensitive ? "" : "i");
    function parse(path) {
      const match = path.match(re);
      const params = {};
      if (!match)
        return null;
      for (let i = 1; i < match.length; i++) {
        const value = match[i] || "";
        const key = keys[i - 1];
        params[key.name] = value && key.repeatable ? value.split("/") : value;
      }
      return params;
    }
    function stringify(params) {
      let path = "";
      let avoidDuplicatedSlash = false;
      for (const segment of segments) {
        if (!avoidDuplicatedSlash || !path.endsWith("/"))
          path += "/";
        avoidDuplicatedSlash = false;
        for (const token of segment) {
          if (token.type === 0) {
            path += token.value;
          } else if (token.type === 1) {
            const { value, repeatable, optional } = token;
            const param = value in params ? params[value] : "";
            if (Array.isArray(param) && !repeatable)
              throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
            const text = Array.isArray(param) ? param.join("/") : param;
            if (!text) {
              if (optional) {
                if (segment.length < 2 && segments.length > 1) {
                  if (path.endsWith("/"))
                    path = path.slice(0, -1);
                  else
                    avoidDuplicatedSlash = true;
                }
              } else
                throw new Error(`Missing required param "${value}"`);
            }
            path += text;
          }
        }
      }
      return path;
    }
    return {
      re,
      score,
      keys,
      parse,
      stringify
    };
  }
  function compareScoreArray(a, b) {
    let i = 0;
    while (i < a.length && i < b.length) {
      const diff = b[i] - a[i];
      if (diff)
        return diff;
      i++;
    }
    if (a.length < b.length) {
      return a.length === 1 && a[0] === 40 + 40 ? -1 : 1;
    } else if (a.length > b.length) {
      return b.length === 1 && b[0] === 40 + 40 ? 1 : -1;
    }
    return 0;
  }
  function comparePathParserScore(a, b) {
    let i = 0;
    const aScore = a.score;
    const bScore = b.score;
    while (i < aScore.length && i < bScore.length) {
      const comp = compareScoreArray(aScore[i], bScore[i]);
      if (comp)
        return comp;
      i++;
    }
    if (Math.abs(bScore.length - aScore.length) === 1) {
      if (isLastScoreNegative(aScore))
        return 1;
      if (isLastScoreNegative(bScore))
        return -1;
    }
    return bScore.length - aScore.length;
  }
  function isLastScoreNegative(score) {
    const last = score[score.length - 1];
    return score.length > 0 && last[last.length - 1] < 0;
  }
  const ROOT_TOKEN = {
    type: 0,
    value: ""
  };
  const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
  function tokenizePath(path) {
    if (!path)
      return [[]];
    if (path === "/")
      return [[ROOT_TOKEN]];
    if (!path.startsWith("/")) {
      throw new Error(`Invalid path "${path}"`);
    }
    function crash(message) {
      throw new Error(`ERR (${state})/"${buffer}": ${message}`);
    }
    let state = 0;
    let previousState = state;
    const tokens = [];
    let segment;
    function finalizeSegment() {
      if (segment)
        tokens.push(segment);
      segment = [];
    }
    let i = 0;
    let char;
    let buffer = "";
    let customRe = "";
    function consumeBuffer() {
      if (!buffer)
        return;
      if (state === 0) {
        segment.push({
          type: 0,
          value: buffer
        });
      } else if (state === 1 || state === 2 || state === 3) {
        if (segment.length > 1 && (char === "*" || char === "+"))
          crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
        segment.push({
          type: 1,
          value: buffer,
          regexp: customRe,
          repeatable: char === "*" || char === "+",
          optional: char === "*" || char === "?"
        });
      } else {
        crash("Invalid state to consume buffer");
      }
      buffer = "";
    }
    function addCharToBuffer() {
      buffer += char;
    }
    while (i < path.length) {
      char = path[i++];
      if (char === "\\" && state !== 2) {
        previousState = state;
        state = 4;
        continue;
      }
      switch (state) {
        case 0:
          if (char === "/") {
            if (buffer) {
              consumeBuffer();
            }
            finalizeSegment();
          } else if (char === ":") {
            consumeBuffer();
            state = 1;
          } else {
            addCharToBuffer();
          }
          break;
        case 4:
          addCharToBuffer();
          state = previousState;
          break;
        case 1:
          if (char === "(") {
            state = 2;
          } else if (VALID_PARAM_RE.test(char)) {
            addCharToBuffer();
          } else {
            consumeBuffer();
            state = 0;
            if (char !== "*" && char !== "?" && char !== "+")
              i--;
          }
          break;
        case 2:
          if (char === ")") {
            if (customRe[customRe.length - 1] == "\\")
              customRe = customRe.slice(0, -1) + char;
            else
              state = 3;
          } else {
            customRe += char;
          }
          break;
        case 3:
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i--;
          customRe = "";
          break;
        default:
          crash("Unknown state");
          break;
      }
    }
    if (state === 2)
      crash(`Unfinished custom RegExp for param "${buffer}"`);
    consumeBuffer();
    finalizeSegment();
    return tokens;
  }
  function createRouteRecordMatcher(record, parent, options) {
    const parser = tokensToParser(tokenizePath(record.path), options);
    const matcher = assign(parser, {
      record,
      parent,
      children: [],
      alias: []
    });
    if (parent) {
      if (!matcher.record.aliasOf === !parent.record.aliasOf)
        parent.children.push(matcher);
    }
    return matcher;
  }
  function createRouterMatcher(routes2, globalOptions) {
    const matchers = [];
    const matcherMap = /* @__PURE__ */ new Map();
    globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
    function getRecordMatcher(name) {
      return matcherMap.get(name);
    }
    function addRoute(record, parent, originalRecord) {
      const isRootAdd = !originalRecord;
      const mainNormalizedRecord = normalizeRouteRecord(record);
      mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
      const options = mergeOptions(globalOptions, record);
      const normalizedRecords = [
        mainNormalizedRecord
      ];
      if ("alias" in record) {
        const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
        for (const alias of aliases) {
          normalizedRecords.push(assign({}, mainNormalizedRecord, {
            components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
            path: alias,
            aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
          }));
        }
      }
      let matcher;
      let originalMatcher;
      for (const normalizedRecord of normalizedRecords) {
        const { path } = normalizedRecord;
        if (parent && path[0] !== "/") {
          const parentPath = parent.record.path;
          const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
          normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
        }
        matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
        if (originalRecord) {
          originalRecord.alias.push(matcher);
        } else {
          originalMatcher = originalMatcher || matcher;
          if (originalMatcher !== matcher)
            originalMatcher.alias.push(matcher);
          if (isRootAdd && record.name && !isAliasRecord(matcher))
            removeRoute(record.name);
        }
        if ("children" in mainNormalizedRecord) {
          const children = mainNormalizedRecord.children;
          for (let i = 0; i < children.length; i++) {
            addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
          }
        }
        originalRecord = originalRecord || matcher;
        insertMatcher(matcher);
      }
      return originalMatcher ? () => {
        removeRoute(originalMatcher);
      } : noop;
    }
    function removeRoute(matcherRef) {
      if (isRouteName(matcherRef)) {
        const matcher = matcherMap.get(matcherRef);
        if (matcher) {
          matcherMap.delete(matcherRef);
          matchers.splice(matchers.indexOf(matcher), 1);
          matcher.children.forEach(removeRoute);
          matcher.alias.forEach(removeRoute);
        }
      } else {
        const index2 = matchers.indexOf(matcherRef);
        if (index2 > -1) {
          matchers.splice(index2, 1);
          if (matcherRef.record.name)
            matcherMap.delete(matcherRef.record.name);
          matcherRef.children.forEach(removeRoute);
          matcherRef.alias.forEach(removeRoute);
        }
      }
    }
    function getRoutes() {
      return matchers;
    }
    function insertMatcher(matcher) {
      let i = 0;
      while (i < matchers.length && comparePathParserScore(matcher, matchers[i]) >= 0 && (matcher.record.path !== matchers[i].record.path || !isRecordChildOf(matcher, matchers[i])))
        i++;
      matchers.splice(i, 0, matcher);
      if (matcher.record.name && !isAliasRecord(matcher))
        matcherMap.set(matcher.record.name, matcher);
    }
    function resolve(location2, currentLocation) {
      let matcher;
      let params = {};
      let path;
      let name;
      if ("name" in location2 && location2.name) {
        matcher = matcherMap.get(location2.name);
        if (!matcher)
          throw createRouterError(1, {
            location: location2
          });
        name = matcher.record.name;
        params = assign(paramsFromLocation(currentLocation.params, matcher.keys.filter((k) => !k.optional).map((k) => k.name)), location2.params);
        path = matcher.stringify(params);
      } else if ("path" in location2) {
        path = location2.path;
        matcher = matchers.find((m) => m.re.test(path));
        if (matcher) {
          params = matcher.parse(path);
          name = matcher.record.name;
        }
      } else {
        matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
        if (!matcher)
          throw createRouterError(1, {
            location: location2,
            currentLocation
          });
        name = matcher.record.name;
        params = assign({}, currentLocation.params, location2.params);
        path = matcher.stringify(params);
      }
      const matched = [];
      let parentMatcher = matcher;
      while (parentMatcher) {
        matched.unshift(parentMatcher.record);
        parentMatcher = parentMatcher.parent;
      }
      return {
        name,
        path,
        params,
        matched,
        meta: mergeMetaFields(matched)
      };
    }
    routes2.forEach((route) => addRoute(route));
    return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher };
  }
  function paramsFromLocation(params, keys) {
    const newParams = {};
    for (const key of keys) {
      if (key in params)
        newParams[key] = params[key];
    }
    return newParams;
  }
  function normalizeRouteRecord(record) {
    return {
      path: record.path,
      redirect: record.redirect,
      name: record.name,
      meta: record.meta || {},
      aliasOf: void 0,
      beforeEnter: record.beforeEnter,
      props: normalizeRecordProps(record),
      children: record.children || [],
      instances: {},
      leaveGuards: /* @__PURE__ */ new Set(),
      updateGuards: /* @__PURE__ */ new Set(),
      enterCallbacks: {},
      components: "components" in record ? record.components || {} : { default: record.component }
    };
  }
  function normalizeRecordProps(record) {
    const propsObject = {};
    const props = record.props || false;
    if ("component" in record) {
      propsObject.default = props;
    } else {
      for (const name in record.components)
        propsObject[name] = typeof props === "boolean" ? props : props[name];
    }
    return propsObject;
  }
  function isAliasRecord(record) {
    while (record) {
      if (record.record.aliasOf)
        return true;
      record = record.parent;
    }
    return false;
  }
  function mergeMetaFields(matched) {
    return matched.reduce((meta2, record) => assign(meta2, record.meta), {});
  }
  function mergeOptions(defaults2, partialOptions) {
    const options = {};
    for (const key in defaults2) {
      options[key] = key in partialOptions ? partialOptions[key] : defaults2[key];
    }
    return options;
  }
  function isRecordChildOf(record, parent) {
    return parent.children.some((child) => child === record || isRecordChildOf(record, child));
  }
  const HASH_RE = /#/g;
  const AMPERSAND_RE = /&/g;
  const SLASH_RE = /\//g;
  const EQUAL_RE = /=/g;
  const IM_RE = /\?/g;
  const PLUS_RE = /\+/g;
  const ENC_BRACKET_OPEN_RE = /%5B/g;
  const ENC_BRACKET_CLOSE_RE = /%5D/g;
  const ENC_CARET_RE = /%5E/g;
  const ENC_BACKTICK_RE = /%60/g;
  const ENC_CURLY_OPEN_RE = /%7B/g;
  const ENC_PIPE_RE = /%7C/g;
  const ENC_CURLY_CLOSE_RE = /%7D/g;
  const ENC_SPACE_RE = /%20/g;
  function commonEncode(text) {
    return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
  }
  function encodeHash(text) {
    return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
  }
  function encodeQueryValue(text) {
    return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
  }
  function encodeQueryKey(text) {
    return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
  }
  function encodePath(text) {
    return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
  }
  function encodeParam(text) {
    return text == null ? "" : encodePath(text).replace(SLASH_RE, "%2F");
  }
  function decode(text) {
    try {
      return decodeURIComponent("" + text);
    } catch (err) {
    }
    return "" + text;
  }
  function parseQuery(search) {
    const query = {};
    if (search === "" || search === "?")
      return query;
    const hasLeadingIM = search[0] === "?";
    const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
    for (let i = 0; i < searchParams.length; ++i) {
      const searchParam = searchParams[i].replace(PLUS_RE, " ");
      const eqPos = searchParam.indexOf("=");
      const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
      const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
      if (key in query) {
        let currentValue = query[key];
        if (!Array.isArray(currentValue)) {
          currentValue = query[key] = [currentValue];
        }
        currentValue.push(value);
      } else {
        query[key] = value;
      }
    }
    return query;
  }
  function stringifyQuery(query) {
    let search = "";
    for (let key in query) {
      const value = query[key];
      key = encodeQueryKey(key);
      if (value == null) {
        if (value !== void 0) {
          search += (search.length ? "&" : "") + key;
        }
        continue;
      }
      const values = Array.isArray(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)];
      values.forEach((value2) => {
        if (value2 !== void 0) {
          search += (search.length ? "&" : "") + key;
          if (value2 != null)
            search += "=" + value2;
        }
      });
    }
    return search;
  }
  function normalizeQuery(query) {
    const normalizedQuery = {};
    for (const key in query) {
      const value = query[key];
      if (value !== void 0) {
        normalizedQuery[key] = Array.isArray(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
      }
    }
    return normalizedQuery;
  }
  function useCallbacks() {
    let handlers = [];
    function add(handler) {
      handlers.push(handler);
      return () => {
        const i = handlers.indexOf(handler);
        if (i > -1)
          handlers.splice(i, 1);
      };
    }
    function reset() {
      handlers = [];
    }
    return {
      add,
      list: () => handlers,
      reset
    };
  }
  function registerGuard(record, name, guard) {
    const removeFromList = () => {
      record[name].delete(guard);
    };
    vue.onUnmounted(removeFromList);
    vue.onDeactivated(removeFromList);
    vue.onActivated(() => {
      record[name].add(guard);
    });
    record[name].add(guard);
  }
  function onBeforeRouteLeave(leaveGuard) {
    const activeRecord = vue.inject(matchedRouteKey, {}).value;
    if (!activeRecord) {
      return;
    }
    registerGuard(activeRecord, "leaveGuards", leaveGuard);
  }
  function onBeforeRouteUpdate(updateGuard) {
    const activeRecord = vue.inject(matchedRouteKey, {}).value;
    if (!activeRecord) {
      return;
    }
    registerGuard(activeRecord, "updateGuards", updateGuard);
  }
  function guardToPromiseFn(guard, to, from, record, name) {
    const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
    return () => new Promise((resolve, reject) => {
      const next = (valid) => {
        if (valid === false)
          reject(createRouterError(4, {
            from,
            to
          }));
        else if (valid instanceof Error) {
          reject(valid);
        } else if (isRouteLocation(valid)) {
          reject(createRouterError(2, {
            from: to,
            to: valid
          }));
        } else {
          if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function")
            enterCallbackArray.push(valid);
          resolve();
        }
      };
      const guardReturn = guard.call(record && record.instances[name], to, from, next);
      let guardCall = Promise.resolve(guardReturn);
      if (guard.length < 3)
        guardCall = guardCall.then(next);
      guardCall.catch((err) => reject(err));
    });
  }
  function extractComponentsGuards(matched, guardType, to, from) {
    const guards = [];
    for (const record of matched) {
      for (const name in record.components) {
        let rawComponent = record.components[name];
        if (guardType !== "beforeRouteEnter" && !record.instances[name])
          continue;
        if (isRouteComponent(rawComponent)) {
          const options = rawComponent.__vccOpts || rawComponent;
          const guard = options[guardType];
          guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
        } else {
          let componentPromise = rawComponent();
          guards.push(() => componentPromise.then((resolved) => {
            if (!resolved)
              return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
            const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
            record.components[name] = resolvedComponent;
            const options = resolvedComponent.__vccOpts || resolvedComponent;
            const guard = options[guardType];
            return guard && guardToPromiseFn(guard, to, from, record, name)();
          }));
        }
      }
    }
    return guards;
  }
  function isRouteComponent(component) {
    return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
  }
  function useLink(props) {
    const router = vue.inject(routerKey);
    const currentRoute = vue.inject(routeLocationKey);
    const route = vue.computed(() => router.resolve(vue.unref(props.to)));
    const activeRecordIndex = vue.computed(() => {
      const { matched } = route.value;
      const { length } = matched;
      const routeMatched = matched[length - 1];
      const currentMatched = currentRoute.matched;
      if (!routeMatched || !currentMatched.length)
        return -1;
      const index2 = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
      if (index2 > -1)
        return index2;
      const parentRecordPath = getOriginalPath(matched[length - 2]);
      return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index2;
    });
    const isActive = vue.computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
    const isExactActive = vue.computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
    function navigate(e = {}) {
      if (guardEvent(e)) {
        return router[vue.unref(props.replace) ? "replace" : "push"](vue.unref(props.to)).catch(noop);
      }
      return Promise.resolve();
    }
    return {
      route,
      href: vue.computed(() => route.value.href),
      isActive,
      isExactActive,
      navigate
    };
  }
  const RouterLinkImpl = /* @__PURE__ */ vue.defineComponent({
    name: "RouterLink",
    compatConfig: { MODE: 3 },
    props: {
      to: {
        type: [String, Object],
        required: true
      },
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      custom: Boolean,
      ariaCurrentValue: {
        type: String,
        default: "page"
      }
    },
    useLink,
    setup(props, { slots }) {
      const link = vue.reactive(useLink(props));
      const { options } = vue.inject(routerKey);
      const elClass = vue.computed(() => ({
        [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
        [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
      }));
      return () => {
        const children = slots.default && slots.default(link);
        return props.custom ? children : vue.h("a", {
          "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
          href: link.href,
          onClick: link.navigate,
          class: elClass.value
        }, children);
      };
    }
  });
  const RouterLink = RouterLinkImpl;
  function guardEvent(e) {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
      return;
    if (e.defaultPrevented)
      return;
    if (e.button !== void 0 && e.button !== 0)
      return;
    if (e.currentTarget && e.currentTarget.getAttribute) {
      const target = e.currentTarget.getAttribute("target");
      if (/\b_blank\b/i.test(target))
        return;
    }
    if (e.preventDefault)
      e.preventDefault();
    return true;
  }
  function includesParams(outer, inner) {
    for (const key in inner) {
      const innerValue = inner[key];
      const outerValue = outer[key];
      if (typeof innerValue === "string") {
        if (innerValue !== outerValue)
          return false;
      } else {
        if (!Array.isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i]))
          return false;
      }
    }
    return true;
  }
  function getOriginalPath(record) {
    return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
  }
  const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
  const RouterViewImpl = /* @__PURE__ */ vue.defineComponent({
    name: "RouterView",
    inheritAttrs: false,
    props: {
      name: {
        type: String,
        default: "default"
      },
      route: Object
    },
    compatConfig: { MODE: 3 },
    setup(props, { attrs, slots }) {
      const injectedRoute = vue.inject(routerViewLocationKey);
      const routeToDisplay = vue.computed(() => props.route || injectedRoute.value);
      const depth = vue.inject(viewDepthKey, 0);
      const matchedRouteRef = vue.computed(() => routeToDisplay.value.matched[depth]);
      vue.provide(viewDepthKey, depth + 1);
      vue.provide(matchedRouteKey, matchedRouteRef);
      vue.provide(routerViewLocationKey, routeToDisplay);
      const viewRef = vue.ref();
      vue.watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
        if (to) {
          to.instances[name] = instance;
          if (from && from !== to && instance && instance === oldInstance) {
            if (!to.leaveGuards.size) {
              to.leaveGuards = from.leaveGuards;
            }
            if (!to.updateGuards.size) {
              to.updateGuards = from.updateGuards;
            }
          }
        }
        if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
          (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
        }
      }, { flush: "post" });
      return () => {
        const route = routeToDisplay.value;
        const matchedRoute = matchedRouteRef.value;
        const ViewComponent = matchedRoute && matchedRoute.components[props.name];
        const currentName = props.name;
        if (!ViewComponent) {
          return normalizeSlot(slots.default, { Component: ViewComponent, route });
        }
        const routePropsOption = matchedRoute.props[props.name];
        const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
        const onVnodeUnmounted = (vnode) => {
          if (vnode.component.isUnmounted) {
            matchedRoute.instances[currentName] = null;
          }
        };
        const component = vue.h(ViewComponent, assign({}, routeProps, attrs, {
          onVnodeUnmounted,
          ref: viewRef
        }));
        return normalizeSlot(slots.default, { Component: component, route }) || component;
      };
    }
  });
  function normalizeSlot(slot, data) {
    if (!slot)
      return null;
    const slotContent = slot(data);
    return slotContent.length === 1 ? slotContent[0] : slotContent;
  }
  const RouterView = RouterViewImpl;
  function createRouter(options) {
    const matcher = createRouterMatcher(options.routes, options);
    const parseQuery$1 = options.parseQuery || parseQuery;
    const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
    const routerHistory = options.history;
    const beforeGuards = useCallbacks();
    const beforeResolveGuards = useCallbacks();
    const afterGuards = useCallbacks();
    const currentRoute = vue.shallowRef(START_LOCATION_NORMALIZED);
    let pendingLocation = START_LOCATION_NORMALIZED;
    const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
    const encodeParams = applyToParams.bind(null, encodeParam);
    const decodeParams = applyToParams.bind(null, decode);
    function addRoute(parentOrRoute, route) {
      let parent;
      let record;
      if (isRouteName(parentOrRoute)) {
        parent = matcher.getRecordMatcher(parentOrRoute);
        record = route;
      } else {
        record = parentOrRoute;
      }
      return matcher.addRoute(record, parent);
    }
    function removeRoute(name) {
      const recordMatcher = matcher.getRecordMatcher(name);
      if (recordMatcher) {
        matcher.removeRoute(recordMatcher);
      }
    }
    function getRoutes() {
      return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
    }
    function hasRoute(name) {
      return !!matcher.getRecordMatcher(name);
    }
    function resolve(rawLocation, currentLocation) {
      currentLocation = assign({}, currentLocation || currentRoute.value);
      if (typeof rawLocation === "string") {
        const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
        const matchedRoute2 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
        const href2 = routerHistory.createHref(locationNormalized.fullPath);
        return assign(locationNormalized, matchedRoute2, {
          params: decodeParams(matchedRoute2.params),
          hash: decode(locationNormalized.hash),
          redirectedFrom: void 0,
          href: href2
        });
      }
      let matcherLocation;
      if ("path" in rawLocation) {
        matcherLocation = assign({}, rawLocation, {
          path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
        });
      } else {
        const targetParams = assign({}, rawLocation.params);
        for (const key in targetParams) {
          if (targetParams[key] == null) {
            delete targetParams[key];
          }
        }
        matcherLocation = assign({}, rawLocation, {
          params: encodeParams(rawLocation.params)
        });
        currentLocation.params = encodeParams(currentLocation.params);
      }
      const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
      const hash2 = rawLocation.hash || "";
      matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
      const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
        hash: encodeHash(hash2),
        path: matchedRoute.path
      }));
      const href = routerHistory.createHref(fullPath);
      return assign({
        fullPath,
        hash: hash2,
        query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
      }, matchedRoute, {
        redirectedFrom: void 0,
        href
      });
    }
    function locationAsObject(to) {
      return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
    }
    function checkCanceledNavigation(to, from) {
      if (pendingLocation !== to) {
        return createRouterError(8, {
          from,
          to
        });
      }
    }
    function push(to) {
      return pushWithRedirect(to);
    }
    function replace(to) {
      return push(assign(locationAsObject(to), { replace: true }));
    }
    function handleRedirectRecord(to) {
      const lastMatched = to.matched[to.matched.length - 1];
      if (lastMatched && lastMatched.redirect) {
        const { redirect } = lastMatched;
        let newTargetLocation = typeof redirect === "function" ? redirect(to) : redirect;
        if (typeof newTargetLocation === "string") {
          newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : { path: newTargetLocation };
          newTargetLocation.params = {};
        }
        return assign({
          query: to.query,
          hash: to.hash,
          params: to.params
        }, newTargetLocation);
      }
    }
    function pushWithRedirect(to, redirectedFrom) {
      const targetLocation = pendingLocation = resolve(to);
      const from = currentRoute.value;
      const data = to.state;
      const force = to.force;
      const replace2 = to.replace === true;
      const shouldRedirect = handleRedirectRecord(targetLocation);
      if (shouldRedirect)
        return pushWithRedirect(assign(locationAsObject(shouldRedirect), {
          state: data,
          force,
          replace: replace2
        }), redirectedFrom || targetLocation);
      const toLocation = targetLocation;
      toLocation.redirectedFrom = redirectedFrom;
      let failure;
      if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
        failure = createRouterError(16, { to: toLocation, from });
        handleScroll();
      }
      return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? isNavigationFailure(error, 2) ? error : markAsReady(error) : triggerError(error, toLocation, from)).then((failure2) => {
        if (failure2) {
          if (isNavigationFailure(failure2, 2)) {
            return pushWithRedirect(assign(locationAsObject(failure2.to), {
              state: data,
              force,
              replace: replace2
            }), redirectedFrom || toLocation);
          }
        } else {
          failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
        }
        triggerAfterEach(toLocation, from, failure2);
        return failure2;
      });
    }
    function checkCanceledNavigationAndReject(to, from) {
      const error = checkCanceledNavigation(to, from);
      return error ? Promise.reject(error) : Promise.resolve();
    }
    function navigate(to, from) {
      let guards;
      const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
      guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
      for (const record of leavingRecords) {
        record.leaveGuards.forEach((guard) => {
          guards.push(guardToPromiseFn(guard, to, from));
        });
      }
      const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards).then(() => {
        guards = [];
        for (const guard of beforeGuards.list()) {
          guards.push(guardToPromiseFn(guard, to, from));
        }
        guards.push(canceledNavigationCheck);
        return runGuardQueue(guards);
      }).then(() => {
        guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
        for (const record of updatingRecords) {
          record.updateGuards.forEach((guard) => {
            guards.push(guardToPromiseFn(guard, to, from));
          });
        }
        guards.push(canceledNavigationCheck);
        return runGuardQueue(guards);
      }).then(() => {
        guards = [];
        for (const record of to.matched) {
          if (record.beforeEnter && !from.matched.includes(record)) {
            if (Array.isArray(record.beforeEnter)) {
              for (const beforeEnter of record.beforeEnter)
                guards.push(guardToPromiseFn(beforeEnter, to, from));
            } else {
              guards.push(guardToPromiseFn(record.beforeEnter, to, from));
            }
          }
        }
        guards.push(canceledNavigationCheck);
        return runGuardQueue(guards);
      }).then(() => {
        to.matched.forEach((record) => record.enterCallbacks = {});
        guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from);
        guards.push(canceledNavigationCheck);
        return runGuardQueue(guards);
      }).then(() => {
        guards = [];
        for (const guard of beforeResolveGuards.list()) {
          guards.push(guardToPromiseFn(guard, to, from));
        }
        guards.push(canceledNavigationCheck);
        return runGuardQueue(guards);
      }).catch((err) => isNavigationFailure(err, 8) ? err : Promise.reject(err));
    }
    function triggerAfterEach(to, from, failure) {
      for (const guard of afterGuards.list())
        guard(to, from, failure);
    }
    function finalizeNavigation(toLocation, from, isPush, replace2, data) {
      const error = checkCanceledNavigation(toLocation, from);
      if (error)
        return error;
      const isFirstNavigation = from === START_LOCATION_NORMALIZED;
      const state = {};
      if (isPush) {
        if (replace2 || isFirstNavigation)
          routerHistory.replace(toLocation.fullPath, assign({
            scroll: isFirstNavigation && state && state.scroll
          }, data));
        else
          routerHistory.push(toLocation.fullPath, data);
      }
      currentRoute.value = toLocation;
      handleScroll();
      markAsReady();
    }
    let removeHistoryListener;
    function setupListeners() {
      if (removeHistoryListener)
        return;
      removeHistoryListener = routerHistory.listen((to, _from, info) => {
        const toLocation = resolve(to);
        const shouldRedirect = handleRedirectRecord(toLocation);
        if (shouldRedirect) {
          pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop);
          return;
        }
        pendingLocation = toLocation;
        const from = currentRoute.value;
        navigate(toLocation, from).catch((error) => {
          if (isNavigationFailure(error, 4 | 8)) {
            return error;
          }
          if (isNavigationFailure(error, 2)) {
            pushWithRedirect(error.to, toLocation).then((failure) => {
              if (isNavigationFailure(failure, 4 | 16) && !info.delta && info.type === NavigationType.pop) {
                routerHistory.go(-1, false);
              }
            }).catch(noop);
            return Promise.reject();
          }
          if (info.delta)
            routerHistory.go(-info.delta, false);
          return triggerError(error, toLocation, from);
        }).then((failure) => {
          failure = failure || finalizeNavigation(toLocation, from, false);
          if (failure) {
            if (info.delta) {
              routerHistory.go(-info.delta, false);
            } else if (info.type === NavigationType.pop && isNavigationFailure(failure, 4 | 16)) {
              routerHistory.go(-1, false);
            }
          }
          triggerAfterEach(toLocation, from, failure);
        }).catch(noop);
      });
    }
    let readyHandlers = useCallbacks();
    let errorHandlers = useCallbacks();
    let ready;
    function triggerError(error, to, from) {
      markAsReady(error);
      const list = errorHandlers.list();
      if (list.length) {
        list.forEach((handler) => handler(error, to, from));
      } else {
        console.error(error);
      }
      return Promise.reject(error);
    }
    function isReady() {
      if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
        return Promise.resolve();
      return new Promise((resolve2, reject) => {
        readyHandlers.add([resolve2, reject]);
      });
    }
    function markAsReady(err) {
      if (!ready) {
        ready = !err;
        setupListeners();
        readyHandlers.list().forEach(([resolve2, reject]) => err ? reject(err) : resolve2());
        readyHandlers.reset();
      }
      return err;
    }
    function handleScroll(to, from, isPush, isFirstNavigation) {
      return Promise.resolve();
    }
    const go = (delta) => routerHistory.go(delta);
    const installedApps = /* @__PURE__ */ new Set();
    const router = {
      currentRoute,
      addRoute,
      removeRoute,
      hasRoute,
      getRoutes,
      resolve,
      options,
      push,
      replace,
      go,
      back: () => go(-1),
      forward: () => go(1),
      beforeEach: beforeGuards.add,
      beforeResolve: beforeResolveGuards.add,
      afterEach: afterGuards.add,
      onError: errorHandlers.add,
      isReady,
      install(app) {
        const router2 = this;
        app.component("RouterLink", RouterLink);
        app.component("RouterView", RouterView);
        app.config.globalProperties.$router = router2;
        Object.defineProperty(app.config.globalProperties, "$route", {
          enumerable: true,
          get: () => vue.unref(currentRoute)
        });
        const reactiveRoute = {};
        for (const key in START_LOCATION_NORMALIZED) {
          reactiveRoute[key] = vue.computed(() => currentRoute.value[key]);
        }
        app.provide(routerKey, router2);
        app.provide(routeLocationKey, vue.reactive(reactiveRoute));
        app.provide(routerViewLocationKey, currentRoute);
        const unmountApp = app.unmount;
        installedApps.add(app);
        app.unmount = function() {
          installedApps.delete(app);
          if (installedApps.size < 1) {
            pendingLocation = START_LOCATION_NORMALIZED;
            removeHistoryListener && removeHistoryListener();
            removeHistoryListener = null;
            currentRoute.value = START_LOCATION_NORMALIZED;
            ready = false;
          }
          unmountApp();
        };
      }
    };
    return router;
  }
  function runGuardQueue(guards) {
    return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
  }
  function extractChangingRecords(to, from) {
    const leavingRecords = [];
    const updatingRecords = [];
    const enteringRecords = [];
    const len = Math.max(from.matched.length, to.matched.length);
    for (let i = 0; i < len; i++) {
      const recordFrom = from.matched[i];
      if (recordFrom) {
        if (to.matched.find((record) => isSameRouteRecord(record, recordFrom)))
          updatingRecords.push(recordFrom);
        else
          leavingRecords.push(recordFrom);
      }
      const recordTo = to.matched[i];
      if (recordTo) {
        if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) {
          enteringRecords.push(recordTo);
        }
      }
    }
    return [leavingRecords, updatingRecords, enteringRecords];
  }
  function useRouter2() {
    return vue.inject(routerKey);
  }
  function useRoute2() {
    return vue.inject(routeLocationKey);
  }
  exports.RouterLink = RouterLink;
  exports.RouterView = RouterView;
  exports.START_LOCATION = START_LOCATION_NORMALIZED;
  exports.createMemoryHistory = createMemoryHistory;
  exports.createRouter = createRouter;
  exports.createRouterMatcher = createRouterMatcher;
  exports.createWebHashHistory = createWebHashHistory;
  exports.createWebHistory = createWebHistory;
  exports.isNavigationFailure = isNavigationFailure;
  exports.matchedRouteKey = matchedRouteKey;
  exports.onBeforeRouteLeave = onBeforeRouteLeave;
  exports.onBeforeRouteUpdate = onBeforeRouteUpdate;
  exports.parseQuery = parseQuery;
  exports.routeLocationKey = routeLocationKey;
  exports.routerKey = routerKey;
  exports.routerViewLocationKey = routerViewLocationKey;
  exports.stringifyQuery = stringifyQuery;
  exports.useLink = useLink;
  exports.useRoute = useRoute2;
  exports.useRouter = useRouter2;
  exports.viewDepthKey = viewDepthKey;
})(vueRouter_cjs_prod);
const wrapInRef = (value) => vue_cjs_prod.isRef(value) ? value : vue_cjs_prod.ref(value);
const getDefault = () => null;
function useAsyncData(key, handler, options = {}) {
  var _a, _b, _c, _d, _e;
  if (typeof key !== "string") {
    throw new TypeError("asyncData key must be a string");
  }
  if (typeof handler !== "function") {
    throw new TypeError("asyncData handler must be a function");
  }
  options = { server: true, default: getDefault, ...options };
  if (options.defer) {
    console.warn("[useAsyncData] `defer` has been renamed to `lazy`. Support for `defer` will be removed in RC.");
  }
  options.lazy = (_b = (_a = options.lazy) != null ? _a : options.defer) != null ? _b : false;
  options.initialCache = (_c = options.initialCache) != null ? _c : true;
  const nuxt = useNuxtApp();
  const instance = vue_cjs_prod.getCurrentInstance();
  if (instance && !instance._nuxtOnBeforeMountCbs) {
    const cbs = instance._nuxtOnBeforeMountCbs = [];
    if (instance && false) {
      vue_cjs_prod.onBeforeMount(() => {
        cbs.forEach((cb) => {
          cb();
        });
        cbs.splice(0, cbs.length);
      });
      vue_cjs_prod.onUnmounted(() => cbs.splice(0, cbs.length));
    }
  }
  const useInitialCache = () => options.initialCache && nuxt.payload.data[key] !== void 0;
  const asyncData = {
    data: wrapInRef((_d = nuxt.payload.data[key]) != null ? _d : options.default()),
    pending: vue_cjs_prod.ref(!useInitialCache()),
    error: vue_cjs_prod.ref((_e = nuxt.payload._errors[key]) != null ? _e : null)
  };
  asyncData.refresh = (opts = {}) => {
    if (nuxt._asyncDataPromises[key]) {
      return nuxt._asyncDataPromises[key];
    }
    if (opts._initial && useInitialCache()) {
      return nuxt.payload.data[key];
    }
    asyncData.pending.value = true;
    nuxt._asyncDataPromises[key] = Promise.resolve(handler(nuxt)).then((result) => {
      if (options.transform) {
        result = options.transform(result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      asyncData.data.value = result;
      asyncData.error.value = null;
    }).catch((error) => {
      asyncData.error.value = error;
      asyncData.data.value = vue_cjs_prod.unref(options.default());
    }).finally(() => {
      asyncData.pending.value = false;
      nuxt.payload.data[key] = asyncData.data.value;
      if (asyncData.error.value) {
        nuxt.payload._errors[key] = true;
      }
      delete nuxt._asyncDataPromises[key];
    });
    return nuxt._asyncDataPromises[key];
  };
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxt.payload.serverRendered;
  if (fetchOnServer) {
    const promise = initialFetch();
    vue_cjs_prod.onServerPrefetch(() => promise);
  }
  const asyncDataPromise = Promise.resolve(nuxt._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
const useState = (key, init) => {
  const nuxt = useNuxtApp();
  const state = vue_cjs_prod.toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (vue_cjs_prod.isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
};
const useError = () => {
  const nuxtApp = useNuxtApp();
  return useState("error", () => nuxtApp.ssrContext.error);
};
const throwError = (_err) => {
  const nuxtApp = useNuxtApp();
  useError();
  const err = typeof _err === "string" ? new Error(_err) : _err;
  nuxtApp.callHook("app:error", err);
  {
    nuxtApp.ssrContext.error = nuxtApp.ssrContext.error || err;
  }
  return err;
};
function murmurHash(key, seed = 0) {
  if (typeof key === "string") {
    key = createBuffer(key);
  }
  let i = 0;
  let h1 = seed;
  let k1;
  let h1b;
  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  const c1 = 3432918353;
  const c2 = 461845907;
  while (i < bytes) {
    k1 = key[i] & 255 | (key[++i] & 255) << 8 | (key[++i] & 255) << 16 | (key[++i] & 255) << 24;
    ++i;
    k1 = (k1 & 65535) * c1 + (((k1 >>> 16) * c1 & 65535) << 16) & 4294967295;
    k1 = k1 << 15 | k1 >>> 17;
    k1 = (k1 & 65535) * c2 + (((k1 >>> 16) * c2 & 65535) << 16) & 4294967295;
    h1 ^= k1;
    h1 = h1 << 13 | h1 >>> 19;
    h1b = (h1 & 65535) * 5 + (((h1 >>> 16) * 5 & 65535) << 16) & 4294967295;
    h1 = (h1b & 65535) + 27492 + (((h1b >>> 16) + 58964 & 65535) << 16);
  }
  k1 = 0;
  switch (remainder) {
    case 3:
      k1 ^= (key[i + 2] & 255) << 16;
      break;
    case 2:
      k1 ^= (key[i + 1] & 255) << 8;
      break;
    case 1:
      k1 ^= key[i] & 255;
      k1 = (k1 & 65535) * c1 + (((k1 >>> 16) * c1 & 65535) << 16) & 4294967295;
      k1 = k1 << 15 | k1 >>> 17;
      k1 = (k1 & 65535) * c2 + (((k1 >>> 16) * c2 & 65535) << 16) & 4294967295;
      h1 ^= k1;
  }
  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = (h1 & 65535) * 2246822507 + (((h1 >>> 16) * 2246822507 & 65535) << 16) & 4294967295;
  h1 ^= h1 >>> 13;
  h1 = (h1 & 65535) * 3266489909 + (((h1 >>> 16) * 3266489909 & 65535) << 16) & 4294967295;
  h1 ^= h1 >>> 16;
  return h1 >>> 0;
}
function createBuffer(val) {
  return new TextEncoder().encode(val);
}
const defaults = {
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false
};
function objectHash(object, options = {}) {
  options = { ...defaults, ...options };
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
function createHasher(options) {
  const buff = [];
  let context = [];
  const write = (str) => {
    buff.push(str);
  };
  return {
    toString() {
      return buff.join("");
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this["_" + type](value);
    },
    _object(object) {
      const pattern = /\[object (.*)\]/i;
      const objString = Object.prototype.toString.call(object);
      const _objType = pattern.exec(objString);
      const objType = _objType ? _objType[1].toLowerCase() : "unknown:[" + objString.toLowerCase() + "]";
      let objectNumber = null;
      if ((objectNumber = context.indexOf(object)) >= 0) {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      } else {
        context.push(object);
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this["_" + objType]) {
          this["_" + objType](object);
        } else if (options.ignoreUnknown) {
          return write("[" + objType + "]");
        } else {
          throw new Error('Unknown object type "' + objType + '"');
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        if (options.respectType !== false && !isNativeFunction(object)) {
          keys.splice(0, 0, "prototype", "__proto__", "letructor");
        }
        if (options.excludeKeys) {
          keys = keys.filter(function(key) {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + keys.length + ":");
        return keys.forEach((key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        });
      }
    },
    _array(arr, unordered) {
      unordered = typeof unordered !== "undefined" ? unordered : options.unorderedArrays !== false;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        return arr.forEach((entry2) => {
          return this.dispatch(entry2);
        });
      }
      const contextAdditions = [];
      const entries = arr.map((entry2) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry2);
        contextAdditions.push(hasher.getContext());
        return hasher.toString();
      });
      context = context.concat(contextAdditions);
      entries.sort();
      return this._array(entries, false);
    },
    _date(date) {
      return write("date:" + date.toJSON());
    },
    _symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    _error(err) {
      return write("error:" + err.toString());
    },
    _boolean(bool) {
      return write("bool:" + bool.toString());
    },
    _string(string) {
      write("string:" + string.length + ":");
      write(string.toString());
    },
    _function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this._object(fn);
      }
    },
    _number(number) {
      return write("number:" + number.toString());
    },
    _xml(xml) {
      return write("xml:" + xml.toString());
    },
    _null() {
      return write("Null");
    },
    _undefined() {
      return write("Undefined");
    },
    _regexp(regex) {
      return write("regex:" + regex.toString());
    },
    _uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    _url(url) {
      return write("url:" + url.toString());
    },
    _map(map) {
      write("map:");
      const arr = Array.from(map);
      return this._array(arr, options.unorderedSets !== false);
    },
    _set(set) {
      write("set:");
      const arr = Array.from(set);
      return this._array(arr, options.unorderedSets !== false);
    },
    _file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    _blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error('Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n');
    },
    _domwindow() {
      return write("domwindow");
    },
    _bigint(number) {
      return write("bigint:" + number.toString());
    },
    _process() {
      return write("process");
    },
    _timer() {
      return write("timer");
    },
    _pipe() {
      return write("pipe");
    },
    _tcp() {
      return write("tcp");
    },
    _udp() {
      return write("udp");
    },
    _tty() {
      return write("tty");
    },
    _statwatcher() {
      return write("statwatcher");
    },
    _securecontext() {
      return write("securecontext");
    },
    _connection() {
      return write("connection");
    },
    _zlib() {
      return write("zlib");
    },
    _context() {
      return write("context");
    },
    _nodescript() {
      return write("nodescript");
    },
    _httpparser() {
      return write("httpparser");
    },
    _dataview() {
      return write("dataview");
    },
    _signal() {
      return write("signal");
    },
    _fsevent() {
      return write("fsevent");
    },
    _tlswrap() {
      return write("tlswrap");
    }
  };
}
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  const exp = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i;
  return exp.exec(Function.prototype.toString.call(f)) != null;
}
function hash(object, options = {}) {
  const hashed = typeof object === "string" ? object : objectHash(object, options);
  return String(murmurHash(hashed));
}
function useFetch(request, opts = {}) {
  const key = "$f_" + (opts.key || hash([request, { ...opts, transform: null }]));
  const _request = vue_cjs_prod.computed(() => {
    let r = request;
    if (typeof r === "function") {
      r = r();
    }
    return vue_cjs_prod.isRef(r) ? r.value : r;
  });
  const _fetchOptions = {
    ...opts,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  };
  const _asyncDataOptions = {
    ...opts,
    watch: [
      _request,
      ...opts.watch || []
    ]
  };
  const asyncData = useAsyncData(key, () => {
    return $fetch(_request.value, _fetchOptions);
  }, _asyncDataOptions);
  return asyncData;
}
const MIMES = {
  html: "text/html",
  json: "application/json"
};
const defer = typeof setImmediate !== "undefined" ? setImmediate : (fn) => fn();
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      event.res.end(data);
      resolve(void 0);
    });
  });
}
function defaultContentType(event, type) {
  if (type && !event.res.getHeader("Content-Type")) {
    event.res.setHeader("Content-Type", type);
  }
}
function sendRedirect(event, location2, code = 302) {
  event.res.statusCode = code;
  event.res.setHeader("Location", location2);
  return send(event, "Redirecting to " + location2, MIMES.html);
}
class H3Error extends Error {
  constructor() {
    super(...arguments);
    this.statusCode = 500;
    this.statusMessage = "Internal Server Error";
  }
}
function createError(input) {
  var _a;
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (input instanceof H3Error) {
    return input;
  }
  const err = new H3Error((_a = input.message) != null ? _a : input.statusMessage, input.cause ? { cause: input.cause } : void 0);
  if (input.statusCode) {
    err.statusCode = input.statusCode;
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  }
  if (input.data) {
    err.data = input.data;
  }
  return err;
}
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  return useNuxtApp()._route;
};
const navigateTo = (to, options = {}) => {
  if (!to) {
    to = "/";
  }
  const router = useRouter();
  {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      const redirectLocation = joinURL(useRuntimeConfig().app.baseURL, router.resolve(to).fullPath || "/");
      return nuxtApp.callHook("app:redirected").then(() => sendRedirect(nuxtApp.ssrContext.event, redirectLocation, options.redirectCode || 302));
    }
  }
  return options.replace ? router.replace(to) : router.push(to);
};
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = "noopener noreferrer";
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  const checkPropConflicts = (props, main2, sub) => {
  };
  return vue_cjs_prod.defineComponent({
    name: componentName,
    props: {
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      }
    },
    setup(props, { slots }) {
      const router = useRouter();
      const to = vue_cjs_prod.computed(() => {
        checkPropConflicts();
        return props.to || props.href || "";
      });
      const isExternal = vue_cjs_prod.computed(() => {
        if (props.external) {
          return true;
        }
        if (props.target && props.target !== "_self") {
          return true;
        }
        if (typeof to.value === "object") {
          return false;
        }
        return to.value === "" || hasProtocol(to.value, true);
      });
      return () => {
        var _a, _b, _c;
        if (!isExternal.value) {
          return vue_cjs_prod.h(vue_cjs_prod.resolveComponent("RouterLink"), {
            to: to.value,
            activeClass: props.activeClass || options.activeClass,
            exactActiveClass: props.exactActiveClass || options.exactActiveClass,
            replace: props.replace,
            ariaCurrentValue: props.ariaCurrentValue
          }, slots.default);
        }
        const href = typeof to.value === "object" ? (_b = (_a = router.resolve(to.value)) == null ? void 0 : _a.href) != null ? _b : null : to.value || null;
        const target = props.target || null;
        checkPropConflicts();
        const rel = props.noRel ? null : firstNonUndefined(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : "") || null;
        return vue_cjs_prod.h("a", { href, rel, target }, (_c = slots.default) == null ? void 0 : _c.call(slots));
      };
    }
  });
}
const __nuxt_component_0$1 = defineNuxtLink({ componentName: "NuxtLink" });
const nuxtLink = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  defineNuxtLink,
  "default": __nuxt_component_0$1
}, Symbol.toStringTag, { value: "Module" }));
var shared_cjs_prod = {};
Object.defineProperty(shared_cjs_prod, "__esModule", { value: true });
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const PatchFlagNames = {
  [1]: `TEXT`,
  [2]: `CLASS`,
  [4]: `STYLE`,
  [8]: `PROPS`,
  [16]: `FULL_PROPS`,
  [32]: `HYDRATE_EVENTS`,
  [64]: `STABLE_FRAGMENT`,
  [128]: `KEYED_FRAGMENT`,
  [256]: `UNKEYED_FRAGMENT`,
  [512]: `NEED_PATCH`,
  [1024]: `DYNAMIC_SLOTS`,
  [2048]: `DEV_ROOT_FRAGMENT`,
  [-1]: `HOISTED`,
  [-2]: `BAIL`
};
const slotFlagsText = {
  [1]: "STABLE",
  [2]: "DYNAMIC",
  [3]: "FORWARDED"
};
const GLOBALS_WHITE_LISTED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt";
const isGloballyWhitelisted = /* @__PURE__ */ makeMap(GLOBALS_WHITE_LISTED);
const range = 2;
function generateCodeFrame(source, start = 0, end = source.length) {
  let lines = source.split(/(\r?\n)/);
  const newlineSequences = lines.filter((_, idx) => idx % 2 === 1);
  lines = lines.filter((_, idx) => idx % 2 === 0);
  let count = 0;
  const res = [];
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + (newlineSequences[i] && newlineSequences[i].length || 0);
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length)
          continue;
        const line = j + 1;
        res.push(`${line}${" ".repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
        const lineLength = lines[j].length;
        const newLineSeqLength = newlineSequences[j] && newlineSequences[j].length || 0;
        if (j === i) {
          const pad = start - (count - (lineLength + newLineSeqLength));
          const length = Math.max(1, end > count ? lineLength - pad : end - start);
          res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(Math.min(end - count, lineLength), 1);
            res.push(`   |  ` + "^".repeat(length));
          }
          count += lineLength + newLineSeqLength;
        }
      }
      break;
    }
  }
  return res.join("\n");
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
const isBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
const unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u0020]/;
const attrValidationCache = {};
function isSSRSafeAttrName(name) {
  if (attrValidationCache.hasOwnProperty(name)) {
    return attrValidationCache[name];
  }
  const isUnsafe = unsafeAttrCharRE.test(name);
  if (isUnsafe) {
    console.error(`unsafe attribute name: ${name}`);
  }
  return attrValidationCache[name] = !isUnsafe;
}
const propsToAttrMap = {
  acceptCharset: "accept-charset",
  className: "class",
  htmlFor: "for",
  httpEquiv: "http-equiv"
};
const isNoUnitNumericStyleProp = /* @__PURE__ */ makeMap(`animation-iteration-count,border-image-outset,border-image-slice,border-image-width,box-flex,box-flex-group,box-ordinal-group,column-count,columns,flex,flex-grow,flex-positive,flex-shrink,flex-negative,flex-order,grid-row,grid-row-end,grid-row-span,grid-row-start,grid-column,grid-column-end,grid-column-span,grid-column-start,font-weight,line-clamp,line-height,opacity,order,orphans,tab-size,widows,z-index,zoom,fill-opacity,flood-opacity,stop-opacity,stroke-dasharray,stroke-dashoffset,stroke-miterlimit,stroke-opacity,stroke-width`);
const isKnownHtmlAttr = /* @__PURE__ */ makeMap(`accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap`);
const isKnownSvgAttr = /* @__PURE__ */ makeMap(`xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,overflow,overline-position,overline-thickness,panose-1,paint-order,path,pathLength,patternContentUnits,patternTransform,patternUnits,ping,pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,specularConstant,specularExponent,speed,spreadMethod,startOffset,stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,string,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,text-decoration,text-rendering,textLength,to,transform,transform-origin,type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan`);
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value)) {
    return value;
  } else if (isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function stringifyStyle(styles) {
  let ret = "";
  if (!styles || isString(styles)) {
    return ret;
  }
  for (const key in styles) {
    const value = styles[key];
    const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
    if (isString(value) || typeof value === "number" && isNoUnitNumericStyleProp(normalizedKey)) {
      ret += `${normalizedKey}:${value};`;
    }
  }
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
function normalizeProps(props) {
  if (!props)
    return null;
  let { class: klass, style } = props;
  if (klass && !isString(klass)) {
    props.class = normalizeClass(klass);
  }
  if (style) {
    props.style = normalizeStyle(style);
  }
  return props;
}
const HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
const SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
const VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
const isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
const isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
const isVoidTag = /* @__PURE__ */ makeMap(VOID_TAGS);
const escapeRE = /["'&<>]/;
function escapeHtml(string) {
  const str = "" + string;
  const match = escapeRE.exec(str);
  if (!match) {
    return str;
  }
  let html = "";
  let escaped;
  let index2;
  let lastIndex = 0;
  for (index2 = match.index; index2 < str.length; index2++) {
    switch (str.charCodeAt(index2)) {
      case 34:
        escaped = "&quot;";
        break;
      case 38:
        escaped = "&amp;";
        break;
      case 39:
        escaped = "&#39;";
        break;
      case 60:
        escaped = "&lt;";
        break;
      case 62:
        escaped = "&gt;";
        break;
      default:
        continue;
    }
    if (lastIndex !== index2) {
      html += str.slice(lastIndex, index2);
    }
    lastIndex = index2 + 1;
    html += escaped;
  }
  return lastIndex !== index2 ? html + str.slice(lastIndex, index2) : html;
}
const commentStripRE = /^-?>|<!--|-->|--!>|<!-$/g;
function escapeHtmlComment(src) {
  return src.replace(commentStripRE, "");
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length)
    return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseEqual(a, b) {
  if (a === b)
    return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject$1(a);
  bValidType = isObject$1(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject$1(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
        entries[`${key} =>`] = val2;
        return entries;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject$1(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
const isBuiltInDirective = /* @__PURE__ */ makeMap("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo");
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : {});
};
const identRE = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;
function genPropsAccessExp(name) {
  return identRE.test(name) ? `__props.${name}` : `__props[${JSON.stringify(name)}]`;
}
shared_cjs_prod.EMPTY_ARR = EMPTY_ARR;
shared_cjs_prod.EMPTY_OBJ = EMPTY_OBJ;
shared_cjs_prod.NO = NO;
shared_cjs_prod.NOOP = NOOP;
shared_cjs_prod.PatchFlagNames = PatchFlagNames;
shared_cjs_prod.camelize = camelize;
shared_cjs_prod.capitalize = capitalize;
shared_cjs_prod.def = def;
shared_cjs_prod.escapeHtml = escapeHtml;
shared_cjs_prod.escapeHtmlComment = escapeHtmlComment;
shared_cjs_prod.extend = extend;
shared_cjs_prod.genPropsAccessExp = genPropsAccessExp;
shared_cjs_prod.generateCodeFrame = generateCodeFrame;
shared_cjs_prod.getGlobalThis = getGlobalThis;
shared_cjs_prod.hasChanged = hasChanged;
shared_cjs_prod.hasOwn = hasOwn;
shared_cjs_prod.hyphenate = hyphenate;
shared_cjs_prod.includeBooleanAttr = includeBooleanAttr;
shared_cjs_prod.invokeArrayFns = invokeArrayFns;
shared_cjs_prod.isArray = isArray;
shared_cjs_prod.isBooleanAttr = isBooleanAttr;
shared_cjs_prod.isBuiltInDirective = isBuiltInDirective;
shared_cjs_prod.isDate = isDate;
var isFunction_1 = shared_cjs_prod.isFunction = isFunction;
shared_cjs_prod.isGloballyWhitelisted = isGloballyWhitelisted;
shared_cjs_prod.isHTMLTag = isHTMLTag;
shared_cjs_prod.isIntegerKey = isIntegerKey;
shared_cjs_prod.isKnownHtmlAttr = isKnownHtmlAttr;
shared_cjs_prod.isKnownSvgAttr = isKnownSvgAttr;
shared_cjs_prod.isMap = isMap;
shared_cjs_prod.isModelListener = isModelListener;
shared_cjs_prod.isNoUnitNumericStyleProp = isNoUnitNumericStyleProp;
shared_cjs_prod.isObject = isObject$1;
shared_cjs_prod.isOn = isOn;
shared_cjs_prod.isPlainObject = isPlainObject;
shared_cjs_prod.isPromise = isPromise;
shared_cjs_prod.isReservedProp = isReservedProp;
shared_cjs_prod.isSSRSafeAttrName = isSSRSafeAttrName;
shared_cjs_prod.isSVGTag = isSVGTag;
shared_cjs_prod.isSet = isSet;
shared_cjs_prod.isSpecialBooleanAttr = isSpecialBooleanAttr;
shared_cjs_prod.isString = isString;
shared_cjs_prod.isSymbol = isSymbol;
shared_cjs_prod.isVoidTag = isVoidTag;
shared_cjs_prod.looseEqual = looseEqual;
shared_cjs_prod.looseIndexOf = looseIndexOf;
shared_cjs_prod.makeMap = makeMap;
shared_cjs_prod.normalizeClass = normalizeClass;
shared_cjs_prod.normalizeProps = normalizeProps;
shared_cjs_prod.normalizeStyle = normalizeStyle;
shared_cjs_prod.objectToString = objectToString;
shared_cjs_prod.parseStringStyle = parseStringStyle;
shared_cjs_prod.propsToAttrMap = propsToAttrMap;
shared_cjs_prod.remove = remove;
shared_cjs_prod.slotFlagsText = slotFlagsText;
shared_cjs_prod.stringifyStyle = stringifyStyle;
shared_cjs_prod.toDisplayString = toDisplayString;
shared_cjs_prod.toHandlerKey = toHandlerKey;
shared_cjs_prod.toNumber = toNumber;
shared_cjs_prod.toRawType = toRawType;
shared_cjs_prod.toTypeString = toTypeString;
function useHead(meta2) {
  const resolvedMeta = isFunction_1(meta2) ? vue_cjs_prod.computed(meta2) : meta2;
  useNuxtApp()._useHead(resolvedMeta);
}
const preload = defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin({
    beforeCreate() {
      const { _registeredComponents } = this.$nuxt.ssrContext;
      const { __moduleIdentifier } = this.$options;
      _registeredComponents.add(__moduleIdentifier);
    }
  });
});
const components = {};
function C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47_46nuxt_47components_46plugin_46mjs(nuxtApp) {
  for (const name in components) {
    nuxtApp.vueApp.component(name, components[name]);
    nuxtApp.vueApp.component("Lazy" + name, components[name]);
  }
}
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var PROVIDE_KEY = `usehead`;
var HEAD_COUNT_KEY = `head:count`;
var HEAD_ATTRS_KEY = `data-head-attrs`;
var SELF_CLOSING_TAGS = ["meta", "link", "base"];
var createElement = (tag, attrs, document2) => {
  const el = document2.createElement(tag);
  for (const key of Object.keys(attrs)) {
    let value = attrs[key];
    if (key === "key" || value === false) {
      continue;
    }
    if (key === "children") {
      el.textContent = value;
    } else {
      el.setAttribute(key, value);
    }
  }
  return el;
};
var htmlEscape = (str) => str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
var stringifyAttrs = (attributes) => {
  const handledAttributes = [];
  for (let [key, value] of Object.entries(attributes)) {
    if (key === "children" || key === "key") {
      continue;
    }
    if (value === false || value == null) {
      continue;
    }
    let attribute = htmlEscape(key);
    if (value !== true) {
      attribute += `="${htmlEscape(String(value))}"`;
    }
    handledAttributes.push(attribute);
  }
  return handledAttributes.length > 0 ? " " + handledAttributes.join(" ") : "";
};
function isEqualNode(oldTag, newTag) {
  if (oldTag instanceof HTMLElement && newTag instanceof HTMLElement) {
    const nonce = newTag.getAttribute("nonce");
    if (nonce && !oldTag.getAttribute("nonce")) {
      const cloneTag = newTag.cloneNode(true);
      cloneTag.setAttribute("nonce", "");
      cloneTag.nonce = nonce;
      return nonce === oldTag.nonce && oldTag.isEqualNode(cloneTag);
    }
  }
  return oldTag.isEqualNode(newTag);
}
var getTagKey = (props) => {
  const names = ["key", "id", "name", "property"];
  for (const n of names) {
    const value = typeof props.getAttribute === "function" ? props.hasAttribute(n) ? props.getAttribute(n) : void 0 : props[n];
    if (value !== void 0) {
      return { name: n, value };
    }
  }
};
var acceptFields = [
  "title",
  "meta",
  "link",
  "base",
  "style",
  "script",
  "htmlAttrs",
  "bodyAttrs"
];
var headObjToTags = (obj) => {
  const tags = [];
  for (const key of Object.keys(obj)) {
    if (obj[key] == null)
      continue;
    if (key === "title") {
      tags.push({ tag: key, props: { children: obj[key] } });
    } else if (key === "base") {
      tags.push({ tag: key, props: __spreadValues({ key: "default" }, obj[key]) });
    } else if (acceptFields.includes(key)) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach((item) => {
          tags.push({ tag: key, props: item });
        });
      } else if (value) {
        tags.push({ tag: key, props: value });
      }
    }
  }
  return tags;
};
var setAttrs = (el, attrs) => {
  const existingAttrs = el.getAttribute(HEAD_ATTRS_KEY);
  if (existingAttrs) {
    for (const key of existingAttrs.split(",")) {
      if (!(key in attrs)) {
        el.removeAttribute(key);
      }
    }
  }
  const keys = [];
  for (const key in attrs) {
    const value = attrs[key];
    if (value == null)
      continue;
    if (value === false) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
    keys.push(key);
  }
  if (keys.length) {
    el.setAttribute(HEAD_ATTRS_KEY, keys.join(","));
  } else {
    el.removeAttribute(HEAD_ATTRS_KEY);
  }
};
var updateElements = (document2 = window.document, type, tags) => {
  var _a;
  const head = document2.head;
  let headCountEl = head.querySelector(`meta[name="${HEAD_COUNT_KEY}"]`);
  const headCount = headCountEl ? Number(headCountEl.getAttribute("content")) : 0;
  const oldElements = [];
  if (headCountEl) {
    for (let i = 0, j = headCountEl.previousElementSibling; i < headCount; i++, j = (j == null ? void 0 : j.previousElementSibling) || null) {
      if (((_a = j == null ? void 0 : j.tagName) == null ? void 0 : _a.toLowerCase()) === type) {
        oldElements.push(j);
      }
    }
  } else {
    headCountEl = document2.createElement("meta");
    headCountEl.setAttribute("name", HEAD_COUNT_KEY);
    headCountEl.setAttribute("content", "0");
    head.append(headCountEl);
  }
  let newElements = tags.map((tag) => createElement(tag.tag, tag.props, document2));
  newElements = newElements.filter((newEl) => {
    for (let i = 0; i < oldElements.length; i++) {
      const oldEl = oldElements[i];
      if (isEqualNode(oldEl, newEl)) {
        oldElements.splice(i, 1);
        return false;
      }
    }
    return true;
  });
  oldElements.forEach((t) => {
    var _a2;
    return (_a2 = t.parentNode) == null ? void 0 : _a2.removeChild(t);
  });
  newElements.forEach((t) => {
    head.insertBefore(t, headCountEl);
  });
  headCountEl.setAttribute("content", "" + (headCount - oldElements.length + newElements.length));
};
var createHead = () => {
  let allHeadObjs = [];
  let previousTags = /* @__PURE__ */ new Set();
  const head = {
    install(app) {
      app.config.globalProperties.$head = head;
      app.provide(PROVIDE_KEY, head);
    },
    get headTags() {
      const deduped = [];
      allHeadObjs.forEach((objs) => {
        const tags = headObjToTags(objs.value);
        tags.forEach((tag) => {
          if (tag.tag === "meta" || tag.tag === "base" || tag.tag === "script") {
            const key = getTagKey(tag.props);
            if (key) {
              let index2 = -1;
              for (let i = 0; i < deduped.length; i++) {
                const prev = deduped[i];
                const prevValue = prev.props[key.name];
                const nextValue = tag.props[key.name];
                if (prev.tag === tag.tag && prevValue === nextValue) {
                  index2 = i;
                  break;
                }
              }
              if (index2 !== -1) {
                deduped.splice(index2, 1);
              }
            }
          }
          deduped.push(tag);
        });
      });
      return deduped;
    },
    addHeadObjs(objs) {
      allHeadObjs.push(objs);
    },
    removeHeadObjs(objs) {
      allHeadObjs = allHeadObjs.filter((_objs) => _objs !== objs);
    },
    updateDOM(document2 = window.document) {
      let title;
      let htmlAttrs = {};
      let bodyAttrs = {};
      const actualTags = {};
      for (const tag of head.headTags) {
        if (tag.tag === "title") {
          title = tag.props.children;
          continue;
        }
        if (tag.tag === "htmlAttrs") {
          Object.assign(htmlAttrs, tag.props);
          continue;
        }
        if (tag.tag === "bodyAttrs") {
          Object.assign(bodyAttrs, tag.props);
          continue;
        }
        actualTags[tag.tag] = actualTags[tag.tag] || [];
        actualTags[tag.tag].push(tag);
      }
      if (title !== void 0) {
        document2.title = title;
      }
      setAttrs(document2.documentElement, htmlAttrs);
      setAttrs(document2.body, bodyAttrs);
      const tags = /* @__PURE__ */ new Set([...Object.keys(actualTags), ...previousTags]);
      for (const tag of tags) {
        updateElements(document2, tag, actualTags[tag] || []);
      }
      previousTags.clear();
      Object.keys(actualTags).forEach((i) => previousTags.add(i));
    }
  };
  return head;
};
var tagToString = (tag) => {
  let attrs = stringifyAttrs(tag.props);
  if (SELF_CLOSING_TAGS.includes(tag.tag)) {
    return `<${tag.tag}${attrs}>`;
  }
  return `<${tag.tag}${attrs}>${tag.props.children || ""}</${tag.tag}>`;
};
var renderHeadToString = (head) => {
  const tags = [];
  let titleTag = "";
  let htmlAttrs = {};
  let bodyAttrs = {};
  for (const tag of head.headTags) {
    if (tag.tag === "title") {
      titleTag = tagToString(tag);
    } else if (tag.tag === "htmlAttrs") {
      Object.assign(htmlAttrs, tag.props);
    } else if (tag.tag === "bodyAttrs") {
      Object.assign(bodyAttrs, tag.props);
    } else {
      tags.push(tagToString(tag));
    }
  }
  tags.push(`<meta name="${HEAD_COUNT_KEY}" content="${tags.length}">`);
  return {
    get headTags() {
      return titleTag + tags.join("");
    },
    get htmlAttrs() {
      return stringifyAttrs(__spreadProps(__spreadValues({}, htmlAttrs), {
        [HEAD_ATTRS_KEY]: Object.keys(htmlAttrs).join(",")
      }));
    },
    get bodyAttrs() {
      return stringifyAttrs(__spreadProps(__spreadValues({}, bodyAttrs), {
        [HEAD_ATTRS_KEY]: Object.keys(bodyAttrs).join(",")
      }));
    }
  };
};
function isObject(val) {
  return val !== null && typeof val === "object";
}
function _defu(baseObj, defaults2, namespace = ".", merger) {
  if (!isObject(defaults2)) {
    return _defu(baseObj, {}, namespace, merger);
  }
  const obj = Object.assign({}, defaults2);
  for (const key in baseObj) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const val = baseObj[key];
    if (val === null || val === void 0) {
      continue;
    }
    if (merger && merger(obj, key, val, namespace)) {
      continue;
    }
    if (Array.isArray(val) && Array.isArray(obj[key])) {
      obj[key] = val.concat(obj[key]);
    } else if (isObject(val) && isObject(obj[key])) {
      obj[key] = _defu(val, obj[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
    } else {
      obj[key] = val;
    }
  }
  return obj;
}
function createDefu(merger) {
  return (...args) => args.reduce((p, c) => _defu(p, c, "", merger), {});
}
const defu = createDefu();
const C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47node_modules_47nuxt_47dist_47head_47runtime_47lib_47vueuse_45head_46plugin = defineNuxtPlugin((nuxtApp) => {
  const head = createHead();
  nuxtApp.vueApp.use(head);
  nuxtApp.hooks.hookOnce("app:mounted", () => {
    vue_cjs_prod.watchEffect(() => {
      head.updateDOM();
    });
  });
  const titleTemplate = vue_cjs_prod.ref();
  nuxtApp._useHead = (_meta) => {
    const meta2 = vue_cjs_prod.ref(_meta);
    if ("titleTemplate" in meta2.value) {
      titleTemplate.value = meta2.value.titleTemplate;
    }
    const headObj = vue_cjs_prod.computed(() => {
      const overrides = { meta: [] };
      if (titleTemplate.value && "title" in meta2.value) {
        overrides.title = typeof titleTemplate.value === "function" ? titleTemplate.value(meta2.value.title) : titleTemplate.value.replace(/%s/g, meta2.value.title);
      }
      if (meta2.value.charset) {
        overrides.meta.push({ key: "charset", charset: meta2.value.charset });
      }
      if (meta2.value.viewport) {
        overrides.meta.push({ name: "viewport", content: meta2.value.viewport });
      }
      return defu(overrides, meta2.value);
    });
    head.addHeadObjs(headObj);
    {
      return;
    }
  };
  {
    nuxtApp.ssrContext.renderMeta = () => renderHeadToString(head);
  }
});
const removeUndefinedProps = (props) => Object.fromEntries(Object.entries(props).filter(([, value]) => value !== void 0));
const setupForUseMeta = (metaFactory, renderChild) => (props, ctx) => {
  useHead(() => metaFactory({ ...removeUndefinedProps(props), ...ctx.attrs }, ctx));
  return () => {
    var _a, _b;
    return renderChild ? (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a) : null;
  };
};
const globalProps = {
  accesskey: String,
  autocapitalize: String,
  autofocus: {
    type: Boolean,
    default: void 0
  },
  class: String,
  contenteditable: {
    type: Boolean,
    default: void 0
  },
  contextmenu: String,
  dir: String,
  draggable: {
    type: Boolean,
    default: void 0
  },
  enterkeyhint: String,
  exportparts: String,
  hidden: {
    type: Boolean,
    default: void 0
  },
  id: String,
  inputmode: String,
  is: String,
  itemid: String,
  itemprop: String,
  itemref: String,
  itemscope: String,
  itemtype: String,
  lang: String,
  nonce: String,
  part: String,
  slot: String,
  spellcheck: {
    type: Boolean,
    default: void 0
  },
  style: String,
  tabindex: String,
  title: String,
  translate: String
};
const Script = vue_cjs_prod.defineComponent({
  name: "Script",
  inheritAttrs: false,
  props: {
    ...globalProps,
    async: Boolean,
    crossorigin: {
      type: [Boolean, String],
      default: void 0
    },
    defer: Boolean,
    integrity: String,
    nomodule: Boolean,
    nonce: String,
    referrerpolicy: String,
    src: String,
    type: String,
    charset: String,
    language: String
  },
  setup: setupForUseMeta((script) => ({
    script: [script]
  }))
});
const Link = vue_cjs_prod.defineComponent({
  name: "Link",
  inheritAttrs: false,
  props: {
    ...globalProps,
    as: String,
    crossorigin: String,
    disabled: Boolean,
    href: String,
    hreflang: String,
    imagesizes: String,
    imagesrcset: String,
    integrity: String,
    media: String,
    prefetch: {
      type: Boolean,
      default: void 0
    },
    referrerpolicy: String,
    rel: String,
    sizes: String,
    title: String,
    type: String,
    methods: String,
    target: String
  },
  setup: setupForUseMeta((link) => ({
    link: [link]
  }))
});
const Base = vue_cjs_prod.defineComponent({
  name: "Base",
  inheritAttrs: false,
  props: {
    ...globalProps,
    href: String,
    target: String
  },
  setup: setupForUseMeta((base) => ({
    base
  }))
});
const Title = vue_cjs_prod.defineComponent({
  name: "Title",
  inheritAttrs: false,
  setup: setupForUseMeta((_, { slots }) => {
    var _a, _b, _c;
    const title = ((_c = (_b = (_a = slots.default) == null ? void 0 : _a.call(slots)) == null ? void 0 : _b[0]) == null ? void 0 : _c.children) || null;
    return {
      title
    };
  })
});
const Meta = vue_cjs_prod.defineComponent({
  name: "Meta",
  inheritAttrs: false,
  props: {
    ...globalProps,
    charset: String,
    content: String,
    httpEquiv: String,
    name: String
  },
  setup: setupForUseMeta((meta2) => ({
    meta: [meta2]
  }))
});
const Style = vue_cjs_prod.defineComponent({
  name: "Style",
  inheritAttrs: false,
  props: {
    ...globalProps,
    type: String,
    media: String,
    nonce: String,
    title: String,
    scoped: {
      type: Boolean,
      default: void 0
    }
  },
  setup: setupForUseMeta((props, { slots }) => {
    var _a, _b, _c;
    const style = { ...props };
    const textContent = (_c = (_b = (_a = slots.default) == null ? void 0 : _a.call(slots)) == null ? void 0 : _b[0]) == null ? void 0 : _c.children;
    if (textContent) {
      style.children = textContent;
    }
    return {
      style: [style]
    };
  })
});
const Head = vue_cjs_prod.defineComponent({
  name: "Head",
  inheritAttrs: false,
  setup: (_props, ctx) => () => {
    var _a, _b;
    return (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a);
  }
});
const Html = vue_cjs_prod.defineComponent({
  name: "Html",
  inheritAttrs: false,
  props: {
    ...globalProps,
    manifest: String,
    version: String,
    xmlns: String
  },
  setup: setupForUseMeta((htmlAttrs) => ({ htmlAttrs }), true)
});
const Body = vue_cjs_prod.defineComponent({
  name: "Body",
  inheritAttrs: false,
  props: globalProps,
  setup: setupForUseMeta((bodyAttrs) => ({ bodyAttrs }), true)
});
const Components = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Script,
  Link,
  Base,
  Title,
  Meta,
  Style,
  Head,
  Html,
  Body
}, Symbol.toStringTag, { value: "Module" }));
const metaConfig = { "globalMeta": { "charset": "utf-8", "viewport": "width=device-width, initial-scale=1", "meta": [], "link": [], "style": [], "script": [] } };
const metaMixin = {
  created() {
    const instance = vue_cjs_prod.getCurrentInstance();
    if (!instance) {
      return;
    }
    const options = instance.type;
    if (!options || !("head" in options)) {
      return;
    }
    const nuxtApp = useNuxtApp();
    const source = typeof options.head === "function" ? vue_cjs_prod.computed(() => options.head(nuxtApp)) : options.head;
    useHead(source);
  }
};
const C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47node_modules_47nuxt_47dist_47head_47runtime_47plugin = defineNuxtPlugin((nuxtApp) => {
  useHead(vue_cjs_prod.markRaw({ title: "", ...metaConfig.globalMeta }));
  nuxtApp.vueApp.mixin(metaMixin);
  for (const name in Components) {
    nuxtApp.vueApp.component(name, Components[name]);
  }
});
const interpolatePath = (route, match) => {
  return match.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey = (override, routeProps) => {
  var _a;
  const matchedRoute = routeProps.route.matched.find((m) => m.components.default === routeProps.Component.type);
  const source = (_a = override != null ? override : matchedRoute == null ? void 0 : matchedRoute.meta.key) != null ? _a : interpolatePath(routeProps.route, matchedRoute);
  return typeof source === "function" ? source(routeProps.route) : source;
};
const wrapInKeepAlive = (props, children) => {
  return { default: () => children };
};
const Fragment = {
  setup(_props, { slots }) {
    return () => {
      var _a;
      return (_a = slots.default) == null ? void 0 : _a.call(slots);
    };
  }
};
const _wrapIf = (component, props, slots) => {
  return { default: () => props ? vue_cjs_prod.h(component, props === true ? {} : props, slots) : vue_cjs_prod.h(Fragment, {}, slots) };
};
const isNestedKey = Symbol("isNested");
const NuxtPage = vue_cjs_prod.defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs }) {
    const nuxtApp = useNuxtApp();
    const isNested = vue_cjs_prod.inject(isNestedKey, false);
    vue_cjs_prod.provide(isNestedKey, true);
    return () => {
      return vue_cjs_prod.h(vueRouter_cjs_prod.RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          var _a;
          return routeProps.Component && _wrapIf(vue_cjs_prod.Transition, (_a = routeProps.route.meta.pageTransition) != null ? _a : defaultPageTransition, wrapInKeepAlive(routeProps.route.meta.keepalive, isNested && nuxtApp.isHydrating ? vue_cjs_prod.h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) }) : vue_cjs_prod.h(vue_cjs_prod.Suspense, {
            onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
            onResolve: () => nuxtApp.callHook("page:finish", routeProps.Component)
          }, { default: () => vue_cjs_prod.h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) }) }))).default();
        }
      });
    };
  }
});
const defaultPageTransition = { name: "page", mode: "out-in" };
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$p = {};
function _sfc_ssrRender$d(_ctx, _push, _parent, _attrs) {
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "container" }, _attrs))}>`);
  serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup$p = _sfc_main$p.setup;
_sfc_main$p.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Container.vue");
  return _sfc_setup$p ? _sfc_setup$p(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["ssrRender", _sfc_ssrRender$d]]);
const Container = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_1
}, Symbol.toStringTag, { value: "Module" }));
const _imports_0 = publicAssetsURL(`logo.png`);
const _sfc_main$o = {};
function _sfc_ssrRender$c(_ctx, _push, _parent, _attrs) {
  const _component_ui_container = __nuxt_component_1;
  _push(`<header${serverRenderer.exports.ssrRenderAttrs(_attrs)}>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_ui_container, { class: "header" }, {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<img${serverRenderer.exports.ssrRenderAttr("src", _imports_0)} width="auto" height="60px"${_scopeId}>`);
      } else {
        return [
          vue_cjs_prod.createVNode("img", {
            src: _imports_0,
            width: "auto",
            height: "60px"
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</header>`);
}
const _sfc_setup$o = _sfc_main$o.setup;
_sfc_main$o.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Header.vue");
  return _sfc_setup$o ? _sfc_setup$o(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["ssrRender", _sfc_ssrRender$c]]);
const Header = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_0
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$n = {
  props: {
    spacing: "xs" | "sm" | "md" | "lg" | "xl"
  }
};
function _sfc_ssrRender$b(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
    class: ["row", [$props.spacing && `row_spacing-${$props.spacing}`]]
  }, _attrs))}>`);
  serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup$n = _sfc_main$n.setup;
_sfc_main$n.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Grid/Row.vue");
  return _sfc_setup$n ? _sfc_setup$n(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["ssrRender", _sfc_ssrRender$b]]);
const Row = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_3
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$m = {
  props: {
    cols: Number,
    sm: Number,
    md: Number,
    lg: Number,
    xl: Number
  },
  computed: {
    breakpoints() {
      return ["sm", "md", "lg", "xl"].map((breakpoint) => this[breakpoint] && `col-${breakpoint}-${this[breakpoint]}`).filter((value) => value).join(" ");
    }
  }
};
function _sfc_ssrRender$a(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
    class: ["col", [$props.cols && `col-${$props.cols}`, $options.breakpoints]]
  }, _attrs))}>`);
  serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup$m = _sfc_main$m.setup;
_sfc_main$m.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Grid/Col.vue");
  return _sfc_setup$m ? _sfc_setup$m(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["ssrRender", _sfc_ssrRender$a]]);
const Col = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_4
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$l = {
  __name: "index",
  __ssrInlineRender: true,
  props: {
    primary: Boolean,
    outlined: Boolean,
    moreRounded: Boolean
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
        class: ["card", {
          primary: __props.primary,
          outlined: __props.outlined,
          "rounded-lg": __props.moreRounded
        }]
      }, _attrs))}>`);
      serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup$l = _sfc_main$l.setup;
_sfc_main$l.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Card/index.vue");
  return _sfc_setup$l ? _sfc_setup$l(props, ctx) : void 0;
};
const index$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$l
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$k = {};
function _sfc_ssrRender$9(_ctx, _push, _parent, _attrs) {
  _push(`<svg${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
    viewBox: "0 0 81 81",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, _attrs))}><path fill-rule="evenodd" clip-rule="evenodd" d="M40.132 62.2639C52.3551 62.2639 62.2639 52.3551 62.2639 40.132C62.2639 27.9088 52.3551 18 40.132 18C27.9088 18 18 27.9088 18 40.132C18 52.3551 27.9088 62.2639 40.132 62.2639ZM40.0701 52.6198C46.9329 52.6198 52.4962 47.0565 52.4962 40.1938C52.4962 33.3311 46.9329 27.7677 40.0701 27.7677C33.2074 27.7677 27.6441 33.3311 27.6441 40.1938C27.6441 47.0565 33.2074 52.6198 40.0701 52.6198Z" fill="url(#paint0_linear_362_295)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M42.4865 53.7878C52.8892 53.7878 61.3222 45.3277 61.3222 34.8916V34.0012C59.6483 27.7155 55.9844 24.1815 52.794 21.9042C43.3455 15.6259 34.3264 18.3056 30.3657 20.427C25.8596 24.153 23.6508 29.0868 23.6508 34.8916C23.6508 45.3277 32.0839 53.7878 42.4865 53.7878ZM40.1551 52.5568C46.9659 52.5568 52.4872 47.0177 52.4872 40.1849C52.4872 33.3521 46.9659 27.8131 40.1551 27.8131C33.3442 27.8131 27.8229 33.3521 27.8229 40.1849C27.8229 47.0177 33.3442 52.5568 40.1551 52.5568Z" fill="url(#paint1_linear_362_295)"></path><path d="M37.5284 47.309C39.362 44.7319 44.7351 41.2255 51.5579 47.8171C50.7014 47.3816 49.6504 47.4421 49.232 47.5267C50.0565 47.5388 52.2668 48.5794 54.5115 52.6447C57.3174 57.7263 58.2404 58.8515 60.1602 59.9404C61.6961 60.8116 63.36 61.223 63.9999 61.3197C53.7362 62.5902 50.9303 61.3923 46.7952 58.8152C43.4872 56.7535 41.9464 52.681 41.5895 50.9024L41.5895 52.6447C40.1866 51.7372 39.3374 50.0676 39.3374 48.9786C39.3374 48.1075 39.0667 47.5026 38.9313 47.309C40.1743 46.9581 43.1402 46.8734 45.06 49.3416C47.4598 52.4269 49.4904 55.3307 50.9303 56.5285C52.0822 57.4867 52.9362 57.7263 53.2193 57.7263C51.964 56.9278 47.6075 51.4106 44.3216 47.8171C41.6929 44.9424 38.6975 46.2805 37.5284 47.309Z" fill="url(#paint2_linear_362_295)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M53.2193 57.7263L52.5662 57.8699C47.3464 58.5036 43.6235 52.4469 41.816 49.3416C40.7596 47.5267 39.4284 47.4507 38.9313 47.309C40.8218 46.7753 43.5121 47.3515 45.06 49.3416C45.6533 50.1044 46.224 50.856 46.7688 51.5736C48.4277 53.7584 49.8464 55.6268 50.9303 56.5285C52.0822 57.4867 52.9362 57.7263 53.2193 57.7263Z" fill="url(#paint3_linear_362_295)"></path><defs><linearGradient id="paint0_linear_362_295" x1="28.8187" y1="25.7276" x2="53.9181" y2="54.6599" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD600"></stop><stop offset="0.484375" stop-color="#FFA420"></stop><stop offset="1" stop-color="#FF3565"></stop></linearGradient><linearGradient id="paint1_linear_362_295" x1="28.251" y1="23.2075" x2="56.5877" y2="47.1692" gradientUnits="userSpaceOnUse"><stop stop-color="#FF4A55"></stop><stop offset="0.713542" stop-color="#FF9900"></stop></linearGradient><linearGradient id="paint2_linear_362_295" x1="38.0255" y1="46.5973" x2="60.0333" y2="60.2642" gradientUnits="userSpaceOnUse"><stop stop-color="#43C5FF"></stop><stop offset="0.703125" stop-color="#1171FF"></stop><stop offset="1" stop-color="#0053FF"></stop></linearGradient><linearGradient id="paint3_linear_362_295" x1="52.7526" y1="58.8448" x2="36.6179" y2="44.8836" gradientUnits="userSpaceOnUse"><stop stop-color="#0093D5"></stop><stop offset="0.120903" stop-color="#21B4FB"></stop><stop offset="1" stop-color="#287EFF"></stop></linearGradient></defs></svg>`);
}
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/icons/logo.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["ssrRender", _sfc_ssrRender$9]]);
const logo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_5
}, Symbol.toStringTag, { value: "Module" }));
const margin = { left: 32, right: 16, top: 12, bottom: 28 };
class Chart$1 {
  constructor(props) {
    this.width = props.clientWidth - margin.left - margin.right;
    this.canvas = d3.select(props).append("svg").attr("viewBox", `0 0 ${this.width + margin.left + margin.right} ${this.width / 3.5 + margin.top + margin.bottom}`).attr("width", "100%").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.render();
  }
  render() {
    const { canvas, width } = this;
    canvas.append("defs").append("linearGradient").attr("id", "gradient").attr("x1", width).attr("y1", 0).attr("x2", width).attr("y2", width / 3.5).attr("gradientUnits", "userSpaceOnUse").selectAll("stop").data([
      { offset: "0%", color: "#87BBFF88" },
      { offset: "100%", color: "#87BBFF00" }
    ]).enter().append("stop").attr("offset", (d) => d.offset).attr("stop-color", (d) => d.color);
  }
  update(points) {
    const { canvas, width } = this;
    const x = d3.scaleTime().domain(d3.extent(points, (d) => +d.xpoint)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(points, (d) => +d.ypoint)]).range([width / 3.5, 0]).nice();
    canvas.append("g").attr("class", "xAxis chart-legend").call(d3.axisLeft(y).tickFormat(d3.format("~s")).tickSize(-width * 1.3).ticks(5)).select(".domain").remove();
    canvas.append("g").attr("class", "yAxis chart-legend").attr("transform", "translate(0," + width / 3.5 + ")").call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d.%m")).tickSize(-width / 3.5 * 1.3).ticks(7)).select(".domain").remove();
    canvas.selectAll(".xAxis line").attr("x2", width);
    canvas.selectAll(".tick line").attr("stroke", "#cccccc88");
    canvas.selectAll(".xAxis .tick text").attr("x", -5);
    canvas.selectAll(".yAxis .tick text").attr("y", 12);
    const area = canvas.selectAll(".area").data([points], (d) => d.xpoint);
    const areaGenerator = d3.area().x((d) => x(d.xpoint)).y0(y(0)).y1((d) => y(d.ypoint)).curve(d3.curveCardinal);
    const interpolator = d3.interpolate(points.map((point) => ({ ...point, ypoint: 0 })), points);
    area.enter().append("path").attr("class", "area").merge(area).attr("stroke-width", 1.5).attr("fill", "url(#gradient)").attr("d", areaGenerator).transition().duration(3e3).attrTween("d", () => (t) => areaGenerator(interpolator(t)));
    const u = canvas.selectAll(".line").data([points], (d) => d.xpoint);
    const lineGenerator = d3.line().x((d) => x(d.xpoint)).y((d) => y(d.ypoint)).curve(d3.curveCardinal);
    u.enter().append("path").attr("class", "line").merge(u).attr("stroke", "#87BBFF").attr("stroke-width", 1.5).attr("fill", "none").attr("d", lineGenerator).transition().duration(3e3).attrTween("d", () => (t) => lineGenerator(interpolator(t)));
    const circle = canvas.selectAll(".circle").data(points);
    circle.enter().append("circle").merge(circle).attr("class", "circle").attr("fill", "#87BBFF").attr("cx", (d) => x(d.xpoint)).attr("cy", (d) => y(d.ypoint)).attr("r", 6).transition().duration(3e3).attrTween("cy", (_, i) => (t) => y(interpolator(t)[i].ypoint));
  }
}
const _sfc_main$j = /* @__PURE__ */ vue_cjs_prod.defineComponent({
  __name: "Chart",
  __ssrInlineRender: true,
  props: {
    chartData: null,
    loading: { type: Boolean }
  },
  setup(__props) {
    const { chartData, loading } = __props;
    const data = vue_cjs_prod.ref(chartData);
    const chartNode = vue_cjs_prod.ref(null);
    const state = vue_cjs_prod.reactive({ chart: null });
    vue_cjs_prod.onMounted(() => {
      var _a;
      state.chart = new Chart$1(chartNode.value);
      if ((_a = data.value) == null ? void 0 : _a.length) {
        const data2 = chartData.map((t) => ({
          xpoint: d3.timeParse("%Y-%m-%dT%H:%M:%S.000Z")(t.time),
          ypoint: t.transactionCount
        }));
        state.chart.update(data2.splice(-7));
      }
    });
    vue_cjs_prod.watch(data, (data2) => {
      if (data2 == null ? void 0 : data2.length) {
        const data3 = chartData.map((t) => ({
          xpoint: d3.timeParse("%Y-%m-%dT%H:%M:%S.000Z")(t.time),
          ypoint: t.transactionCount
        }));
        state.chart.update(data3.splice(-7));
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(_attrs)}><div></div>`);
      if (__props.loading) {
        _push(`<div>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Chart.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const Chart = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$j
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$i = {
  props: {
    min: {
      type: Number,
      default: 10
    },
    max: {
      type: Number,
      default: 20
    },
    value: {
      type: Number,
      default: 10
    }
  },
  computed: {
    left() {
      const len = this.max - this.min;
      return 100 / len * (this.value - this.min) + "%";
    }
  },
  methods: {
    onTrackClick(e) {
      const { width, left } = this.$refs.track.getBoundingClientRect();
      const len = this.max - this.min;
      const rounded = Math.round((e.pageX - left) / (width / len)) + this.min;
      this.value = Math.min(Math.max(this.min, rounded), this.max);
    },
    onThumbDown() {
      const onMouseUp = () => {
        window.removeEventListener("mousemove", this.onTrackClick);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", this.onTrackClick);
      window.addEventListener("mouseup", onMouseUp);
    }
  }
};
function _sfc_ssrRender$8(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "slider" }, _attrs))}><div class="slider__container"><div class="slider__track"><div class="slider__track-bg"></div><div class="slider__track-fill" style="${serverRenderer.exports.ssrRenderStyle({ width: $options.left })}"></div></div><div class="slider__thumb" style="${serverRenderer.exports.ssrRenderStyle({ left: $options.left })}"></div><div class="slider__label" style="${serverRenderer.exports.ssrRenderStyle({ left: $options.left })}">${serverRenderer.exports.ssrInterpolate($props.value)}</div></div><div style="${serverRenderer.exports.ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "20px 0" })}"><div>${serverRenderer.exports.ssrInterpolate($props.min)}</div><div>${serverRenderer.exports.ssrInterpolate($props.max)}</div></div></div>`);
}
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Slider.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["ssrRender", _sfc_ssrRender$8]]);
const Slider = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_7
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$h = {};
function _sfc_ssrRender$7(_ctx, _push, _parent, _attrs) {
  _push(`<button${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "btn" }, _attrs))}><div class="btn__content">`);
  serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div></button>`);
}
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Button.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["ssrRender", _sfc_ssrRender$7]]);
const Button = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_2
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$g = /* @__PURE__ */ vue_cjs_prod.defineComponent({
  __name: "Table",
  __ssrInlineRender: true,
  props: {
    headers: null
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<table${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "table" }, _attrs))}><thead><tr><!--[-->`);
      serverRenderer.exports.ssrRenderList(__props.headers, (header, i) => {
        _push(`<th>`);
        serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "header", {}, () => {
          _push(`${serverRenderer.exports.ssrInterpolate(header)}`);
        }, _push, _parent);
        _push(`</th>`);
      });
      _push(`<!--]--></tr></thead>`);
      serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</table>`);
    };
  }
});
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Table.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const Table = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$g
}, Symbol.toStringTag, { value: "Module" }));
const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    dailyTransactions: null
  }),
  actions: {
    async getDailyTranaactions() {
      this.dailyTransactions = await useFetch("https://explorer.sbercoin.com/api/stats/daily-transactions");
    }
  }
});
const meta$1 = void 0;
const useTestStore = defineStore("test", {
  state: () => ({
    filtersList: ["youtube", "twitch"]
  }),
  actions: {}
});
const _sfc_main$f = {
  __name: "FilterMenu",
  __ssrInlineRender: true,
  setup(__props) {
    const filtersStore = useTestStore();
    const filtersList = filtersStore.filtersList;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(_attrs)}>${serverRenderer.exports.ssrInterpolate(vue_cjs_prod.unref(filtersList))}</div>`);
    };
  }
};
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FilterMenu.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const FilterMenu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$f
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$e = {};
function _sfc_ssrRender$6(_ctx, _push, _parent, _attrs) {
  _push(`<svg${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
    viewBox: "0 0 137 136",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, _attrs))}><circle cx="68.25" cy="68" r="56" fill="#EDF3FC"></circle><circle cx="68.25" cy="68" r="66" stroke="#EDF3FC" stroke-width="4"></circle><path d="M109.25 55C109.25 56.5556 107.107 58.6296 106.25 58.6296C107.107 58.6296 109.25 60.1852 109.25 62C109.25 60.7037 110.964 58.6296 112.25 58.6296C110.964 58.6296 109.25 56.037 109.25 55Z" fill="#8AC9F9" stroke="#8AC9F9" stroke-linejoin="round"></path><path d="M23.25 60C23.25 61.1111 21.8214 62.5926 21.25 62.5926C21.8214 62.5926 23.25 63.7037 23.25 65C23.25 64.0741 24.3929 62.5926 25.25 62.5926C24.3929 62.5926 23.25 60.7407 23.25 60Z" fill="#330D84" stroke="#330D84" stroke-linejoin="round"></path><path d="M76.25 19C76.25 20.5556 74.1071 22.6296 73.25 22.6296C74.1071 22.6296 76.25 24.1852 76.25 26C76.25 24.7037 77.9643 22.6296 79.25 22.6296C77.9643 22.6296 76.25 20.037 76.25 19Z" fill="#330D84" stroke="#330D84" stroke-linejoin="round"></path><path d="M114.75 66C114.75 67.3333 112.964 69.1111 112.25 69.1111C112.964 69.1111 114.75 70.4444 114.75 72C114.75 70.8889 116.179 69.1111 117.25 69.1111C116.179 69.1111 114.75 66.8889 114.75 66Z" fill="#8AC9F9" stroke="#8AC9F9" stroke-linejoin="round"></path><path d="M65.75 26C65.75 27.3333 63.9643 29.1111 63.25 29.1111C63.9643 29.1111 65.75 30.4444 65.75 32C65.75 30.8889 67.1786 29.1111 68.25 29.1111C67.1786 29.1111 65.75 26.8889 65.75 26Z" fill="#8AC9F9" stroke="#8AC9F9" stroke-linejoin="round"></path><path d="M39.25 102C39.25 103.556 37.1071 105.63 36.25 105.63C37.1071 105.63 39.25 107.185 39.25 109C39.25 107.704 40.9643 105.63 42.25 105.63C40.9643 105.63 39.25 103.037 39.25 102Z" fill="#F9C84E" stroke="#F9C84E" stroke-linejoin="round"></path><path d="M44.7191 66.1465V64.1465H51.7191V66.1465L48.2191 70.6465L44.7191 66.1465Z" fill="#DBBDAC"></path><path d="M58.7191 55.0795C58.7191 60.6393 55.2191 64.1465 48.2191 65.1465C41.2191 64.1465 37.7191 60.6393 37.7191 55.0795V43.1465H58.7191V55.0795Z" fill="#F5D4BC"></path><path d="M47.7191 43.1466C46.7191 44.6466 45.2191 46.1466 42.2191 46.1466C40.7191 46.1466 38.7191 47.1466 37.7191 49.1466L35.7191 51.6466L37.7191 53.1466C37.4941 57.6258 38.3118 59.4857 40.7191 62.1466C39.2191 62.8133 35.9191 62.7466 32.7191 61.1466C28.7191 59.1466 30.2191 50.6466 32.7191 48.6466C34.7191 47.0466 35.5525 44.98 35.7191 44.1466C36.3858 39.98 39.8191 31.9466 48.2191 33.1466C51.7191 32.48 59.1191 33.7466 60.7191 44.1466C60.7191 45.1466 61.2191 47.4466 63.2191 48.6466C65.7191 50.1466 67.2191 60.6466 61.7191 62.1466C57.3191 63.3466 56.8858 62.48 55.7191 62.1466C58.1509 59.8736 58.9496 56.7307 58.7191 53.6466C58.9568 53.0247 60.4518 52.3591 60.7191 51.6466L58.7191 49.1466C58.5525 48.3133 56.8413 46.1466 53.2191 46.1466C49.7191 46.1466 48.2191 43.98 47.7191 43.1466Z" fill="#704E43"></path><path d="M44.7191 66.1465L39.2191 67.6465C35.7191 68.6465 32.7191 71.1465 32.7191 75.1465V84.1465C32.7191 85.2511 33.6145 86.1465 34.7191 86.1465H60.7191C61.8237 86.1465 62.7191 85.2511 62.7191 84.1465V74.1465C62.3863 70.3035 61.1282 68.8584 56.7191 67.6465L51.7191 66.1465L48.2191 70.6465L44.7191 66.1465Z" fill="#8AC9F9"></path><path d="M35.7191 52.1465C35.7191 50.6655 36.578 49.4301 37.7191 49.1465V55.1465C36.578 54.8628 35.7191 53.6275 35.7191 52.1465Z" fill="#F5D4BC"></path><path d="M60.7191 52.1465C60.7191 53.6275 59.8602 54.8628 58.7191 55.1465L58.7191 49.1465C59.8602 49.4301 60.7191 50.6655 60.7191 52.1465Z" fill="#F5D4BC"></path><path d="M88.25 68V66H95.25V68L91.75 72.5L88.25 68Z" fill="#DBBDAC"></path><path d="M102.25 56.5C102.25 62.0599 98.75 66 91.75 67C84.75 66 81.25 62.0599 81.25 56.5V45H102.25V56.5Z" fill="#F5D4BC"></path><path d="M88.25 68L82.75 69.5C79.25 70.5 76.25 73 76.25 77V86C76.25 87.1046 77.1454 88 78.25 88H104.25C105.355 88 106.25 87.1046 106.25 86V76C105.917 72.157 104.659 70.7119 100.25 69.5L95.25 68L91.75 72.5L88.25 68Z" fill="#8AC9F9"></path><path d="M95.25 47C92.5833 48.8333 86.05 52.2 81.25 51C80.8834 51.1025 79.75 52.5 79.25 54C77.9167 46 81.3982 41.5 85.25 39.7222C87.176 38.8333 89.1945 38.5 90.75 38.5C100.307 38.5 104.25 43.5 103.75 52.5C103.377 51.9406 102.859 51.4449 102.261 51C97.75 50.5 95.5212 48.0847 95.25 47Z" fill="#513830"></path><circle cx="91.25" cy="39" r="6" fill="#513830"></circle><path d="M79.25 54C79.25 52.519 80.1089 51.2836 81.25 51V57C80.1089 56.7164 79.25 55.481 79.25 54Z" fill="#F5D4BC"></path><path d="M104.25 54C104.25 55.481 103.391 56.7164 102.25 57L102.25 51C103.391 51.2836 104.25 52.519 104.25 54Z" fill="#F5D4BC"></path><path d="M65.25 92.0996V90.0996H72.25V92.0996L68.75 96.5996L65.25 92.0996Z" fill="#DBBDAC"></path><path d="M78.25 81.0996C78.25 86.6595 74.9167 90.0996 68.25 91.0996C61.5833 90.0996 58.25 86.6595 58.25 81.0996V69.0996H78.25V81.0996Z" fill="#F5D4BC"></path><path d="M56.25 77.0995V71.0995C55.25 68.5995 56.25 66.0995 59.25 66.0995C58.75 64.0995 61.75 60.5995 65.25 63.0995C65.25 61.0995 70.25 59.5995 71.75 63.0995C73.25 61.5995 77.75 62.0995 77.25 66.0995C81.25 66.0995 81.25 70.0995 80.25 71.0995V77.0995L80.25 78.0995L78.25 75.0995C78.25 74.5995 78.05 73.5995 77.25 73.5995C76.25 73.5995 74.75 74.5995 71.25 71.0995C67.65 75.0995 63.0833 73.4329 61.25 72.0995C58.45 71.6995 58.0833 73.9329 58.25 75.0995L56.25 78.0995L56.25 77.0995Z" fill="#404040"></path><path d="M65.25 92.0996L59.75 93.5996C56.25 94.5996 53.25 97.0996 53.25 101.1V110.1C53.25 111.204 54.1454 112.1 55.25 112.1H81.25C82.3546 112.1 83.25 111.204 83.25 110.1V100.1C82.9172 96.2566 81.6591 94.8115 77.25 93.5996L72.25 92.0996L68.75 96.5996L65.25 92.0996Z" fill="#EAB642"></path><path d="M56.25 78.0996C56.25 76.6186 57.1089 75.3832 58.25 75.0996V81.0996C57.1089 80.816 56.25 79.5806 56.25 78.0996Z" fill="#F5D4BC"></path><path d="M80.25 78.0996C80.25 79.5806 79.3911 80.816 78.25 81.0996L78.25 75.0996C79.3911 75.3832 80.25 76.6186 80.25 78.0996Z" fill="#F5D4BC"></path></svg>`);
}
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/icons/people.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const IconsPeople = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["ssrRender", _sfc_ssrRender$6]]);
const people = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": IconsPeople
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$d = {};
function _sfc_ssrRender$5(_ctx, _push, _parent, _attrs) {
  _push(`<svg${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
    viewBox: "0 0 137 136",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, _attrs))}><circle cx="68.25" cy="68" r="56" fill="#EDF3FC"></circle><circle cx="68.25" cy="68" r="66" stroke="#EDF3FC" stroke-width="4"></circle><path d="M23.75 51C23.75 53.6667 19.8214 57.2222 18.25 57.2222C19.8214 57.2222 23.75 59.8889 23.75 63C23.75 60.7778 26.8929 57.2222 29.25 57.2222C26.8929 57.2222 23.75 52.7778 23.75 51Z" fill="#330D84" stroke="#330D84" stroke-linejoin="round"></path><path d="M115.25 67C115.25 68.5556 113.107 70.6296 112.25 70.6296C113.107 70.6296 115.25 72.1852 115.25 74C115.25 72.7037 116.964 70.6296 118.25 70.6296C116.964 70.6296 115.25 68.037 115.25 67Z" fill="#8AC9F9" stroke="#8AC9F9" stroke-linejoin="round"></path><path d="M97.25 26C97.25 27.5556 95.1071 29.6296 94.25 29.6296C95.1071 29.6296 97.25 31.1852 97.25 33C97.25 31.7037 98.9643 29.6296 100.25 29.6296C98.9643 29.6296 97.25 27.037 97.25 26Z" fill="#8AC9F9" stroke="#8AC9F9" stroke-linejoin="round"></path><path d="M29.25 67C29.25 68.5556 27.1071 70.6296 26.25 70.6296C27.1071 70.6296 29.25 72.1852 29.25 74C29.25 72.7037 30.9643 70.6296 32.25 70.6296C30.9643 70.6296 29.25 68.037 29.25 67Z" fill="#330D84" stroke="#330D84" stroke-linejoin="round"></path><path d="M92.25 105C92.25 106.556 90.1071 108.63 89.25 108.63C90.1071 108.63 92.25 110.185 92.25 112C92.25 110.704 93.9643 108.63 95.25 108.63C93.9643 108.63 92.25 106.037 92.25 105Z" fill="#F9C84E" stroke="#F9C84E" stroke-linejoin="round"></path><path d="M108.75 74C108.75 75.3333 106.964 77.1111 106.25 77.1111C106.964 77.1111 108.75 78.4444 108.75 80C108.75 78.8889 110.179 77.1111 111.25 77.1111C110.179 77.1111 108.75 74.8889 108.75 74Z" fill="#8AC9F9" stroke="#8AC9F9" stroke-linejoin="round"></path><path d="M98.25 83H39.25V43C39.25 41.8954 40.1454 41 41.25 41H96.25C97.3546 41 98.25 41.8954 98.25 43V83Z" fill="#2E3360"></path><rect x="44.25" y="46" width="49" height="33" rx="2" fill="#49508E"></rect><ellipse cx="69.25" cy="42" rx="10" ry="9" fill="#E2EBF6"></ellipse><path d="M78.25 38H60.25C63.45 32.4 67.25 30 69.25 30C70.75 30 75.25 32.5 78.25 38Z" fill="#8AC9F9"></path><rect x="59.25" y="42" width="20" height="28" fill="#E2EBF6"></rect><circle cx="69.25" cy="45" r="4" fill="#49508E"></circle><path d="M87.0408 63.2822C84.0738 59.4537 79.3692 53.1347 79.25 53V68L86.5264 71.6382C86.8588 71.8044 87.25 71.5627 87.25 71.191V63.8947C87.25 63.6724 87.177 63.4579 87.0408 63.2822Z" fill="#8AC9F9"></path><path d="M51.4592 63.2822C54.4262 59.4537 59.1308 53.1347 59.25 53V68L51.9736 71.6382C51.6412 71.8044 51.25 71.5627 51.25 71.191V63.8947C51.25 63.6724 51.323 63.4579 51.4592 63.2822Z" fill="#8AC9F9"></path><path d="M76.8382 70H61.6618L60.7204 72.6672C60.4908 73.3178 60.9734 74 61.6634 74H76.8366C77.5266 74 78.0092 73.3178 77.7796 72.6672L76.8382 70Z" fill="#C3D4E0"></path><path d="M74.25 74H64.25C64.25 76 64.05 79 59.25 79H79.25C74.75 79 74.25 76 74.25 74Z" fill="#F2D283"></path><rect x="68.25" y="53" width="2" height="19" rx="1" fill="#8AC9F9"></rect><path d="M34.25 95L39.2499 83H98.2499L104.25 95H34.25Z" fill="#E2EBF6"></path><path d="M58.0221 89.6838L56.25 95H82.25L80.4779 89.6838C80.3418 89.2754 79.9597 89 79.5292 89H58.9708C58.5403 89 58.1582 89.2754 58.0221 89.6838Z" fill="#CDDEEC"></path><path d="M34.25 99V95H104.25V99C104.25 99.5523 103.802 100 103.25 100H35.25C34.6977 100 34.25 99.5523 34.25 99Z" fill="#C3D4E0"></path></svg>`);
}
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/icons/rocket.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const IconsRocket = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["ssrRender", _sfc_ssrRender$5]]);
const rocket = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": IconsRocket
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$c = /* @__PURE__ */ vue_cjs_prod.defineComponent({
  __name: "Icon",
  __ssrInlineRender: true,
  props: {
    d: null,
    size: null
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<svg${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
        height: __props.size,
        width: __props.size,
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        role: "img"
      }, _attrs))}><path${serverRenderer.exports.ssrRenderAttr("d", __props.d)}></path></svg>`);
    };
  }
});
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Icon.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const Icon = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$c
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$b = {
  props: {
    tag: {
      type: String,
      default: "div"
    },
    size: String,
    gutterBottom: String,
    weight: String
  }
};
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  serverRenderer.exports.ssrRenderVNode(_push, vue_cjs_prod.createVNode(vue_cjs_prod.resolveDynamicComponent($props.tag), vue_cjs_prod.mergeProps({
    class: [
      $props.size && `text-${$props.size}`,
      $props.gutterBottom && `text-gutter-${$props.gutterBottom}`,
      $props.weight && `text-weight-${$props.weight}`
    ]
  }, _attrs), {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
      } else {
        return [
          vue_cjs_prod.renderSlot(_ctx.$slots, "default")
        ];
      }
    }),
    _: 3
  }), _parent);
}
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Typography.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_8 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["ssrRender", _sfc_ssrRender$4]]);
const Typography = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_8
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$a = /* @__PURE__ */ vue_cjs_prod.defineComponent({
  __name: "CardTitle",
  __ssrInlineRender: true,
  props: {
    tag: null
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      serverRenderer.exports.ssrRenderVNode(_push, vue_cjs_prod.createVNode(vue_cjs_prod.resolveDynamicComponent(__props.tag), _attrs, {
        default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            serverRenderer.exports.ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              vue_cjs_prod.renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Card/CardTitle.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const CardTitle = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$a
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$9 = {
  __name: "welcome",
  __ssrInlineRender: true,
  props: {
    appName: {
      type: String,
      default: "Nuxt"
    },
    version: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: "Welcome to Nuxt 3!"
    },
    readDocs: {
      type: String,
      default: "We highly recommend you take a look at the Nuxt documentation, whether you are new or have previous experience with the framework."
    },
    followTwitter: {
      type: String,
      default: "Follow the Nuxt Twitter account to get latest news about releases, new modules, tutorials and tips."
    },
    starGitHub: {
      type: String,
      default: "Nuxt is open source and the code is available on GitHub, feel free to star it, participate in discussions or dive into the source."
    }
  },
  setup(__props) {
    const props = __props;
    useHead({
      title: `${props.title}`,
      script: [],
      style: [
        {
          children: `*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000}:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}a{color:inherit;text-decoration:inherit}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}p,h4,h5{margin:0}h4,h5{font-size:inherit;font-weight:inherit}svg{display:block;vertical-align:middle}`
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white min-h-screen place-content-center flex flex-col items-center justify-center p-8 text-sm sm:text-base" }, _attrs))} data-v-6b7098bc><div class="grid grid-cols-3 gap-4 md:gap-8 max-w-5xl w-full z-20" data-v-6b7098bc><div class="flex justify-between items-end col-span-3" data-v-6b7098bc><a href="https://v3.nuxtjs.org" target="_blank" rel="noopener" class="nuxt-logo" data-v-6b7098bc><svg viewBox="0 0 221 65" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-40 text-black dark:text-white" data-v-6b7098bc><g clip-path="url(#a)" data-v-6b7098bc><path fill="currentColor" d="M82.5623 18.5705h7.3017l15.474 24.7415V18.5705h6.741v35.0576h-7.252L89.3025 28.938v24.6901h-6.7402V18.5705ZM142.207 53.628h-6.282v-3.916c-1.429 2.7559-4.339 4.3076-8.015 4.3076-5.822 0-9.603-4.1069-9.603-10.0175V28.3847h6.282v14.3251c0 3.4558 2.146 5.8592 5.362 5.8592 3.524 0 5.974-2.7044 5.974-6.4099V28.3847h6.282V53.628ZM164.064 53.2289l-6.026-8.4144-6.027 8.4144h-6.69l9.296-13.1723-8.58-12.0709h6.843l5.158 7.2641 5.106-7.2641h6.895l-8.632 12.0709 9.295 13.1723h-6.638ZM183.469 20.7726v7.6116h7.149v5.1593h-7.149v12.5311c0 .4208.17.8245.473 1.1223.303.2978.715.4654 1.144.4661h5.532v5.9547h-4.137c-5.617 0-9.293-3.2062-9.293-8.8109V33.5484h-5.056v-5.1642h3.172c1.479 0 2.34-.8639 2.34-2.2932v-5.3184h5.825Z" data-v-6b7098bc></path><path fill-rule="evenodd" clip-rule="evenodd" d="M30.1185 11.5456c-1.8853-3.24168-6.5987-3.24169-8.484 0L1.08737 46.8747c-1.885324 3.2417.47133 7.2938 4.24199 7.2938H21.3695c-1.6112-1.4081-2.2079-3.8441-.9886-5.9341l15.5615-26.675-5.8239-10.0138Z" fill="#80EEC0" data-v-6b7098bc></path><path d="M43.1374 19.2952c1.5603-2.6523 5.461-2.6523 7.0212 0l17.0045 28.9057c1.5603 2.6522-.39 5.9676-3.5106 5.9676h-34.009c-3.1206 0-5.0709-3.3154-3.5106-5.9676l17.0045-28.9057ZM209.174 53.8005H198.483c0-1.8514.067-3.4526 0-6.0213h10.641c1.868 0 3.353.1001 4.354-.934 1-1.0341 1.501-2.3351 1.501-3.9029 0-1.8347-.667-3.2191-2.002-4.1532-1.301-.9674-2.985-1.4511-5.054-1.4511h-2.601v-5.2539h2.652c1.701 0 3.119-.4003 4.253-1.2009 1.134-.8006 1.701-1.9849 1.701-3.5527 0-1.301-.434-2.3351-1.301-3.1023-.834-.8007-2.001-1.201-3.503-1.201-1.634 0-2.918.4837-3.853 1.4511-.9.9674-1.401 2.1517-1.501 3.5527h-6.254c.133-3.2358 1.251-5.7877 3.352-7.6558 2.135-1.868 4.887-2.8021 8.256-2.8021 2.402 0 4.42.4337 6.055 1.301 1.668.834 2.919 1.9515 3.753 3.3525.867 1.4011 1.301 2.9523 1.301 4.6536 0 1.9681-.551 3.636-1.651 5.0037-1.068 1.3344-2.402 2.235-4.004 2.7021 1.969.4003 3.57 1.3677 4.804 2.9022 1.234 1.5011 1.852 3.4025 1.852 5.7043 0 1.9347-.468 3.7028-1.402 5.304-.934 1.6012-2.301 2.8855-4.103 3.8529-1.768.9674-3.953 1.4511-6.555 1.4511Z" fill="#00DC82" data-v-6b7098bc></path></g><defs data-v-6b7098bc><clipPath id="a" data-v-6b7098bc><path fill="#fff" d="M0 0h221v65H0z" data-v-6b7098bc></path></clipPath></defs></svg></a><a href="https://github.com/nuxt/framework/releases/tag/{{ version }}" target="_blank" rel="noopener" class="flex justify-end pb-1 sm:pb-2" data-v-6b7098bc>${serverRenderer.exports.ssrInterpolate(__props.version)}</a><div class="spotlight-wrapper" data-v-6b7098bc><div class="fixed z-10 left-0 right-0 spotlight" data-v-6b7098bc></div></div></div><div class="col-span-3 rounded p-4 flex flex-col gradient-border" data-v-6b7098bc><div class="flex justify-between items-center mb-4" data-v-6b7098bc><h4 class="font-medium text-2xl" data-v-6b7098bc>Get Started</h4><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6b7098bc><path d="M29.4284 31.095C26.9278 33.5955 23.5364 35.0003 20.0001 35.0003C16.4637 35.0003 13.0723 33.5955 10.5717 31.095C8.07118 28.5944 6.66638 25.203 6.66638 21.6667C6.66638 18.1304 8.07118 14.7389 10.5717 12.2383C10.5717 12.2383 11.6667 15 15.0001 16.6667C15.0001 13.3333 15.8334 8.33333 19.9767 5C23.3334 8.33333 26.8167 9.62833 29.4267 12.2383C30.667 13.475 31.6506 14.9446 32.321 16.5626C32.9915 18.1806 33.3355 19.9152 33.3334 21.6667C33.3357 23.418 32.9919 25.1525 32.3218 26.7705C31.6516 28.3886 30.6683 29.8582 29.4284 31.095V31.095Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-6b7098bc></path><path d="M16.465 26.8683C17.0456 27.4491 17.7604 27.878 18.5462 28.1169C19.3319 28.3559 20.1644 28.3976 20.9701 28.2385C21.7758 28.0793 22.5299 27.7241 23.1657 27.2043C23.8015 26.6845 24.2995 26.016 24.6157 25.2581C24.9318 24.5001 25.0564 23.6759 24.9784 22.8584C24.9004 22.0408 24.6222 21.2551 24.1684 20.5705C23.7146 19.886 23.0992 19.3238 22.3766 18.9336C21.6539 18.5434 20.8463 18.3373 20.025 18.3333L18.3333 23.3333H15C15 24.6133 15.4883 25.8933 16.465 26.8683Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-6b7098bc></path></svg></div><p class="mb-2" data-v-6b7098bc>Remove this welcome page by removing <a class="bg-gray-100 dark:bg-white/10 rounded font-mono p-1 font-bold" data-v-6b7098bc>&lt;NuxtWelcome /&gt;</a> tag or creating an <a href="https://v3.nuxtjs.org/docs/directory-structure/app" target="_blank" rel="noopener" class="bg-gray-100 dark:bg-white/10 rounded font-mono p-1 font-bold" data-v-6b7098bc>app.vue</a> file.</p></div><a href="https://v3.nuxtjs.org" target="_blank" rel="noopener" class="gradient-border cursor-pointer col-span-3 sm:col-span-1 p-4 flex flex-col" data-v-6b7098bc><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6b7098bc><path d="M20 10.4217C21.9467 9.12833 24.59 8.33333 27.5 8.33333C30.4117 8.33333 33.0533 9.12833 35 10.4217V32.0883C33.0533 30.795 30.4117 30 27.5 30C24.59 30 21.9467 30.795 20 32.0883M20 10.4217V32.0883V10.4217ZM20 10.4217C18.0533 9.12833 15.41 8.33333 12.5 8.33333C9.59 8.33333 6.94667 9.12833 5 10.4217V32.0883C6.94667 30.795 9.59 30 12.5 30C15.41 30 18.0533 30.795 20 32.0883V10.4217Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-6b7098bc></path><rect x="23.3334" y="13.3333" width="8.33334" height="1.66667" rx="0.833333" fill="currentColor" data-v-6b7098bc></rect><rect x="8.33337" y="13.3333" width="8.33333" height="1.66667" rx="0.833333" fill="currentColor" data-v-6b7098bc></rect><rect x="8.33337" y="18.3333" width="8.33333" height="1.66667" rx="0.833333" fill="currentColor" data-v-6b7098bc></rect><rect x="8.33337" y="23.3333" width="8.33333" height="1.66667" rx="0.833334" fill="currentColor" data-v-6b7098bc></rect><rect x="23.3334" y="18.3333" width="8.33334" height="1.66667" rx="0.833333" fill="currentColor" data-v-6b7098bc></rect><rect x="23.3334" y="23.3333" width="8.33334" height="1.66667" rx="0.833334" fill="currentColor" data-v-6b7098bc></rect></svg><h5 class="font-semibold text-xl mt-4" data-v-6b7098bc>Documentation</h5><p class="mt-2" data-v-6b7098bc>${serverRenderer.exports.ssrInterpolate(__props.readDocs)}</p></a><a href="https://github.com/nuxt/framework" target="_blank" rel="noopener" class="cursor-pointer gradient-border col-span-3 sm:col-span-1 p-4 flex flex-col" data-v-6b7098bc><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6b7098bc><path fill-rule="evenodd" clip-rule="evenodd" d="M20 3.33333C10.795 3.33333 3.33337 10.8067 3.33337 20.0283C3.33337 27.4033 8.10837 33.6617 14.7317 35.8683C15.565 36.0217 15.8684 35.5067 15.8684 35.0633C15.8684 34.6683 15.855 33.6167 15.8467 32.225C11.21 33.2333 10.2317 29.9867 10.2317 29.9867C9.47504 28.0567 8.38171 27.5433 8.38171 27.5433C6.86837 26.51 8.49671 26.53 8.49671 26.53C10.1684 26.6467 11.0484 28.25 11.0484 28.25C12.535 30.8 14.95 30.0633 15.8984 29.6367C16.0517 28.5583 16.4817 27.8233 16.9584 27.4067C13.2584 26.985 9.36671 25.5517 9.36671 19.155C9.36671 17.3333 10.0167 15.8417 11.0817 14.675C10.91 14.2533 10.3384 12.555 11.245 10.2583C11.245 10.2583 12.645 9.80833 15.8284 11.9683C17.188 11.5975 18.5908 11.4087 20 11.4067C21.4167 11.4133 22.8417 11.5983 24.1734 11.9683C27.355 9.80833 28.7517 10.2567 28.7517 10.2567C29.6617 12.555 29.0884 14.2533 28.9184 14.675C29.985 15.8417 30.6317 17.3333 30.6317 19.155C30.6317 25.5683 26.7334 26.98 23.0217 27.3933C23.62 27.9083 24.1517 28.9267 24.1517 30.485C24.1517 32.715 24.1317 34.5167 24.1317 35.0633C24.1317 35.51 24.4317 36.03 25.2784 35.8667C28.5972 34.7535 31.4823 32.6255 33.5258 29.7834C35.5694 26.9413 36.6681 23.5289 36.6667 20.0283C36.6667 10.8067 29.2034 3.33333 20 3.33333Z" fill="currentColor" data-v-6b7098bc></path></svg><h5 class="font-semibold text-xl mt-4" data-v-6b7098bc>GitHub</h5><p class="mt-2" data-v-6b7098bc>${serverRenderer.exports.ssrInterpolate(__props.starGitHub)}</p></a><a href="https://twitter.com/nuxt_js" target="_blank" rel="noopener" class="cursor-pointer gradient-border col-span-3 sm:col-span-1 p-4 flex flex-col gap-y-4" data-v-6b7098bc><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-6b7098bc><path d="M13.8167 33.7557C26.395 33.7557 33.275 23.334 33.275 14.2973C33.275 14.0007 33.275 13.7057 33.255 13.414C34.5937 12.4449 35.7489 11.245 36.6667 9.87066C35.4185 10.424 34.0943 10.7869 32.7384 10.9473C34.1661 10.0924 35.2346 8.74791 35.745 7.164C34.4029 7.96048 32.9345 8.52188 31.4034 8.824C30.3724 7.72694 29.0084 7.00039 27.5228 6.75684C26.0371 6.51329 24.5126 6.76633 23.1852 7.47678C21.8579 8.18723 20.8018 9.31545 20.1805 10.6868C19.5592 12.0581 19.4073 13.596 19.7484 15.0623C17.0294 14.9261 14.3694 14.2195 11.9411 12.9886C9.51285 11.7577 7.37059 10.0299 5.65337 7.91733C4.7789 9.42267 4.51102 11.2047 4.90427 12.9006C5.29751 14.5965 6.32232 16.0788 7.77004 17.0457C6.68214 17.0142 5.61776 16.7215 4.66671 16.1923V16.279C4.66736 17.8578 5.21403 19.3878 6.21404 20.6096C7.21404 21.8313 8.60582 22.6696 10.1534 22.9823C9.14639 23.2569 8.08986 23.2968 7.06504 23.099C7.50198 24.4581 8.35284 25.6467 9.49859 26.4984C10.6443 27.35 12.0277 27.8223 13.455 27.849C12.0369 28.9633 10.413 29.7871 8.67625 30.2732C6.93948 30.7594 5.12391 30.8984 3.33337 30.6823C6.46105 32.6896 10.1004 33.7542 13.8167 33.749" fill="currentColor" data-v-6b7098bc></path></svg><h5 class="font-semibold text-xl" data-v-6b7098bc>Twitter</h5><p data-v-6b7098bc>${serverRenderer.exports.ssrInterpolate(__props.followTwitter)}</p></a></div></div>`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui-templates/dist/templates/welcome.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const welcome = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-6b7098bc"]]);
const welcome$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": welcome
}, Symbol.toStringTag, { value: "Module" }));
const layouts = {};
const defaultLayoutTransition = { name: "layout", mode: "out-in" };
const layout = vue_cjs_prod.defineComponent({
  props: {
    name: {
      type: [String, Boolean, Object],
      default: null
    }
  },
  setup(props, context) {
    const route = useRoute();
    return () => {
      var _a, _b, _c;
      const layout2 = (_b = (_a = vue_cjs_prod.isRef(props.name) ? props.name.value : props.name) != null ? _a : route.meta.layout) != null ? _b : "default";
      const hasLayout = layout2 && layout2 in layouts;
      return _wrapIf(vue_cjs_prod.Transition, hasLayout && ((_c = route.meta.layoutTransition) != null ? _c : defaultLayoutTransition), _wrapIf(layouts[layout2], hasLayout, context.slots)).default();
    };
  }
});
const layout$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": layout
}, Symbol.toStringTag, { value: "Module" }));
const nuxtErrorBoundary = vue_cjs_prod.defineComponent({
  setup(_props, { slots, emit }) {
    const error = vue_cjs_prod.ref(null);
    useNuxtApp();
    vue_cjs_prod.onErrorCaptured((err) => {
    });
    return () => {
      var _a, _b;
      return error.value ? (_a = slots.error) == null ? void 0 : _a.call(slots, { error }) : (_b = slots.default) == null ? void 0 : _b.call(slots);
    };
  }
});
const nuxtErrorBoundary$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": nuxtErrorBoundary
}, Symbol.toStringTag, { value: "Module" }));
const clientOnly = vue_cjs_prod.defineComponent({
  name: "ClientOnly",
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots }) {
    const mounted = vue_cjs_prod.ref(false);
    vue_cjs_prod.onMounted(() => {
      mounted.value = true;
    });
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? void 0 : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return vue_cjs_prod.createElementBlock(fallbackTag, null, fallbackStr);
    };
  }
});
function createClientOnly(component) {
  return vue_cjs_prod.defineComponent({
    name: "ClientOnlyWrapper",
    setup(props, { attrs, slots }) {
      const mounted = vue_cjs_prod.ref(false);
      vue_cjs_prod.onMounted(() => {
        mounted.value = true;
      });
      return () => {
        if (mounted.value) {
          return vue_cjs_prod.h(component, { props, attrs }, slots);
        }
        return vue_cjs_prod.h("div");
      };
    }
  });
}
const clientOnly$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": clientOnly,
  createClientOnly
}, Symbol.toStringTag, { value: "Module" }));
const serverPlaceholder = vue_cjs_prod.defineComponent({
  name: "ServerPlaceholder",
  render() {
    return vue_cjs_prod.createElementBlock("div");
  }
});
const serverPlaceholder$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": serverPlaceholder
}, Symbol.toStringTag, { value: "Module" }));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return AboutUs;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Chart;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return FilterMenu;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Header;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return logo;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return people;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return rocket;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Button;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Container;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Icon;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Slider;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Table;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Typography;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return CardTitle;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return index$2;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Col;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Row;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return welcome$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return layout$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return nuxtErrorBoundary$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return clientOnly$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return serverPlaceholder$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return nuxtLink;
}).then((c) => c.default || c));
const _sfc_main$8 = {
  data: () => ({
    mdiCheck,
    cards: [
      {
        title: "\u0421\u043E\u0446\u0441\u0435\u0442\u0435\u0439 \u043C\u043D\u043E\u0433\u043E - \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043E\u0434\u043D\u0430",
        subtitle: "\u0421\u0434\u0435\u043B\u0430\u0439\u0442\u0435 \u0441\u0435\u0431\u044F \u0438 \u0441\u0432\u043E\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u043C \u0434\u043B\u044F \u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u0438, \u0433\u0434\u0435 \u0431\u044B \u0432\u044B \u043D\u0438 \u043D\u0430\u0445\u043E\u0434\u0438\u043B\u0438\u0441\u044C",
        icon: IconsRocket
      },
      {
        title: "\u041A\u0440\u043E\u0441\u0441\u0435\u0442\u044C",
        subtitle: "\u0420\u0430\u0441\u0448\u0438\u0440\u044F\u0439\u0442\u0435 \u0441\u0432\u043E\u044E \u0441\u0435\u0442\u044C \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0438 \u043B\u0438\u0447\u043D\u044B\u0445 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043E\u0432 \u0431\u0435\u0437 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0439",
        icon: IconsPeople
      },
      {
        title: "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E",
        subtitle: "\u0415\u0434\u0438\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0434\u043B\u044F \u043F\u043E\u0438\u0441\u043A\u0430, \u043A\u043E\u043C\u043C\u0443\u043D\u0438\u043A\u0430\u0446\u0438\u0439 \u0438 \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0442\u0441\u0432\u0438\u044F \u043C\u0435\u0436\u0434\u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F\u043C\u0438"
      },
      {
        title: "\u041F\u043B\u0430\u0442\u0435\u0436\u0438 \u0438 \u0443\u0441\u043B\u0443\u0433\u0438",
        subtitle: "\u041F\u0440\u0438\u043D\u0438\u043C\u0430\u0439\u0442\u0435 \u043F\u043E\u0436\u0435\u0440\u0442\u0432\u043E\u0432\u0430\u043D\u0438\u044F \u0438 \u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0439\u0442\u0435 \u0443\u0441\u043B\u0443\u0433\u0438 \u0441 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F\u043C\u0438"
      }
    ]
  })
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ui_container = __nuxt_component_1;
  const _component_ui_grid_row = __nuxt_component_3;
  const _component_ui_grid_col = __nuxt_component_4;
  const _component_ui_card = _sfc_main$l;
  _push(`<section${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({
    class: "section",
    style: { "background": "#fafcff" }
  }, _attrs))}>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_ui_container, null, {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h2 class="section-title"${_scopeId}><span${_scopeId}> \u041E \u043D\u0430\u0441 </span></h2>`);
        _push2(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_row, null, {
          default: vue_cjs_prod.withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<!--[-->`);
              serverRenderer.exports.ssrRenderList(_ctx.cards, (card, i) => {
                _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                  cols: 12,
                  lg: 6,
                  key: i
                }, {
                  default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, {
                        outlined: "",
                        style: { "display": "flex", "align-items": "center", "gap": "16px" }
                      }, {
                        default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                          if (_push5) {
                            _push5(`<div${_scopeId4}>`);
                            serverRenderer.exports.ssrRenderVNode(_push5, vue_cjs_prod.createVNode(vue_cjs_prod.resolveDynamicComponent(card.icon), { class: "icon" }, null), _parent5, _scopeId4);
                            _push5(`</div><div${_scopeId4}><h5 class="about-subtitle"${_scopeId4}>${serverRenderer.exports.ssrInterpolate(card.title)}</h5><p class="about-description"${_scopeId4}>${serverRenderer.exports.ssrInterpolate(card.subtitle)}</p></div>`);
                          } else {
                            return [
                              vue_cjs_prod.createVNode("div", null, [
                                (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(vue_cjs_prod.resolveDynamicComponent(card.icon), { class: "icon" }))
                              ]),
                              vue_cjs_prod.createVNode("div", null, [
                                vue_cjs_prod.createVNode("h5", { class: "about-subtitle" }, vue_cjs_prod.toDisplayString(card.title), 1),
                                vue_cjs_prod.createVNode("p", { class: "about-description" }, vue_cjs_prod.toDisplayString(card.subtitle), 1)
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent4, _scopeId3));
                    } else {
                      return [
                        vue_cjs_prod.createVNode(_component_ui_card, {
                          outlined: "",
                          style: { "display": "flex", "align-items": "center", "gap": "16px" }
                        }, {
                          default: vue_cjs_prod.withCtx(() => [
                            vue_cjs_prod.createVNode("div", null, [
                              (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(vue_cjs_prod.resolveDynamicComponent(card.icon), { class: "icon" }))
                            ]),
                            vue_cjs_prod.createVNode("div", null, [
                              vue_cjs_prod.createVNode("h5", { class: "about-subtitle" }, vue_cjs_prod.toDisplayString(card.title), 1),
                              vue_cjs_prod.createVNode("p", { class: "about-description" }, vue_cjs_prod.toDisplayString(card.subtitle), 1)
                            ])
                          ]),
                          _: 2
                        }, 1024)
                      ];
                    }
                  }),
                  _: 2
                }, _parent3, _scopeId2));
              });
              _push3(`<!--]-->`);
            } else {
              return [
                (vue_cjs_prod.openBlock(true), vue_cjs_prod.createBlock(vue_cjs_prod.Fragment, null, vue_cjs_prod.renderList(_ctx.cards, (card, i) => {
                  return vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(_component_ui_grid_col, {
                    cols: 12,
                    lg: 6,
                    key: i
                  }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, {
                        outlined: "",
                        style: { "display": "flex", "align-items": "center", "gap": "16px" }
                      }, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("div", null, [
                            (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(vue_cjs_prod.resolveDynamicComponent(card.icon), { class: "icon" }))
                          ]),
                          vue_cjs_prod.createVNode("div", null, [
                            vue_cjs_prod.createVNode("h5", { class: "about-subtitle" }, vue_cjs_prod.toDisplayString(card.title), 1),
                            vue_cjs_prod.createVNode("p", { class: "about-description" }, vue_cjs_prod.toDisplayString(card.subtitle), 1)
                          ])
                        ]),
                        _: 2
                      }, 1024)
                    ]),
                    _: 2
                  }, 1024);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          vue_cjs_prod.createVNode("h2", { class: "section-title" }, [
            vue_cjs_prod.createVNode("span", null, " \u041E \u043D\u0430\u0441 ")
          ]),
          vue_cjs_prod.createVNode(_component_ui_grid_row, null, {
            default: vue_cjs_prod.withCtx(() => [
              (vue_cjs_prod.openBlock(true), vue_cjs_prod.createBlock(vue_cjs_prod.Fragment, null, vue_cjs_prod.renderList(_ctx.cards, (card, i) => {
                return vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(_component_ui_grid_col, {
                  cols: 12,
                  lg: 6,
                  key: i
                }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, {
                      outlined: "",
                      style: { "display": "flex", "align-items": "center", "gap": "16px" }
                    }, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createVNode("div", null, [
                          (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(vue_cjs_prod.resolveDynamicComponent(card.icon), { class: "icon" }))
                        ]),
                        vue_cjs_prod.createVNode("div", null, [
                          vue_cjs_prod.createVNode("h5", { class: "about-subtitle" }, vue_cjs_prod.toDisplayString(card.title), 1),
                          vue_cjs_prod.createVNode("p", { class: "about-description" }, vue_cjs_prod.toDisplayString(card.subtitle), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  _: 2
                }, 1024);
              }), 128))
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section>`);
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AboutUs.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["ssrRender", _sfc_ssrRender$3]]);
const AboutUs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __nuxt_component_6
}, Symbol.toStringTag, { value: "Module" }));
const meta = void 0;
const routes = [
  {
    name: "cabinet",
    path: "/cabinet",
    file: "C:/Users/rosie/OneDrive/\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B/GitHub/qaqadoLanding/pages/cabinet.vue",
    children: [],
    meta: meta$1,
    alias: [],
    component: () => Promise.resolve().then(function() {
      return cabinet$1;
    })
  },
  {
    name: "index",
    path: "/",
    file: "C:/Users/rosie/OneDrive/\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B/GitHub/qaqadoLanding/pages/index.vue",
    children: [],
    meta,
    alias: [],
    component: () => Promise.resolve().then(function() {
      return index$1;
    })
  }
];
const configRouterOptions = {};
const routerOptions = {
  ...configRouterOptions
};
const globalMiddleware = [];
const namedMiddleware = {};
const C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47node_modules_47nuxt_47dist_47pages_47runtime_47router = defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.vueApp.component("NuxtPage", NuxtPage);
  nuxtApp.vueApp.component("NuxtNestedPage", NuxtPage);
  nuxtApp.vueApp.component("NuxtChild", NuxtPage);
  const baseURL2 = useRuntimeConfig().app.baseURL;
  const routerHistory = vueRouter_cjs_prod.createMemoryHistory(baseURL2);
  const initialURL = nuxtApp.ssrContext.url;
  const router = vueRouter_cjs_prod.createRouter({
    ...routerOptions,
    history: routerHistory,
    routes
  });
  nuxtApp.vueApp.use(router);
  const previousRoute = vue_cjs_prod.shallowRef(router.currentRoute.value);
  router.afterEach((_to, from) => {
    previousRoute.value = from;
  });
  Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
    get: () => previousRoute.value
  });
  const route = {};
  for (const key in router.currentRoute.value) {
    route[key] = vue_cjs_prod.computed(() => router.currentRoute.value[key]);
  }
  const _activeRoute = vue_cjs_prod.shallowRef(router.resolve(initialURL));
  const syncCurrentRoute = () => {
    _activeRoute.value = router.currentRoute.value;
  };
  nuxtApp.hook("page:finish", syncCurrentRoute);
  router.afterEach((to, from) => {
    var _a, _b, _c, _d;
    if (((_b = (_a = to.matched[0]) == null ? void 0 : _a.components) == null ? void 0 : _b.default) === ((_d = (_c = from.matched[0]) == null ? void 0 : _c.components) == null ? void 0 : _d.default)) {
      syncCurrentRoute();
    }
  });
  const activeRoute = {};
  for (const key in _activeRoute.value) {
    activeRoute[key] = vue_cjs_prod.computed(() => _activeRoute.value[key]);
  }
  nuxtApp._route = vue_cjs_prod.reactive(route);
  nuxtApp._activeRoute = vue_cjs_prod.reactive(activeRoute);
  nuxtApp._middleware = nuxtApp._middleware || {
    global: [],
    named: {}
  };
  useError();
  try {
    if (true) {
      await router.push(initialURL);
    }
    await router.isReady();
  } catch (error2) {
    callWithNuxt(nuxtApp, throwError, [error2]);
  }
  router.beforeEach(async (to, from) => {
    var _a;
    to.meta = vue_cjs_prod.reactive(to.meta);
    nuxtApp._processingMiddleware = true;
    const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
    for (const component of to.matched) {
      const componentMiddleware = component.meta.middleware;
      if (!componentMiddleware) {
        continue;
      }
      if (Array.isArray(componentMiddleware)) {
        for (const entry2 of componentMiddleware) {
          middlewareEntries.add(entry2);
        }
      } else {
        middlewareEntries.add(componentMiddleware);
      }
    }
    for (const entry2 of middlewareEntries) {
      const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_a = namedMiddleware[entry2]) == null ? void 0 : _a.call(namedMiddleware).then((r) => r.default || r)) : entry2;
      if (!middleware) {
        throw new Error(`Unknown route middleware: '${entry2}'.`);
      }
      const result = await callWithNuxt(nuxtApp, middleware, [to, from]);
      {
        if (result === false || result instanceof Error) {
          const error2 = result || createError({
            statusMessage: `Route navigation aborted: ${initialURL}`
          });
          return callWithNuxt(nuxtApp, throwError, [error2]);
        }
      }
      if (result || result === false) {
        return result;
      }
    }
  });
  router.afterEach(async (to) => {
    delete nuxtApp._processingMiddleware;
    if (to.matched.length === 0) {
      callWithNuxt(nuxtApp, throwError, [createError({
        statusCode: 404,
        statusMessage: `Page not found: ${to.fullPath}`
      })]);
    } else if (to.matched[0].name === "404" && nuxtApp.ssrContext) {
      nuxtApp.ssrContext.res.statusCode = 404;
    } else {
      const currentURL = to.fullPath || "/";
      if (!isEqual(currentURL, initialURL)) {
        await callWithNuxt(nuxtApp, navigateTo, [currentURL]);
      }
    }
  });
  nuxtApp.hooks.hookOnce("app:created", async () => {
    try {
      await router.replace({
        ...router.resolve(initialURL),
        name: void 0,
        force: true
      });
    } catch (error2) {
      callWithNuxt(nuxtApp, throwError, [error2]);
    }
  });
  return { provide: { router } };
});
const PiniaNuxtPlugin = (context, inject2) => {
  const pinia = createPinia();
  {
    context.vueApp.use(pinia);
  }
  inject2("pinia", pinia);
  context.pinia = pinia;
  setActivePinia(pinia);
  pinia._p.push(({ store }) => {
    Object.defineProperty(store, "$nuxt", { value: context });
  });
  {
    {
      context.nuxtState.pinia = pinia.state.value;
    }
  }
};
const _plugins = [
  preload,
  C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47_46nuxt_47components_46plugin_46mjs,
  C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47node_modules_47nuxt_47dist_47head_47runtime_47lib_47vueuse_45head_46plugin,
  C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47node_modules_47nuxt_47dist_47head_47runtime_47plugin,
  C_58_47Users_47rosie_47OneDrive_47_1044_1086_1082_1091_1084_1077_1085_1090_1099_47GitHub_47qaqadoLanding_47node_modules_47nuxt_47dist_47pages_47runtime_47router,
  PiniaNuxtPlugin
];
const _sfc_main$7 = {
  __name: "error-404",
  __ssrInlineRender: true,
  props: {
    appName: {
      type: String,
      default: "Nuxt"
    },
    version: {
      type: String,
      default: ""
    },
    statusCode: {
      type: String,
      default: "404"
    },
    statusMessage: {
      type: String,
      default: "Not Found"
    },
    description: {
      type: String,
      default: "Sorry, the page you are looking for could not be found."
    },
    backHome: {
      type: String,
      default: "Go back home"
    }
  },
  setup(__props) {
    const props = __props;
    useHead({
      title: `${props.statusCode} - ${props.statusMessage} | ${props.appName}`,
      script: [],
      style: [
        {
          children: `*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000}:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}a{color:inherit;text-decoration:inherit}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}h1,p{margin:0}h1{font-size:inherit;font-weight:inherit}`
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white grid min-h-screen place-content-center overflow-hidden" }, _attrs))} data-v-011aae6d><div class="fixed left-0 right-0 spotlight z-10" data-v-011aae6d></div><div class="max-w-520px text-center z-20" data-v-011aae6d><h1 class="text-8xl sm:text-10xl font-medium mb-8" data-v-011aae6d>${serverRenderer.exports.ssrInterpolate(__props.statusCode)}</h1><p class="text-xl px-8 sm:px-0 sm:text-4xl font-light mb-16 leading-tight" data-v-011aae6d>${serverRenderer.exports.ssrInterpolate(__props.description)}</p><div class="w-full flex items-center justify-center" data-v-011aae6d>`);
      _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "gradient-border text-md sm:text-xl py-2 px-4 sm:py-3 sm:px-6 cursor-pointer"
      }, {
        default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${serverRenderer.exports.ssrInterpolate(__props.backHome)}`);
          } else {
            return [
              vue_cjs_prod.createTextVNode(vue_cjs_prod.toDisplayString(__props.backHome), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui-templates/dist/templates/error-404.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const Error404 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-011aae6d"]]);
const _sfc_main$6 = {
  __name: "error-500",
  __ssrInlineRender: true,
  props: {
    appName: {
      type: String,
      default: "Nuxt"
    },
    version: {
      type: String,
      default: ""
    },
    statusCode: {
      type: String,
      default: "500"
    },
    statusMessage: {
      type: String,
      default: "Server error"
    },
    description: {
      type: String,
      default: "This page is temporarily unavailable."
    }
  },
  setup(__props) {
    const props = __props;
    useHead({
      title: `${props.statusCode} - ${props.statusMessage} | ${props.appName}`,
      script: [],
      style: [
        {
          children: `*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000}:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}h1,p{margin:0}h1{font-size:inherit;font-weight:inherit}`
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white grid min-h-screen place-content-center overflow-hidden" }, _attrs))} data-v-6aee6495><div class="fixed -bottom-1/2 left-0 right-0 h-1/2 spotlight" data-v-6aee6495></div><div class="max-w-520px text-center" data-v-6aee6495><h1 class="text-8xl sm:text-10xl font-medium mb-8" data-v-6aee6495>${serverRenderer.exports.ssrInterpolate(__props.statusCode)}</h1><p class="text-xl px-8 sm:px-0 sm:text-4xl font-light mb-16 leading-tight" data-v-6aee6495>${serverRenderer.exports.ssrInterpolate(__props.description)}</p></div></div>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui-templates/dist/templates/error-500.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const Error500 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-6aee6495"]]);
const _sfc_main$4 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    var _a;
    const props = __props;
    const error = props.error;
    (error.stack || "").split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n");
    const statusCode = String(error.statusCode || 500);
    const is404 = statusCode === "404";
    const statusMessage = (_a = error.statusMessage) != null ? _a : is404 ? "Page Not Found" : "Internal Server Error";
    const description = error.message || error.toString();
    const stack = void 0;
    const ErrorTemplate = is404 ? Error404 : Error500;
    return (_ctx, _push, _parent, _attrs) => {
      _push(serverRenderer.exports.ssrRenderComponent(vue_cjs_prod.unref(ErrorTemplate), vue_cjs_prod.mergeProps({ statusCode: vue_cjs_prod.unref(statusCode), statusMessage: vue_cjs_prod.unref(statusMessage), description: vue_cjs_prod.unref(description), stack: vue_cjs_prod.unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const nuxtApp = useNuxtApp();
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    vue_cjs_prod.onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        callWithNuxt(nuxtApp, throwError, [err]);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_App = vue_cjs_prod.resolveComponent("App");
      serverRenderer.exports.ssrRenderSuspense(_push, {
        default: () => {
          if (vue_cjs_prod.unref(error)) {
            _push(serverRenderer.exports.ssrRenderComponent(vue_cjs_prod.unref(_sfc_main$4), { error: vue_cjs_prod.unref(error) }, null, _parent));
          } else {
            _push(serverRenderer.exports.ssrRenderComponent(_component_App, null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs) {
  const _component_NuxtPage = vue_cjs_prod.resolveComponent("NuxtPage");
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(_attrs)}>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtPage, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2]]);
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
let entry;
const plugins = normalizePlugins(_plugins);
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = vue_cjs_prod.createApp(_sfc_main$3);
    vueApp.component("App", AppComponent);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.callHook("app:error", err);
      ssrContext.error = ssrContext.error || err;
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);
const _sfc_main$1 = {
  async setup() {
    const dashboardStore = useDashboardStore();
    dashboardStore.getDailyTranaactions();
    return { dashboardStore };
  },
  components: {
    Chart: _sfc_main$j
  },
  data: () => ({
    chart: null
  })
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Header = __nuxt_component_0;
  const _component_ui_container = __nuxt_component_1;
  const _component_ui_grid_row = __nuxt_component_3;
  const _component_ui_grid_col = __nuxt_component_4;
  const _component_ui_card = _sfc_main$l;
  const _component_icons_logo = __nuxt_component_5;
  const _component_chart = _sfc_main$j;
  const _component_ui_slider = __nuxt_component_7;
  const _component_ui_button = __nuxt_component_2;
  const _component_ui_table = _sfc_main$g;
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(_attrs)}>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_Header, null, null, _parent));
  _push(`<section>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_ui_container, null, {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_row, { spacing: "md" }, {
          default: vue_cjs_prod.withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                cols: 12,
                lg: 4
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`<div style="${serverRenderer.exports.ssrRenderStyle({ "display": "flex" })}"${_scopeId4}><div class="icon-container"${_scopeId4}><div class="icon"${_scopeId4}>`);
                          _push5(serverRenderer.exports.ssrRenderComponent(_component_icons_logo, null, null, _parent5, _scopeId4));
                          _push5(`</div></div><div${_scopeId4}><h5 style="${serverRenderer.exports.ssrRenderStyle({ "font-size": "20px", "margin-bottom": "1.5em" })}"${_scopeId4}> Token balance </h5><p${_scopeId4}>120 000 000 QQD</p></div></div>`);
                        } else {
                          return [
                            vue_cjs_prod.createVNode("div", { style: { "display": "flex" } }, [
                              vue_cjs_prod.createVNode("div", { class: "icon-container" }, [
                                vue_cjs_prod.createVNode("div", { class: "icon" }, [
                                  vue_cjs_prod.createVNode(_component_icons_logo)
                                ])
                              ]),
                              vue_cjs_prod.createVNode("div", null, [
                                vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " Token balance "),
                                vue_cjs_prod.createVNode("p", null, "120 000 000 QQD")
                              ])
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("div", { style: { "display": "flex" } }, [
                            vue_cjs_prod.createVNode("div", { class: "icon-container" }, [
                              vue_cjs_prod.createVNode("div", { class: "icon" }, [
                                vue_cjs_prod.createVNode(_component_icons_logo)
                              ])
                            ]),
                            vue_cjs_prod.createVNode("div", null, [
                              vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " Token balance "),
                              vue_cjs_prod.createVNode("p", null, "120 000 000 QQD")
                            ])
                          ])
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                cols: 12,
                lg: 8
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(` 2 `);
                        } else {
                          return [
                            vue_cjs_prod.createTextVNode(" 2 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode(" 2 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                cols: 12,
                lg: 8
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`<h5 style="${serverRenderer.exports.ssrRenderStyle({ "font-size": "20px", "margin-bottom": "1.5em" })}"${_scopeId4}> \u0413\u0440\u0430\u0444\u0438\u043A \u043E\u043D\u0447\u0435\u0439\u043D \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432 QQD </h5>`);
                          _push5(serverRenderer.exports.ssrRenderComponent(_component_chart, {
                            chartData: $setup.dashboardStore.dailyTransactions && $setup.dashboardStore.dailyTransactions.data || null,
                            loading: false
                          }, null, _parent5, _scopeId4));
                        } else {
                          return [
                            vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0413\u0440\u0430\u0444\u0438\u043A \u043E\u043D\u0447\u0435\u0439\u043D \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432 QQD "),
                            vue_cjs_prod.createVNode(_component_chart, {
                              chartData: $setup.dashboardStore.dailyTransactions && $setup.dashboardStore.dailyTransactions.data || null,
                              loading: false
                            }, null, 8, ["chartData"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0413\u0440\u0430\u0444\u0438\u043A \u043E\u043D\u0447\u0435\u0439\u043D \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432 QQD "),
                          vue_cjs_prod.createVNode(_component_chart, {
                            chartData: $setup.dashboardStore.dailyTransactions && $setup.dashboardStore.dailyTransactions.data || null,
                            loading: false
                          }, null, 8, ["chartData"])
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                cols: 12,
                lg: 4
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`<h5 style="${serverRenderer.exports.ssrRenderStyle({ "font-size": "20px", "margin-bottom": "1.5em" })}"${_scopeId4}> \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0442\u043E\u043A\u0435\u043D\u0430 </h5>`);
                          _push5(serverRenderer.exports.ssrRenderComponent(_component_ui_slider, { min: 0 }, null, _parent5, _scopeId4));
                          _push5(serverRenderer.exports.ssrRenderComponent(_component_ui_button, null, {
                            default: vue_cjs_prod.withCtx((_5, _push6, _parent6, _scopeId5) => {
                              if (_push6) {
                                _push6(`\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D`);
                              } else {
                                return [
                                  vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent5, _scopeId4));
                        } else {
                          return [
                            vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0442\u043E\u043A\u0435\u043D\u0430 "),
                            vue_cjs_prod.createVNode(_component_ui_slider, { min: 0 }),
                            vue_cjs_prod.createVNode(_component_ui_button, null, {
                              default: vue_cjs_prod.withCtx(() => [
                                vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0442\u043E\u043A\u0435\u043D\u0430 "),
                          vue_cjs_prod.createVNode(_component_ui_slider, { min: 0 }),
                          vue_cjs_prod.createVNode(_component_ui_button, null, {
                            default: vue_cjs_prod.withCtx(() => [
                              vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                cols: 12,
                lg: 8
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`<h5 style="${serverRenderer.exports.ssrRenderStyle({ "font-size": "20px", "margin-bottom": "1.5em" })}"${_scopeId4}> \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 </h5>`);
                          _push5(serverRenderer.exports.ssrRenderComponent(_component_ui_table, { headers: ["\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432", "\u0421\u0443\u043C\u043C\u0430", "\u0414\u0430\u0442\u0430", "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"] }, {
                            default: vue_cjs_prod.withCtx((_5, _push6, _parent6, _scopeId5) => {
                              if (_push6) {
                                _push6(`<tbody${_scopeId5}><tr${_scopeId5}><td${_scopeId5}>\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432</td><td${_scopeId5}>\u0421\u0443\u043C\u043C\u0430</td><td${_scopeId5}>\u0414\u0430\u0442\u0430</td><td${_scopeId5}>\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435</td></tr><tr${_scopeId5}><td${_scopeId5}>\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432</td><td${_scopeId5}>\u0421\u0443\u043C\u043C\u0430</td><td${_scopeId5}>\u0414\u0430\u0442\u0430</td><td${_scopeId5}>\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435</td></tr><tr${_scopeId5}><td${_scopeId5}>\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432</td><td${_scopeId5}>\u0421\u0443\u043C\u043C\u0430</td><td${_scopeId5}>\u0414\u0430\u0442\u0430</td><td${_scopeId5}>\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435</td></tr></tbody>`);
                              } else {
                                return [
                                  vue_cjs_prod.createVNode("tbody", null, [
                                    vue_cjs_prod.createVNode("tr", null, [
                                      vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                      vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                      vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                      vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                    ]),
                                    vue_cjs_prod.createVNode("tr", null, [
                                      vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                      vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                      vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                      vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                    ]),
                                    vue_cjs_prod.createVNode("tr", null, [
                                      vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                      vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                      vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                      vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                    ])
                                  ])
                                ];
                              }
                            }),
                            _: 1
                          }, _parent5, _scopeId4));
                        } else {
                          return [
                            vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 "),
                            vue_cjs_prod.createVNode(_component_ui_table, { headers: ["\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432", "\u0421\u0443\u043C\u043C\u0430", "\u0414\u0430\u0442\u0430", "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"] }, {
                              default: vue_cjs_prod.withCtx(() => [
                                vue_cjs_prod.createVNode("tbody", null, [
                                  vue_cjs_prod.createVNode("tr", null, [
                                    vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                    vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                    vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                    vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                  ]),
                                  vue_cjs_prod.createVNode("tr", null, [
                                    vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                    vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                    vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                    vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                  ]),
                                  vue_cjs_prod.createVNode("tr", null, [
                                    vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                    vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                    vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                    vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                  ])
                                ])
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 "),
                          vue_cjs_prod.createVNode(_component_ui_table, { headers: ["\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432", "\u0421\u0443\u043C\u043C\u0430", "\u0414\u0430\u0442\u0430", "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"] }, {
                            default: vue_cjs_prod.withCtx(() => [
                              vue_cjs_prod.createVNode("tbody", null, [
                                vue_cjs_prod.createVNode("tr", null, [
                                  vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                  vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                  vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                  vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                ]),
                                vue_cjs_prod.createVNode("tr", null, [
                                  vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                  vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                  vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                  vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                ]),
                                vue_cjs_prod.createVNode("tr", null, [
                                  vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                  vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                  vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                  vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                                ])
                              ])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                cols: 12,
                lg: 4
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`<h5 style="${serverRenderer.exports.ssrRenderStyle({ "font-size": "20px", "margin-bottom": "1.5em" })}"${_scopeId4}> \u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 </h5>`);
                        } else {
                          return [
                            vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
            } else {
              return [
                vue_cjs_prod.createVNode(_component_ui_grid_col, {
                  cols: 12,
                  lg: 4
                }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createVNode("div", { style: { "display": "flex" } }, [
                          vue_cjs_prod.createVNode("div", { class: "icon-container" }, [
                            vue_cjs_prod.createVNode("div", { class: "icon" }, [
                              vue_cjs_prod.createVNode(_component_icons_logo)
                            ])
                          ]),
                          vue_cjs_prod.createVNode("div", null, [
                            vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " Token balance "),
                            vue_cjs_prod.createVNode("p", null, "120 000 000 QQD")
                          ])
                        ])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, {
                  cols: 12,
                  lg: 8
                }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode(" 2 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, {
                  cols: 12,
                  lg: 8
                }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0413\u0440\u0430\u0444\u0438\u043A \u043E\u043D\u0447\u0435\u0439\u043D \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432 QQD "),
                        vue_cjs_prod.createVNode(_component_chart, {
                          chartData: $setup.dashboardStore.dailyTransactions && $setup.dashboardStore.dailyTransactions.data || null,
                          loading: false
                        }, null, 8, ["chartData"])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, {
                  cols: 12,
                  lg: 4
                }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0442\u043E\u043A\u0435\u043D\u0430 "),
                        vue_cjs_prod.createVNode(_component_ui_slider, { min: 0 }),
                        vue_cjs_prod.createVNode(_component_ui_button, null, {
                          default: vue_cjs_prod.withCtx(() => [
                            vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, {
                  cols: 12,
                  lg: 8
                }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 "),
                        vue_cjs_prod.createVNode(_component_ui_table, { headers: ["\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432", "\u0421\u0443\u043C\u043C\u0430", "\u0414\u0430\u0442\u0430", "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"] }, {
                          default: vue_cjs_prod.withCtx(() => [
                            vue_cjs_prod.createVNode("tbody", null, [
                              vue_cjs_prod.createVNode("tr", null, [
                                vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                              ]),
                              vue_cjs_prod.createVNode("tr", null, [
                                vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                              ]),
                              vue_cjs_prod.createVNode("tr", null, [
                                vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                                vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                                vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                                vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                              ])
                            ])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, {
                  cols: 12,
                  lg: 4
                }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          vue_cjs_prod.createVNode(_component_ui_grid_row, { spacing: "md" }, {
            default: vue_cjs_prod.withCtx(() => [
              vue_cjs_prod.createVNode(_component_ui_grid_col, {
                cols: 12,
                lg: 4
              }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_card, null, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode("div", { style: { "display": "flex" } }, [
                        vue_cjs_prod.createVNode("div", { class: "icon-container" }, [
                          vue_cjs_prod.createVNode("div", { class: "icon" }, [
                            vue_cjs_prod.createVNode(_component_icons_logo)
                          ])
                        ]),
                        vue_cjs_prod.createVNode("div", null, [
                          vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " Token balance "),
                          vue_cjs_prod.createVNode("p", null, "120 000 000 QQD")
                        ])
                      ])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              vue_cjs_prod.createVNode(_component_ui_grid_col, {
                cols: 12,
                lg: 8
              }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_card, null, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createTextVNode(" 2 ")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              vue_cjs_prod.createVNode(_component_ui_grid_col, {
                cols: 12,
                lg: 8
              }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_card, null, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0413\u0440\u0430\u0444\u0438\u043A \u043E\u043D\u0447\u0435\u0439\u043D \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u0432 QQD "),
                      vue_cjs_prod.createVNode(_component_chart, {
                        chartData: $setup.dashboardStore.dailyTransactions && $setup.dashboardStore.dailyTransactions.data || null,
                        loading: false
                      }, null, 8, ["chartData"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              vue_cjs_prod.createVNode(_component_ui_grid_col, {
                cols: 12,
                lg: 4
              }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_card, null, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0442\u043E\u043A\u0435\u043D\u0430 "),
                      vue_cjs_prod.createVNode(_component_ui_slider, { min: 0 }),
                      vue_cjs_prod.createVNode(_component_ui_button, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              vue_cjs_prod.createVNode(_component_ui_grid_col, {
                cols: 12,
                lg: 8
              }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_card, null, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 "),
                      vue_cjs_prod.createVNode(_component_ui_table, { headers: ["\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432", "\u0421\u0443\u043C\u043C\u0430", "\u0414\u0430\u0442\u0430", "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"] }, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("tbody", null, [
                            vue_cjs_prod.createVNode("tr", null, [
                              vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                              vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                              vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                              vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                            ]),
                            vue_cjs_prod.createVNode("tr", null, [
                              vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                              vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                              vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                              vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                            ]),
                            vue_cjs_prod.createVNode("tr", null, [
                              vue_cjs_prod.createVNode("td", null, "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432"),
                              vue_cjs_prod.createVNode("td", null, "\u0421\u0443\u043C\u043C\u0430"),
                              vue_cjs_prod.createVNode("td", null, "\u0414\u0430\u0442\u0430"),
                              vue_cjs_prod.createVNode("td", null, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
                            ])
                          ])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              vue_cjs_prod.createVNode(_component_ui_grid_col, {
                cols: 12,
                lg: 4
              }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_card, null, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode("h5", { style: { "font-size": "20px", "margin-bottom": "1.5em" } }, " \u041A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 ")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cabinet.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const cabinet = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);
const cabinet$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": cabinet
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_Header = __nuxt_component_0;
  const _component_ui_container = __nuxt_component_1;
  const _component_ui_button = __nuxt_component_2;
  const _component_ui_grid_row = __nuxt_component_3;
  const _component_ui_grid_col = __nuxt_component_4;
  const _component_ui_card = _sfc_main$l;
  const _component_AboutUs = __nuxt_component_6;
  const _component_ui_slider = __nuxt_component_7;
  const _component_ui_typography = __nuxt_component_8;
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(_attrs)}>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_Header, null, null, _parent));
  _push(`<div class="frame first-frame">`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_ui_container, { style: { "display": "flex", "flex-direction": "column", "justify-content": "space-between", "height": "100%", "position": "relative", "padding-top": "92px", "padding-bottom": "40px" } }, {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div style="${serverRenderer.exports.ssrRenderStyle({ "flex-grow": "1" })}"${_scopeId}><div class="row" style="${serverRenderer.exports.ssrRenderStyle({ "align-items": "center", "height": "100%" })}"${_scopeId}><div class="col cols-6"${_scopeId}><div style="${serverRenderer.exports.ssrRenderStyle({ "display": "grid", "grid-gap": "28px" })}"${_scopeId}><h1 class="main-title"${_scopeId}><span class="text-primary"${_scopeId}>\u0415\u0434\u0438\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430</span> \u0434\u043B\u044F \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u0441\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0441\u0435\u0442\u044F\u043C\u0438 </h1><p class="text-secondary"${_scopeId}> Qaqado - \u0441\u0430\u043C\u0430\u044F \u0443\u0434\u043E\u0431\u043D\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430 \u0434\u043B\u044F \u043A\u0443\u043F\u043B\u0438 \u0438 \u043F\u0440\u043E\u0434\u0430\u0436\u0438 \u043A\u0440\u0438\u043F\u0442\u043E\u0432\u0430\u043B\u044E\u0442\u044B. </p><div${_scopeId}>`);
        _push2(serverRenderer.exports.ssrRenderComponent(_component_ui_button, null, {
          default: vue_cjs_prod.withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(` \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 `);
            } else {
              return [
                vue_cjs_prod.createTextVNode(" \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 ")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`</div></div></div><div class="col cols-6" style="${serverRenderer.exports.ssrRenderStyle({ "position": "relative", "height": "100%" })}"${_scopeId}><svg style="${serverRenderer.exports.ssrRenderStyle({ "position": "absolute", "right": "24px" })}" height="100%" viewBox="0 0 580 640" fill="none" xmlns="http://www.w3.org/2000/svg"${_scopeId}><g class="social tiktok"${_scopeId}><path d="M30.6209 269.585C33.0846 265.204 38.9236 265.045 42.7791 268.12L66.6397 287.207C68.4977 288.689 69.784 290.77 70.2792 293.094C70.7744 295.419 70.4479 297.843 69.3552 299.953L54.8429 324.526C51.2341 328.13 47.1268 328.11 43.635 326.146L19.7674 307.071C17.9099 305.586 16.6247 303.503 16.1308 301.176C15.0568 298.722 15.8008 296.101 16.8947 293.989L30.6209 269.585Z" fill="#353535"${_scopeId}></path><path d="M33.4137 267.167L33.7735 266.908C34.0148 266.737 34.2672 266.582 34.529 266.443C34.687 266.35 34.85 266.266 35.0171 266.191L24.9991 270.441C24.9115 270.473 24.8276 270.514 24.7488 270.564L24.511 270.693C24.2492 270.832 23.9968 270.987 23.7555 271.158L23.5568 271.277L23.4582 271.452C23.2261 271.645 23.0056 271.851 22.7981 272.069L22.5205 272.358C22.2249 272.702 21.9576 273.07 21.7211 273.457L7.20877 298.029C7.02509 298.361 6.86032 298.703 6.71526 299.053L6.57447 299.303C6.44632 299.626 6.33792 299.955 6.24989 300.291L6.21469 300.353C6.10901 300.809 6.0413 301.272 6.01219 301.738L5.95586 301.839L5.91363 301.914C5.89031 302.286 5.8893 302.66 5.91056 303.032C5.91041 303.094 5.92047 303.155 5.94031 303.214C5.9518 303.491 5.98344 303.768 6.03499 304.041L6.05217 304.216L6.08348 304.365L6.29627 305.275L6.32913 305.393C6.4331 305.759 6.5617 306.117 6.71403 306.466L6.78911 306.508L6.85951 306.647C7.04032 307.062 7.24833 307.465 7.48218 307.853L7.75204 308.252C7.85217 308.309 7.88897 308.478 7.96797 308.571C8.04697 308.665 8.18541 308.859 8.29493 308.986C8.3663 309.088 8.44308 309.186 8.52491 309.28C8.65241 309.434 8.79399 309.563 8.92853 309.705C9.06307 309.846 9.06856 309.866 9.14209 309.94C9.21561 310.015 9.60438 310.349 9.83904 310.546L33.7067 329.621C34.7657 330.543 36.0568 331.158 37.44 331.399C38.8233 331.639 40.2461 331.497 41.5543 330.987L51.5724 326.737C50.2616 327.247 48.8363 327.389 47.4508 327.147C46.0654 326.904 44.7725 326.288 43.7122 325.364L19.8445 306.289C19.5817 306.141 19.3877 305.901 19.1601 305.69L18.9646 305.481C18.7893 305.383 18.6704 305.184 18.5429 305.03L18.3184 304.755C18.2002 304.617 18.0892 304.472 17.986 304.321C17.8858 304.265 17.842 304.109 17.7575 303.995C17.6731 303.882 17.5776 303.729 17.4947 303.584C17.2557 303.199 17.0475 302.795 16.872 302.377L16.7618 302.134C16.6094 301.785 16.4808 301.427 16.3769 301.061L16.3386 300.924C16.2509 300.611 16.1884 300.312 16.1258 300.013L16.0702 299.702C16.0326 299.417 15.988 299.145 15.9755 298.874L15.9559 298.616C15.9347 298.244 15.9357 297.87 15.959 297.498L15.9825 297.28C16.0116 296.814 16.0794 296.35 16.185 295.895L16.2273 295.82C16.3211 295.477 16.4204 295.154 16.5393 294.826L16.6801 294.575C16.8251 294.225 16.9899 293.883 17.1736 293.552L31.6859 268.979C31.9165 268.588 32.1842 268.22 32.4853 267.88L32.7629 267.592C32.9695 267.435 33.187 267.293 33.4137 267.167Z" fill="url(#paint11_linear_101_825)"${_scopeId}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M28.8949 284.771C28.9013 284.813 33.6179 288.306 39.3763 292.533C48.3525 299.122 49.887 300.27 50.1331 300.576C51.9176 302.797 51.2158 305.996 48.6469 307.351C47.6023 307.902 46.0175 307.942 44.9261 307.444C44.3144 307.165 43.3621 306.374 43.0197 305.861C41.3733 303.394 42.6068 299.978 45.4473 299.139L45.8821 299.011L42.5709 296.607L39.2598 294.202L38.7309 294.667C37.9112 295.387 36.4452 297.397 35.9816 298.436C33.9948 302.892 34.7509 307.758 37.9948 311.392C38.7497 312.238 40.427 313.499 41.4571 313.996C43.5238 314.992 45.8297 315.377 48.0612 315.1C50.5265 314.794 52.672 313.838 54.4818 312.24C56.4526 310.499 57.7789 308.185 58.2815 305.609C58.9952 301.952 57.9481 298.227 55.3923 295.333C54.8886 294.763 54.648 294.577 49.3128 290.623C46.2574 288.359 43.7746 286.484 43.7953 286.456C43.8161 286.427 44.0202 286.275 44.2489 286.117C45.3516 285.355 46.3581 284.327 47.4314 282.864L48.1193 281.927L45.218 279.732C43.6223 278.525 42.2791 277.535 42.233 277.531C42.187 277.527 41.8106 277.986 41.3965 278.55C40.5477 279.707 40.1787 280.052 39.3826 280.438C38.7965 280.722 37.7005 280.922 37.0861 280.857C36.1373 280.757 35.7863 280.601 34.4603 279.688L33.231 278.842L31.0571 281.769C29.8615 283.378 28.8885 284.729 28.8949 284.771Z" fill="white"${_scopeId}></path></g><g class="social vk"${_scopeId}><path d="M68.5057 97.0799C71.2615 89.6316 79.5788 86.8013 87.0766 90.8482L133.504 115.924C137.133 117.863 139.973 121.006 141.536 124.811C143.099 128.617 143.288 132.849 142.069 136.779L124.988 183.057C122.232 190.506 113.915 193.336 106.442 189.289L60.5 165C56.868 163.057 53.5672 159.809 52 156C50.4328 152.191 49.787 147.436 51 143.5L68.5057 97.0799Z" fill="#1958C4"${_scopeId}></path><path d="M70.8396 93.1312L71.3609 92.5601C71.732 92.2008 72.1215 91.8611 72.5278 91.5422C72.7638 91.3364 73.0126 91.1457 73.2727 90.9712L57.6562 101.25L57.2341 101.523C57.115 101.609 57.0067 101.709 56.9114 101.821C56.4999 102.133 56.11 102.473 55.7445 102.839C55.6396 102.923 55.5401 103.015 55.4465 103.112C55.3642 103.205 55.2895 103.305 55.2231 103.41C54.8813 103.802 54.5662 104.217 54.2797 104.651C54.1556 104.85 54.0066 105.024 53.8825 105.247C53.4892 105.923 53.1488 106.629 52.8645 107.357L35.8081 153.636C35.5771 154.249 35.3945 154.88 35.2619 155.522C35.2619 155.696 35.2619 155.845 35.2619 156.019C35.2619 156.615 35.0881 157.186 35.0384 157.807C34.9872 158.633 34.9872 159.463 35.0384 160.289C35.0384 160.289 35.0384 160.438 35.0384 160.513C35.0384 160.587 35.0384 160.513 35.0384 160.513C35.1077 161.156 35.2154 161.794 35.3611 162.425C35.3729 162.465 35.3729 162.508 35.3611 162.549V162.847C35.3611 163.318 35.6343 163.79 35.7832 164.237C35.7726 164.336 35.7726 164.436 35.7832 164.535V164.758C35.9729 165.257 36.1884 165.746 36.4288 166.223V166.422C36.7264 167.004 37.058 167.567 37.4219 168.11V168.309L37.5708 168.507C38.0151 169.155 38.4959 169.776 39.0108 170.369L39.5818 170.965C39.7264 171.135 39.8841 171.292 40.0536 171.437C40.2649 171.656 40.4887 171.864 40.7239 172.058L41.2205 172.48L42.0149 173.076L42.4867 173.398C42.9188 173.695 43.3663 173.968 43.8273 174.218L90.2546 199.268C92.3336 200.523 94.7159 201.187 97.1442 201.187C99.5726 201.187 101.955 200.523 104.034 199.268L119.75 188.99C117.671 190.245 115.288 190.908 112.86 190.908C110.432 190.908 108.049 190.245 105.97 188.99L60.1389 164.237C59.6699 163.988 59.2141 163.714 58.7735 163.418L58.401 163.12L57.5072 162.499L57.0604 162.077C56.8091 161.883 56.5687 161.676 56.3403 161.456L55.8686 160.985L55.1735 160.364C54.6526 159.773 54.1794 159.142 53.7583 158.477L53.4852 158.105C53.1376 157.558 52.8148 156.987 52.5169 156.416C52.5169 156.416 52.5169 156.243 52.3928 156.168C52.1693 155.696 51.9459 155.2 51.7473 154.703C51.5486 154.207 51.6231 154.356 51.5735 154.182C51.4067 153.727 51.2658 153.263 51.1514 152.792C51.1514 152.667 51.1514 152.518 51.0272 152.369C50.8783 151.749 50.779 151.103 50.6797 150.458C50.6911 150.342 50.6911 150.226 50.6797 150.11C50.6284 149.283 50.6284 148.454 50.6797 147.627C50.6797 147.627 50.6797 147.627 50.6797 147.478C50.7144 146.878 50.789 146.281 50.9031 145.691C50.8891 145.526 50.8891 145.36 50.9031 145.194C51.039 144.556 51.2131 143.925 51.4245 143.307L68.5058 97.0291C68.7798 96.296 69.1205 95.5896 69.5237 94.9187C69.6478 94.6953 69.7968 94.5215 69.921 94.3229C70.2028 93.9074 70.5095 93.5095 70.8396 93.1312Z" fill="url(#paint10_linear_101_825)"${_scopeId}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M81.1975 140.197C80.66 141.637 80.4071 142.741 80.4251 143.567C80.4344 143.997 80.7013 144.941 80.8165 144.952C80.851 144.955 81.0175 144.794 81.1866 144.594C81.8581 143.799 82.6924 143.295 83.5135 143.189C84.0217 143.123 84.8775 143.206 85.6295 143.395C86.2822 143.56 88.9153 144.561 90.1904 145.129C91.8223 145.857 93.4234 146.766 94.3019 147.462C95.4889 148.404 95.8488 149.208 95.4712 150.074C94.9798 151.202 92.9415 151.97 88.9496 152.532C85.9653 152.952 82.7371 153.165 79.9807 153.125C77.7226 153.092 77.5572 153.115 77.0887 153.533L76.825 153.769L74.8457 158.197L72.8664 162.626L72.8865 163.032C72.9118 163.546 73.1054 163.85 73.4926 163.986C73.932 164.139 76.7835 164.116 80.8558 163.926C91.1675 163.445 98.9473 162.049 103.8 159.81C107.495 158.105 110.537 155.581 112.749 152.386C113.439 151.389 113.761 150.763 114.759 148.48C115.626 146.497 115.717 146.264 115.708 146.038C115.691 145.599 115.526 145.175 115.236 144.823C114.968 144.498 114.918 144.465 114.026 144.014C112.314 143.147 111.434 142.502 110.69 141.568C110.226 140.986 109.902 140.148 109.938 139.619C110.006 138.588 110.731 137.863 112.379 137.182C112.787 137.013 114.064 136.579 115.215 136.219C117.524 135.496 119.01 134.922 119.756 134.464C120.337 134.107 121.071 133.487 121.508 132.983C121.822 132.62 121.824 132.617 123.767 128.316C125.052 125.47 125.732 123.912 125.775 123.714C126.021 122.562 125.725 121.501 125.074 121.206C123.87 120.659 120.229 121.596 113.942 124.07C111.207 125.146 110.534 125.318 109.644 125.168C109.159 125.086 108.762 124.867 108.297 124.428C107.619 123.787 107.065 122.897 105.161 119.392C102.639 114.748 101.263 112.539 99.8232 110.822C99.0713 109.925 98.7217 109.587 98.1992 109.252C97.502 108.805 97.1165 108.92 96.6106 109.727C96.2882 110.24 91.9347 119.985 91.8866 120.301C91.8416 120.595 91.9638 121.011 92.1865 121.32C92.2796 121.449 92.6636 121.874 93.0398 122.263C95.4912 124.8 97.4976 127.343 99.326 130.231C100.859 132.653 101.687 134.52 101.701 135.588C101.707 136.032 101.497 136.517 101.186 136.781C100.722 137.173 99.774 137.315 98.852 137.13C98.0195 136.963 97.1483 136.607 94.3818 135.303C88.2825 132.429 87.9122 132.26 87.4017 132.117C86.2559 131.794 85.6441 131.973 84.9155 132.841C84.405 133.45 84.001 134.071 83.5132 134.998C83.0126 135.949 81.5946 139.133 81.1975 140.197Z" fill="white"${_scopeId}></path></g><g class="social facebook"${_scopeId}><path d="M154.867 446.517C160.898 449.574 162.437 456.848 158.304 462.794L132.707 499.525C130.716 502.401 127.784 504.492 124.416 505.439C121.048 506.386 117.456 506.128 114.258 504.711L76.8738 485.735C70.8224 482.678 69.3462 474.925 73.5 469L98.9709 432.811C100.965 429.938 103.895 427.847 107.261 426.897C110.627 425.947 114.218 426.197 117.42 427.603L154.867 446.517Z" fill="#1958C4"${_scopeId}></path><path d="M158.009 448.878C158.157 449.046 158.304 449.194 158.431 449.363C158.71 449.71 158.964 450.076 159.19 450.459C159.343 450.676 159.483 450.901 159.612 451.134L152.464 436.88L152.274 436.522C152.274 436.395 152.105 436.311 152.042 436.206C151.816 435.827 151.569 435.461 151.304 435.109C151.304 435.109 151.178 434.92 151.093 434.835L150.861 434.624C150.566 434.301 150.249 433.998 149.913 433.718C149.768 433.58 149.612 433.453 149.449 433.338C148.929 432.927 148.372 432.567 147.783 432.263L110.378 413.286C109.88 413.041 109.365 412.83 108.839 412.654L108.438 412.527C107.955 412.375 107.462 412.256 106.962 412.169H106.836C106.137 412.068 105.433 412.012 104.727 412H104.411C103.868 412.003 103.326 412.038 102.787 412.105H102.682H102.408L101.206 412.337H100.953H100.742C100.3 412.449 99.8635 412.582 99.4349 412.738H99.2662C98.7455 412.928 98.2383 413.154 97.7481 413.413H97.5794L97.3896 413.518C96.8011 413.83 96.2309 414.175 95.6817 414.551L95.1124 414.973L94.6697 415.31L94.0793 415.837L93.6787 416.217L93.1094 416.828L92.772 417.187L91.9497 418.241L66.3102 454.971C65.0601 456.613 64.2833 458.566 64.064 460.617C63.8447 462.669 64.1913 464.742 65.0662 466.61L72.193 480.864C71.3233 478.993 70.9815 476.919 71.2045 474.868C71.4274 472.817 72.2067 470.866 73.4581 469.225L98.971 432.811L99.7933 431.757L100.089 431.44L100.7 430.787L101.08 430.428L101.691 429.88L102.134 429.543L102.724 429.1C103.273 428.723 103.844 428.378 104.432 428.067L104.769 427.898C105.269 427.643 105.783 427.418 106.309 427.223H106.519C106.948 427.068 107.384 426.934 107.827 426.823L108.291 426.717L109.492 426.485H109.851C110.397 426.419 110.946 426.384 111.496 426.38H111.812C112.517 426.393 113.222 426.449 113.92 426.549H114.047C114.546 426.638 115.039 426.758 115.523 426.907L115.923 427.034C116.45 427.21 116.964 427.421 117.463 427.666L154.868 446.643C155.451 446.947 156.008 447.3 156.533 447.697L156.997 448.098C157.351 448.335 157.689 448.596 158.009 448.878Z" fill="url(#paint3_linear_101_825)"${_scopeId}></path><path d="M137.262 462.899L133.045 460.791C129.797 459.104 128.174 460.2 126.719 462.267L123.535 466.863L131.273 470.891L125.264 477.553L118.538 474.032L105.718 492.461L97.6427 488.244L110.462 469.836L103.8 466.168L108.797 458.977L115.565 462.499L119.234 457.206C120.902 454.459 123.583 452.477 126.699 451.688C129.815 450.899 133.116 451.366 135.891 452.989C137.903 454.013 139.853 455.154 141.732 456.405L137.262 462.899Z" fill="white"${_scopeId}></path></g><g class="social reddit"${_scopeId}><path d="M249.5 539.94C251.86 535.731 257.6 534.689 261.779 537.816L287.168 557.192C289.156 558.696 290.557 560.845 291.133 563.27C291.709 565.694 291.424 568.244 290.325 570.481L275.729 596.547C273.369 600.756 268 601.441 263.5 598.941L238.5 579.441C236.513 577.937 235.076 575.865 234.5 573.441C233.924 571.016 233.902 568.178 235 565.941L249.5 539.94Z" fill="#C73E00"${_scopeId}></path><path d="M251.842 537.635L252.218 537.349C252.469 537.17 252.73 537.004 252.999 536.853C253.18 536.763 253.33 536.643 253.511 536.568L243.138 541.243L242.868 541.363L242.642 541.513C242.364 541.664 242.098 541.835 241.845 542.025L241.65 542.145C241.591 542.196 241.536 542.251 241.485 542.31C241.241 542.506 241.015 542.722 240.808 542.957C240.718 543.062 240.613 543.152 240.523 543.272C240.215 543.636 239.943 544.029 239.711 544.445L225.129 570.511C224.937 570.853 224.771 571.21 224.633 571.578C224.633 571.684 224.633 571.774 224.513 571.864C224.393 572.21 224.303 572.555 224.212 572.916C224.211 572.941 224.211 572.966 224.212 572.991C224.107 573.486 224.042 573.989 224.017 574.495C224.017 574.495 224.017 574.585 224.017 574.63V574.72C223.994 575.111 223.994 575.502 224.017 575.893C224.009 575.957 224.009 576.023 224.017 576.088C224.041 576.381 224.081 576.672 224.137 576.96C224.137 576.96 224.137 577.08 224.137 577.14C224.13 577.19 224.13 577.241 224.137 577.291C224.137 577.606 224.287 577.922 224.378 578.238V578.358C224.503 578.736 224.649 579.107 224.814 579.47V579.575C224.833 579.624 224.858 579.669 224.889 579.711C225.081 580.144 225.307 580.561 225.565 580.958L225.851 581.364L226.076 581.695L226.437 582.131L226.678 582.432L227.114 582.853L227.354 583.093C227.586 583.315 227.832 583.52 228.091 583.709L253.48 603.086C254.613 604.024 255.981 604.634 257.435 604.852C258.89 605.069 260.376 604.885 261.733 604.319L272.106 599.659C270.748 600.225 269.262 600.409 267.808 600.192C266.353 599.974 264.986 599.364 263.853 598.426L238.448 579.049C238.192 578.854 237.952 578.644 237.726 578.433C237.649 578.371 237.578 578.3 237.516 578.223C237.351 578.072 237.2 577.922 237.05 577.757C236.962 577.668 236.881 577.573 236.809 577.471L236.449 577.035C236.359 576.93 236.283 576.81 236.208 576.704C236.133 576.599 236.013 576.419 235.908 576.268C235.652 575.863 235.442 575.442 235.231 575.021C235.197 574.933 235.157 574.847 235.111 574.765C234.961 574.404 234.81 574.044 234.69 573.668V573.502C234.594 573.196 234.514 572.885 234.449 572.57C234.444 572.46 234.444 572.35 234.449 572.24C234.39 571.952 234.345 571.661 234.314 571.368C234.322 571.278 234.322 571.187 234.314 571.097C234.292 570.712 234.292 570.325 234.314 569.94C234.314 569.865 234.314 569.789 234.314 569.714C234.342 569.21 234.402 568.708 234.495 568.211C234.495 568.211 234.495 568.211 234.495 568.121C234.572 567.764 234.672 567.412 234.795 567.069L234.9 566.783C235.044 566.418 235.21 566.061 235.396 565.716L249.993 539.634C250.225 539.227 250.492 538.839 250.79 538.477C250.882 538.364 250.983 538.259 251.09 538.161C251.332 537.973 251.583 537.798 251.842 537.635Z" fill="url(#paint4_linear_101_825)"${_scopeId}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M248.32 556.614C248.311 556.731 248.353 556.979 248.395 557.059C248.414 557.094 248.593 557.293 248.794 557.5C248.995 557.707 250.186 558.941 251.44 560.243C252.695 561.544 253.975 562.868 254.284 563.185C254.593 563.503 255.057 563.983 255.313 564.253C255.57 564.523 255.786 564.747 255.793 564.752C255.801 564.757 255.682 564.971 255.53 565.228C253.837 568.081 252.907 571.27 252.859 574.386C252.854 574.715 252.841 574.999 252.829 575.017C252.817 575.034 252.734 575.062 252.645 575.077C252.371 575.124 251.789 575.352 251.514 575.52C250.53 576.119 249.888 577.034 249.651 578.173C249.474 579.026 249.659 580.088 250.125 580.895C250.817 582.093 252.161 582.84 253.586 582.819C254.144 582.811 254.915 582.615 255.329 582.377C255.415 582.328 255.502 582.288 255.522 582.288C255.542 582.289 255.613 582.346 255.68 582.415C256.178 582.933 257.23 583.678 257.969 584.036C259.455 584.756 261.156 585.012 263.034 584.799C267.235 584.32 271.539 581.488 274.562 577.212C276.339 574.7 277.446 572.267 278.048 569.555C278.977 565.369 278.316 561.483 276.235 558.892C275.669 558.186 275.186 557.758 274.304 557.177C273.738 556.805 273.537 556.69 273.183 556.539C272.946 556.437 272.723 556.348 272.686 556.34C272.635 556.329 272.623 556.251 272.635 556.012C272.683 555.014 272.319 554.009 271.628 553.231C271.401 552.975 271.309 552.9 270.857 552.602C270.404 552.303 270.301 552.249 269.968 552.138C268.186 551.544 266.178 552.313 265.289 553.929C264.827 554.77 264.676 555.606 264.83 556.47C264.852 556.593 264.863 556.704 264.854 556.716C264.845 556.729 264.593 556.85 264.293 556.985C262.024 558.005 259.945 559.561 258.153 561.58C257.687 562.105 257.018 562.947 256.783 563.303L256.597 563.584L256.524 563.504C256.483 563.46 256.277 563.247 256.064 563.032C255.852 562.817 255.408 562.36 255.078 562.017C254.747 561.674 253.941 560.841 253.285 560.166C251.633 558.464 249.96 556.735 249.956 556.727C249.954 556.723 250.311 556.375 250.75 555.953C251.699 555.04 252.658 554.113 253.375 553.414C253.663 553.134 254.104 552.708 254.355 552.467L254.811 552.029L255.094 552.181C255.695 552.504 256.332 552.584 257.057 552.428C257.563 552.319 257.94 552.137 258.35 551.801C258.547 551.639 258.628 551.541 258.869 551.174C259.165 550.723 259.22 550.596 259.318 550.131C259.397 549.76 259.397 549.425 259.319 549.006C259.15 548.103 258.703 547.467 257.902 546.994C257.228 546.596 256.66 546.506 255.86 546.672C255.313 546.786 255.042 546.906 254.637 547.216C254.389 547.404 254.314 547.486 254.061 547.845C253.724 548.321 253.579 548.671 253.507 549.184C253.431 549.721 253.556 550.469 253.786 550.851C253.83 550.925 253.854 551.004 253.838 551.028C253.806 551.076 253.02 551.852 252.189 552.655C251.877 552.957 251.095 553.719 250.451 554.348C249.807 554.977 249.109 555.658 248.901 555.86C248.503 556.246 248.332 556.468 248.32 556.614ZM258.847 572.77C259.253 572.402 259.713 572.18 260.3 572.068C261.116 571.912 261.83 572.076 262.533 572.581C263.135 573.014 263.485 573.529 263.663 574.244C263.93 575.316 263.6 576.428 262.797 577.164C262.56 577.381 262.01 577.695 261.698 577.79C261.082 577.98 260.421 577.967 259.813 577.754C259.544 577.659 259.436 577.599 259.09 577.35C258.654 577.038 258.478 576.847 258.242 576.434C257.916 575.863 257.78 574.969 257.924 574.344C258.053 573.786 258.423 573.155 258.847 572.77ZM265.849 562.08C266.578 561.306 267.713 560.996 268.795 561.276C269.188 561.378 269.833 561.779 270.132 562.107C270.531 562.544 270.736 562.943 270.856 563.514C271.202 565.147 270.122 566.735 268.471 567.02C267.623 567.166 266.911 566.998 266.211 566.486C265.685 566.101 265.369 565.672 265.175 565.079C264.822 563.998 265.066 562.912 265.849 562.08ZM266.107 577.572C266.195 577.525 266.417 577.443 266.599 577.39C267.492 577.131 268.353 576.513 269.407 575.375C269.953 574.785 270.273 574.378 270.71 573.715C271.148 573.051 271.396 572.597 271.724 571.862C272.362 570.431 272.589 569.396 272.466 568.478C272.405 568.014 272.435 567.796 272.589 567.606C272.913 567.203 273.541 567.26 273.771 567.712C273.94 568.043 273.971 569.017 273.838 569.814C273.674 570.803 273.233 572.151 272.793 573.01C272.522 573.539 271.262 575.45 270.883 575.906C270.514 576.351 270.193 576.664 269.5 577.257C268.487 578.122 267.788 578.539 266.905 578.803C266.456 578.937 266.276 578.925 266.03 578.743C265.802 578.574 265.718 578.38 265.753 578.101C265.783 577.863 265.906 577.68 266.107 577.572Z" fill="white"${_scopeId}></path></g><g class="social youtube"${_scopeId}><path d="M251.432 134.723C253.741 132.481 257.244 132.914 259.284 135.705L271.777 152.853C272.757 154.19 273.242 155.825 273.148 157.48C273.054 159.135 272.388 160.705 271.263 161.922L256.998 175.77C254.703 178.009 251.2 177.576 249.146 174.788L236.703 157.674C235.724 156.337 235.239 154.701 235.331 153.046C235.423 151.391 236.086 149.82 237.208 148.599L251.432 134.723Z" fill="#A40001"${_scopeId}></path><path d="M252.966 133.696L253.254 133.581C253.451 133.512 253.652 133.457 253.857 133.416C253.979 133.379 254.104 133.352 254.23 133.335L246.732 134.345L246.543 134.371L246.359 134.426C246.158 134.469 245.96 134.525 245.756 134.59L245.605 134.631L245.446 134.667C245.259 134.752 245.077 134.849 244.902 134.958C244.85 135.031 244.731 135.045 244.655 135.102C244.39 135.277 244.142 135.475 243.912 135.694L229.678 149.55C229.487 149.735 229.312 149.934 229.152 150.146L229.037 150.31C228.888 150.498 228.75 150.696 228.625 150.901L228.591 150.95C228.432 151.25 228.293 151.561 228.174 151.879L228.128 151.944L228.094 151.994C228.011 152.238 227.942 152.488 227.889 152.741L227.87 152.874L227.785 153.449L227.763 153.568L227.767 153.668C227.748 153.886 227.744 154.103 227.739 154.319L227.699 154.376C227.71 154.64 227.729 154.91 227.76 155.163L227.769 155.254C227.778 155.286 227.784 155.319 227.786 155.352C227.841 155.658 227.903 155.97 227.986 156.272L228.093 156.59C228.115 156.678 228.145 156.764 228.181 156.847L228.321 157.189L228.421 157.43L228.613 157.783C228.671 157.823 228.688 157.921 228.72 157.98C228.829 158.166 228.947 158.346 229.075 158.52L241.705 175.838C242.26 176.645 243.024 177.286 243.915 177.693C244.805 178.1 245.79 178.258 246.763 178.149L254.261 177.14C253.288 177.243 252.305 177.078 251.419 176.664C250.533 176.249 249.776 175.6 249.232 174.787L236.702 157.674C236.578 157.502 236.462 157.323 236.356 157.139C236.307 157.105 236.3 157.027 236.262 156.976C236.225 156.926 236.115 156.715 236.057 156.589L235.959 156.362C235.909 156.242 235.853 156.13 235.811 156.015C235.777 155.929 235.749 155.84 235.728 155.75C235.683 155.644 235.645 155.536 235.613 155.426C235.525 155.122 235.46 154.812 235.42 154.498L235.387 154.317C235.352 154.056 235.332 153.793 235.327 153.53L235.329 153.422C235.327 153.205 235.336 152.987 235.357 152.771L235.375 152.552C235.392 152.359 235.42 152.167 235.46 151.977L235.486 151.8C235.543 151.546 235.616 151.295 235.704 151.05L235.785 150.935C235.899 150.615 236.038 150.305 236.201 150.006L236.235 149.957C236.358 149.747 236.498 149.546 236.653 149.359L236.768 149.195C236.93 148.989 237.104 148.793 237.288 148.607L251.537 134.748C251.766 134.529 252.014 134.331 252.279 134.156L252.518 134.006C252.662 133.896 252.812 133.792 252.966 133.696Z" fill="url(#paint8_linear_101_825)"${_scopeId}></path><path d="M260.692 144.273C260.207 143.767 259.594 143.402 258.917 143.217C258.553 143.185 258.186 143.227 257.839 143.341C257.491 143.455 257.17 143.637 256.895 143.878C254.593 145.674 251.249 148.681 251.249 148.681C251.249 148.681 247.847 151.807 245.585 154.069C244.945 154.666 244.529 155.465 244.407 156.333C244.381 157.154 244.563 157.969 244.936 158.702C245.499 159.717 246.122 160.698 246.801 161.638L247.75 162.935C248.432 163.853 249.168 164.729 249.955 165.559C250.471 166.089 251.133 166.454 251.857 166.607C252.744 166.553 253.581 166.18 254.213 165.556C255.605 164.418 259.758 160.39 259.758 160.39C259.758 160.39 262.986 157.217 264.965 154.976C265.529 154.401 265.877 153.649 265.951 152.847C265.926 152.09 265.725 151.349 265.365 150.682C264.832 149.74 264.248 148.827 263.615 147.948L262.731 146.733C262.097 145.877 261.416 145.056 260.692 144.273ZM255.432 158.273L251.998 153.583L258.02 151.945L255.432 158.273Z" fill="white"${_scopeId}></path></g><g class="social instagram"${_scopeId}><path d="M325.876 236.568C334.914 232.923 344.133 238.074 346.664 248.107L362.33 310.169C363.566 315.005 363.082 320.12 360.96 324.638C358.838 329.157 355.212 332.796 350.701 334.934L295.297 357.62C286.259 361.295 277.01 356.143 274.509 346.141L258.843 284.079C257.587 279.238 258.062 274.111 260.185 269.584C262.309 265.057 265.947 261.413 270.472 259.284L325.876 236.568Z" fill="url(#paint5_linear_101_825)"${_scopeId}></path><path d="M331.299 235.453C331.609 235.423 331.922 235.423 332.233 235.453C332.858 235.482 333.481 235.542 334.1 235.634L335.245 235.845L313.222 230.211H312.65H312.077C311.461 230.094 310.836 230.024 310.209 230H309.276C308.673 230 308.04 230 307.438 230.181H306.564C305.637 230.368 304.73 230.641 303.853 230.994L248.448 253.68C247.706 253.981 246.991 254.344 246.309 254.765L245.797 255.066C245.195 255.458 244.592 255.879 244.02 256.331C243.266 256.96 242.561 257.644 241.911 258.38L241.7 258.561V258.711C241.185 259.3 240.712 259.925 240.284 260.579C240.196 260.678 240.125 260.79 240.073 260.911C239.772 261.393 239.47 261.905 239.199 262.417L238.988 262.748C239 262.838 239 262.93 238.988 263.02C238.717 263.592 238.446 264.195 238.205 264.797V265.038C237.934 265.761 237.693 266.544 237.482 267.298C237.482 267.298 237.482 267.448 237.482 267.539C237.482 267.629 237.482 267.75 237.482 267.84C237.263 268.763 237.102 269.699 237 270.642C237 270.973 237 271.305 237 271.636C237 271.967 237 272.178 237 272.449C237 272.721 237 273.203 237 273.564C237.015 273.825 237.015 274.087 237 274.347C237 274.739 237 275.161 237.151 275.553C237.136 275.783 237.136 276.015 237.151 276.246C237.151 276.878 237.392 277.481 237.542 278.113L253.208 340.176C253.814 343.058 255.194 345.72 257.201 347.876C259.208 350.031 261.765 351.598 264.597 352.407L286.68 358.041C283.848 357.232 281.291 355.665 279.284 353.51C277.277 351.354 275.897 348.692 275.292 345.81L259.626 283.747C259.452 283.124 259.321 282.49 259.234 281.849C259.234 281.668 259.234 281.457 259.234 281.277C259.234 281.096 259.234 280.403 259.083 279.951C258.933 279.499 259.083 279.469 259.083 279.228C259.083 278.987 259.083 278.445 259.083 278.083C259.083 277.722 259.083 277.541 259.083 277.24C259.083 276.938 259.083 276.547 259.083 276.215C259.205 275.273 259.376 274.338 259.596 273.414C259.596 273.233 259.596 273.052 259.596 272.871C259.791 272.094 260.032 271.33 260.319 270.582V270.28C260.56 269.678 260.831 269.105 261.102 268.503L261.403 267.9C261.704 267.388 261.976 266.906 262.307 266.394L262.578 265.942C263.03 265.309 263.512 264.677 264.024 264.074L264.325 263.773C264.967 263.02 265.673 262.325 266.434 261.694C267.002 261.238 267.596 260.816 268.212 260.429L268.724 260.127C269.413 259.728 270.127 259.376 270.863 259.073L326.267 236.357C327.149 236.017 328.056 235.745 328.979 235.543H329.822C330.312 235.477 330.805 235.447 331.299 235.453Z" fill="url(#paint6_linear_101_825)"${_scopeId}></path><path d="M307.443 281.408C303.378 283.297 300.095 286.538 298.154 290.577C296.212 294.617 295.733 299.206 296.798 303.56C297.287 305.543 298.211 307.393 299.504 308.975C300.797 310.557 302.426 311.831 304.273 312.705C306.12 313.579 308.138 314.03 310.182 314.026C312.225 314.022 314.241 313.563 316.085 312.683C320.169 310.828 323.477 307.606 325.44 303.573C327.403 299.539 327.897 294.948 326.837 290.589C326.359 288.586 325.438 286.716 324.14 285.116C322.843 283.517 321.203 282.229 319.342 281.348C317.481 280.467 315.445 280.015 313.386 280.025C311.326 280.036 309.296 280.508 307.443 281.408ZM314.513 307.173C313.317 307.765 312.003 308.078 310.669 308.089C309.335 308.1 308.016 307.809 306.81 307.238C305.605 306.667 304.544 305.83 303.708 304.79C302.872 303.751 302.282 302.536 301.983 301.236C301.288 298.408 301.605 295.426 302.879 292.808C304.153 290.19 306.304 288.101 308.958 286.903C310.152 286.317 311.463 286.008 312.793 285.999C314.123 285.99 315.438 286.282 316.64 286.852C317.842 287.422 318.899 288.256 319.734 289.292C320.568 290.327 321.158 291.538 321.46 292.834C322.153 295.659 321.838 298.637 320.57 301.255C319.302 303.873 317.159 305.966 314.513 307.173ZM326.394 272.568C326.647 273.581 326.536 274.652 326.079 275.591C325.622 276.531 324.849 277.279 323.896 277.706C323.466 277.918 322.995 278.03 322.516 278.034C322.037 278.039 321.564 277.935 321.131 277.731C320.698 277.527 320.317 277.228 320.015 276.856C319.714 276.484 319.501 276.048 319.391 275.582C319.143 274.564 319.257 273.491 319.714 272.548C320.172 271.605 320.943 270.851 321.897 270.415C322.328 270.211 322.8 270.105 323.278 270.106C323.756 270.107 324.227 270.214 324.658 270.421C325.089 270.627 325.468 270.927 325.769 271.298C326.069 271.669 326.283 272.103 326.394 272.568ZM337.343 271.96C336.669 269.462 335.537 267.111 334.006 265.026C332.753 263.327 331.091 261.972 329.175 261.086C327.261 260.161 325.147 259.725 323.023 259.818C320.453 259.92 317.923 260.478 315.548 261.466C312.384 262.664 311.375 263.045 303.44 266.491C295.506 269.937 294.533 270.296 291.424 271.873C288.984 272.977 286.73 274.452 284.742 276.247C282.983 277.882 281.554 279.839 280.533 282.013C279.499 284.167 278.902 286.505 278.776 288.891C278.558 291.558 278.776 294.243 279.421 296.84C280.204 300.08 280.434 301.203 282.671 309.467C284.908 317.731 285.252 318.761 286.293 321.946C287.005 324.392 288.147 326.692 289.666 328.737C290.944 330.421 292.615 331.767 294.533 332.656C296.438 333.574 298.537 334.016 300.65 333.945C303.232 333.834 305.774 333.269 308.16 332.276C311.296 331.07 312.305 330.69 320.261 327.28C328.216 323.87 329.14 323.467 332.249 321.89C334.694 320.796 336.95 319.319 338.931 317.516C342.487 314.248 344.711 309.781 345.175 304.973C345.375 302.293 345.15 299.599 344.509 296.989C343.754 293.756 343.524 292.633 341.259 284.362C338.994 276.091 338.384 275.144 337.343 271.96ZM338.904 299.054C339.396 301.082 339.559 303.177 339.387 305.258C339.325 306.805 338.938 308.323 338.249 309.71C337.598 311.131 336.662 312.402 335.501 313.447C333.99 314.855 332.258 316.004 330.374 316.85C327.323 318.321 326.392 318.873 318.601 322.113C310.811 325.352 309.836 325.954 306.73 327.046C304.923 327.824 302.987 328.257 301.022 328.324C299.645 328.391 298.274 328.114 297.032 327.517C295.794 326.925 294.716 326.045 293.887 324.95C292.736 323.382 291.878 321.617 291.356 319.743C290.373 316.451 290.034 315.635 287.818 307.529C285.602 299.422 285.343 298.414 284.624 295.159C284.117 293.178 283.932 291.129 284.076 289.09C284.169 287.537 284.558 286.016 285.221 284.609C285.865 283.195 286.799 281.931 287.962 280.901C289.474 279.495 291.206 278.346 293.088 277.498C296.139 276.027 297.1 275.482 304.869 272.207C312.638 268.932 313.634 268.365 316.733 267.302C318.55 266.546 320.483 266.104 322.448 265.996C323.818 265.967 325.175 266.256 326.413 266.842C327.651 267.427 328.736 268.292 329.583 269.369C330.727 270.949 331.593 272.712 332.142 274.584C333.162 277.732 333.436 278.684 335.673 286.826C337.911 294.969 338.299 295.828 338.904 299.054Z" fill="white"${_scopeId}></path></g><g class="social badu"${_scopeId}><path d="M372.315 41.5044C377.45 44.017 378.718 50.1968 375.235 55.151L353.808 86.015C352.148 88.4544 349.685 90.2342 346.848 91.0444C344.01 91.8547 340.979 91.6441 338.281 90.4492L306.969 74.6544C301.826 72.1259 300.55 65.9697 304.033 61.0155L325.444 30.1592C327.106 27.7242 329.898 25.5129 332.732 24.7003C335.566 23.8876 338.043 24.1837 340.743 25.3679L372.315 41.5044Z" fill="#844DFB"${_scopeId}></path><path d="M374.912 43.4726L375.269 43.8892C375.5 44.1721 375.709 44.4713 375.897 44.7843C376.009 44.9787 376.106 45.181 376.188 45.3897L370.166 33.4525L370.02 33.1498L369.875 32.8471C369.687 32.5341 369.478 32.235 369.247 31.952C369.201 31.8564 369.163 31.7767 369.125 31.697L368.938 31.5124C368.686 31.243 368.415 30.9931 368.126 30.7647L367.752 30.4349C367.309 30.0911 366.83 29.795 366.325 29.5515L334.878 13.8022C334.463 13.5952 334.032 13.4221 333.589 13.2847L333.243 13.1767C332.837 13.0395 332.421 12.938 331.998 12.8734C331.428 12.7789 330.853 12.728 330.276 12.7211L330.148 12.7825C329.682 12.7913 329.222 12.8161 328.755 12.8645C328.755 12.8645 328.628 12.9258 328.548 12.9642L327.541 13.1548L327.35 13.2468C327.35 13.2468 327.254 13.2929 327.19 13.3235C326.856 13.4846 326.467 13.5342 326.102 13.6711C326.102 13.6711 326.022 13.7094 325.974 13.7324C325.543 13.9106 325.123 14.1129 324.715 14.3384C324.715 14.3384 324.62 14.3844 324.588 14.3998C324.556 14.4151 324.477 14.4535 324.429 14.4765C323.929 14.736 323.447 15.0273 322.984 15.3486C322.809 15.433 322.634 15.5174 322.512 15.7133L322.128 16.016C321.953 16.1004 321.815 16.3039 321.647 16.4438C321.479 16.5836 321.431 16.6462 321.31 16.763C321.19 16.8798 320.989 17.1141 320.836 17.2858L320.563 17.5743C320.315 17.8594 320.086 18.1597 319.877 18.4736L298.45 49.3376C297.408 50.7193 296.763 52.3596 296.585 54.0812C296.407 55.8028 296.704 57.5402 297.442 59.1056L303.464 71.0428C302.732 69.4736 302.441 67.735 302.622 66.0131C302.802 64.2911 303.447 62.6506 304.488 61.2671L325.444 30.1588C325.662 29.8378 325.896 29.5487 326.13 29.2596C326.201 29.1709 326.279 29.0874 326.363 29.01C326.54 28.807 326.709 28.6276 326.893 28.4406C326.997 28.3358 327.107 28.2371 327.222 28.1449C327.413 28.0529 327.543 27.8334 327.711 27.6935L328.095 27.3908C328.271 27.3065 328.446 27.2221 328.583 27.0185C329.077 26.7807 329.517 26.4314 330.012 26.1541L330.299 26.016C330.706 25.7901 331.126 25.5878 331.557 25.41C331.557 25.41 331.669 25.3563 331.732 25.3256C332.09 25.1901 332.456 25.0793 332.829 24.994C332.94 24.9403 333.052 24.8866 333.179 24.8253L334.187 24.6347L334.503 24.5999C334.957 24.5387 335.415 24.5085 335.873 24.5096L336.126 24.5055C336.708 24.5098 337.289 24.5581 337.864 24.6501C338.285 24.7257 338.701 24.827 339.109 24.9534L339.439 25.069C339.882 25.2065 340.314 25.3795 340.729 25.5865L372.316 41.5041C372.816 41.7503 373.289 42.0489 373.726 42.3951C373.863 42.4933 373.994 42.601 374.116 42.7173C374.4 42.9484 374.666 43.2009 374.912 43.4726Z" fill="url(#paint7_linear_101_825)"${_scopeId}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M336.842 37.6654C334.013 36.8255 330.195 37.4701 327.742 39.202C326.419 40.1358 324.999 41.6708 324.33 42.8905C323.752 43.9438 322.849 46.5493 322.537 48.0638C321.119 54.9517 323.549 63.0564 328.586 68.2315C329.626 69.3008 330.036 69.5937 332.07 70.7256C334.887 72.2929 336.145 72.6312 339.758 72.7936C342.649 72.9236 344.593 72.682 347.466 71.8353C352.515 70.347 356.584 67.3831 359.393 63.1462C362.486 58.4819 361.38 51.9293 356.933 48.5662C353.719 46.1354 349.363 45.7292 345.884 47.5359C345.244 47.8678 344.68 48.1366 344.629 48.1332C344.578 48.1297 344.484 47.5186 344.42 46.7752C344.054 42.5488 341.026 38.908 336.842 37.6654ZM335.266 49.9312C333.744 53.5443 335.071 57.442 338.456 59.3035C340.355 60.348 341.77 60.5051 343.85 59.9026C345.784 59.3425 346.757 58.6896 347.865 57.2079L348.69 56.1054L350.434 57.1229L352.178 58.1403L351.558 59.1487C349.067 63.2037 343.692 65.2847 339.048 63.9923C337.602 63.5899 335.294 62.3212 334.18 61.3158C332.465 59.7677 331.185 57.4376 330.703 54.9851C330.402 53.456 330.475 51.2349 330.867 49.9485C331.249 48.6963 331.911 47.1887 332.104 47.1329C332.193 47.1071 333.033 47.5077 333.97 48.0232L335.675 48.9606L335.266 49.9312Z" fill="white"${_scopeId}></path></g><g class="social linkedin"${_scopeId}><path d="M344 424C347.5 421 352.924 421.391 356.044 425.542L375.345 451.296C376.858 453.298 377.627 455.765 377.519 458.272C377.411 460.78 376.433 463.171 374.754 465.036L353.439 486.246C350 489.7 344.682 489.109 341.577 484.958L322.261 459.204C320.75 457.198 319.982 454.729 320.09 452.22C320.198 449.711 320.822 447.369 322.5 445.5L344 424Z" fill="#217DE3"${_scopeId}></path><path d="M346.47 422.648L346.894 422.482C347.188 422.363 347.492 422.272 347.803 422.209L348.364 422.073L337.032 423.754H336.744L336.471 423.83L335.562 424.103L335.335 424.178L335.138 424.284C334.85 424.41 334.571 424.557 334.305 424.724L333.926 424.951C333.542 425.228 333.178 425.532 332.836 425.86L311.52 447.145C311.243 447.425 310.985 447.724 310.748 448.039L310.566 448.296C310.354 448.592 310.162 448.9 309.99 449.22C309.765 449.66 309.572 450.116 309.415 450.584V450.705C309.415 450.705 309.415 450.705 309.415 450.796C309.293 451.159 309.202 451.538 309.112 451.932C309.112 451.932 309.112 452.053 309.112 452.114C309.112 452.417 309.021 452.705 309.005 452.992C308.998 453.053 308.998 453.114 309.005 453.174V453.326C309.005 453.659 309.005 453.992 309.005 454.31V454.477C309.005 454.871 309.005 455.265 309.112 455.659C309.119 455.704 309.119 455.75 309.112 455.795C309.12 455.845 309.12 455.897 309.112 455.947C309.202 456.416 309.293 456.886 309.43 457.34C309.476 457.505 309.532 457.667 309.596 457.825C309.635 457.959 309.68 458.09 309.733 458.219C309.733 458.386 309.869 458.552 309.945 458.719L310.111 459.083C310.203 459.264 310.305 459.441 310.414 459.613C310.461 459.719 310.517 459.82 310.581 459.916C310.748 460.188 310.929 460.461 311.111 460.719L330.427 486.473C331.266 487.696 332.424 488.666 333.775 489.278C335.127 489.889 336.62 490.119 338.092 489.942L349.424 488.26C347.953 488.436 346.462 488.207 345.112 487.598C343.761 486.989 342.602 486.024 341.759 484.806L322.443 459.052C322.261 458.795 322.079 458.537 321.913 458.265C321.857 458.177 321.806 458.086 321.761 457.992L321.443 457.416C321.386 457.308 321.336 457.197 321.292 457.083C321.216 456.901 321.125 456.734 321.064 456.553C321.01 456.425 320.964 456.293 320.928 456.159L320.746 455.659C320.615 455.201 320.514 454.736 320.443 454.265C320.436 454.174 320.436 454.083 320.443 453.992C320.38 453.596 320.34 453.196 320.322 452.796V452.644C320.322 452.311 320.322 451.977 320.322 451.659C320.314 451.548 320.314 451.437 320.322 451.326C320.342 451.031 320.377 450.738 320.428 450.447V450.175C320.519 449.796 320.61 449.417 320.731 449.039L320.807 448.826C320.966 448.357 321.164 447.901 321.398 447.463V447.387C321.566 447.06 321.758 446.746 321.973 446.448L322.155 446.206C322.396 445.889 322.654 445.586 322.928 445.297L344.243 424.087C344.577 423.751 344.943 423.447 345.334 423.178C345.455 423.088 345.591 423.027 345.713 422.951C345.96 422.839 346.213 422.738 346.47 422.648Z" fill="url(#paint0_linear_101_825)"${_scopeId}></path><path d="M352.606 472.702L348.334 476.928L336.987 461.855L341.274 457.643L352.606 472.702ZM337.608 457.961C337.335 458.307 336.986 458.586 336.588 458.774C336.19 458.963 335.753 459.056 335.313 459.047C334.872 459.038 334.44 458.928 334.049 458.723C333.659 458.519 333.321 458.227 333.063 457.87C332.513 457.076 332.275 456.106 332.395 455.148C332.515 454.189 332.985 453.308 333.714 452.674C333.986 452.327 334.334 452.048 334.731 451.858C335.129 451.668 335.565 451.573 336.006 451.58C336.446 451.588 336.879 451.697 337.27 451.9C337.661 452.103 338 452.394 338.259 452.75C338.821 453.543 339.065 454.518 338.944 455.482C338.824 456.446 338.347 457.33 337.608 457.961ZM369.725 455.855L364.877 460.627L359.029 452.826C357.514 450.78 355.681 450.144 354.015 451.78C353.493 452.317 353.131 452.987 352.968 453.717C352.804 454.448 352.847 455.209 353.09 455.916C353.281 456.406 353.559 456.857 353.909 457.249L359.968 465.4L355.166 470.141C355.166 470.141 344.834 456.264 343.819 454.992L348.621 450.25L350.409 452.613C350.186 451.384 350.288 450.119 350.706 448.941C351.123 447.764 351.841 446.717 352.787 445.902C355.817 442.872 359.847 442.721 363.392 447.417L369.725 455.855Z" fill="white"${_scopeId}></path></g><g class="social twitter"${_scopeId}><path d="M490.21 107.5L490.81 107.044C491.225 106.768 491.658 106.519 492.106 106.3C492.37 106.142 492.642 105.998 492.921 105.868L476.127 112.802L475.696 112.994L475.312 113.234C474.862 113.457 474.428 113.714 474.016 114.001C473.907 114.056 473.803 114.121 473.704 114.193L473.416 114.433C473.031 114.75 472.663 115.086 472.313 115.441L471.833 115.921C471.334 116.489 470.884 117.099 470.489 117.744L445.946 158.529C445.633 159.072 445.353 159.633 445.107 160.209C445.107 160.377 444.987 160.52 444.915 160.664C444.723 161.216 444.531 161.768 444.387 162.32C444.215 163.111 444.095 163.912 444.027 164.719C444.027 164.719 444.027 164.863 444.027 164.935C443.991 165.558 443.991 166.183 444.027 166.806V166.926C444.027 166.926 444.027 167.142 444.027 167.238C444.027 167.694 444.027 168.174 444.195 168.63C444.183 168.725 444.183 168.822 444.195 168.917C444.195 168.917 444.195 169.085 444.195 169.157C444.195 169.661 444.411 170.165 444.531 170.669C444.542 170.74 444.542 170.813 444.531 170.885C444.703 171.489 444.911 172.081 445.155 172.66V172.852C445.185 172.929 445.226 173.001 445.275 173.068C445.567 173.768 445.903 174.45 446.282 175.107L446.714 175.779L447.074 176.307C447.244 176.549 447.429 176.781 447.626 177.003L448.01 177.506L448.657 178.202C448.801 178.346 448.897 178.49 449.041 178.61C449.4 178.965 449.776 179.301 450.169 179.618L489.754 211.766C491.512 213.321 493.662 214.366 495.97 214.789C498.279 215.212 500.659 214.996 502.854 214.165L519.648 207.232C517.449 208.062 515.065 208.278 512.753 207.855C510.441 207.432 508.287 206.387 506.524 204.832L466.963 172.684C466.57 172.368 466.194 172.031 465.835 171.676C465.729 171.559 465.617 171.446 465.499 171.341L464.78 170.573L464.42 170.093C464.222 169.864 464.038 169.623 463.868 169.373L463.508 168.821C463.342 168.599 463.19 168.367 463.052 168.126C462.67 167.474 462.326 166.801 462.02 166.11C462.02 165.966 461.901 165.847 461.853 165.703C461.605 165.117 461.397 164.516 461.229 163.903V163.663C461.085 163.159 460.989 162.656 460.893 162.152C460.797 161.648 460.893 161.792 460.893 161.624C460.821 161.163 460.773 160.699 460.749 160.233C460.737 160.089 460.737 159.944 460.749 159.801C460.713 159.177 460.713 158.553 460.749 157.929C460.749 157.929 460.749 157.713 460.749 157.594C460.805 156.785 460.925 155.983 461.109 155.194V155.05C461.253 154.499 461.445 153.947 461.637 153.395C461.637 153.251 461.757 153.107 461.829 152.939C462.065 152.359 462.346 151.797 462.668 151.26L487.211 110.474C487.606 109.83 488.056 109.22 488.555 108.651L489.035 108.171C489.416 107.929 489.808 107.705 490.21 107.5Z" fill="url(#paint1_linear_101_825)"${_scopeId}></path><path d="M487 110.5C490.959 103.903 499.639 103.061 506.044 108.244L545.606 140.392C548.699 142.891 550.826 146.388 551.623 150.284C552.42 154.18 551.836 158.232 549.973 161.744L525.429 202.53C521.471 209.127 513.074 210.279 506.692 205.097L467.13 172.948C464.033 170.452 461.902 166.957 461.1 163.061C460.299 159.165 460.139 155.516 462 152L487 110.5Z" fill="#217DE3"${_scopeId}></path><path d="M512.451 133.051L513.482 133.867C523.99 142.36 529.796 159.945 518.28 174.196C514.859 178.413 510.282 181.539 505.109 183.193C505.661 182.641 506.189 182.065 506.717 181.441C509.545 177.936 511.086 173.566 511.083 169.062C509.719 170.66 507.886 171.787 505.844 172.283C503.802 172.778 501.656 172.617 499.711 171.821C500.204 171.428 500.647 170.977 501.031 170.477C501.592 169.791 502.06 169.032 502.422 168.222C500.607 169.693 498.341 170.495 496.004 170.495C493.668 170.495 491.402 169.693 489.587 168.222C491.071 167.651 492.39 166.719 493.425 165.511C491.822 165.987 490.127 166.063 488.488 165.732C486.848 165.402 485.315 164.675 484.021 163.616C482.61 162.489 481.525 161.007 480.878 159.321C484.867 159.379 488.822 158.584 492.479 156.991C496.136 155.399 499.411 153.044 502.086 150.085C501.392 149.724 500.733 149.298 500.119 148.813C498.022 147.151 496.669 144.727 496.354 142.07C496.04 139.413 496.789 136.74 498.44 134.634C499.319 133.56 500.414 132.682 501.653 132.058C502.893 131.434 504.251 131.078 505.637 131.012C506.692 128.987 507.39 126.796 507.7 124.534C509.058 126.584 509.636 129.052 509.332 131.491C510.405 129.801 511.214 127.956 511.731 126.021C512.367 128.307 512.61 130.684 512.451 133.051Z" fill="white"${_scopeId}></path></g><g class="social medium"${_scopeId}><path d="M537.928 333.014C540.701 336.171 539.823 340.812 536.084 343.442L513 359.744C511.203 361.022 509.057 361.63 506.93 361.466C504.803 361.302 502.828 360.375 501.341 358.844L484.573 339.46C481.807 336.291 482.684 331.65 486.406 329.027L509.49 312.725C511.289 311.445 513.438 310.835 515.567 311C517.696 311.165 519.513 311.465 521 313L537.928 333.014Z" fill="#29A424"${_scopeId}></path><path d="M539.167 335.096L539.299 335.483C539.372 335.749 539.432 336.018 539.477 336.291C539.497 336.464 539.533 336.629 539.541 336.796L538.768 326.769L538.747 326.507C538.734 326.423 538.716 326.34 538.692 326.259C538.656 325.987 538.6 325.719 538.526 325.456L538.477 325.256L538.394 325.069C538.299 324.818 538.186 324.573 538.073 324.328L537.901 323.997C537.695 323.64 537.459 323.304 537.195 322.991L520.45 303.528C520.225 303.279 519.984 303.045 519.73 302.827L519.526 302.659C519.288 302.463 519.036 302.283 518.774 302.121L518.704 302.089C518.335 301.873 517.946 301.695 517.542 301.556L517.368 301.476C517.057 301.361 516.739 301.264 516.417 301.188L516.358 301.161L516.219 301.097L515.478 300.964L515.338 300.9L515.234 300.852C514.958 300.819 514.68 300.801 514.401 300.797L514.308 300.754C513.967 300.761 513.633 300.785 513.292 300.822L513.199 300.779L513.072 300.81C512.667 300.859 512.265 300.937 511.868 301.044L511.442 301.174C511.328 301.203 511.217 301.241 511.108 301.288L510.66 301.468L510.35 301.593C510.189 301.667 510.034 301.76 509.867 301.846C509.701 301.933 509.689 301.928 509.609 301.98C509.363 302.12 509.124 302.272 508.893 302.437L485.69 318.966C484.603 319.677 483.71 320.671 483.108 321.845C482.505 323.018 482.214 324.326 482.267 325.629L483.006 335.669C482.945 334.368 483.231 333.06 483.831 331.887C484.431 330.714 485.324 329.721 486.412 329.014L509.496 312.713C509.736 312.556 509.965 312.394 510.212 312.255L510.448 312.141C510.614 312.054 510.774 311.949 510.947 311.88L511.246 311.75C511.401 311.688 511.562 311.614 511.711 311.563L512.057 311.455L512.488 311.312C512.886 311.21 513.288 311.132 513.693 311.078L513.935 311.041C514.275 311.004 514.61 310.98 514.951 310.973L515.067 311.027C515.348 311.026 515.627 311.041 515.905 311.07L516.183 311.109C516.434 311.134 516.682 311.178 516.924 311.241L517.122 311.332C517.445 311.409 517.762 311.506 518.073 311.62L518.247 311.7C518.649 311.845 519.038 312.024 519.41 312.233L519.479 312.265C519.745 312.43 520 312.611 520.243 312.808L520.464 312.91C520.723 313.13 520.965 313.371 521.189 313.628L537.957 333.013C538.226 333.317 538.465 333.65 538.668 334.007L538.84 334.338C538.966 334.582 539.075 334.835 539.167 335.096Z" fill="url(#paint9_linear_101_825)"${_scopeId}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M512.93 317.68C512.806 317.662 510.512 319.341 510.379 319.547C510.305 319.661 510.372 319.821 510.656 320.208C511.081 320.787 511.149 321.258 510.873 321.712C510.752 321.911 509.144 323.124 504.927 326.197L499.146 330.409L498.692 330.315C498.291 330.231 498.191 330.157 497.839 329.677C497.557 329.295 497.395 329.147 497.289 329.176C497.206 329.199 496.589 329.631 495.918 330.136L494.698 331.055L497.232 334.503L499.766 337.952L501.093 336.977L502.42 336.002L501.803 335.111L501.186 334.22L507.09 329.882C510.338 327.496 513.019 325.576 513.048 325.616C513.077 325.656 512.675 326.219 512.154 326.867C511.633 327.515 510.946 328.376 510.627 328.78C510.308 329.185 509.413 330.309 508.64 331.279C506.1 334.461 502.169 339.409 501.807 339.877L501.453 340.337L502.603 341.903L503.754 343.469L504.188 343.297C504.751 343.073 507.01 342.21 511.058 340.671C512.011 340.308 512.838 339.992 516.82 338.465C520.781 336.946 521.278 336.761 521.357 336.773C521.397 336.779 518.748 338.755 515.469 341.164L509.508 345.545L508.873 344.733L508.239 343.92L506.872 344.888L505.506 345.856L508.547 349.949L511.589 354.042L512.752 353.234C514.368 352.112 514.347 352.144 513.85 351.467C513.491 350.979 513.45 350.864 513.491 350.455L513.536 349.993L519.283 345.735C523.485 342.621 525.113 341.456 525.341 341.399C525.888 341.264 526.255 341.437 526.699 342.041C527.185 342.703 527.127 342.718 528.689 341.519L529.826 340.645L526.703 336.349L523.581 332.052L523.329 332.116C523.191 332.151 522.618 332.36 522.055 332.581C521.492 332.801 520.638 333.133 520.158 333.318C517.628 334.292 514.067 335.676 512.64 336.24C511.752 336.591 511 336.843 510.969 336.8C510.938 336.758 511.419 336.096 512.038 335.33C513.365 333.689 513.915 333.004 515.847 330.591C516.641 329.6 517.631 328.364 518.048 327.846C518.465 327.328 518.922 326.759 519.064 326.582L519.322 326.26L516.175 321.978C514.444 319.622 512.984 317.688 512.93 317.68Z" fill="white"${_scopeId}></path></g><g class="social ok"${_scopeId}><path d="M562.959 485.015C570.393 488.975 571.994 498.154 566.779 505.336L533.831 550.272C531.271 553.785 527.57 556.297 523.361 557.38C519.152 558.462 514.697 558.047 510.761 556.205L464.796 531.666C457.348 527.685 455.653 518.601 460.954 511.36L493.903 466.424C496.461 462.907 500.161 460.39 504.371 459.301C508.581 458.212 513.058 458.165 517 460L562.959 485.015Z" fill="#FF6100"${_scopeId}></path><path d="M566.656 488.076L567.116 488.745C567.466 489.161 567.775 489.61 568.038 490.085C568.231 490.366 568.424 490.647 568.617 490.928L560.132 472.987L559.85 472.577C559.745 472.447 559.65 472.31 559.567 472.166C559.255 471.712 558.958 471.28 558.631 470.804C558.568 470.689 558.493 470.581 558.408 470.48C558.344 470.366 558.27 470.257 558.185 470.156C557.834 469.743 557.451 469.357 557.041 469.001L556.474 468.5C555.823 467.986 555.133 467.524 554.41 467.119L508.424 442.595C507.819 442.266 507.19 441.986 506.542 441.756L506.03 441.567C505.423 441.379 504.832 441.213 504.197 441.077C503.35 440.904 502.489 440.814 501.625 440.808L501.406 440.768L501.298 440.842C500.614 440.83 499.93 440.854 499.248 440.915L498.899 440.964C498.398 441.022 497.89 441.116 497.383 441.211L497.071 441.266L496.876 441.4C496.318 441.528 495.767 441.684 495.224 441.868L495.051 441.986C494.398 442.207 493.758 442.466 493.135 442.763C493.071 442.793 493.012 442.833 492.962 442.882C492.898 442.942 492.825 442.992 492.746 443.031C492.076 443.491 491.28 443.816 490.574 444.27C490.336 444.433 490.098 444.596 489.839 444.775C489.644 444.892 489.457 445.021 489.277 445.161C488.996 445.354 488.737 445.533 488.478 445.711C488.283 445.829 488.096 445.958 487.916 446.097C487.635 446.29 487.354 446.484 487.192 446.85C487.019 446.953 486.853 447.067 486.695 447.192C486.337 447.597 485.972 448.038 485.644 448.487L452.717 493.408C451.118 495.415 450.098 497.821 449.766 500.365C449.435 502.91 449.805 505.497 450.837 507.846L459.322 525.787C458.293 523.437 457.925 520.851 458.256 518.307C458.587 515.763 459.606 513.357 461.202 511.349L494.151 466.413C494.479 465.963 494.829 465.531 495.202 465.118C495.331 465.014 495.469 464.919 495.612 464.835L496.408 464.002L496.927 463.645C497.207 463.452 497.488 463.259 497.748 463.081L498.353 462.664C498.591 462.501 498.85 462.323 499.088 462.159C499.81 461.66 500.573 461.22 501.367 460.846C501.497 460.757 501.627 460.668 501.756 460.579C502.393 460.3 503.029 460.022 503.673 459.802L503.889 459.653C504.424 459.474 504.969 459.323 505.52 459.201L506.107 459.083C506.6 458.967 507.101 458.909 507.624 458.836C507.77 458.808 507.918 458.791 508.067 458.786C508.742 458.707 509.423 458.675 510.102 458.691L510.496 458.707C511.351 458.746 512.203 458.841 513.046 458.991L513.228 459.024C513.826 459.154 514.455 459.327 515.061 459.515L515.558 459.682C516.201 459.924 516.83 460.204 517.44 460.521L562.96 485.015C563.682 485.407 564.368 485.862 565.009 486.375L565.576 486.876L566.656 488.076Z" fill="url(#paint2_linear_101_825)"${_scopeId}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M527.671 478.276C525.715 477.378 523.408 476.775 521.493 476.659C519.15 476.518 516.237 476.975 514.181 477.805C511.958 478.703 509.671 480.266 508.054 481.994C507.172 482.935 505.686 485.192 505.143 486.414C502.48 492.414 503.588 499.489 507.962 504.41C510.096 506.811 513.081 508.663 516.115 509.469C521.864 510.996 527.77 509.487 532.195 505.361C533.285 504.345 534.857 502.151 535.59 500.623C536.264 499.218 536.874 497.127 537.071 495.54C537.704 490.456 536.003 485.412 532.396 481.677C531.38 480.624 528.902 478.841 527.671 478.276ZM525.941 489.154C527.212 490.832 527.657 492.956 527.179 495.059C526.935 496.132 525.959 497.753 525.106 498.504C523.175 500.203 520.237 500.709 517.876 499.75C516.382 499.143 515.275 498.153 514.411 496.651C512.881 493.99 513.383 490.497 515.603 488.356C517.441 486.584 520.287 485.983 522.797 486.837C523.71 487.148 525.321 488.334 525.941 489.154ZM497.889 499.232C495.456 498.604 493.077 499.659 492.077 501.81C491.207 503.681 491.521 505.305 493.386 508.58C494.438 510.428 496.115 512.756 497.489 514.277L497.838 514.662L490.912 515.999C483.323 517.464 483.355 517.454 482.203 518.655C480.729 520.193 480.513 522.604 481.675 524.553C482.083 525.237 482.186 525.338 483.114 525.963C484.85 527.131 484.539 527.143 492.626 525.617L499.529 524.314L500.777 530.672C501.463 534.168 502.149 537.385 502.301 537.819C503 539.812 504.959 541.137 507.084 541.055C508.052 541.018 508.68 540.829 509.543 540.315C510.102 539.983 510.236 539.84 510.863 538.904C512.088 537.078 512.107 537.577 510.494 529.344L509.106 522.263L509.596 522.438C511.988 523.292 513.902 523.771 516.218 524.095C520.019 524.626 521.451 524.423 522.893 523.146C525.267 521.044 524.991 517.273 522.331 515.479C521.436 514.875 520.747 514.671 519.254 514.565C515.228 514.281 511.947 513.152 508.621 510.908C505.525 508.82 503.39 506.478 501.708 503.323C500.246 500.581 500.358 500.739 499.374 500.029C498.695 499.54 498.338 499.348 497.889 499.232Z" fill="white"${_scopeId}></path></g><defs${_scopeId}><linearGradient id="paint0_linear_101_825" x1="328.536" y1="491.587" x2="332.433" y2="414.622" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#1A52C5"${_scopeId}></stop><stop offset="0.09" stop-color="#1B56C7"${_scopeId}></stop><stop offset="0.17" stop-color="#2062CC"${_scopeId}></stop><stop offset="0.26" stop-color="#2776D4"${_scopeId}></stop><stop offset="0.34" stop-color="#3292E0"${_scopeId}></stop><stop offset="0.43" stop-color="#3FB6EF"${_scopeId}></stop><stop offset="0.5" stop-color="#4DDAFF"${_scopeId}></stop><stop offset="0.54" stop-color="#46C7F7"${_scopeId}></stop><stop offset="0.64" stop-color="#369DE5"${_scopeId}></stop><stop offset="0.74" stop-color="#2A7DD7"${_scopeId}></stop><stop offset="0.84" stop-color="#2165CD"${_scopeId}></stop><stop offset="0.92" stop-color="#1C57C7"${_scopeId}></stop><stop offset="1" stop-color="#1A52C5"${_scopeId}></stop></linearGradient><linearGradient id="paint1_linear_101_825" x1="488.145" y1="219.626" x2="464.332" y2="99.9301" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#1A52C5"${_scopeId}></stop><stop offset="0.09" stop-color="#1B56C7"${_scopeId}></stop><stop offset="0.17" stop-color="#2062CC"${_scopeId}></stop><stop offset="0.26" stop-color="#2776D4"${_scopeId}></stop><stop offset="0.34" stop-color="#3292E0"${_scopeId}></stop><stop offset="0.43" stop-color="#3FB6EF"${_scopeId}></stop><stop offset="0.5" stop-color="#4DDAFF"${_scopeId}></stop><stop offset="0.54" stop-color="#46C7F7"${_scopeId}></stop><stop offset="0.64" stop-color="#369DE5"${_scopeId}></stop><stop offset="0.74" stop-color="#2A7DD7"${_scopeId}></stop><stop offset="0.84" stop-color="#2165CD"${_scopeId}></stop><stop offset="0.92" stop-color="#1C57C7"${_scopeId}></stop><stop offset="1" stop-color="#1A52C5"${_scopeId}></stop></linearGradient><linearGradient id="paint2_linear_101_825" x1="444.187" y1="492.074" x2="573.564" y2="459.516" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#F34302"${_scopeId}></stop><stop offset="0.11" stop-color="#F34703"${_scopeId}></stop><stop offset="0.21" stop-color="#F45308"${_scopeId}></stop><stop offset="0.32" stop-color="#F66710"${_scopeId}></stop><stop offset="0.42" stop-color="#F8831A"${_scopeId}></stop><stop offset="0.51" stop-color="#FAA025"${_scopeId}></stop><stop offset="0.56" stop-color="#F98E1E"${_scopeId}></stop><stop offset="0.68" stop-color="#F66E12"${_scopeId}></stop><stop offset="0.8" stop-color="#F45609"${_scopeId}></stop><stop offset="0.91" stop-color="#F34804"${_scopeId}></stop><stop offset="1" stop-color="#F34302"${_scopeId}></stop></linearGradient><linearGradient id="paint3_linear_101_825" x1="60.2862" y1="452.305" x2="163.539" y2="423.81" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#142F8D"${_scopeId}></stop><stop offset="0.1" stop-color="#163391"${_scopeId}></stop><stop offset="0.19" stop-color="#1A3D9D"${_scopeId}></stop><stop offset="0.28" stop-color="#224FB1"${_scopeId}></stop><stop offset="0.38" stop-color="#2E68CD"${_scopeId}></stop><stop offset="0.47" stop-color="#3C87F1"${_scopeId}></stop><stop offset="0.51" stop-color="#4294FF"${_scopeId}></stop><stop offset="0.61" stop-color="#3272D8"${_scopeId}></stop><stop offset="0.72" stop-color="#2555B8"${_scopeId}></stop><stop offset="0.82" stop-color="#1C40A0"${_scopeId}></stop><stop offset="0.92" stop-color="#163392"${_scopeId}></stop><stop offset="1" stop-color="#142F8D"${_scopeId}></stop></linearGradient><linearGradient id="paint4_linear_101_825" x1="252.703" y1="607.907" x2="235.508" y2="533.387" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#B72D02"${_scopeId}></stop><stop offset="0.11" stop-color="#BA3103"${_scopeId}></stop><stop offset="0.22" stop-color="#C43D07"${_scopeId}></stop><stop offset="0.33" stop-color="#D4510E"${_scopeId}></stop><stop offset="0.44" stop-color="#EA6D17"${_scopeId}></stop><stop offset="0.51" stop-color="#FA811E"${_scopeId}></stop><stop offset="0.54" stop-color="#F3781B"${_scopeId}></stop><stop offset="0.66" stop-color="#D95810"${_scopeId}></stop><stop offset="0.79" stop-color="#C64008"${_scopeId}></stop><stop offset="0.9" stop-color="#BB3204"${_scopeId}></stop><stop offset="1" stop-color="#B72D02"${_scopeId}></stop></linearGradient><linearGradient id="paint5_linear_101_825" x1="317.078" y1="228.301" x2="303.467" y2="372.799" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#FFBE1E"${_scopeId}></stop><stop offset="0.52" stop-color="#FF47C3"${_scopeId}></stop><stop offset="0.57" stop-color="#EE42BD"${_scopeId}></stop><stop offset="0.67" stop-color="#C235AE"${_scopeId}></stop><stop offset="0.81" stop-color="#7B1F95"${_scopeId}></stop><stop offset="0.99" stop-color="#1B0274"${_scopeId}></stop><stop offset="1" stop-color="#130071"${_scopeId}></stop></linearGradient><linearGradient id="paint6_linear_101_825" x1="297.745" y1="366.12" x2="285.95" y2="220.091" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#3D003B"${_scopeId}></stop><stop offset="0.55" stop-color="#FF47C3"${_scopeId}></stop><stop offset="0.63" stop-color="#EE43B3"${_scopeId}></stop><stop offset="0.79" stop-color="#C23889"${_scopeId}></stop><stop offset="1" stop-color="#7F2849"${_scopeId}></stop></linearGradient><linearGradient id="paint7_linear_101_825" x1="294.194" y1="63.547" x2="369.442" y2="18.1188" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#230564"${_scopeId}></stop><stop offset="0.419792" stop-color="#874FFF"${_scopeId}></stop><stop offset="0.461458" stop-color="#9A6BFF"${_scopeId}></stop><stop offset="0.560417" stop-color="#B999FF"${_scopeId}></stop><stop offset="0.622917" stop-color="#A378FF"${_scopeId}></stop><stop offset="0.70625" stop-color="#874FFF"${_scopeId}></stop><stop offset="0.79" stop-color="#874FFF"${_scopeId}></stop><stop offset="1" stop-color="#230564"${_scopeId}></stop></linearGradient><linearGradient id="paint8_linear_101_825" x1="241.649" y1="177.186" x2="244.595" y2="126.272" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#5F1514"${_scopeId}></stop><stop offset="0.08" stop-color="#631513"${_scopeId}></stop><stop offset="0.17" stop-color="#6F1312"${_scopeId}></stop><stop offset="0.25" stop-color="#83110F"${_scopeId}></stop><stop offset="0.33" stop-color="#9F0E0B"${_scopeId}></stop><stop offset="0.42" stop-color="#C30B06"${_scopeId}></stop><stop offset="0.5" stop-color="#F10600"${_scopeId}></stop><stop offset="0.56" stop-color="#D40904"${_scopeId}></stop><stop offset="0.66" stop-color="#AA0D0A"${_scopeId}></stop><stop offset="0.75" stop-color="#8A110E"${_scopeId}></stop><stop offset="0.84" stop-color="#721311"${_scopeId}></stop><stop offset="0.93" stop-color="#641413"${_scopeId}></stop><stop offset="1" stop-color="#5F1514"${_scopeId}></stop></linearGradient><linearGradient id="paint9_linear_101_825" x1="482.145" y1="316.877" x2="547.1" y2="324.503" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#1F801B"${_scopeId}></stop><stop offset="0.1" stop-color="#22841D"${_scopeId}></stop><stop offset="0.19" stop-color="#2B9022"${_scopeId}></stop><stop offset="0.28" stop-color="#3AA42C"${_scopeId}></stop><stop offset="0.38" stop-color="#50C039"${_scopeId}></stop><stop offset="0.47" stop-color="#6BE449"${_scopeId}></stop><stop offset="0.51" stop-color="#76F250"${_scopeId}></stop><stop offset="0.61" stop-color="#58CB3E"${_scopeId}></stop><stop offset="0.72" stop-color="#3FAB2F"${_scopeId}></stop><stop offset="0.82" stop-color="#2E9324"${_scopeId}></stop><stop offset="0.92" stop-color="#23851D"${_scopeId}></stop><stop offset="1" stop-color="#1F801B"${_scopeId}></stop></linearGradient><linearGradient id="paint10_linear_101_825" x1="90.3785" y1="207.524" x2="43.1163" y2="90.3886" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#142F8D"${_scopeId}></stop><stop offset="0.1" stop-color="#163391"${_scopeId}></stop><stop offset="0.19" stop-color="#1A3D9D"${_scopeId}></stop><stop offset="0.28" stop-color="#224FB1"${_scopeId}></stop><stop offset="0.38" stop-color="#2E68CD"${_scopeId}></stop><stop offset="0.47" stop-color="#3C87F1"${_scopeId}></stop><stop offset="0.51" stop-color="#4294FF"${_scopeId}></stop><stop offset="0.61" stop-color="#3272D8"${_scopeId}></stop><stop offset="0.72" stop-color="#2555B8"${_scopeId}></stop><stop offset="0.82" stop-color="#1C40A0"${_scopeId}></stop><stop offset="0.92" stop-color="#163392"${_scopeId}></stop><stop offset="1" stop-color="#142F8D"${_scopeId}></stop></linearGradient><linearGradient id="paint11_linear_101_825" x1="32.7118" y1="334.342" x2="17.9287" y2="262.811" gradientUnits="userSpaceOnUse"${_scopeId}><stop stop-color="#1A1A1B"${_scopeId}></stop><stop offset="0.08" stop-color="#282829"${_scopeId}></stop><stop offset="0.16" stop-color="#282829"${_scopeId}></stop><stop offset="0.24" stop-color="#353535"${_scopeId}></stop><stop offset="0.32" stop-color="#353535"${_scopeId}></stop><stop offset="0.4" stop-color="#525252"${_scopeId}></stop><stop offset="0.48" stop-color="#6A6767"${_scopeId}></stop><stop offset="0.51" stop-color="#6A6767"${_scopeId}></stop><stop offset="0.59" stop-color="#525252"${_scopeId}></stop><stop offset="0.68" stop-color="#353535"${_scopeId}></stop><stop offset="0.77" stop-color="#353535"${_scopeId}></stop><stop offset="0.85" stop-color="#282829"${_scopeId}></stop><stop offset="0.93" stop-color="#282829"${_scopeId}></stop><stop offset="1" stop-color="#1A1A1B"${_scopeId}></stop></linearGradient></defs></svg></div></div></div><div${_scopeId}>`);
        _push2(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_row, null, {
          default: vue_cjs_prod.withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<!--[-->`);
              serverRenderer.exports.ssrRenderList(4, (card, i) => {
                _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, {
                  cols: 12,
                  md: 6,
                  lg: 3,
                  key: i
                }, {
                  default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, {
                        primary: "",
                        style: { "text-align": "center" }
                      }, {
                        default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                          if (_push5) {
                            _push5(`<h5 class="statictics-title text-primary"${_scopeId4}>88 \u043A</h5><p${_scopeId4}>\u0414\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u0435\u0439 \u0442\u043E\u043A\u0435\u043D\u043E\u0432</p>`);
                          } else {
                            return [
                              vue_cjs_prod.createVNode("h5", { class: "statictics-title text-primary" }, "88 \u043A"),
                              vue_cjs_prod.createVNode("p", null, "\u0414\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u0435\u0439 \u0442\u043E\u043A\u0435\u043D\u043E\u0432")
                            ];
                          }
                        }),
                        _: 2
                      }, _parent4, _scopeId3));
                    } else {
                      return [
                        vue_cjs_prod.createVNode(_component_ui_card, {
                          primary: "",
                          style: { "text-align": "center" }
                        }, {
                          default: vue_cjs_prod.withCtx(() => [
                            vue_cjs_prod.createVNode("h5", { class: "statictics-title text-primary" }, "88 \u043A"),
                            vue_cjs_prod.createVNode("p", null, "\u0414\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u0435\u0439 \u0442\u043E\u043A\u0435\u043D\u043E\u0432")
                          ]),
                          _: 1
                        })
                      ];
                    }
                  }),
                  _: 2
                }, _parent3, _scopeId2));
              });
              _push3(`<!--]-->`);
            } else {
              return [
                (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(vue_cjs_prod.Fragment, null, vue_cjs_prod.renderList(4, (card, i) => {
                  return vue_cjs_prod.createVNode(_component_ui_grid_col, {
                    cols: 12,
                    md: 6,
                    lg: 3,
                    key: i
                  }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, {
                        primary: "",
                        style: { "text-align": "center" }
                      }, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("h5", { class: "statictics-title text-primary" }, "88 \u043A"),
                          vue_cjs_prod.createVNode("p", null, "\u0414\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u0435\u0439 \u0442\u043E\u043A\u0435\u043D\u043E\u0432")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 2
                  }, 1024);
                }), 64))
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`</div>`);
      } else {
        return [
          vue_cjs_prod.createVNode("div", { style: { "flex-grow": "1" } }, [
            vue_cjs_prod.createVNode("div", {
              class: "row",
              style: { "align-items": "center", "height": "100%" }
            }, [
              vue_cjs_prod.createVNode("div", { class: "col cols-6" }, [
                vue_cjs_prod.createVNode("div", { style: { "display": "grid", "grid-gap": "28px" } }, [
                  vue_cjs_prod.createVNode("h1", { class: "main-title" }, [
                    vue_cjs_prod.createVNode("span", { class: "text-primary" }, "\u0415\u0434\u0438\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430"),
                    vue_cjs_prod.createTextVNode(" \u0434\u043B\u044F \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u0441\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0441\u0435\u0442\u044F\u043C\u0438 ")
                  ]),
                  vue_cjs_prod.createVNode("p", { class: "text-secondary" }, " Qaqado - \u0441\u0430\u043C\u0430\u044F \u0443\u0434\u043E\u0431\u043D\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430 \u0434\u043B\u044F \u043A\u0443\u043F\u043B\u0438 \u0438 \u043F\u0440\u043E\u0434\u0430\u0436\u0438 \u043A\u0440\u0438\u043F\u0442\u043E\u0432\u0430\u043B\u044E\u0442\u044B. "),
                  vue_cjs_prod.createVNode("div", null, [
                    vue_cjs_prod.createVNode(_component_ui_button, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode(" \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 ")
                      ]),
                      _: 1
                    })
                  ])
                ])
              ]),
              vue_cjs_prod.createVNode("div", {
                class: "col cols-6",
                style: { "position": "relative", "height": "100%" }
              }, [
                (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock("svg", {
                  style: { "position": "absolute", "right": "24px" },
                  height: "100%",
                  viewBox: "0 0 580 640",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                }, [
                  vue_cjs_prod.createVNode("g", { class: "social tiktok" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M30.6209 269.585C33.0846 265.204 38.9236 265.045 42.7791 268.12L66.6397 287.207C68.4977 288.689 69.784 290.77 70.2792 293.094C70.7744 295.419 70.4479 297.843 69.3552 299.953L54.8429 324.526C51.2341 328.13 47.1268 328.11 43.635 326.146L19.7674 307.071C17.9099 305.586 16.6247 303.503 16.1308 301.176C15.0568 298.722 15.8008 296.101 16.8947 293.989L30.6209 269.585Z",
                      fill: "#353535"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M33.4137 267.167L33.7735 266.908C34.0148 266.737 34.2672 266.582 34.529 266.443C34.687 266.35 34.85 266.266 35.0171 266.191L24.9991 270.441C24.9115 270.473 24.8276 270.514 24.7488 270.564L24.511 270.693C24.2492 270.832 23.9968 270.987 23.7555 271.158L23.5568 271.277L23.4582 271.452C23.2261 271.645 23.0056 271.851 22.7981 272.069L22.5205 272.358C22.2249 272.702 21.9576 273.07 21.7211 273.457L7.20877 298.029C7.02509 298.361 6.86032 298.703 6.71526 299.053L6.57447 299.303C6.44632 299.626 6.33792 299.955 6.24989 300.291L6.21469 300.353C6.10901 300.809 6.0413 301.272 6.01219 301.738L5.95586 301.839L5.91363 301.914C5.89031 302.286 5.8893 302.66 5.91056 303.032C5.91041 303.094 5.92047 303.155 5.94031 303.214C5.9518 303.491 5.98344 303.768 6.03499 304.041L6.05217 304.216L6.08348 304.365L6.29627 305.275L6.32913 305.393C6.4331 305.759 6.5617 306.117 6.71403 306.466L6.78911 306.508L6.85951 306.647C7.04032 307.062 7.24833 307.465 7.48218 307.853L7.75204 308.252C7.85217 308.309 7.88897 308.478 7.96797 308.571C8.04697 308.665 8.18541 308.859 8.29493 308.986C8.3663 309.088 8.44308 309.186 8.52491 309.28C8.65241 309.434 8.79399 309.563 8.92853 309.705C9.06307 309.846 9.06856 309.866 9.14209 309.94C9.21561 310.015 9.60438 310.349 9.83904 310.546L33.7067 329.621C34.7657 330.543 36.0568 331.158 37.44 331.399C38.8233 331.639 40.2461 331.497 41.5543 330.987L51.5724 326.737C50.2616 327.247 48.8363 327.389 47.4508 327.147C46.0654 326.904 44.7725 326.288 43.7122 325.364L19.8445 306.289C19.5817 306.141 19.3877 305.901 19.1601 305.69L18.9646 305.481C18.7893 305.383 18.6704 305.184 18.5429 305.03L18.3184 304.755C18.2002 304.617 18.0892 304.472 17.986 304.321C17.8858 304.265 17.842 304.109 17.7575 303.995C17.6731 303.882 17.5776 303.729 17.4947 303.584C17.2557 303.199 17.0475 302.795 16.872 302.377L16.7618 302.134C16.6094 301.785 16.4808 301.427 16.3769 301.061L16.3386 300.924C16.2509 300.611 16.1884 300.312 16.1258 300.013L16.0702 299.702C16.0326 299.417 15.988 299.145 15.9755 298.874L15.9559 298.616C15.9347 298.244 15.9357 297.87 15.959 297.498L15.9825 297.28C16.0116 296.814 16.0794 296.35 16.185 295.895L16.2273 295.82C16.3211 295.477 16.4204 295.154 16.5393 294.826L16.6801 294.575C16.8251 294.225 16.9899 293.883 17.1736 293.552L31.6859 268.979C31.9165 268.588 32.1842 268.22 32.4853 267.88L32.7629 267.592C32.9695 267.435 33.187 267.293 33.4137 267.167Z",
                      fill: "url(#paint11_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      "fill-rule": "evenodd",
                      "clip-rule": "evenodd",
                      d: "M28.8949 284.771C28.9013 284.813 33.6179 288.306 39.3763 292.533C48.3525 299.122 49.887 300.27 50.1331 300.576C51.9176 302.797 51.2158 305.996 48.6469 307.351C47.6023 307.902 46.0175 307.942 44.9261 307.444C44.3144 307.165 43.3621 306.374 43.0197 305.861C41.3733 303.394 42.6068 299.978 45.4473 299.139L45.8821 299.011L42.5709 296.607L39.2598 294.202L38.7309 294.667C37.9112 295.387 36.4452 297.397 35.9816 298.436C33.9948 302.892 34.7509 307.758 37.9948 311.392C38.7497 312.238 40.427 313.499 41.4571 313.996C43.5238 314.992 45.8297 315.377 48.0612 315.1C50.5265 314.794 52.672 313.838 54.4818 312.24C56.4526 310.499 57.7789 308.185 58.2815 305.609C58.9952 301.952 57.9481 298.227 55.3923 295.333C54.8886 294.763 54.648 294.577 49.3128 290.623C46.2574 288.359 43.7746 286.484 43.7953 286.456C43.8161 286.427 44.0202 286.275 44.2489 286.117C45.3516 285.355 46.3581 284.327 47.4314 282.864L48.1193 281.927L45.218 279.732C43.6223 278.525 42.2791 277.535 42.233 277.531C42.187 277.527 41.8106 277.986 41.3965 278.55C40.5477 279.707 40.1787 280.052 39.3826 280.438C38.7965 280.722 37.7005 280.922 37.0861 280.857C36.1373 280.757 35.7863 280.601 34.4603 279.688L33.231 278.842L31.0571 281.769C29.8615 283.378 28.8885 284.729 28.8949 284.771Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social vk" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M68.5057 97.0799C71.2615 89.6316 79.5788 86.8013 87.0766 90.8482L133.504 115.924C137.133 117.863 139.973 121.006 141.536 124.811C143.099 128.617 143.288 132.849 142.069 136.779L124.988 183.057C122.232 190.506 113.915 193.336 106.442 189.289L60.5 165C56.868 163.057 53.5672 159.809 52 156C50.4328 152.191 49.787 147.436 51 143.5L68.5057 97.0799Z",
                      fill: "#1958C4"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M70.8396 93.1312L71.3609 92.5601C71.732 92.2008 72.1215 91.8611 72.5278 91.5422C72.7638 91.3364 73.0126 91.1457 73.2727 90.9712L57.6562 101.25L57.2341 101.523C57.115 101.609 57.0067 101.709 56.9114 101.821C56.4999 102.133 56.11 102.473 55.7445 102.839C55.6396 102.923 55.5401 103.015 55.4465 103.112C55.3642 103.205 55.2895 103.305 55.2231 103.41C54.8813 103.802 54.5662 104.217 54.2797 104.651C54.1556 104.85 54.0066 105.024 53.8825 105.247C53.4892 105.923 53.1488 106.629 52.8645 107.357L35.8081 153.636C35.5771 154.249 35.3945 154.88 35.2619 155.522C35.2619 155.696 35.2619 155.845 35.2619 156.019C35.2619 156.615 35.0881 157.186 35.0384 157.807C34.9872 158.633 34.9872 159.463 35.0384 160.289C35.0384 160.289 35.0384 160.438 35.0384 160.513C35.0384 160.587 35.0384 160.513 35.0384 160.513C35.1077 161.156 35.2154 161.794 35.3611 162.425C35.3729 162.465 35.3729 162.508 35.3611 162.549V162.847C35.3611 163.318 35.6343 163.79 35.7832 164.237C35.7726 164.336 35.7726 164.436 35.7832 164.535V164.758C35.9729 165.257 36.1884 165.746 36.4288 166.223V166.422C36.7264 167.004 37.058 167.567 37.4219 168.11V168.309L37.5708 168.507C38.0151 169.155 38.4959 169.776 39.0108 170.369L39.5818 170.965C39.7264 171.135 39.8841 171.292 40.0536 171.437C40.2649 171.656 40.4887 171.864 40.7239 172.058L41.2205 172.48L42.0149 173.076L42.4867 173.398C42.9188 173.695 43.3663 173.968 43.8273 174.218L90.2546 199.268C92.3336 200.523 94.7159 201.187 97.1442 201.187C99.5726 201.187 101.955 200.523 104.034 199.268L119.75 188.99C117.671 190.245 115.288 190.908 112.86 190.908C110.432 190.908 108.049 190.245 105.97 188.99L60.1389 164.237C59.6699 163.988 59.2141 163.714 58.7735 163.418L58.401 163.12L57.5072 162.499L57.0604 162.077C56.8091 161.883 56.5687 161.676 56.3403 161.456L55.8686 160.985L55.1735 160.364C54.6526 159.773 54.1794 159.142 53.7583 158.477L53.4852 158.105C53.1376 157.558 52.8148 156.987 52.5169 156.416C52.5169 156.416 52.5169 156.243 52.3928 156.168C52.1693 155.696 51.9459 155.2 51.7473 154.703C51.5486 154.207 51.6231 154.356 51.5735 154.182C51.4067 153.727 51.2658 153.263 51.1514 152.792C51.1514 152.667 51.1514 152.518 51.0272 152.369C50.8783 151.749 50.779 151.103 50.6797 150.458C50.6911 150.342 50.6911 150.226 50.6797 150.11C50.6284 149.283 50.6284 148.454 50.6797 147.627C50.6797 147.627 50.6797 147.627 50.6797 147.478C50.7144 146.878 50.789 146.281 50.9031 145.691C50.8891 145.526 50.8891 145.36 50.9031 145.194C51.039 144.556 51.2131 143.925 51.4245 143.307L68.5058 97.0291C68.7798 96.296 69.1205 95.5896 69.5237 94.9187C69.6478 94.6953 69.7968 94.5215 69.921 94.3229C70.2028 93.9074 70.5095 93.5095 70.8396 93.1312Z",
                      fill: "url(#paint10_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      "fill-rule": "evenodd",
                      "clip-rule": "evenodd",
                      d: "M81.1975 140.197C80.66 141.637 80.4071 142.741 80.4251 143.567C80.4344 143.997 80.7013 144.941 80.8165 144.952C80.851 144.955 81.0175 144.794 81.1866 144.594C81.8581 143.799 82.6924 143.295 83.5135 143.189C84.0217 143.123 84.8775 143.206 85.6295 143.395C86.2822 143.56 88.9153 144.561 90.1904 145.129C91.8223 145.857 93.4234 146.766 94.3019 147.462C95.4889 148.404 95.8488 149.208 95.4712 150.074C94.9798 151.202 92.9415 151.97 88.9496 152.532C85.9653 152.952 82.7371 153.165 79.9807 153.125C77.7226 153.092 77.5572 153.115 77.0887 153.533L76.825 153.769L74.8457 158.197L72.8664 162.626L72.8865 163.032C72.9118 163.546 73.1054 163.85 73.4926 163.986C73.932 164.139 76.7835 164.116 80.8558 163.926C91.1675 163.445 98.9473 162.049 103.8 159.81C107.495 158.105 110.537 155.581 112.749 152.386C113.439 151.389 113.761 150.763 114.759 148.48C115.626 146.497 115.717 146.264 115.708 146.038C115.691 145.599 115.526 145.175 115.236 144.823C114.968 144.498 114.918 144.465 114.026 144.014C112.314 143.147 111.434 142.502 110.69 141.568C110.226 140.986 109.902 140.148 109.938 139.619C110.006 138.588 110.731 137.863 112.379 137.182C112.787 137.013 114.064 136.579 115.215 136.219C117.524 135.496 119.01 134.922 119.756 134.464C120.337 134.107 121.071 133.487 121.508 132.983C121.822 132.62 121.824 132.617 123.767 128.316C125.052 125.47 125.732 123.912 125.775 123.714C126.021 122.562 125.725 121.501 125.074 121.206C123.87 120.659 120.229 121.596 113.942 124.07C111.207 125.146 110.534 125.318 109.644 125.168C109.159 125.086 108.762 124.867 108.297 124.428C107.619 123.787 107.065 122.897 105.161 119.392C102.639 114.748 101.263 112.539 99.8232 110.822C99.0713 109.925 98.7217 109.587 98.1992 109.252C97.502 108.805 97.1165 108.92 96.6106 109.727C96.2882 110.24 91.9347 119.985 91.8866 120.301C91.8416 120.595 91.9638 121.011 92.1865 121.32C92.2796 121.449 92.6636 121.874 93.0398 122.263C95.4912 124.8 97.4976 127.343 99.326 130.231C100.859 132.653 101.687 134.52 101.701 135.588C101.707 136.032 101.497 136.517 101.186 136.781C100.722 137.173 99.774 137.315 98.852 137.13C98.0195 136.963 97.1483 136.607 94.3818 135.303C88.2825 132.429 87.9122 132.26 87.4017 132.117C86.2559 131.794 85.6441 131.973 84.9155 132.841C84.405 133.45 84.001 134.071 83.5132 134.998C83.0126 135.949 81.5946 139.133 81.1975 140.197Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social facebook" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M154.867 446.517C160.898 449.574 162.437 456.848 158.304 462.794L132.707 499.525C130.716 502.401 127.784 504.492 124.416 505.439C121.048 506.386 117.456 506.128 114.258 504.711L76.8738 485.735C70.8224 482.678 69.3462 474.925 73.5 469L98.9709 432.811C100.965 429.938 103.895 427.847 107.261 426.897C110.627 425.947 114.218 426.197 117.42 427.603L154.867 446.517Z",
                      fill: "#1958C4"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M158.009 448.878C158.157 449.046 158.304 449.194 158.431 449.363C158.71 449.71 158.964 450.076 159.19 450.459C159.343 450.676 159.483 450.901 159.612 451.134L152.464 436.88L152.274 436.522C152.274 436.395 152.105 436.311 152.042 436.206C151.816 435.827 151.569 435.461 151.304 435.109C151.304 435.109 151.178 434.92 151.093 434.835L150.861 434.624C150.566 434.301 150.249 433.998 149.913 433.718C149.768 433.58 149.612 433.453 149.449 433.338C148.929 432.927 148.372 432.567 147.783 432.263L110.378 413.286C109.88 413.041 109.365 412.83 108.839 412.654L108.438 412.527C107.955 412.375 107.462 412.256 106.962 412.169H106.836C106.137 412.068 105.433 412.012 104.727 412H104.411C103.868 412.003 103.326 412.038 102.787 412.105H102.682H102.408L101.206 412.337H100.953H100.742C100.3 412.449 99.8635 412.582 99.4349 412.738H99.2662C98.7455 412.928 98.2383 413.154 97.7481 413.413H97.5794L97.3896 413.518C96.8011 413.83 96.2309 414.175 95.6817 414.551L95.1124 414.973L94.6697 415.31L94.0793 415.837L93.6787 416.217L93.1094 416.828L92.772 417.187L91.9497 418.241L66.3102 454.971C65.0601 456.613 64.2833 458.566 64.064 460.617C63.8447 462.669 64.1913 464.742 65.0662 466.61L72.193 480.864C71.3233 478.993 70.9815 476.919 71.2045 474.868C71.4274 472.817 72.2067 470.866 73.4581 469.225L98.971 432.811L99.7933 431.757L100.089 431.44L100.7 430.787L101.08 430.428L101.691 429.88L102.134 429.543L102.724 429.1C103.273 428.723 103.844 428.378 104.432 428.067L104.769 427.898C105.269 427.643 105.783 427.418 106.309 427.223H106.519C106.948 427.068 107.384 426.934 107.827 426.823L108.291 426.717L109.492 426.485H109.851C110.397 426.419 110.946 426.384 111.496 426.38H111.812C112.517 426.393 113.222 426.449 113.92 426.549H114.047C114.546 426.638 115.039 426.758 115.523 426.907L115.923 427.034C116.45 427.21 116.964 427.421 117.463 427.666L154.868 446.643C155.451 446.947 156.008 447.3 156.533 447.697L156.997 448.098C157.351 448.335 157.689 448.596 158.009 448.878Z",
                      fill: "url(#paint3_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M137.262 462.899L133.045 460.791C129.797 459.104 128.174 460.2 126.719 462.267L123.535 466.863L131.273 470.891L125.264 477.553L118.538 474.032L105.718 492.461L97.6427 488.244L110.462 469.836L103.8 466.168L108.797 458.977L115.565 462.499L119.234 457.206C120.902 454.459 123.583 452.477 126.699 451.688C129.815 450.899 133.116 451.366 135.891 452.989C137.903 454.013 139.853 455.154 141.732 456.405L137.262 462.899Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social reddit" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M249.5 539.94C251.86 535.731 257.6 534.689 261.779 537.816L287.168 557.192C289.156 558.696 290.557 560.845 291.133 563.27C291.709 565.694 291.424 568.244 290.325 570.481L275.729 596.547C273.369 600.756 268 601.441 263.5 598.941L238.5 579.441C236.513 577.937 235.076 575.865 234.5 573.441C233.924 571.016 233.902 568.178 235 565.941L249.5 539.94Z",
                      fill: "#C73E00"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M251.842 537.635L252.218 537.349C252.469 537.17 252.73 537.004 252.999 536.853C253.18 536.763 253.33 536.643 253.511 536.568L243.138 541.243L242.868 541.363L242.642 541.513C242.364 541.664 242.098 541.835 241.845 542.025L241.65 542.145C241.591 542.196 241.536 542.251 241.485 542.31C241.241 542.506 241.015 542.722 240.808 542.957C240.718 543.062 240.613 543.152 240.523 543.272C240.215 543.636 239.943 544.029 239.711 544.445L225.129 570.511C224.937 570.853 224.771 571.21 224.633 571.578C224.633 571.684 224.633 571.774 224.513 571.864C224.393 572.21 224.303 572.555 224.212 572.916C224.211 572.941 224.211 572.966 224.212 572.991C224.107 573.486 224.042 573.989 224.017 574.495C224.017 574.495 224.017 574.585 224.017 574.63V574.72C223.994 575.111 223.994 575.502 224.017 575.893C224.009 575.957 224.009 576.023 224.017 576.088C224.041 576.381 224.081 576.672 224.137 576.96C224.137 576.96 224.137 577.08 224.137 577.14C224.13 577.19 224.13 577.241 224.137 577.291C224.137 577.606 224.287 577.922 224.378 578.238V578.358C224.503 578.736 224.649 579.107 224.814 579.47V579.575C224.833 579.624 224.858 579.669 224.889 579.711C225.081 580.144 225.307 580.561 225.565 580.958L225.851 581.364L226.076 581.695L226.437 582.131L226.678 582.432L227.114 582.853L227.354 583.093C227.586 583.315 227.832 583.52 228.091 583.709L253.48 603.086C254.613 604.024 255.981 604.634 257.435 604.852C258.89 605.069 260.376 604.885 261.733 604.319L272.106 599.659C270.748 600.225 269.262 600.409 267.808 600.192C266.353 599.974 264.986 599.364 263.853 598.426L238.448 579.049C238.192 578.854 237.952 578.644 237.726 578.433C237.649 578.371 237.578 578.3 237.516 578.223C237.351 578.072 237.2 577.922 237.05 577.757C236.962 577.668 236.881 577.573 236.809 577.471L236.449 577.035C236.359 576.93 236.283 576.81 236.208 576.704C236.133 576.599 236.013 576.419 235.908 576.268C235.652 575.863 235.442 575.442 235.231 575.021C235.197 574.933 235.157 574.847 235.111 574.765C234.961 574.404 234.81 574.044 234.69 573.668V573.502C234.594 573.196 234.514 572.885 234.449 572.57C234.444 572.46 234.444 572.35 234.449 572.24C234.39 571.952 234.345 571.661 234.314 571.368C234.322 571.278 234.322 571.187 234.314 571.097C234.292 570.712 234.292 570.325 234.314 569.94C234.314 569.865 234.314 569.789 234.314 569.714C234.342 569.21 234.402 568.708 234.495 568.211C234.495 568.211 234.495 568.211 234.495 568.121C234.572 567.764 234.672 567.412 234.795 567.069L234.9 566.783C235.044 566.418 235.21 566.061 235.396 565.716L249.993 539.634C250.225 539.227 250.492 538.839 250.79 538.477C250.882 538.364 250.983 538.259 251.09 538.161C251.332 537.973 251.583 537.798 251.842 537.635Z",
                      fill: "url(#paint4_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      "fill-rule": "evenodd",
                      "clip-rule": "evenodd",
                      d: "M248.32 556.614C248.311 556.731 248.353 556.979 248.395 557.059C248.414 557.094 248.593 557.293 248.794 557.5C248.995 557.707 250.186 558.941 251.44 560.243C252.695 561.544 253.975 562.868 254.284 563.185C254.593 563.503 255.057 563.983 255.313 564.253C255.57 564.523 255.786 564.747 255.793 564.752C255.801 564.757 255.682 564.971 255.53 565.228C253.837 568.081 252.907 571.27 252.859 574.386C252.854 574.715 252.841 574.999 252.829 575.017C252.817 575.034 252.734 575.062 252.645 575.077C252.371 575.124 251.789 575.352 251.514 575.52C250.53 576.119 249.888 577.034 249.651 578.173C249.474 579.026 249.659 580.088 250.125 580.895C250.817 582.093 252.161 582.84 253.586 582.819C254.144 582.811 254.915 582.615 255.329 582.377C255.415 582.328 255.502 582.288 255.522 582.288C255.542 582.289 255.613 582.346 255.68 582.415C256.178 582.933 257.23 583.678 257.969 584.036C259.455 584.756 261.156 585.012 263.034 584.799C267.235 584.32 271.539 581.488 274.562 577.212C276.339 574.7 277.446 572.267 278.048 569.555C278.977 565.369 278.316 561.483 276.235 558.892C275.669 558.186 275.186 557.758 274.304 557.177C273.738 556.805 273.537 556.69 273.183 556.539C272.946 556.437 272.723 556.348 272.686 556.34C272.635 556.329 272.623 556.251 272.635 556.012C272.683 555.014 272.319 554.009 271.628 553.231C271.401 552.975 271.309 552.9 270.857 552.602C270.404 552.303 270.301 552.249 269.968 552.138C268.186 551.544 266.178 552.313 265.289 553.929C264.827 554.77 264.676 555.606 264.83 556.47C264.852 556.593 264.863 556.704 264.854 556.716C264.845 556.729 264.593 556.85 264.293 556.985C262.024 558.005 259.945 559.561 258.153 561.58C257.687 562.105 257.018 562.947 256.783 563.303L256.597 563.584L256.524 563.504C256.483 563.46 256.277 563.247 256.064 563.032C255.852 562.817 255.408 562.36 255.078 562.017C254.747 561.674 253.941 560.841 253.285 560.166C251.633 558.464 249.96 556.735 249.956 556.727C249.954 556.723 250.311 556.375 250.75 555.953C251.699 555.04 252.658 554.113 253.375 553.414C253.663 553.134 254.104 552.708 254.355 552.467L254.811 552.029L255.094 552.181C255.695 552.504 256.332 552.584 257.057 552.428C257.563 552.319 257.94 552.137 258.35 551.801C258.547 551.639 258.628 551.541 258.869 551.174C259.165 550.723 259.22 550.596 259.318 550.131C259.397 549.76 259.397 549.425 259.319 549.006C259.15 548.103 258.703 547.467 257.902 546.994C257.228 546.596 256.66 546.506 255.86 546.672C255.313 546.786 255.042 546.906 254.637 547.216C254.389 547.404 254.314 547.486 254.061 547.845C253.724 548.321 253.579 548.671 253.507 549.184C253.431 549.721 253.556 550.469 253.786 550.851C253.83 550.925 253.854 551.004 253.838 551.028C253.806 551.076 253.02 551.852 252.189 552.655C251.877 552.957 251.095 553.719 250.451 554.348C249.807 554.977 249.109 555.658 248.901 555.86C248.503 556.246 248.332 556.468 248.32 556.614ZM258.847 572.77C259.253 572.402 259.713 572.18 260.3 572.068C261.116 571.912 261.83 572.076 262.533 572.581C263.135 573.014 263.485 573.529 263.663 574.244C263.93 575.316 263.6 576.428 262.797 577.164C262.56 577.381 262.01 577.695 261.698 577.79C261.082 577.98 260.421 577.967 259.813 577.754C259.544 577.659 259.436 577.599 259.09 577.35C258.654 577.038 258.478 576.847 258.242 576.434C257.916 575.863 257.78 574.969 257.924 574.344C258.053 573.786 258.423 573.155 258.847 572.77ZM265.849 562.08C266.578 561.306 267.713 560.996 268.795 561.276C269.188 561.378 269.833 561.779 270.132 562.107C270.531 562.544 270.736 562.943 270.856 563.514C271.202 565.147 270.122 566.735 268.471 567.02C267.623 567.166 266.911 566.998 266.211 566.486C265.685 566.101 265.369 565.672 265.175 565.079C264.822 563.998 265.066 562.912 265.849 562.08ZM266.107 577.572C266.195 577.525 266.417 577.443 266.599 577.39C267.492 577.131 268.353 576.513 269.407 575.375C269.953 574.785 270.273 574.378 270.71 573.715C271.148 573.051 271.396 572.597 271.724 571.862C272.362 570.431 272.589 569.396 272.466 568.478C272.405 568.014 272.435 567.796 272.589 567.606C272.913 567.203 273.541 567.26 273.771 567.712C273.94 568.043 273.971 569.017 273.838 569.814C273.674 570.803 273.233 572.151 272.793 573.01C272.522 573.539 271.262 575.45 270.883 575.906C270.514 576.351 270.193 576.664 269.5 577.257C268.487 578.122 267.788 578.539 266.905 578.803C266.456 578.937 266.276 578.925 266.03 578.743C265.802 578.574 265.718 578.38 265.753 578.101C265.783 577.863 265.906 577.68 266.107 577.572Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social youtube" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M251.432 134.723C253.741 132.481 257.244 132.914 259.284 135.705L271.777 152.853C272.757 154.19 273.242 155.825 273.148 157.48C273.054 159.135 272.388 160.705 271.263 161.922L256.998 175.77C254.703 178.009 251.2 177.576 249.146 174.788L236.703 157.674C235.724 156.337 235.239 154.701 235.331 153.046C235.423 151.391 236.086 149.82 237.208 148.599L251.432 134.723Z",
                      fill: "#A40001"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M252.966 133.696L253.254 133.581C253.451 133.512 253.652 133.457 253.857 133.416C253.979 133.379 254.104 133.352 254.23 133.335L246.732 134.345L246.543 134.371L246.359 134.426C246.158 134.469 245.96 134.525 245.756 134.59L245.605 134.631L245.446 134.667C245.259 134.752 245.077 134.849 244.902 134.958C244.85 135.031 244.731 135.045 244.655 135.102C244.39 135.277 244.142 135.475 243.912 135.694L229.678 149.55C229.487 149.735 229.312 149.934 229.152 150.146L229.037 150.31C228.888 150.498 228.75 150.696 228.625 150.901L228.591 150.95C228.432 151.25 228.293 151.561 228.174 151.879L228.128 151.944L228.094 151.994C228.011 152.238 227.942 152.488 227.889 152.741L227.87 152.874L227.785 153.449L227.763 153.568L227.767 153.668C227.748 153.886 227.744 154.103 227.739 154.319L227.699 154.376C227.71 154.64 227.729 154.91 227.76 155.163L227.769 155.254C227.778 155.286 227.784 155.319 227.786 155.352C227.841 155.658 227.903 155.97 227.986 156.272L228.093 156.59C228.115 156.678 228.145 156.764 228.181 156.847L228.321 157.189L228.421 157.43L228.613 157.783C228.671 157.823 228.688 157.921 228.72 157.98C228.829 158.166 228.947 158.346 229.075 158.52L241.705 175.838C242.26 176.645 243.024 177.286 243.915 177.693C244.805 178.1 245.79 178.258 246.763 178.149L254.261 177.14C253.288 177.243 252.305 177.078 251.419 176.664C250.533 176.249 249.776 175.6 249.232 174.787L236.702 157.674C236.578 157.502 236.462 157.323 236.356 157.139C236.307 157.105 236.3 157.027 236.262 156.976C236.225 156.926 236.115 156.715 236.057 156.589L235.959 156.362C235.909 156.242 235.853 156.13 235.811 156.015C235.777 155.929 235.749 155.84 235.728 155.75C235.683 155.644 235.645 155.536 235.613 155.426C235.525 155.122 235.46 154.812 235.42 154.498L235.387 154.317C235.352 154.056 235.332 153.793 235.327 153.53L235.329 153.422C235.327 153.205 235.336 152.987 235.357 152.771L235.375 152.552C235.392 152.359 235.42 152.167 235.46 151.977L235.486 151.8C235.543 151.546 235.616 151.295 235.704 151.05L235.785 150.935C235.899 150.615 236.038 150.305 236.201 150.006L236.235 149.957C236.358 149.747 236.498 149.546 236.653 149.359L236.768 149.195C236.93 148.989 237.104 148.793 237.288 148.607L251.537 134.748C251.766 134.529 252.014 134.331 252.279 134.156L252.518 134.006C252.662 133.896 252.812 133.792 252.966 133.696Z",
                      fill: "url(#paint8_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M260.692 144.273C260.207 143.767 259.594 143.402 258.917 143.217C258.553 143.185 258.186 143.227 257.839 143.341C257.491 143.455 257.17 143.637 256.895 143.878C254.593 145.674 251.249 148.681 251.249 148.681C251.249 148.681 247.847 151.807 245.585 154.069C244.945 154.666 244.529 155.465 244.407 156.333C244.381 157.154 244.563 157.969 244.936 158.702C245.499 159.717 246.122 160.698 246.801 161.638L247.75 162.935C248.432 163.853 249.168 164.729 249.955 165.559C250.471 166.089 251.133 166.454 251.857 166.607C252.744 166.553 253.581 166.18 254.213 165.556C255.605 164.418 259.758 160.39 259.758 160.39C259.758 160.39 262.986 157.217 264.965 154.976C265.529 154.401 265.877 153.649 265.951 152.847C265.926 152.09 265.725 151.349 265.365 150.682C264.832 149.74 264.248 148.827 263.615 147.948L262.731 146.733C262.097 145.877 261.416 145.056 260.692 144.273ZM255.432 158.273L251.998 153.583L258.02 151.945L255.432 158.273Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social instagram" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M325.876 236.568C334.914 232.923 344.133 238.074 346.664 248.107L362.33 310.169C363.566 315.005 363.082 320.12 360.96 324.638C358.838 329.157 355.212 332.796 350.701 334.934L295.297 357.62C286.259 361.295 277.01 356.143 274.509 346.141L258.843 284.079C257.587 279.238 258.062 274.111 260.185 269.584C262.309 265.057 265.947 261.413 270.472 259.284L325.876 236.568Z",
                      fill: "url(#paint5_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M331.299 235.453C331.609 235.423 331.922 235.423 332.233 235.453C332.858 235.482 333.481 235.542 334.1 235.634L335.245 235.845L313.222 230.211H312.65H312.077C311.461 230.094 310.836 230.024 310.209 230H309.276C308.673 230 308.04 230 307.438 230.181H306.564C305.637 230.368 304.73 230.641 303.853 230.994L248.448 253.68C247.706 253.981 246.991 254.344 246.309 254.765L245.797 255.066C245.195 255.458 244.592 255.879 244.02 256.331C243.266 256.96 242.561 257.644 241.911 258.38L241.7 258.561V258.711C241.185 259.3 240.712 259.925 240.284 260.579C240.196 260.678 240.125 260.79 240.073 260.911C239.772 261.393 239.47 261.905 239.199 262.417L238.988 262.748C239 262.838 239 262.93 238.988 263.02C238.717 263.592 238.446 264.195 238.205 264.797V265.038C237.934 265.761 237.693 266.544 237.482 267.298C237.482 267.298 237.482 267.448 237.482 267.539C237.482 267.629 237.482 267.75 237.482 267.84C237.263 268.763 237.102 269.699 237 270.642C237 270.973 237 271.305 237 271.636C237 271.967 237 272.178 237 272.449C237 272.721 237 273.203 237 273.564C237.015 273.825 237.015 274.087 237 274.347C237 274.739 237 275.161 237.151 275.553C237.136 275.783 237.136 276.015 237.151 276.246C237.151 276.878 237.392 277.481 237.542 278.113L253.208 340.176C253.814 343.058 255.194 345.72 257.201 347.876C259.208 350.031 261.765 351.598 264.597 352.407L286.68 358.041C283.848 357.232 281.291 355.665 279.284 353.51C277.277 351.354 275.897 348.692 275.292 345.81L259.626 283.747C259.452 283.124 259.321 282.49 259.234 281.849C259.234 281.668 259.234 281.457 259.234 281.277C259.234 281.096 259.234 280.403 259.083 279.951C258.933 279.499 259.083 279.469 259.083 279.228C259.083 278.987 259.083 278.445 259.083 278.083C259.083 277.722 259.083 277.541 259.083 277.24C259.083 276.938 259.083 276.547 259.083 276.215C259.205 275.273 259.376 274.338 259.596 273.414C259.596 273.233 259.596 273.052 259.596 272.871C259.791 272.094 260.032 271.33 260.319 270.582V270.28C260.56 269.678 260.831 269.105 261.102 268.503L261.403 267.9C261.704 267.388 261.976 266.906 262.307 266.394L262.578 265.942C263.03 265.309 263.512 264.677 264.024 264.074L264.325 263.773C264.967 263.02 265.673 262.325 266.434 261.694C267.002 261.238 267.596 260.816 268.212 260.429L268.724 260.127C269.413 259.728 270.127 259.376 270.863 259.073L326.267 236.357C327.149 236.017 328.056 235.745 328.979 235.543H329.822C330.312 235.477 330.805 235.447 331.299 235.453Z",
                      fill: "url(#paint6_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M307.443 281.408C303.378 283.297 300.095 286.538 298.154 290.577C296.212 294.617 295.733 299.206 296.798 303.56C297.287 305.543 298.211 307.393 299.504 308.975C300.797 310.557 302.426 311.831 304.273 312.705C306.12 313.579 308.138 314.03 310.182 314.026C312.225 314.022 314.241 313.563 316.085 312.683C320.169 310.828 323.477 307.606 325.44 303.573C327.403 299.539 327.897 294.948 326.837 290.589C326.359 288.586 325.438 286.716 324.14 285.116C322.843 283.517 321.203 282.229 319.342 281.348C317.481 280.467 315.445 280.015 313.386 280.025C311.326 280.036 309.296 280.508 307.443 281.408ZM314.513 307.173C313.317 307.765 312.003 308.078 310.669 308.089C309.335 308.1 308.016 307.809 306.81 307.238C305.605 306.667 304.544 305.83 303.708 304.79C302.872 303.751 302.282 302.536 301.983 301.236C301.288 298.408 301.605 295.426 302.879 292.808C304.153 290.19 306.304 288.101 308.958 286.903C310.152 286.317 311.463 286.008 312.793 285.999C314.123 285.99 315.438 286.282 316.64 286.852C317.842 287.422 318.899 288.256 319.734 289.292C320.568 290.327 321.158 291.538 321.46 292.834C322.153 295.659 321.838 298.637 320.57 301.255C319.302 303.873 317.159 305.966 314.513 307.173ZM326.394 272.568C326.647 273.581 326.536 274.652 326.079 275.591C325.622 276.531 324.849 277.279 323.896 277.706C323.466 277.918 322.995 278.03 322.516 278.034C322.037 278.039 321.564 277.935 321.131 277.731C320.698 277.527 320.317 277.228 320.015 276.856C319.714 276.484 319.501 276.048 319.391 275.582C319.143 274.564 319.257 273.491 319.714 272.548C320.172 271.605 320.943 270.851 321.897 270.415C322.328 270.211 322.8 270.105 323.278 270.106C323.756 270.107 324.227 270.214 324.658 270.421C325.089 270.627 325.468 270.927 325.769 271.298C326.069 271.669 326.283 272.103 326.394 272.568ZM337.343 271.96C336.669 269.462 335.537 267.111 334.006 265.026C332.753 263.327 331.091 261.972 329.175 261.086C327.261 260.161 325.147 259.725 323.023 259.818C320.453 259.92 317.923 260.478 315.548 261.466C312.384 262.664 311.375 263.045 303.44 266.491C295.506 269.937 294.533 270.296 291.424 271.873C288.984 272.977 286.73 274.452 284.742 276.247C282.983 277.882 281.554 279.839 280.533 282.013C279.499 284.167 278.902 286.505 278.776 288.891C278.558 291.558 278.776 294.243 279.421 296.84C280.204 300.08 280.434 301.203 282.671 309.467C284.908 317.731 285.252 318.761 286.293 321.946C287.005 324.392 288.147 326.692 289.666 328.737C290.944 330.421 292.615 331.767 294.533 332.656C296.438 333.574 298.537 334.016 300.65 333.945C303.232 333.834 305.774 333.269 308.16 332.276C311.296 331.07 312.305 330.69 320.261 327.28C328.216 323.87 329.14 323.467 332.249 321.89C334.694 320.796 336.95 319.319 338.931 317.516C342.487 314.248 344.711 309.781 345.175 304.973C345.375 302.293 345.15 299.599 344.509 296.989C343.754 293.756 343.524 292.633 341.259 284.362C338.994 276.091 338.384 275.144 337.343 271.96ZM338.904 299.054C339.396 301.082 339.559 303.177 339.387 305.258C339.325 306.805 338.938 308.323 338.249 309.71C337.598 311.131 336.662 312.402 335.501 313.447C333.99 314.855 332.258 316.004 330.374 316.85C327.323 318.321 326.392 318.873 318.601 322.113C310.811 325.352 309.836 325.954 306.73 327.046C304.923 327.824 302.987 328.257 301.022 328.324C299.645 328.391 298.274 328.114 297.032 327.517C295.794 326.925 294.716 326.045 293.887 324.95C292.736 323.382 291.878 321.617 291.356 319.743C290.373 316.451 290.034 315.635 287.818 307.529C285.602 299.422 285.343 298.414 284.624 295.159C284.117 293.178 283.932 291.129 284.076 289.09C284.169 287.537 284.558 286.016 285.221 284.609C285.865 283.195 286.799 281.931 287.962 280.901C289.474 279.495 291.206 278.346 293.088 277.498C296.139 276.027 297.1 275.482 304.869 272.207C312.638 268.932 313.634 268.365 316.733 267.302C318.55 266.546 320.483 266.104 322.448 265.996C323.818 265.967 325.175 266.256 326.413 266.842C327.651 267.427 328.736 268.292 329.583 269.369C330.727 270.949 331.593 272.712 332.142 274.584C333.162 277.732 333.436 278.684 335.673 286.826C337.911 294.969 338.299 295.828 338.904 299.054Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social badu" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M372.315 41.5044C377.45 44.017 378.718 50.1968 375.235 55.151L353.808 86.015C352.148 88.4544 349.685 90.2342 346.848 91.0444C344.01 91.8547 340.979 91.6441 338.281 90.4492L306.969 74.6544C301.826 72.1259 300.55 65.9697 304.033 61.0155L325.444 30.1592C327.106 27.7242 329.898 25.5129 332.732 24.7003C335.566 23.8876 338.043 24.1837 340.743 25.3679L372.315 41.5044Z",
                      fill: "#844DFB"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M374.912 43.4726L375.269 43.8892C375.5 44.1721 375.709 44.4713 375.897 44.7843C376.009 44.9787 376.106 45.181 376.188 45.3897L370.166 33.4525L370.02 33.1498L369.875 32.8471C369.687 32.5341 369.478 32.235 369.247 31.952C369.201 31.8564 369.163 31.7767 369.125 31.697L368.938 31.5124C368.686 31.243 368.415 30.9931 368.126 30.7647L367.752 30.4349C367.309 30.0911 366.83 29.795 366.325 29.5515L334.878 13.8022C334.463 13.5952 334.032 13.4221 333.589 13.2847L333.243 13.1767C332.837 13.0395 332.421 12.938 331.998 12.8734C331.428 12.7789 330.853 12.728 330.276 12.7211L330.148 12.7825C329.682 12.7913 329.222 12.8161 328.755 12.8645C328.755 12.8645 328.628 12.9258 328.548 12.9642L327.541 13.1548L327.35 13.2468C327.35 13.2468 327.254 13.2929 327.19 13.3235C326.856 13.4846 326.467 13.5342 326.102 13.6711C326.102 13.6711 326.022 13.7094 325.974 13.7324C325.543 13.9106 325.123 14.1129 324.715 14.3384C324.715 14.3384 324.62 14.3844 324.588 14.3998C324.556 14.4151 324.477 14.4535 324.429 14.4765C323.929 14.736 323.447 15.0273 322.984 15.3486C322.809 15.433 322.634 15.5174 322.512 15.7133L322.128 16.016C321.953 16.1004 321.815 16.3039 321.647 16.4438C321.479 16.5836 321.431 16.6462 321.31 16.763C321.19 16.8798 320.989 17.1141 320.836 17.2858L320.563 17.5743C320.315 17.8594 320.086 18.1597 319.877 18.4736L298.45 49.3376C297.408 50.7193 296.763 52.3596 296.585 54.0812C296.407 55.8028 296.704 57.5402 297.442 59.1056L303.464 71.0428C302.732 69.4736 302.441 67.735 302.622 66.0131C302.802 64.2911 303.447 62.6506 304.488 61.2671L325.444 30.1588C325.662 29.8378 325.896 29.5487 326.13 29.2596C326.201 29.1709 326.279 29.0874 326.363 29.01C326.54 28.807 326.709 28.6276 326.893 28.4406C326.997 28.3358 327.107 28.2371 327.222 28.1449C327.413 28.0529 327.543 27.8334 327.711 27.6935L328.095 27.3908C328.271 27.3065 328.446 27.2221 328.583 27.0185C329.077 26.7807 329.517 26.4314 330.012 26.1541L330.299 26.016C330.706 25.7901 331.126 25.5878 331.557 25.41C331.557 25.41 331.669 25.3563 331.732 25.3256C332.09 25.1901 332.456 25.0793 332.829 24.994C332.94 24.9403 333.052 24.8866 333.179 24.8253L334.187 24.6347L334.503 24.5999C334.957 24.5387 335.415 24.5085 335.873 24.5096L336.126 24.5055C336.708 24.5098 337.289 24.5581 337.864 24.6501C338.285 24.7257 338.701 24.827 339.109 24.9534L339.439 25.069C339.882 25.2065 340.314 25.3795 340.729 25.5865L372.316 41.5041C372.816 41.7503 373.289 42.0489 373.726 42.3951C373.863 42.4933 373.994 42.601 374.116 42.7173C374.4 42.9484 374.666 43.2009 374.912 43.4726Z",
                      fill: "url(#paint7_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      "fill-rule": "evenodd",
                      "clip-rule": "evenodd",
                      d: "M336.842 37.6654C334.013 36.8255 330.195 37.4701 327.742 39.202C326.419 40.1358 324.999 41.6708 324.33 42.8905C323.752 43.9438 322.849 46.5493 322.537 48.0638C321.119 54.9517 323.549 63.0564 328.586 68.2315C329.626 69.3008 330.036 69.5937 332.07 70.7256C334.887 72.2929 336.145 72.6312 339.758 72.7936C342.649 72.9236 344.593 72.682 347.466 71.8353C352.515 70.347 356.584 67.3831 359.393 63.1462C362.486 58.4819 361.38 51.9293 356.933 48.5662C353.719 46.1354 349.363 45.7292 345.884 47.5359C345.244 47.8678 344.68 48.1366 344.629 48.1332C344.578 48.1297 344.484 47.5186 344.42 46.7752C344.054 42.5488 341.026 38.908 336.842 37.6654ZM335.266 49.9312C333.744 53.5443 335.071 57.442 338.456 59.3035C340.355 60.348 341.77 60.5051 343.85 59.9026C345.784 59.3425 346.757 58.6896 347.865 57.2079L348.69 56.1054L350.434 57.1229L352.178 58.1403L351.558 59.1487C349.067 63.2037 343.692 65.2847 339.048 63.9923C337.602 63.5899 335.294 62.3212 334.18 61.3158C332.465 59.7677 331.185 57.4376 330.703 54.9851C330.402 53.456 330.475 51.2349 330.867 49.9485C331.249 48.6963 331.911 47.1887 332.104 47.1329C332.193 47.1071 333.033 47.5077 333.97 48.0232L335.675 48.9606L335.266 49.9312Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social linkedin" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M344 424C347.5 421 352.924 421.391 356.044 425.542L375.345 451.296C376.858 453.298 377.627 455.765 377.519 458.272C377.411 460.78 376.433 463.171 374.754 465.036L353.439 486.246C350 489.7 344.682 489.109 341.577 484.958L322.261 459.204C320.75 457.198 319.982 454.729 320.09 452.22C320.198 449.711 320.822 447.369 322.5 445.5L344 424Z",
                      fill: "#217DE3"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M346.47 422.648L346.894 422.482C347.188 422.363 347.492 422.272 347.803 422.209L348.364 422.073L337.032 423.754H336.744L336.471 423.83L335.562 424.103L335.335 424.178L335.138 424.284C334.85 424.41 334.571 424.557 334.305 424.724L333.926 424.951C333.542 425.228 333.178 425.532 332.836 425.86L311.52 447.145C311.243 447.425 310.985 447.724 310.748 448.039L310.566 448.296C310.354 448.592 310.162 448.9 309.99 449.22C309.765 449.66 309.572 450.116 309.415 450.584V450.705C309.415 450.705 309.415 450.705 309.415 450.796C309.293 451.159 309.202 451.538 309.112 451.932C309.112 451.932 309.112 452.053 309.112 452.114C309.112 452.417 309.021 452.705 309.005 452.992C308.998 453.053 308.998 453.114 309.005 453.174V453.326C309.005 453.659 309.005 453.992 309.005 454.31V454.477C309.005 454.871 309.005 455.265 309.112 455.659C309.119 455.704 309.119 455.75 309.112 455.795C309.12 455.845 309.12 455.897 309.112 455.947C309.202 456.416 309.293 456.886 309.43 457.34C309.476 457.505 309.532 457.667 309.596 457.825C309.635 457.959 309.68 458.09 309.733 458.219C309.733 458.386 309.869 458.552 309.945 458.719L310.111 459.083C310.203 459.264 310.305 459.441 310.414 459.613C310.461 459.719 310.517 459.82 310.581 459.916C310.748 460.188 310.929 460.461 311.111 460.719L330.427 486.473C331.266 487.696 332.424 488.666 333.775 489.278C335.127 489.889 336.62 490.119 338.092 489.942L349.424 488.26C347.953 488.436 346.462 488.207 345.112 487.598C343.761 486.989 342.602 486.024 341.759 484.806L322.443 459.052C322.261 458.795 322.079 458.537 321.913 458.265C321.857 458.177 321.806 458.086 321.761 457.992L321.443 457.416C321.386 457.308 321.336 457.197 321.292 457.083C321.216 456.901 321.125 456.734 321.064 456.553C321.01 456.425 320.964 456.293 320.928 456.159L320.746 455.659C320.615 455.201 320.514 454.736 320.443 454.265C320.436 454.174 320.436 454.083 320.443 453.992C320.38 453.596 320.34 453.196 320.322 452.796V452.644C320.322 452.311 320.322 451.977 320.322 451.659C320.314 451.548 320.314 451.437 320.322 451.326C320.342 451.031 320.377 450.738 320.428 450.447V450.175C320.519 449.796 320.61 449.417 320.731 449.039L320.807 448.826C320.966 448.357 321.164 447.901 321.398 447.463V447.387C321.566 447.06 321.758 446.746 321.973 446.448L322.155 446.206C322.396 445.889 322.654 445.586 322.928 445.297L344.243 424.087C344.577 423.751 344.943 423.447 345.334 423.178C345.455 423.088 345.591 423.027 345.713 422.951C345.96 422.839 346.213 422.738 346.47 422.648Z",
                      fill: "url(#paint0_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M352.606 472.702L348.334 476.928L336.987 461.855L341.274 457.643L352.606 472.702ZM337.608 457.961C337.335 458.307 336.986 458.586 336.588 458.774C336.19 458.963 335.753 459.056 335.313 459.047C334.872 459.038 334.44 458.928 334.049 458.723C333.659 458.519 333.321 458.227 333.063 457.87C332.513 457.076 332.275 456.106 332.395 455.148C332.515 454.189 332.985 453.308 333.714 452.674C333.986 452.327 334.334 452.048 334.731 451.858C335.129 451.668 335.565 451.573 336.006 451.58C336.446 451.588 336.879 451.697 337.27 451.9C337.661 452.103 338 452.394 338.259 452.75C338.821 453.543 339.065 454.518 338.944 455.482C338.824 456.446 338.347 457.33 337.608 457.961ZM369.725 455.855L364.877 460.627L359.029 452.826C357.514 450.78 355.681 450.144 354.015 451.78C353.493 452.317 353.131 452.987 352.968 453.717C352.804 454.448 352.847 455.209 353.09 455.916C353.281 456.406 353.559 456.857 353.909 457.249L359.968 465.4L355.166 470.141C355.166 470.141 344.834 456.264 343.819 454.992L348.621 450.25L350.409 452.613C350.186 451.384 350.288 450.119 350.706 448.941C351.123 447.764 351.841 446.717 352.787 445.902C355.817 442.872 359.847 442.721 363.392 447.417L369.725 455.855Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social twitter" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M490.21 107.5L490.81 107.044C491.225 106.768 491.658 106.519 492.106 106.3C492.37 106.142 492.642 105.998 492.921 105.868L476.127 112.802L475.696 112.994L475.312 113.234C474.862 113.457 474.428 113.714 474.016 114.001C473.907 114.056 473.803 114.121 473.704 114.193L473.416 114.433C473.031 114.75 472.663 115.086 472.313 115.441L471.833 115.921C471.334 116.489 470.884 117.099 470.489 117.744L445.946 158.529C445.633 159.072 445.353 159.633 445.107 160.209C445.107 160.377 444.987 160.52 444.915 160.664C444.723 161.216 444.531 161.768 444.387 162.32C444.215 163.111 444.095 163.912 444.027 164.719C444.027 164.719 444.027 164.863 444.027 164.935C443.991 165.558 443.991 166.183 444.027 166.806V166.926C444.027 166.926 444.027 167.142 444.027 167.238C444.027 167.694 444.027 168.174 444.195 168.63C444.183 168.725 444.183 168.822 444.195 168.917C444.195 168.917 444.195 169.085 444.195 169.157C444.195 169.661 444.411 170.165 444.531 170.669C444.542 170.74 444.542 170.813 444.531 170.885C444.703 171.489 444.911 172.081 445.155 172.66V172.852C445.185 172.929 445.226 173.001 445.275 173.068C445.567 173.768 445.903 174.45 446.282 175.107L446.714 175.779L447.074 176.307C447.244 176.549 447.429 176.781 447.626 177.003L448.01 177.506L448.657 178.202C448.801 178.346 448.897 178.49 449.041 178.61C449.4 178.965 449.776 179.301 450.169 179.618L489.754 211.766C491.512 213.321 493.662 214.366 495.97 214.789C498.279 215.212 500.659 214.996 502.854 214.165L519.648 207.232C517.449 208.062 515.065 208.278 512.753 207.855C510.441 207.432 508.287 206.387 506.524 204.832L466.963 172.684C466.57 172.368 466.194 172.031 465.835 171.676C465.729 171.559 465.617 171.446 465.499 171.341L464.78 170.573L464.42 170.093C464.222 169.864 464.038 169.623 463.868 169.373L463.508 168.821C463.342 168.599 463.19 168.367 463.052 168.126C462.67 167.474 462.326 166.801 462.02 166.11C462.02 165.966 461.901 165.847 461.853 165.703C461.605 165.117 461.397 164.516 461.229 163.903V163.663C461.085 163.159 460.989 162.656 460.893 162.152C460.797 161.648 460.893 161.792 460.893 161.624C460.821 161.163 460.773 160.699 460.749 160.233C460.737 160.089 460.737 159.944 460.749 159.801C460.713 159.177 460.713 158.553 460.749 157.929C460.749 157.929 460.749 157.713 460.749 157.594C460.805 156.785 460.925 155.983 461.109 155.194V155.05C461.253 154.499 461.445 153.947 461.637 153.395C461.637 153.251 461.757 153.107 461.829 152.939C462.065 152.359 462.346 151.797 462.668 151.26L487.211 110.474C487.606 109.83 488.056 109.22 488.555 108.651L489.035 108.171C489.416 107.929 489.808 107.705 490.21 107.5Z",
                      fill: "url(#paint1_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M487 110.5C490.959 103.903 499.639 103.061 506.044 108.244L545.606 140.392C548.699 142.891 550.826 146.388 551.623 150.284C552.42 154.18 551.836 158.232 549.973 161.744L525.429 202.53C521.471 209.127 513.074 210.279 506.692 205.097L467.13 172.948C464.033 170.452 461.902 166.957 461.1 163.061C460.299 159.165 460.139 155.516 462 152L487 110.5Z",
                      fill: "#217DE3"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M512.451 133.051L513.482 133.867C523.99 142.36 529.796 159.945 518.28 174.196C514.859 178.413 510.282 181.539 505.109 183.193C505.661 182.641 506.189 182.065 506.717 181.441C509.545 177.936 511.086 173.566 511.083 169.062C509.719 170.66 507.886 171.787 505.844 172.283C503.802 172.778 501.656 172.617 499.711 171.821C500.204 171.428 500.647 170.977 501.031 170.477C501.592 169.791 502.06 169.032 502.422 168.222C500.607 169.693 498.341 170.495 496.004 170.495C493.668 170.495 491.402 169.693 489.587 168.222C491.071 167.651 492.39 166.719 493.425 165.511C491.822 165.987 490.127 166.063 488.488 165.732C486.848 165.402 485.315 164.675 484.021 163.616C482.61 162.489 481.525 161.007 480.878 159.321C484.867 159.379 488.822 158.584 492.479 156.991C496.136 155.399 499.411 153.044 502.086 150.085C501.392 149.724 500.733 149.298 500.119 148.813C498.022 147.151 496.669 144.727 496.354 142.07C496.04 139.413 496.789 136.74 498.44 134.634C499.319 133.56 500.414 132.682 501.653 132.058C502.893 131.434 504.251 131.078 505.637 131.012C506.692 128.987 507.39 126.796 507.7 124.534C509.058 126.584 509.636 129.052 509.332 131.491C510.405 129.801 511.214 127.956 511.731 126.021C512.367 128.307 512.61 130.684 512.451 133.051Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social medium" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M537.928 333.014C540.701 336.171 539.823 340.812 536.084 343.442L513 359.744C511.203 361.022 509.057 361.63 506.93 361.466C504.803 361.302 502.828 360.375 501.341 358.844L484.573 339.46C481.807 336.291 482.684 331.65 486.406 329.027L509.49 312.725C511.289 311.445 513.438 310.835 515.567 311C517.696 311.165 519.513 311.465 521 313L537.928 333.014Z",
                      fill: "#29A424"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M539.167 335.096L539.299 335.483C539.372 335.749 539.432 336.018 539.477 336.291C539.497 336.464 539.533 336.629 539.541 336.796L538.768 326.769L538.747 326.507C538.734 326.423 538.716 326.34 538.692 326.259C538.656 325.987 538.6 325.719 538.526 325.456L538.477 325.256L538.394 325.069C538.299 324.818 538.186 324.573 538.073 324.328L537.901 323.997C537.695 323.64 537.459 323.304 537.195 322.991L520.45 303.528C520.225 303.279 519.984 303.045 519.73 302.827L519.526 302.659C519.288 302.463 519.036 302.283 518.774 302.121L518.704 302.089C518.335 301.873 517.946 301.695 517.542 301.556L517.368 301.476C517.057 301.361 516.739 301.264 516.417 301.188L516.358 301.161L516.219 301.097L515.478 300.964L515.338 300.9L515.234 300.852C514.958 300.819 514.68 300.801 514.401 300.797L514.308 300.754C513.967 300.761 513.633 300.785 513.292 300.822L513.199 300.779L513.072 300.81C512.667 300.859 512.265 300.937 511.868 301.044L511.442 301.174C511.328 301.203 511.217 301.241 511.108 301.288L510.66 301.468L510.35 301.593C510.189 301.667 510.034 301.76 509.867 301.846C509.701 301.933 509.689 301.928 509.609 301.98C509.363 302.12 509.124 302.272 508.893 302.437L485.69 318.966C484.603 319.677 483.71 320.671 483.108 321.845C482.505 323.018 482.214 324.326 482.267 325.629L483.006 335.669C482.945 334.368 483.231 333.06 483.831 331.887C484.431 330.714 485.324 329.721 486.412 329.014L509.496 312.713C509.736 312.556 509.965 312.394 510.212 312.255L510.448 312.141C510.614 312.054 510.774 311.949 510.947 311.88L511.246 311.75C511.401 311.688 511.562 311.614 511.711 311.563L512.057 311.455L512.488 311.312C512.886 311.21 513.288 311.132 513.693 311.078L513.935 311.041C514.275 311.004 514.61 310.98 514.951 310.973L515.067 311.027C515.348 311.026 515.627 311.041 515.905 311.07L516.183 311.109C516.434 311.134 516.682 311.178 516.924 311.241L517.122 311.332C517.445 311.409 517.762 311.506 518.073 311.62L518.247 311.7C518.649 311.845 519.038 312.024 519.41 312.233L519.479 312.265C519.745 312.43 520 312.611 520.243 312.808L520.464 312.91C520.723 313.13 520.965 313.371 521.189 313.628L537.957 333.013C538.226 333.317 538.465 333.65 538.668 334.007L538.84 334.338C538.966 334.582 539.075 334.835 539.167 335.096Z",
                      fill: "url(#paint9_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      "fill-rule": "evenodd",
                      "clip-rule": "evenodd",
                      d: "M512.93 317.68C512.806 317.662 510.512 319.341 510.379 319.547C510.305 319.661 510.372 319.821 510.656 320.208C511.081 320.787 511.149 321.258 510.873 321.712C510.752 321.911 509.144 323.124 504.927 326.197L499.146 330.409L498.692 330.315C498.291 330.231 498.191 330.157 497.839 329.677C497.557 329.295 497.395 329.147 497.289 329.176C497.206 329.199 496.589 329.631 495.918 330.136L494.698 331.055L497.232 334.503L499.766 337.952L501.093 336.977L502.42 336.002L501.803 335.111L501.186 334.22L507.09 329.882C510.338 327.496 513.019 325.576 513.048 325.616C513.077 325.656 512.675 326.219 512.154 326.867C511.633 327.515 510.946 328.376 510.627 328.78C510.308 329.185 509.413 330.309 508.64 331.279C506.1 334.461 502.169 339.409 501.807 339.877L501.453 340.337L502.603 341.903L503.754 343.469L504.188 343.297C504.751 343.073 507.01 342.21 511.058 340.671C512.011 340.308 512.838 339.992 516.82 338.465C520.781 336.946 521.278 336.761 521.357 336.773C521.397 336.779 518.748 338.755 515.469 341.164L509.508 345.545L508.873 344.733L508.239 343.92L506.872 344.888L505.506 345.856L508.547 349.949L511.589 354.042L512.752 353.234C514.368 352.112 514.347 352.144 513.85 351.467C513.491 350.979 513.45 350.864 513.491 350.455L513.536 349.993L519.283 345.735C523.485 342.621 525.113 341.456 525.341 341.399C525.888 341.264 526.255 341.437 526.699 342.041C527.185 342.703 527.127 342.718 528.689 341.519L529.826 340.645L526.703 336.349L523.581 332.052L523.329 332.116C523.191 332.151 522.618 332.36 522.055 332.581C521.492 332.801 520.638 333.133 520.158 333.318C517.628 334.292 514.067 335.676 512.64 336.24C511.752 336.591 511 336.843 510.969 336.8C510.938 336.758 511.419 336.096 512.038 335.33C513.365 333.689 513.915 333.004 515.847 330.591C516.641 329.6 517.631 328.364 518.048 327.846C518.465 327.328 518.922 326.759 519.064 326.582L519.322 326.26L516.175 321.978C514.444 319.622 512.984 317.688 512.93 317.68Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("g", { class: "social ok" }, [
                    vue_cjs_prod.createVNode("path", {
                      d: "M562.959 485.015C570.393 488.975 571.994 498.154 566.779 505.336L533.831 550.272C531.271 553.785 527.57 556.297 523.361 557.38C519.152 558.462 514.697 558.047 510.761 556.205L464.796 531.666C457.348 527.685 455.653 518.601 460.954 511.36L493.903 466.424C496.461 462.907 500.161 460.39 504.371 459.301C508.581 458.212 513.058 458.165 517 460L562.959 485.015Z",
                      fill: "#FF6100"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      d: "M566.656 488.076L567.116 488.745C567.466 489.161 567.775 489.61 568.038 490.085C568.231 490.366 568.424 490.647 568.617 490.928L560.132 472.987L559.85 472.577C559.745 472.447 559.65 472.31 559.567 472.166C559.255 471.712 558.958 471.28 558.631 470.804C558.568 470.689 558.493 470.581 558.408 470.48C558.344 470.366 558.27 470.257 558.185 470.156C557.834 469.743 557.451 469.357 557.041 469.001L556.474 468.5C555.823 467.986 555.133 467.524 554.41 467.119L508.424 442.595C507.819 442.266 507.19 441.986 506.542 441.756L506.03 441.567C505.423 441.379 504.832 441.213 504.197 441.077C503.35 440.904 502.489 440.814 501.625 440.808L501.406 440.768L501.298 440.842C500.614 440.83 499.93 440.854 499.248 440.915L498.899 440.964C498.398 441.022 497.89 441.116 497.383 441.211L497.071 441.266L496.876 441.4C496.318 441.528 495.767 441.684 495.224 441.868L495.051 441.986C494.398 442.207 493.758 442.466 493.135 442.763C493.071 442.793 493.012 442.833 492.962 442.882C492.898 442.942 492.825 442.992 492.746 443.031C492.076 443.491 491.28 443.816 490.574 444.27C490.336 444.433 490.098 444.596 489.839 444.775C489.644 444.892 489.457 445.021 489.277 445.161C488.996 445.354 488.737 445.533 488.478 445.711C488.283 445.829 488.096 445.958 487.916 446.097C487.635 446.29 487.354 446.484 487.192 446.85C487.019 446.953 486.853 447.067 486.695 447.192C486.337 447.597 485.972 448.038 485.644 448.487L452.717 493.408C451.118 495.415 450.098 497.821 449.766 500.365C449.435 502.91 449.805 505.497 450.837 507.846L459.322 525.787C458.293 523.437 457.925 520.851 458.256 518.307C458.587 515.763 459.606 513.357 461.202 511.349L494.151 466.413C494.479 465.963 494.829 465.531 495.202 465.118C495.331 465.014 495.469 464.919 495.612 464.835L496.408 464.002L496.927 463.645C497.207 463.452 497.488 463.259 497.748 463.081L498.353 462.664C498.591 462.501 498.85 462.323 499.088 462.159C499.81 461.66 500.573 461.22 501.367 460.846C501.497 460.757 501.627 460.668 501.756 460.579C502.393 460.3 503.029 460.022 503.673 459.802L503.889 459.653C504.424 459.474 504.969 459.323 505.52 459.201L506.107 459.083C506.6 458.967 507.101 458.909 507.624 458.836C507.77 458.808 507.918 458.791 508.067 458.786C508.742 458.707 509.423 458.675 510.102 458.691L510.496 458.707C511.351 458.746 512.203 458.841 513.046 458.991L513.228 459.024C513.826 459.154 514.455 459.327 515.061 459.515L515.558 459.682C516.201 459.924 516.83 460.204 517.44 460.521L562.96 485.015C563.682 485.407 564.368 485.862 565.009 486.375L565.576 486.876L566.656 488.076Z",
                      fill: "url(#paint2_linear_101_825)"
                    }),
                    vue_cjs_prod.createVNode("path", {
                      "fill-rule": "evenodd",
                      "clip-rule": "evenodd",
                      d: "M527.671 478.276C525.715 477.378 523.408 476.775 521.493 476.659C519.15 476.518 516.237 476.975 514.181 477.805C511.958 478.703 509.671 480.266 508.054 481.994C507.172 482.935 505.686 485.192 505.143 486.414C502.48 492.414 503.588 499.489 507.962 504.41C510.096 506.811 513.081 508.663 516.115 509.469C521.864 510.996 527.77 509.487 532.195 505.361C533.285 504.345 534.857 502.151 535.59 500.623C536.264 499.218 536.874 497.127 537.071 495.54C537.704 490.456 536.003 485.412 532.396 481.677C531.38 480.624 528.902 478.841 527.671 478.276ZM525.941 489.154C527.212 490.832 527.657 492.956 527.179 495.059C526.935 496.132 525.959 497.753 525.106 498.504C523.175 500.203 520.237 500.709 517.876 499.75C516.382 499.143 515.275 498.153 514.411 496.651C512.881 493.99 513.383 490.497 515.603 488.356C517.441 486.584 520.287 485.983 522.797 486.837C523.71 487.148 525.321 488.334 525.941 489.154ZM497.889 499.232C495.456 498.604 493.077 499.659 492.077 501.81C491.207 503.681 491.521 505.305 493.386 508.58C494.438 510.428 496.115 512.756 497.489 514.277L497.838 514.662L490.912 515.999C483.323 517.464 483.355 517.454 482.203 518.655C480.729 520.193 480.513 522.604 481.675 524.553C482.083 525.237 482.186 525.338 483.114 525.963C484.85 527.131 484.539 527.143 492.626 525.617L499.529 524.314L500.777 530.672C501.463 534.168 502.149 537.385 502.301 537.819C503 539.812 504.959 541.137 507.084 541.055C508.052 541.018 508.68 540.829 509.543 540.315C510.102 539.983 510.236 539.84 510.863 538.904C512.088 537.078 512.107 537.577 510.494 529.344L509.106 522.263L509.596 522.438C511.988 523.292 513.902 523.771 516.218 524.095C520.019 524.626 521.451 524.423 522.893 523.146C525.267 521.044 524.991 517.273 522.331 515.479C521.436 514.875 520.747 514.671 519.254 514.565C515.228 514.281 511.947 513.152 508.621 510.908C505.525 508.82 503.39 506.478 501.708 503.323C500.246 500.581 500.358 500.739 499.374 500.029C498.695 499.54 498.338 499.348 497.889 499.232Z",
                      fill: "white"
                    })
                  ]),
                  vue_cjs_prod.createVNode("defs", null, [
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint0_linear_101_825",
                      x1: "328.536",
                      y1: "491.587",
                      x2: "332.433",
                      y2: "414.622",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#1A52C5" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.09",
                        "stop-color": "#1B56C7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.17",
                        "stop-color": "#2062CC"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.26",
                        "stop-color": "#2776D4"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.34",
                        "stop-color": "#3292E0"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.43",
                        "stop-color": "#3FB6EF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.5",
                        "stop-color": "#4DDAFF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.54",
                        "stop-color": "#46C7F7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.64",
                        "stop-color": "#369DE5"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.74",
                        "stop-color": "#2A7DD7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.84",
                        "stop-color": "#2165CD"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.92",
                        "stop-color": "#1C57C7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#1A52C5"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint1_linear_101_825",
                      x1: "488.145",
                      y1: "219.626",
                      x2: "464.332",
                      y2: "99.9301",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#1A52C5" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.09",
                        "stop-color": "#1B56C7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.17",
                        "stop-color": "#2062CC"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.26",
                        "stop-color": "#2776D4"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.34",
                        "stop-color": "#3292E0"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.43",
                        "stop-color": "#3FB6EF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.5",
                        "stop-color": "#4DDAFF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.54",
                        "stop-color": "#46C7F7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.64",
                        "stop-color": "#369DE5"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.74",
                        "stop-color": "#2A7DD7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.84",
                        "stop-color": "#2165CD"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.92",
                        "stop-color": "#1C57C7"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#1A52C5"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint2_linear_101_825",
                      x1: "444.187",
                      y1: "492.074",
                      x2: "573.564",
                      y2: "459.516",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#F34302" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.11",
                        "stop-color": "#F34703"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.21",
                        "stop-color": "#F45308"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.32",
                        "stop-color": "#F66710"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.42",
                        "stop-color": "#F8831A"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.51",
                        "stop-color": "#FAA025"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.56",
                        "stop-color": "#F98E1E"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.68",
                        "stop-color": "#F66E12"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.8",
                        "stop-color": "#F45609"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.91",
                        "stop-color": "#F34804"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#F34302"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint3_linear_101_825",
                      x1: "60.2862",
                      y1: "452.305",
                      x2: "163.539",
                      y2: "423.81",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#142F8D" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.1",
                        "stop-color": "#163391"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.19",
                        "stop-color": "#1A3D9D"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.28",
                        "stop-color": "#224FB1"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.38",
                        "stop-color": "#2E68CD"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.47",
                        "stop-color": "#3C87F1"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.51",
                        "stop-color": "#4294FF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.61",
                        "stop-color": "#3272D8"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.72",
                        "stop-color": "#2555B8"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.82",
                        "stop-color": "#1C40A0"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.92",
                        "stop-color": "#163392"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#142F8D"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint4_linear_101_825",
                      x1: "252.703",
                      y1: "607.907",
                      x2: "235.508",
                      y2: "533.387",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#B72D02" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.11",
                        "stop-color": "#BA3103"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.22",
                        "stop-color": "#C43D07"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.33",
                        "stop-color": "#D4510E"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.44",
                        "stop-color": "#EA6D17"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.51",
                        "stop-color": "#FA811E"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.54",
                        "stop-color": "#F3781B"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.66",
                        "stop-color": "#D95810"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.79",
                        "stop-color": "#C64008"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.9",
                        "stop-color": "#BB3204"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#B72D02"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint5_linear_101_825",
                      x1: "317.078",
                      y1: "228.301",
                      x2: "303.467",
                      y2: "372.799",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#FFBE1E" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.52",
                        "stop-color": "#FF47C3"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.57",
                        "stop-color": "#EE42BD"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.67",
                        "stop-color": "#C235AE"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.81",
                        "stop-color": "#7B1F95"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.99",
                        "stop-color": "#1B0274"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#130071"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint6_linear_101_825",
                      x1: "297.745",
                      y1: "366.12",
                      x2: "285.95",
                      y2: "220.091",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#3D003B" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.55",
                        "stop-color": "#FF47C3"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.63",
                        "stop-color": "#EE43B3"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.79",
                        "stop-color": "#C23889"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#7F2849"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint7_linear_101_825",
                      x1: "294.194",
                      y1: "63.547",
                      x2: "369.442",
                      y2: "18.1188",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#230564" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.419792",
                        "stop-color": "#874FFF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.461458",
                        "stop-color": "#9A6BFF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.560417",
                        "stop-color": "#B999FF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.622917",
                        "stop-color": "#A378FF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.70625",
                        "stop-color": "#874FFF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.79",
                        "stop-color": "#874FFF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#230564"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint8_linear_101_825",
                      x1: "241.649",
                      y1: "177.186",
                      x2: "244.595",
                      y2: "126.272",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#5F1514" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.08",
                        "stop-color": "#631513"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.17",
                        "stop-color": "#6F1312"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.25",
                        "stop-color": "#83110F"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.33",
                        "stop-color": "#9F0E0B"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.42",
                        "stop-color": "#C30B06"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.5",
                        "stop-color": "#F10600"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.56",
                        "stop-color": "#D40904"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.66",
                        "stop-color": "#AA0D0A"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.75",
                        "stop-color": "#8A110E"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.84",
                        "stop-color": "#721311"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.93",
                        "stop-color": "#641413"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#5F1514"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint9_linear_101_825",
                      x1: "482.145",
                      y1: "316.877",
                      x2: "547.1",
                      y2: "324.503",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#1F801B" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.1",
                        "stop-color": "#22841D"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.19",
                        "stop-color": "#2B9022"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.28",
                        "stop-color": "#3AA42C"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.38",
                        "stop-color": "#50C039"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.47",
                        "stop-color": "#6BE449"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.51",
                        "stop-color": "#76F250"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.61",
                        "stop-color": "#58CB3E"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.72",
                        "stop-color": "#3FAB2F"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.82",
                        "stop-color": "#2E9324"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.92",
                        "stop-color": "#23851D"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#1F801B"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint10_linear_101_825",
                      x1: "90.3785",
                      y1: "207.524",
                      x2: "43.1163",
                      y2: "90.3886",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#142F8D" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.1",
                        "stop-color": "#163391"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.19",
                        "stop-color": "#1A3D9D"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.28",
                        "stop-color": "#224FB1"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.38",
                        "stop-color": "#2E68CD"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.47",
                        "stop-color": "#3C87F1"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.51",
                        "stop-color": "#4294FF"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.61",
                        "stop-color": "#3272D8"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.72",
                        "stop-color": "#2555B8"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.82",
                        "stop-color": "#1C40A0"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.92",
                        "stop-color": "#163392"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#142F8D"
                      })
                    ]),
                    vue_cjs_prod.createVNode("linearGradient", {
                      id: "paint11_linear_101_825",
                      x1: "32.7118",
                      y1: "334.342",
                      x2: "17.9287",
                      y2: "262.811",
                      gradientUnits: "userSpaceOnUse"
                    }, [
                      vue_cjs_prod.createVNode("stop", { "stop-color": "#1A1A1B" }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.08",
                        "stop-color": "#282829"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.16",
                        "stop-color": "#282829"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.24",
                        "stop-color": "#353535"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.32",
                        "stop-color": "#353535"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.4",
                        "stop-color": "#525252"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.48",
                        "stop-color": "#6A6767"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.51",
                        "stop-color": "#6A6767"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.59",
                        "stop-color": "#525252"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.68",
                        "stop-color": "#353535"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.77",
                        "stop-color": "#353535"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.85",
                        "stop-color": "#282829"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "0.93",
                        "stop-color": "#282829"
                      }),
                      vue_cjs_prod.createVNode("stop", {
                        offset: "1",
                        "stop-color": "#1A1A1B"
                      })
                    ])
                  ])
                ]))
              ])
            ])
          ]),
          vue_cjs_prod.createVNode("div", null, [
            vue_cjs_prod.createVNode(_component_ui_grid_row, null, {
              default: vue_cjs_prod.withCtx(() => [
                (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock(vue_cjs_prod.Fragment, null, vue_cjs_prod.renderList(4, (card, i) => {
                  return vue_cjs_prod.createVNode(_component_ui_grid_col, {
                    cols: 12,
                    md: 6,
                    lg: 3,
                    key: i
                  }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, {
                        primary: "",
                        style: { "text-align": "center" }
                      }, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createVNode("h5", { class: "statictics-title text-primary" }, "88 \u043A"),
                          vue_cjs_prod.createVNode("p", null, "\u0414\u0435\u0440\u0436\u0430\u0442\u0435\u043B\u0435\u0439 \u0442\u043E\u043A\u0435\u043D\u043E\u0432")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 2
                  }, 1024);
                }), 64))
              ]),
              _: 1
            })
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_AboutUs, null, null, _parent));
  _push(`<section class="section frame">`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_ui_container, null, {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h2 class="section-title"${_scopeId}><span${_scopeId}> \u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0442\u043E\u043A\u0435\u043D\u0430 </span></h2><div class="row"${_scopeId}><div class="col cols-3"${_scopeId}>`);
        _push2(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_row, { spacing: "md" }, {
          default: vue_cjs_prod.withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, { cols: 12 }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 `);
                        } else {
                          return [
                            vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, { cols: 12 }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 `);
                        } else {
                          return [
                            vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, { cols: 12 }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 `);
                        } else {
                          return [
                            vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
            } else {
              return [
                vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`</div><div class="col cols-6"${_scopeId}>`);
        _push2(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
          default: vue_cjs_prod.withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<div style="${serverRenderer.exports.ssrRenderStyle({ "display": "flex", "justify-content": "space-between" })}"${_scopeId2}><div${_scopeId2}>\u0412\u0441\u0435\u0433\u043E \u043F\u0440\u043E\u0434\u0430\u043D\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432:</div><div${_scopeId2}>\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0435\u0440\u0438\u043E\u0434: 1/10</div></div>`);
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_slider, null, null, _parent3, _scopeId2));
              _push3(`<div style="${serverRenderer.exports.ssrRenderStyle({ "text-align": "center" })}"${_scopeId2}>`);
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_typography, {
                size: "lg",
                gutterBottom: "sm",
                weight: "bold"
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(` \u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C 1 536 $ `);
                  } else {
                    return [
                      vue_cjs_prod.createTextVNode(" \u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C 1 536 $ ")
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_typography, {
                size: "md",
                gutterBottom: "lg"
              }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(` \u0421\u0442\u0430\u043D\u044C\u0442\u0435 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u043C \u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u0434\u043E 20% \u0434\u043E\u0445\u043E\u0434\u0430 \u043E\u0442 \u043F\u0440\u043E\u0434\u0430\u0436 `);
                  } else {
                    return [
                      vue_cjs_prod.createTextVNode(" \u0421\u0442\u0430\u043D\u044C\u0442\u0435 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u043C \u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u0434\u043E 20% \u0434\u043E\u0445\u043E\u0434\u0430 \u043E\u0442 \u043F\u0440\u043E\u0434\u0430\u0436 ")
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_button, null, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(`\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D`);
                  } else {
                    return [
                      vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(`</div>`);
            } else {
              return [
                vue_cjs_prod.createVNode("div", { style: { "display": "flex", "justify-content": "space-between" } }, [
                  vue_cjs_prod.createVNode("div", null, "\u0412\u0441\u0435\u0433\u043E \u043F\u0440\u043E\u0434\u0430\u043D\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432:"),
                  vue_cjs_prod.createVNode("div", null, "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0435\u0440\u0438\u043E\u0434: 1/10")
                ]),
                vue_cjs_prod.createVNode(_component_ui_slider),
                vue_cjs_prod.createVNode("div", { style: { "text-align": "center" } }, [
                  vue_cjs_prod.createVNode(_component_ui_typography, {
                    size: "lg",
                    gutterBottom: "sm",
                    weight: "bold"
                  }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createTextVNode(" \u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C 1 536 $ ")
                    ]),
                    _: 1
                  }),
                  vue_cjs_prod.createVNode(_component_ui_typography, {
                    size: "md",
                    gutterBottom: "lg"
                  }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createTextVNode(" \u0421\u0442\u0430\u043D\u044C\u0442\u0435 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u043C \u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u0434\u043E 20% \u0434\u043E\u0445\u043E\u0434\u0430 \u043E\u0442 \u043F\u0440\u043E\u0434\u0430\u0436 ")
                    ]),
                    _: 1
                  }),
                  vue_cjs_prod.createVNode(_component_ui_button, null, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                    ]),
                    _: 1
                  })
                ])
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`</div><div class="col cols-3"${_scopeId}>`);
        _push2(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_row, { spacing: "md" }, {
          default: vue_cjs_prod.withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, { cols: 12 }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 `);
                        } else {
                          return [
                            vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, { cols: 12 }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 `);
                        } else {
                          return [
                            vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(serverRenderer.exports.ssrRenderComponent(_component_ui_grid_col, { cols: 12 }, {
                default: vue_cjs_prod.withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(serverRenderer.exports.ssrRenderComponent(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 `);
                        } else {
                          return [
                            vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
            } else {
              return [
                vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                  default: vue_cjs_prod.withCtx(() => [
                    vue_cjs_prod.createVNode(_component_ui_card, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(`</div></div>`);
      } else {
        return [
          vue_cjs_prod.createVNode("h2", { class: "section-title" }, [
            vue_cjs_prod.createVNode("span", null, " \u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0442\u043E\u043A\u0435\u043D\u0430 ")
          ]),
          vue_cjs_prod.createVNode("div", { class: "row" }, [
            vue_cjs_prod.createVNode("div", { class: "col cols-3" }, [
              vue_cjs_prod.createVNode(_component_ui_grid_row, { spacing: "md" }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            vue_cjs_prod.createVNode("div", { class: "col cols-6" }, [
              vue_cjs_prod.createVNode(_component_ui_card, null, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode("div", { style: { "display": "flex", "justify-content": "space-between" } }, [
                    vue_cjs_prod.createVNode("div", null, "\u0412\u0441\u0435\u0433\u043E \u043F\u0440\u043E\u0434\u0430\u043D\u043E \u0442\u043E\u043A\u0435\u043D\u043E\u0432:"),
                    vue_cjs_prod.createVNode("div", null, "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0435\u0440\u0438\u043E\u0434: 1/10")
                  ]),
                  vue_cjs_prod.createVNode(_component_ui_slider),
                  vue_cjs_prod.createVNode("div", { style: { "text-align": "center" } }, [
                    vue_cjs_prod.createVNode(_component_ui_typography, {
                      size: "lg",
                      gutterBottom: "sm",
                      weight: "bold"
                    }, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode(" \u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C 1 536 $ ")
                      ]),
                      _: 1
                    }),
                    vue_cjs_prod.createVNode(_component_ui_typography, {
                      size: "md",
                      gutterBottom: "lg"
                    }, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode(" \u0421\u0442\u0430\u043D\u044C\u0442\u0435 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u043E\u043C \u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u0434\u043E 20% \u0434\u043E\u0445\u043E\u0434\u0430 \u043E\u0442 \u043F\u0440\u043E\u0434\u0430\u0436 ")
                      ]),
                      _: 1
                    }),
                    vue_cjs_prod.createVNode(_component_ui_button, null, {
                      default: vue_cjs_prod.withCtx(() => [
                        vue_cjs_prod.createTextVNode("\u041A\u0443\u043F\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D")
                      ]),
                      _: 1
                    })
                  ])
                ]),
                _: 1
              })
            ]),
            vue_cjs_prod.createVNode("div", { class: "col cols-3" }, [
              vue_cjs_prod.createVNode(_component_ui_grid_row, { spacing: "md" }, {
                default: vue_cjs_prod.withCtx(() => [
                  vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  vue_cjs_prod.createVNode(_component_ui_grid_col, { cols: 12 }, {
                    default: vue_cjs_prod.withCtx(() => [
                      vue_cjs_prod.createVNode(_component_ui_card, null, {
                        default: vue_cjs_prod.withCtx(() => [
                          vue_cjs_prod.createTextVNode("\u0427\u0430\u0441\u0442\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section><section class="section">`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_ui_container, null, {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h2 class="section-title"${_scopeId}><span${_scopeId}> Roadmap </span></h2>`);
      } else {
        return [
          vue_cjs_prod.createVNode("h2", { class: "section-title" }, [
            vue_cjs_prod.createVNode("span", null, " Roadmap ")
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section><section class="section frame">`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_ui_container, null, {
    default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h2 class="section-title"${_scopeId}><span${_scopeId}> \u041D\u0430\u0448\u0438 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u044B </span></h2>`);
      } else {
        return [
          vue_cjs_prod.createVNode("h2", { class: "section-title" }, [
            vue_cjs_prod.createVNode("span", null, " \u041D\u0430\u0448\u0438 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u044B ")
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
const index$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": index
}, Symbol.toStringTag, { value: "Module" }));

export { entry$1 as default };
//# sourceMappingURL=server.mjs.map
