var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args2) {
    return fn.call(thisArg, ...args2);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../node_modules/.pnpm/@cloudflare+unenv-preset@2.14.0_unenv@2.0.0-rc.24_workerd@1.20260305.0/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../node_modules/.pnpm/@cloudflare+unenv-preset@2.14.0_unenv@2.0.0-rc.24_workerd@1.20260305.0/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../node_modules/.pnpm/wrangler@4.69.0_@cloudflare+workers-types@4.20260305.0/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args2) {
    return super.emit(...args2);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../node_modules/.pnpm/@cloudflare+unenv-preset@2.14.0_unenv@2.0.0-rc.24_workerd@1.20260305.0/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../node_modules/.pnpm/wrangler@4.69.0_@cloudflare+workers-types@4.20260305.0/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all: all2 = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all: all2, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys2 = key.split(".");
  keys2.forEach((key2, index) => {
    if (index === keys2.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match3, index) => {
    const mark = `@${index}`;
    groups.push([mark, match3]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match3 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match3) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match3[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match3[1], new RegExp(`^${match3[2]}(?=/${next})`)] : [label, match3[1], new RegExp(`^${match3[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match3[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match3) => {
      try {
        return decoder(match3);
      } catch {
        return match3;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys2 = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys2) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text2) => JSON.parse(text2));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args2) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args2);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args2) => this.#newResponse(...args2), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text2, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text2) : this.#newResponse(
      text2,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location2, status) => {
    const locationString = String(location2);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args2) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args2.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match22 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match22;
  return match22(method, path);
}
__name(match, "match");

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context2, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context2.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context2, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map2 = handlerData[i][j]?.[1];
      if (!map2) {
        continue;
      }
      const keys2 = Object.keys(map2);
      for (let k = 0, len3 = keys2.length; k < len3; k++) {
        map2[keys2[k]] = paramReplacementMap[map2[keys2[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params2) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params2 && params2 !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params2?.[key] && !processed ? params2[key] : nodeParams[key] ?? params2?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params2 = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params2;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params2[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params2);
              if (hasChildren(child.#children)) {
                child.#params = params2;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params2[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params2, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params2,
                  node.#params
                );
              }
            } else {
              child.#params = params2;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params: params2 }) => [handler, params2])];
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/utils/color.js
function getColorEnabled() {
  const { process: process2, Deno } = globalThis;
  const isNoColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : process2 !== void 0 ? (
    // eslint-disable-next-line no-unsafe-optional-chaining
    "NO_COLOR" in process2?.env
  ) : false;
  return !isNoColor;
}
__name(getColorEnabled, "getColorEnabled");
async function getColorEnabledAsync() {
  const { navigator: navigator2 } = globalThis;
  const cfWorkers = "cloudflare:workers";
  const isNoColor = navigator2 !== void 0 && navigator2.userAgent === "Cloudflare-Workers" ? await (async () => {
    try {
      return "NO_COLOR" in ((await import(cfWorkers)).env ?? {});
    } catch {
      return false;
    }
  })() : !getColorEnabled();
  return !isNoColor;
}
__name(getColorEnabledAsync, "getColorEnabledAsync");

// ../../node_modules/.pnpm/hono@4.12.3/node_modules/hono/dist/middleware/logger/index.js
var humanize = /* @__PURE__ */ __name((times) => {
  const [delimiter, separator] = [",", "."];
  const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));
  return orderTimes.join(separator);
}, "humanize");
var time3 = /* @__PURE__ */ __name((start) => {
  const delta = Date.now() - start;
  return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"]);
}, "time");
var colorStatus = /* @__PURE__ */ __name(async (status) => {
  const colorEnabled = await getColorEnabledAsync();
  if (colorEnabled) {
    switch (status / 100 | 0) {
      case 5:
        return `\x1B[31m${status}\x1B[0m`;
      case 4:
        return `\x1B[33m${status}\x1B[0m`;
      case 3:
        return `\x1B[36m${status}\x1B[0m`;
      case 2:
        return `\x1B[32m${status}\x1B[0m`;
    }
  }
  return `${status}`;
}, "colorStatus");
async function log3(fn, prefix, method, path, status = 0, elapsed) {
  const out = prefix === "<--" ? `${prefix} ${method} ${path}` : `${prefix} ${method} ${path} ${await colorStatus(status)} ${elapsed}`;
  fn(out);
}
__name(log3, "log");
var logger = /* @__PURE__ */ __name((fn = console.log) => {
  return /* @__PURE__ */ __name(async function logger2(c, next) {
    const { method, url } = c.req;
    const path = url.slice(url.indexOf("/", 8));
    await log3(fn, "<--", method, path);
    const start = Date.now();
    await next();
    await log3(fn, "-->", method, path, c.res.status, time3(start));
  }, "logger2");
}, "logger");

// src/durable-objects/virtual-balance.ts
import { DurableObject } from "cloudflare:workers";
var DEFAULT_MIN_WITHDRAW = 100n;
var VirtualBalanceDO = class extends DurableObject {
  static {
    __name(this, "VirtualBalanceDO");
  }
  sql;
  address = null;
  constructor(ctx, env2) {
    super(ctx, env2);
    this.sql = ctx.storage.sql;
    this.ctx.blockConcurrencyWhile(async () => {
      await this.initializeSchema();
    });
  }
  /**
   * Initialize SQLite schema
   */
  async initializeSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS balance (
        address TEXT PRIMARY KEY,
        virtual_balance TEXT NOT NULL DEFAULT '0',
        total_mined TEXT NOT NULL DEFAULT '0',
        total_withdrawn TEXT NOT NULL DEFAULT '0',
        pending_withdraw TEXT NOT NULL DEFAULT '0',
        last_mining_at INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS mining_proofs (
        id TEXT PRIMARY KEY,
        hash TEXT NOT NULL,
        nonce INTEGER NOT NULL,
        difficulty INTEGER NOT NULL,
        block_data TEXT NOT NULL,
        reward TEXT NOT NULL,
        credited INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        UNIQUE(hash, nonce)
      )
    `);
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_proofs_credited
      ON mining_proofs(credited)
    `);
  }
  /**
   * Get or create balance record
   */
  getOrCreateBalance(address) {
    const now = Date.now();
    const rows = this.sql.exec("SELECT * FROM balance WHERE address = ?", address).toArray();
    if (rows.length > 0) {
      const row = rows[0];
      return {
        address: row.address,
        virtualBalance: BigInt(row.virtual_balance),
        totalMined: BigInt(row.total_mined),
        totalWithdrawn: BigInt(row.total_withdrawn),
        pendingWithdraw: BigInt(row.pending_withdraw),
        lastMiningAt: row.last_mining_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }
    this.sql.exec(
      `INSERT INTO balance (address, created_at, updated_at) VALUES (?, ?, ?)`,
      address,
      now,
      now
    );
    return {
      address,
      virtualBalance: 0n,
      totalMined: 0n,
      totalWithdrawn: 0n,
      pendingWithdraw: 0n,
      lastMiningAt: 0,
      createdAt: now,
      updatedAt: now
    };
  }
  /**
   * Update balance in database
   */
  updateBalance(balance) {
    this.sql.exec(
      `UPDATE balance SET
        virtual_balance = ?,
        total_mined = ?,
        total_withdrawn = ?,
        pending_withdraw = ?,
        last_mining_at = ?,
        updated_at = ?
       WHERE address = ?`,
      balance.virtualBalance.toString(),
      balance.totalMined.toString(),
      balance.totalWithdrawn.toString(),
      balance.pendingWithdraw.toString(),
      balance.lastMiningAt,
      Date.now(),
      balance.address
    );
  }
  /**
   * Handle incoming requests
   */
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length < 2 || pathParts[0] !== "balance") {
        return this.errorResponse("Invalid path", 400);
      }
      this.address = pathParts[1];
      const action = pathParts[2] || "get";
      switch (request.method) {
        case "GET":
          if (action === "get" || action === "") {
            return this.handleGetBalance();
          }
          break;
        case "POST":
          if (action === "credit") {
            return this.handleCreditMining(request);
          }
          if (action === "reserve") {
            return this.handleReserveWithdraw(request);
          }
          if (action === "confirm-withdraw") {
            return this.handleConfirmWithdraw(request);
          }
          if (action === "cancel-withdraw") {
            return this.handleCancelWithdraw(request);
          }
          break;
      }
      return this.errorResponse("Not found", 404);
    } catch (error3) {
      console.error("[VirtualBalance] Error:", error3);
      return this.errorResponse(
        error3 instanceof Error ? error3.message : "Internal error",
        500
      );
    }
  }
  /**
   * GET /balance/{address} - Get current balance
   */
  handleGetBalance() {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }
    const balance = this.getOrCreateBalance(this.address);
    const available = balance.virtualBalance - balance.pendingWithdraw;
    const response = {
      success: true,
      data: {
        address: balance.address,
        virtualBalance: balance.virtualBalance.toString(),
        pendingWithdraw: balance.pendingWithdraw.toString(),
        availableToWithdraw: (available > 0n ? available : 0n).toString(),
        totalMined: balance.totalMined.toString(),
        totalWithdrawn: balance.totalWithdrawn.toString()
      },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * POST /balance/{address}/credit - Credit mining reward
   */
  async handleCreditMining(request) {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }
    const body = await request.json();
    const { proof } = body;
    if (!proof || !proof.hash || !proof.nonce || !proof.reward) {
      return this.errorResponse("Invalid proof", 400);
    }
    const existing = this.sql.exec(
      "SELECT id FROM mining_proofs WHERE hash = ? AND nonce = ?",
      proof.hash,
      proof.nonce
    ).toArray();
    if (existing.length > 0) {
      return this.errorResponse("Proof already credited", 409);
    }
    const proofId = crypto.randomUUID();
    const now = Date.now();
    this.sql.exec(
      `INSERT INTO mining_proofs
       (id, hash, nonce, difficulty, block_data, reward, credited, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      proofId,
      proof.hash,
      proof.nonce,
      proof.difficulty,
      proof.blockData || "",
      proof.reward.toString(),
      now
    );
    const balance = this.getOrCreateBalance(this.address);
    const reward = BigInt(proof.reward);
    balance.virtualBalance += reward;
    balance.totalMined += reward;
    balance.lastMiningAt = now;
    this.updateBalance(balance);
    const response = {
      success: true,
      data: {
        credited: reward.toString(),
        newBalance: balance.virtualBalance.toString(),
        proofId
      },
      timestamp: now
    };
    return Response.json(response);
  }
  /**
   * POST /balance/{address}/reserve - Reserve amount for withdrawal
   */
  async handleReserveWithdraw(request) {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }
    const body = await request.json();
    const amount = BigInt(body.amount);
    const minWithdraw = BigInt(
      this.env.MIN_WITHDRAW_AMOUNT || DEFAULT_MIN_WITHDRAW
    );
    if (amount < minWithdraw) {
      return this.errorResponse(
        `Minimum withdrawal is ${minWithdraw} tokens`,
        400
      );
    }
    const balance = this.getOrCreateBalance(this.address);
    const available = balance.virtualBalance - balance.pendingWithdraw;
    if (amount > available) {
      return this.errorResponse(
        `Insufficient balance. Available: ${available}`,
        400
      );
    }
    balance.pendingWithdraw += amount;
    this.updateBalance(balance);
    const response = {
      success: true,
      data: {
        reserved: amount.toString(),
        pendingTotal: balance.pendingWithdraw.toString(),
        availableAfter: (balance.virtualBalance - balance.pendingWithdraw).toString()
      },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * POST /balance/{address}/confirm-withdraw - Confirm withdrawal completed
   */
  async handleConfirmWithdraw(request) {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }
    const body = await request.json();
    const amount = BigInt(body.amount);
    const balance = this.getOrCreateBalance(this.address);
    if (amount > balance.pendingWithdraw) {
      return this.errorResponse("Amount exceeds pending withdrawal", 400);
    }
    balance.pendingWithdraw -= amount;
    balance.virtualBalance -= amount;
    balance.totalWithdrawn += amount;
    this.updateBalance(balance);
    const response = {
      success: true,
      data: {
        withdrawn: amount.toString(),
        txid: body.txid,
        newBalance: balance.virtualBalance.toString()
      },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * POST /balance/{address}/cancel-withdraw - Cancel pending withdrawal
   */
  async handleCancelWithdraw(request) {
    if (!this.address) {
      return this.errorResponse("Address required", 400);
    }
    const body = await request.json();
    const amount = BigInt(body.amount);
    const balance = this.getOrCreateBalance(this.address);
    if (amount > balance.pendingWithdraw) {
      return this.errorResponse("Amount exceeds pending withdrawal", 400);
    }
    balance.pendingWithdraw -= amount;
    this.updateBalance(balance);
    const response = {
      success: true,
      data: {
        released: amount.toString(),
        availableNow: (balance.virtualBalance - balance.pendingWithdraw).toString()
      },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * Helper to create error response
   */
  errorResponse(message, status) {
    const response = {
      success: false,
      error: message,
      timestamp: Date.now()
    };
    return Response.json(response, { status });
  }
};

// src/durable-objects/withdraw-pool.ts
import { DurableObject as DurableObject2 } from "cloudflare:workers";
var POOL_CONFIG = {
  weekly: {
    name: "Weekly Pool",
    description: "Processed every Sunday - Lowest fees",
    processingDay: 0
    // Sunday
  },
  monthly: {
    name: "Monthly Pool",
    description: "Processed on 1st of month - Lowest fees",
    processingDay: 1
    // 1st of month
  },
  low_fee: {
    name: "Low Fee Pool",
    description: "Processed when fees are low",
    maxFeeRate: 5
    // sat/vB
  },
  immediate: {
    name: "Immediate",
    description: "Process ASAP - Higher fees",
    maxWaitMs: 60 * 60 * 1e3
    // 1 hour max wait
  }
};
var WithdrawPoolDO = class extends DurableObject2 {
  static {
    __name(this, "WithdrawPoolDO");
  }
  sql;
  constructor(ctx, env2) {
    super(ctx, env2);
    this.sql = ctx.storage.sql;
    this.ctx.blockConcurrencyWhile(async () => {
      await this.initializeSchema();
    });
  }
  /**
   * Initialize SQLite schema
   */
  async initializeSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS withdraw_requests (
        id TEXT PRIMARY KEY,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        amount TEXT NOT NULL,
        pool_type TEXT NOT NULL,
        max_fee_rate INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        batch_id TEXT,
        txid TEXT,
        error TEXT,
        requested_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS batch_transactions (
        id TEXT PRIMARY KEY,
        total_amount TEXT NOT NULL,
        recipient_count INTEGER NOT NULL,
        tx_hex TEXT,
        txid TEXT,
        fee_rate INTEGER NOT NULL,
        total_fee INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'building',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_requests_status
      ON withdraw_requests(status)
    `);
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_requests_pool
      ON withdraw_requests(pool_type, status)
    `);
  }
  /**
   * Handle incoming requests
   *
   * Path format: /pool/{poolType}/{action}
   * Examples:
   *   GET  /pool/weekly/status
   *   GET  /pool/weekly/requests?address=xxx
   *   POST /pool/weekly/request
   *   POST /pool/weekly/cancel
   *   POST /pool/weekly/process
   */
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length < 2 || pathParts[0] !== "pool") {
        return this.errorResponse("Invalid path", 400);
      }
      const poolType = pathParts[1];
      const action = pathParts[2] || "status";
      switch (request.method) {
        case "GET":
          if (action === "status") {
            return this.handleGetPoolStatus(poolType);
          }
          if (action === "request" && pathParts[3]) {
            return this.handleGetRequest(pathParts[3]);
          }
          if (action === "requests") {
            const address = url.searchParams.get("address");
            if (!address) return this.errorResponse("Address required", 400);
            return this.handleGetUserRequests(address);
          }
          break;
        case "POST":
          if (action === "request") {
            return this.handleCreateRequest(request, poolType);
          }
          if (action === "cancel") {
            return this.handleCancelRequest(request);
          }
          if (action === "process") {
            return this.handleProcessPool(poolType);
          }
          break;
      }
      return this.errorResponse("Not found", 404);
    } catch (error3) {
      console.error("[WithdrawPool] Error:", error3);
      return this.errorResponse(
        error3 instanceof Error ? error3.message : "Internal error",
        500
      );
    }
  }
  /**
   * GET /pool/status - Get pool status
   */
  handleGetPoolStatus(poolType) {
    const pending = this.sql.exec(
      `SELECT COUNT(*) as count, COALESCE(SUM(CAST(amount AS INTEGER)), 0) as total
         FROM withdraw_requests
         WHERE pool_type = ? AND status = 'pending'`,
      poolType
    ).toArray()[0];
    const nextProcessingTime = this.getNextProcessingTime(poolType);
    const feeRate = 5;
    const poolConfig = POOL_CONFIG[poolType];
    const response = {
      success: true,
      data: {
        poolType,
        name: poolConfig.name,
        description: poolConfig.description,
        pendingRequests: pending.count,
        totalAmount: (pending.total || 0).toString(),
        nextProcessingTime: new Date(nextProcessingTime).toISOString(),
        currentFeeRate: feeRate,
        estimatedFeePerUser: this.estimateFeePerUser(
          pending.count,
          feeRate
        )
      },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * GET /pool/request/{id} - Get specific request
   */
  handleGetRequest(requestId) {
    const rows = this.sql.exec("SELECT * FROM withdraw_requests WHERE id = ?", requestId).toArray();
    if (rows.length === 0) {
      return this.errorResponse("Request not found", 404);
    }
    const row = rows[0];
    const response = {
      success: true,
      data: {
        id: row.id,
        fromAddress: row.from_address,
        toAddress: row.to_address,
        amount: BigInt(row.amount),
        poolType: row.pool_type,
        maxFeeRate: row.max_fee_rate,
        status: row.status,
        txid: row.txid,
        error: row.error,
        requestedAt: row.requested_at,
        updatedAt: row.updated_at
      },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * GET /pool/user-requests - Get all requests for a user
   */
  handleGetUserRequests(address) {
    const rows = this.sql.exec(
      `SELECT * FROM withdraw_requests
         WHERE from_address = ?
         ORDER BY requested_at DESC
         LIMIT 50`,
      address
    ).toArray();
    const requests = rows.map((row) => ({
      id: row.id,
      fromAddress: row.from_address,
      toAddress: row.to_address,
      amount: BigInt(row.amount),
      poolType: row.pool_type,
      maxFeeRate: row.max_fee_rate,
      status: row.status,
      txid: row.txid,
      error: row.error,
      requestedAt: row.requested_at,
      updatedAt: row.updated_at
    }));
    const response = {
      success: true,
      data: { requests },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * POST /pool/{poolType}/request - Create withdrawal request
   */
  async handleCreateRequest(request, poolType) {
    const body = await request.json();
    if (!body.fromAddress || !body.toAddress || !body.amount) {
      return this.errorResponse("Missing required fields", 400);
    }
    if (!["weekly", "monthly", "low_fee", "immediate"].includes(poolType)) {
      return this.errorResponse("Invalid pool type", 400);
    }
    const now = Date.now();
    const requestId = crypto.randomUUID();
    this.sql.exec(
      `INSERT INTO withdraw_requests
       (id, from_address, to_address, amount, pool_type, max_fee_rate, status, requested_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      requestId,
      body.fromAddress,
      body.toAddress,
      body.amount,
      poolType,
      body.maxFeeRate || null,
      now,
      now
    );
    const position = this.sql.exec(
      `SELECT COUNT(*) as pos FROM withdraw_requests
         WHERE pool_type = ? AND status = 'pending' AND requested_at <= ?`,
      poolType,
      now
    ).toArray()[0].pos;
    const nextProcessingTime = this.getNextProcessingTime(poolType);
    const feeRate = 5;
    const response = {
      success: true,
      data: {
        requestId,
        amount: body.amount,
        poolType,
        estimatedProcessingTime: new Date(nextProcessingTime).toISOString(),
        estimatedFee: this.estimateFeePerUser(position, feeRate),
        position
      },
      timestamp: now
    };
    return Response.json(response, { status: 201 });
  }
  /**
   * POST /pool/cancel - Cancel pending request
   */
  async handleCancelRequest(request) {
    const body = await request.json();
    const rows = this.sql.exec(
      `SELECT * FROM withdraw_requests
         WHERE id = ? AND from_address = ? AND status = 'pending'`,
      body.requestId,
      body.address
    ).toArray();
    if (rows.length === 0) {
      return this.errorResponse(
        "Request not found or cannot be cancelled",
        404
      );
    }
    this.sql.exec(
      `UPDATE withdraw_requests
       SET status = 'cancelled', updated_at = ?
       WHERE id = ?`,
      Date.now(),
      body.requestId
    );
    const response = {
      success: true,
      data: {
        cancelled: true,
        amount: rows[0].amount
      },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * POST /pool/process - Process pool (called by cron or manually)
   */
  async handleProcessPool(poolType) {
    if (!this.shouldProcessNow(poolType)) {
      return Response.json({
        success: true,
        data: { processed: false, reason: "Not time to process yet" },
        timestamp: Date.now()
      });
    }
    const rows = this.sql.exec(
      `SELECT * FROM withdraw_requests
         WHERE pool_type = ? AND status = 'pending'
         ORDER BY requested_at ASC`,
      poolType
    ).toArray();
    if (rows.length === 0) {
      return Response.json({
        success: true,
        data: { processed: false, reason: "No pending requests" },
        timestamp: Date.now()
      });
    }
    const batchId = crypto.randomUUID();
    const now = Date.now();
    let totalAmount = 0n;
    const requests = rows.map((row) => {
      const amount = BigInt(row.amount);
      totalAmount += amount;
      return {
        id: row.id,
        fromAddress: row.from_address,
        toAddress: row.to_address,
        amount,
        poolType: row.pool_type,
        maxFeeRate: row.max_fee_rate,
        status: row.status,
        txid: null,
        error: null,
        requestedAt: row.requested_at,
        updatedAt: row.updated_at
      };
    });
    const feeRate = await this.getCurrentFeeRate();
    const totalFee = this.estimateTotalFee(requests.length, feeRate);
    this.sql.exec(
      `INSERT INTO batch_transactions
       (id, total_amount, recipient_count, fee_rate, total_fee, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'building', ?, ?)`,
      batchId,
      totalAmount.toString(),
      requests.length,
      feeRate,
      totalFee,
      now,
      now
    );
    for (const req of requests) {
      this.sql.exec(
        `UPDATE withdraw_requests
         SET status = 'processing', batch_id = ?, updated_at = ?
         WHERE id = ?`,
        batchId,
        now,
        req.id
      );
    }
    this.sql.exec(
      `UPDATE batch_transactions
       SET status = 'ready', updated_at = ?
       WHERE id = ?`,
      now,
      batchId
    );
    const response = {
      success: true,
      data: {
        processed: true,
        batchId,
        requestCount: requests.length,
        totalAmount: totalAmount.toString(),
        estimatedFee: totalFee,
        feePerUser: Math.ceil(totalFee / requests.length)
      },
      timestamp: now
    };
    return Response.json(response);
  }
  /**
   * Handle scheduled cron events
   */
  async alarm() {
    const now = /* @__PURE__ */ new Date();
    const dayOfWeek = now.getUTCDay();
    const dayOfMonth = now.getUTCDate();
    if (dayOfWeek === 0) {
      await this.processPoolInternal("weekly");
    }
    if (dayOfMonth === 1) {
      await this.processPoolInternal("monthly");
    }
    const feeRate = await this.getCurrentFeeRate();
    const maxFeeRate = parseInt(this.env.MAX_FEE_RATE_SAT_VB || "5");
    if (feeRate <= maxFeeRate) {
      await this.processPoolInternal("low_fee");
    }
    await this.processPoolInternal("immediate");
  }
  /**
   * Internal pool processing
   */
  async processPoolInternal(poolType) {
    const request = new Request(
      `http://internal/pool/process?pool=${poolType}`,
      {
        method: "POST"
      }
    );
    await this.fetch(request);
  }
  /**
   * Calculate next processing time for pool type
   */
  getNextProcessingTime(poolType) {
    const now = /* @__PURE__ */ new Date();
    switch (poolType) {
      case "weekly": {
        const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
        const nextSunday = new Date(now);
        nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
        nextSunday.setUTCHours(0, 0, 0, 0);
        return nextSunday.getTime();
      }
      case "monthly": {
        const nextMonth = new Date(now);
        nextMonth.setUTCMonth(now.getUTCMonth() + 1, 1);
        nextMonth.setUTCHours(0, 0, 0, 0);
        return nextMonth.getTime();
      }
      case "low_fee": {
        const nextCheck = new Date(now);
        nextCheck.setUTCHours(Math.ceil(now.getUTCHours() / 6) * 6, 0, 0, 0);
        if (nextCheck <= now) {
          nextCheck.setUTCHours(nextCheck.getUTCHours() + 6);
        }
        return nextCheck.getTime();
      }
      case "immediate": {
        return now.getTime() + 60 * 60 * 1e3;
      }
      default:
        return now.getTime() + 7 * 24 * 60 * 60 * 1e3;
    }
  }
  /**
   * Check if pool should be processed now
   */
  shouldProcessNow(poolType) {
    const now = /* @__PURE__ */ new Date();
    switch (poolType) {
      case "weekly":
        return now.getUTCDay() === 0 && now.getUTCHours() < 1;
      case "monthly":
        return now.getUTCDate() === 1 && now.getUTCHours() < 1;
      case "low_fee":
        return true;
      // Always check, will verify fee rate
      case "immediate":
        return true;
      default:
        return false;
    }
  }
  /**
   * Get current Bitcoin fee rate
   */
  async getCurrentFeeRate() {
    try {
      const response = await fetch(
        "https://mempool.space/api/v1/fees/recommended"
      );
      if (response.ok) {
        const fees = await response.json();
        return fees.economyFee;
      }
    } catch (error3) {
      console.error("[WithdrawPool] Failed to fetch fee rate:", error3);
    }
    return 5;
  }
  /**
   * Estimate fee per user based on pool size
   */
  estimateFeePerUser(userCount, feeRate) {
    if (userCount === 0) return 0;
    const baseTxSize = 100;
    const perOutputSize = 34;
    const totalSize = baseTxSize + perOutputSize * Math.max(userCount, 1);
    const totalFee = totalSize * feeRate;
    return Math.ceil(totalFee / Math.max(userCount, 1));
  }
  /**
   * Estimate total fee for batch
   */
  estimateTotalFee(userCount, feeRate) {
    const baseTxSize = 100;
    const perOutputSize = 34;
    const totalSize = baseTxSize + perOutputSize * userCount;
    return totalSize * feeRate;
  }
  /**
   * Helper to create error response
   */
  errorResponse(message, status) {
    const response = {
      success: false,
      error: message,
      timestamp: Date.now()
    };
    return Response.json(response, { status });
  }
};

// src/durable-objects/game-room.ts
import { DurableObject as DurableObject3 } from "cloudflare:workers";

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/map.js
var create = /* @__PURE__ */ __name(() => /* @__PURE__ */ new Map(), "create");
var copy = /* @__PURE__ */ __name((m) => {
  const r = create();
  m.forEach((v, k) => {
    r.set(k, v);
  });
  return r;
}, "copy");
var setIfUndefined = /* @__PURE__ */ __name((map2, key, createT) => {
  let set = map2.get(key);
  if (set === void 0) {
    map2.set(key, set = createT());
  }
  return set;
}, "setIfUndefined");
var map = /* @__PURE__ */ __name((m, f) => {
  const res = [];
  for (const [key, value] of m) {
    res.push(f(value, key));
  }
  return res;
}, "map");
var any = /* @__PURE__ */ __name((m, f) => {
  for (const [key, value] of m) {
    if (f(value, key)) {
      return true;
    }
  }
  return false;
}, "any");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/set.js
var create2 = /* @__PURE__ */ __name(() => /* @__PURE__ */ new Set(), "create");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/array.js
var last = /* @__PURE__ */ __name((arr) => arr[arr.length - 1], "last");
var appendTo = /* @__PURE__ */ __name((dest, src) => {
  for (let i = 0; i < src.length; i++) {
    dest.push(src[i]);
  }
}, "appendTo");
var from = Array.from;
var every = /* @__PURE__ */ __name((arr, f) => {
  for (let i = 0; i < arr.length; i++) {
    if (!f(arr[i], i, arr)) {
      return false;
    }
  }
  return true;
}, "every");
var some = /* @__PURE__ */ __name((arr, f) => {
  for (let i = 0; i < arr.length; i++) {
    if (f(arr[i], i, arr)) {
      return true;
    }
  }
  return false;
}, "some");
var unfold = /* @__PURE__ */ __name((len, f) => {
  const array = new Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = f(i, array);
  }
  return array;
}, "unfold");
var isArray = Array.isArray;

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/observable.js
var ObservableV2 = class {
  static {
    __name(this, "ObservableV2");
  }
  constructor() {
    this._observers = create();
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on(name, f) {
    setIfUndefined(
      this._observers,
      /** @type {string} */
      name,
      create2
    ).add(f);
    return f;
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  once(name, f) {
    const _f = /* @__PURE__ */ __name((...args2) => {
      this.off(
        name,
        /** @type {any} */
        _f
      );
      f(...args2);
    }, "_f");
    this.on(
      name,
      /** @type {any} */
      _f
    );
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  off(name, f) {
    const observers = this._observers.get(name);
    if (observers !== void 0) {
      observers.delete(f);
      if (observers.size === 0) {
        this._observers.delete(name);
      }
    }
  }
  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name The event name.
   * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
   */
  emit(name, args2) {
    return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args2));
  }
  destroy() {
    this._observers = create();
  }
};

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/math.js
var floor = Math.floor;
var abs = Math.abs;
var min = /* @__PURE__ */ __name((a, b) => a < b ? a : b, "min");
var max = /* @__PURE__ */ __name((a, b) => a > b ? a : b, "max");
var isNaN2 = Number.isNaN;
var isNegativeZero = /* @__PURE__ */ __name((n) => n !== 0 ? n < 0 : 1 / n < 0, "isNegativeZero");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/binary.js
var BIT1 = 1;
var BIT2 = 2;
var BIT3 = 4;
var BIT4 = 8;
var BIT6 = 32;
var BIT7 = 64;
var BIT8 = 128;
var BIT18 = 1 << 17;
var BIT19 = 1 << 18;
var BIT20 = 1 << 19;
var BIT21 = 1 << 20;
var BIT22 = 1 << 21;
var BIT23 = 1 << 22;
var BIT24 = 1 << 23;
var BIT25 = 1 << 24;
var BIT26 = 1 << 25;
var BIT27 = 1 << 26;
var BIT28 = 1 << 27;
var BIT29 = 1 << 28;
var BIT30 = 1 << 29;
var BIT31 = 1 << 30;
var BIT32 = 1 << 31;
var BITS5 = 31;
var BITS6 = 63;
var BITS7 = 127;
var BITS17 = BIT18 - 1;
var BITS18 = BIT19 - 1;
var BITS19 = BIT20 - 1;
var BITS20 = BIT21 - 1;
var BITS21 = BIT22 - 1;
var BITS22 = BIT23 - 1;
var BITS23 = BIT24 - 1;
var BITS24 = BIT25 - 1;
var BITS25 = BIT26 - 1;
var BITS26 = BIT27 - 1;
var BITS27 = BIT28 - 1;
var BITS28 = BIT29 - 1;
var BITS29 = BIT30 - 1;
var BITS30 = BIT31 - 1;
var BITS31 = 2147483647;

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/number.js
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
var MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
var LOWEST_INT32 = 1 << 31;
var isInteger = Number.isInteger || ((num) => typeof num === "number" && isFinite(num) && floor(num) === num);
var isNaN3 = Number.isNaN;
var parseInt2 = Number.parseInt;

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/string.js
var fromCharCode = String.fromCharCode;
var fromCodePoint = String.fromCodePoint;
var MAX_UTF16_CHARACTER = fromCharCode(65535);
var toLowerCase = /* @__PURE__ */ __name((s) => s.toLowerCase(), "toLowerCase");
var trimLeftRegex = /^\s*/g;
var trimLeft = /* @__PURE__ */ __name((s) => s.replace(trimLeftRegex, ""), "trimLeft");
var fromCamelCaseRegex = /([A-Z])/g;
var fromCamelCase = /* @__PURE__ */ __name((s, separator) => trimLeft(s.replace(fromCamelCaseRegex, (match3) => `${separator}${toLowerCase(match3)}`)), "fromCamelCase");
var _encodeUtf8Polyfill = /* @__PURE__ */ __name((str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = /** @type {number} */
    encodedString.codePointAt(i);
  }
  return buf;
}, "_encodeUtf8Polyfill");
var utf8TextEncoder = (
  /** @type {TextEncoder} */
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null
);
var _encodeUtf8Native = /* @__PURE__ */ __name((str) => utf8TextEncoder.encode(str), "_encodeUtf8Native");
var encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  utf8TextDecoder = null;
}
var repeat = /* @__PURE__ */ __name((source, n) => unfold(n, () => source).join(""), "repeat");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/encoding.js
var Encoder = class {
  static {
    __name(this, "Encoder");
  }
  constructor() {
    this.cpos = 0;
    this.cbuf = new Uint8Array(100);
    this.bufs = [];
  }
};
var createEncoder = /* @__PURE__ */ __name(() => new Encoder(), "createEncoder");
var length = /* @__PURE__ */ __name((encoder) => {
  let len = encoder.cpos;
  for (let i = 0; i < encoder.bufs.length; i++) {
    len += encoder.bufs[i].length;
  }
  return len;
}, "length");
var toUint8Array = /* @__PURE__ */ __name((encoder) => {
  const uint8arr = new Uint8Array(length(encoder));
  let curPos = 0;
  for (let i = 0; i < encoder.bufs.length; i++) {
    const d = encoder.bufs[i];
    uint8arr.set(d, curPos);
    curPos += d.length;
  }
  uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
  return uint8arr;
}, "toUint8Array");
var verifyLen = /* @__PURE__ */ __name((encoder, len) => {
  const bufferLen = encoder.cbuf.length;
  if (bufferLen - encoder.cpos < len) {
    encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos));
    encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
    encoder.cpos = 0;
  }
}, "verifyLen");
var write = /* @__PURE__ */ __name((encoder, num) => {
  const bufferLen = encoder.cbuf.length;
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(bufferLen * 2);
    encoder.cpos = 0;
  }
  encoder.cbuf[encoder.cpos++] = num;
}, "write");
var writeUint8 = write;
var writeVarUint = /* @__PURE__ */ __name((encoder, num) => {
  while (num > BITS7) {
    write(encoder, BIT8 | BITS7 & num);
    num = floor(num / 128);
  }
  write(encoder, BITS7 & num);
}, "writeVarUint");
var writeVarInt = /* @__PURE__ */ __name((encoder, num) => {
  const isNegative = isNegativeZero(num);
  if (isNegative) {
    num = -num;
  }
  write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | BITS6 & num);
  num = floor(num / 64);
  while (num > 0) {
    write(encoder, (num > BITS7 ? BIT8 : 0) | BITS7 & num);
    num = floor(num / 128);
  }
}, "writeVarInt");
var _strBuffer = new Uint8Array(3e4);
var _maxStrBSize = _strBuffer.length / 3;
var _writeVarStringNative = /* @__PURE__ */ __name((encoder, str) => {
  if (str.length < _maxStrBSize) {
    const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
    writeVarUint(encoder, written);
    for (let i = 0; i < written; i++) {
      write(encoder, _strBuffer[i]);
    }
  } else {
    writeVarUint8Array(encoder, encodeUtf8(str));
  }
}, "_writeVarStringNative");
var _writeVarStringPolyfill = /* @__PURE__ */ __name((encoder, str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    write(
      encoder,
      /** @type {number} */
      encodedString.codePointAt(i)
    );
  }
}, "_writeVarStringPolyfill");
var writeVarString = utf8TextEncoder && /** @type {any} */
utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
var writeUint8Array = /* @__PURE__ */ __name((encoder, uint8Array) => {
  const bufferLen = encoder.cbuf.length;
  const cpos = encoder.cpos;
  const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
  const rightCopyLen = uint8Array.length - leftCopyLen;
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
  encoder.cpos += leftCopyLen;
  if (rightCopyLen > 0) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
    encoder.cpos = rightCopyLen;
  }
}, "writeUint8Array");
var writeVarUint8Array = /* @__PURE__ */ __name((encoder, uint8Array) => {
  writeVarUint(encoder, uint8Array.byteLength);
  writeUint8Array(encoder, uint8Array);
}, "writeVarUint8Array");
var writeOnDataView = /* @__PURE__ */ __name((encoder, len) => {
  verifyLen(encoder, len);
  const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
  encoder.cpos += len;
  return dview;
}, "writeOnDataView");
var writeFloat32 = /* @__PURE__ */ __name((encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false), "writeFloat32");
var writeFloat64 = /* @__PURE__ */ __name((encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false), "writeFloat64");
var writeBigInt64 = /* @__PURE__ */ __name((encoder, num) => (
  /** @type {any} */
  writeOnDataView(encoder, 8).setBigInt64(0, num, false)
), "writeBigInt64");
var floatTestBed = new DataView(new ArrayBuffer(4));
var isFloat32 = /* @__PURE__ */ __name((num) => {
  floatTestBed.setFloat32(0, num);
  return floatTestBed.getFloat32(0) === num;
}, "isFloat32");
var writeAny = /* @__PURE__ */ __name((encoder, data) => {
  switch (typeof data) {
    case "string":
      write(encoder, 119);
      writeVarString(encoder, data);
      break;
    case "number":
      if (isInteger(data) && abs(data) <= BITS31) {
        write(encoder, 125);
        writeVarInt(encoder, data);
      } else if (isFloat32(data)) {
        write(encoder, 124);
        writeFloat32(encoder, data);
      } else {
        write(encoder, 123);
        writeFloat64(encoder, data);
      }
      break;
    case "bigint":
      write(encoder, 122);
      writeBigInt64(encoder, data);
      break;
    case "object":
      if (data === null) {
        write(encoder, 126);
      } else if (isArray(data)) {
        write(encoder, 117);
        writeVarUint(encoder, data.length);
        for (let i = 0; i < data.length; i++) {
          writeAny(encoder, data[i]);
        }
      } else if (data instanceof Uint8Array) {
        write(encoder, 116);
        writeVarUint8Array(encoder, data);
      } else {
        write(encoder, 118);
        const keys2 = Object.keys(data);
        writeVarUint(encoder, keys2.length);
        for (let i = 0; i < keys2.length; i++) {
          const key = keys2[i];
          writeVarString(encoder, key);
          writeAny(encoder, data[key]);
        }
      }
      break;
    case "boolean":
      write(encoder, data ? 120 : 121);
      break;
    default:
      write(encoder, 127);
  }
}, "writeAny");
var RleEncoder = class extends Encoder {
  static {
    __name(this, "RleEncoder");
  }
  /**
   * @param {function(Encoder, T):void} writer
   */
  constructor(writer) {
    super();
    this.w = writer;
    this.s = null;
    this.count = 0;
  }
  /**
   * @param {T} v
   */
  write(v) {
    if (this.s === v) {
      this.count++;
    } else {
      if (this.count > 0) {
        writeVarUint(this, this.count - 1);
      }
      this.count = 1;
      this.w(this, v);
      this.s = v;
    }
  }
};
var flushUintOptRleEncoder = /* @__PURE__ */ __name((encoder) => {
  if (encoder.count > 0) {
    writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2);
    }
  }
}, "flushUintOptRleEncoder");
var UintOptRleEncoder = class {
  static {
    __name(this, "UintOptRleEncoder");
  }
  constructor() {
    this.encoder = new Encoder();
    this.s = 0;
    this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(v) {
    if (this.s === v) {
      this.count++;
    } else {
      flushUintOptRleEncoder(this);
      this.count = 1;
      this.s = v;
    }
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    flushUintOptRleEncoder(this);
    return toUint8Array(this.encoder);
  }
};
var flushIntDiffOptRleEncoder = /* @__PURE__ */ __name((encoder) => {
  if (encoder.count > 0) {
    const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
    writeVarInt(encoder.encoder, encodedDiff);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2);
    }
  }
}, "flushIntDiffOptRleEncoder");
var IntDiffOptRleEncoder = class {
  static {
    __name(this, "IntDiffOptRleEncoder");
  }
  constructor() {
    this.encoder = new Encoder();
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(v) {
    if (this.diff === v - this.s) {
      this.s = v;
      this.count++;
    } else {
      flushIntDiffOptRleEncoder(this);
      this.count = 1;
      this.diff = v - this.s;
      this.s = v;
    }
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    flushIntDiffOptRleEncoder(this);
    return toUint8Array(this.encoder);
  }
};
var StringEncoder = class {
  static {
    __name(this, "StringEncoder");
  }
  constructor() {
    this.sarr = [];
    this.s = "";
    this.lensE = new UintOptRleEncoder();
  }
  /**
   * @param {string} string
   */
  write(string) {
    this.s += string;
    if (this.s.length > 19) {
      this.sarr.push(this.s);
      this.s = "";
    }
    this.lensE.write(string.length);
  }
  toUint8Array() {
    const encoder = new Encoder();
    this.sarr.push(this.s);
    this.s = "";
    writeVarString(encoder, this.sarr.join(""));
    writeUint8Array(encoder, this.lensE.toUint8Array());
    return toUint8Array(encoder);
  }
};

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/error.js
var create3 = /* @__PURE__ */ __name((s) => new Error(s), "create");
var methodUnimplemented = /* @__PURE__ */ __name(() => {
  throw create3("Method unimplemented");
}, "methodUnimplemented");
var unexpectedCase = /* @__PURE__ */ __name(() => {
  throw create3("Unexpected case");
}, "unexpectedCase");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/decoding.js
var errorUnexpectedEndOfArray = create3("Unexpected end of array");
var errorIntegerOutOfRange = create3("Integer out of Range");
var Decoder = class {
  static {
    __name(this, "Decoder");
  }
  /**
   * @param {Uint8Array<Buf>} uint8Array Binary data to decode
   */
  constructor(uint8Array) {
    this.arr = uint8Array;
    this.pos = 0;
  }
};
var createDecoder = /* @__PURE__ */ __name((uint8Array) => new Decoder(uint8Array), "createDecoder");
var hasContent = /* @__PURE__ */ __name((decoder) => decoder.pos !== decoder.arr.length, "hasContent");
var readUint8Array = /* @__PURE__ */ __name((decoder, len) => {
  const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
  decoder.pos += len;
  return view;
}, "readUint8Array");
var readVarUint8Array = /* @__PURE__ */ __name((decoder) => readUint8Array(decoder, readVarUint(decoder)), "readVarUint8Array");
var readUint8 = /* @__PURE__ */ __name((decoder) => decoder.arr[decoder.pos++], "readUint8");
var readVarUint = /* @__PURE__ */ __name((decoder) => {
  let num = 0;
  let mult = 1;
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    const r = decoder.arr[decoder.pos++];
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return num;
    }
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange;
    }
  }
  throw errorUnexpectedEndOfArray;
}, "readVarUint");
var readVarInt = /* @__PURE__ */ __name((decoder) => {
  let r = decoder.arr[decoder.pos++];
  let num = r & BITS6;
  let mult = 64;
  const sign = (r & BIT7) > 0 ? -1 : 1;
  if ((r & BIT8) === 0) {
    return sign * num;
  }
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    r = decoder.arr[decoder.pos++];
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return sign * num;
    }
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange;
    }
  }
  throw errorUnexpectedEndOfArray;
}, "readVarInt");
var _readVarStringPolyfill = /* @__PURE__ */ __name((decoder) => {
  let remainingLen = readVarUint(decoder);
  if (remainingLen === 0) {
    return "";
  } else {
    let encodedString = String.fromCodePoint(readUint8(decoder));
    if (--remainingLen < 100) {
      while (remainingLen--) {
        encodedString += String.fromCodePoint(readUint8(decoder));
      }
    } else {
      while (remainingLen > 0) {
        const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
        const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
        decoder.pos += nextLen;
        encodedString += String.fromCodePoint.apply(
          null,
          /** @type {any} */
          bytes
        );
        remainingLen -= nextLen;
      }
    }
    return decodeURIComponent(escape(encodedString));
  }
}, "_readVarStringPolyfill");
var _readVarStringNative = /* @__PURE__ */ __name((decoder) => (
  /** @type any */
  utf8TextDecoder.decode(readVarUint8Array(decoder))
), "_readVarStringNative");
var readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;
var readFromDataView = /* @__PURE__ */ __name((decoder, len) => {
  const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
  decoder.pos += len;
  return dv;
}, "readFromDataView");
var readFloat32 = /* @__PURE__ */ __name((decoder) => readFromDataView(decoder, 4).getFloat32(0, false), "readFloat32");
var readFloat64 = /* @__PURE__ */ __name((decoder) => readFromDataView(decoder, 8).getFloat64(0, false), "readFloat64");
var readBigInt64 = /* @__PURE__ */ __name((decoder) => (
  /** @type {any} */
  readFromDataView(decoder, 8).getBigInt64(0, false)
), "readBigInt64");
var readAnyLookupTable = [
  (decoder) => void 0,
  // CASE 127: undefined
  (decoder) => null,
  // CASE 126: null
  readVarInt,
  // CASE 125: integer
  readFloat32,
  // CASE 124: float32
  readFloat64,
  // CASE 123: float64
  readBigInt64,
  // CASE 122: bigint
  (decoder) => false,
  // CASE 121: boolean (false)
  (decoder) => true,
  // CASE 120: boolean (true)
  readVarString,
  // CASE 119: string
  (decoder) => {
    const len = readVarUint(decoder);
    const obj = {};
    for (let i = 0; i < len; i++) {
      const key = readVarString(decoder);
      obj[key] = readAny(decoder);
    }
    return obj;
  },
  (decoder) => {
    const len = readVarUint(decoder);
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(readAny(decoder));
    }
    return arr;
  },
  readVarUint8Array
  // CASE 116: Uint8Array
];
var readAny = /* @__PURE__ */ __name((decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder), "readAny");
var RleDecoder = class extends Decoder {
  static {
    __name(this, "RleDecoder");
  }
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(uint8Array, reader) {
    super(uint8Array);
    this.reader = reader;
    this.s = null;
    this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = this.reader(this);
      if (hasContent(this)) {
        this.count = readVarUint(this) + 1;
      } else {
        this.count = -1;
      }
    }
    this.count--;
    return (
      /** @type {T} */
      this.s
    );
  }
};
var UintOptRleDecoder = class extends Decoder {
  static {
    __name(this, "UintOptRleDecoder");
  }
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(uint8Array) {
    super(uint8Array);
    this.s = 0;
    this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = readVarInt(this);
      const isNegative = isNegativeZero(this.s);
      this.count = 1;
      if (isNegative) {
        this.s = -this.s;
        this.count = readVarUint(this) + 2;
      }
    }
    this.count--;
    return (
      /** @type {number} */
      this.s
    );
  }
};
var IntDiffOptRleDecoder = class extends Decoder {
  static {
    __name(this, "IntDiffOptRleDecoder");
  }
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(uint8Array) {
    super(uint8Array);
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }
  /**
   * @return {number}
   */
  read() {
    if (this.count === 0) {
      const diff = readVarInt(this);
      const hasCount = diff & 1;
      this.diff = floor(diff / 2);
      this.count = 1;
      if (hasCount) {
        this.count = readVarUint(this) + 2;
      }
    }
    this.s += this.diff;
    this.count--;
    return this.s;
  }
};
var StringDecoder = class {
  static {
    __name(this, "StringDecoder");
  }
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(uint8Array) {
    this.decoder = new UintOptRleDecoder(uint8Array);
    this.str = readVarString(this.decoder);
    this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const end = this.spos + this.decoder.read();
    const res = this.str.slice(this.spos, end);
    this.spos = end;
    return res;
  }
};

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/webcrypto.js
var subtle = crypto.subtle;
var getRandomValues = crypto.getRandomValues.bind(crypto);

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/random.js
var uint32 = /* @__PURE__ */ __name(() => getRandomValues(new Uint32Array(1))[0], "uint32");
var uuidv4Template = "10000000-1000-4000-8000" + -1e11;
var uuidv4 = /* @__PURE__ */ __name(() => uuidv4Template.replace(
  /[018]/g,
  /** @param {number} c */
  (c) => (c ^ uint32() & 15 >> c / 4).toString(16)
), "uuidv4");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/time.js
var getUnixTime = Date.now;

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/promise.js
var create4 = /* @__PURE__ */ __name((f) => (
  /** @type {Promise<T>} */
  new Promise(f)
), "create");
var all = Promise.all.bind(Promise);

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/conditions.js
var undefinedToNull = /* @__PURE__ */ __name((v) => v === void 0 ? null : v, "undefinedToNull");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/storage.js
var VarStoragePolyfill = class {
  static {
    __name(this, "VarStoragePolyfill");
  }
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {string} key
   * @param {any} newValue
   */
  setItem(key, newValue) {
    this.map.set(key, newValue);
  }
  /**
   * @param {string} key
   */
  getItem(key) {
    return this.map.get(key);
  }
};
var _localStorage = new VarStoragePolyfill();
var usePolyfill = true;
try {
  if (typeof localStorage !== "undefined" && localStorage) {
    _localStorage = localStorage;
    usePolyfill = false;
  }
} catch (e) {
}
var varStorage = _localStorage;

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/trait/equality.js
var EqualityTraitSymbol = /* @__PURE__ */ Symbol("Equality");
var equals = /* @__PURE__ */ __name((a, b) => a === b || !!a?.[EqualityTraitSymbol]?.(b) || false, "equals");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/object.js
var isObject = /* @__PURE__ */ __name((o) => typeof o === "object", "isObject");
var assign = Object.assign;
var keys = Object.keys;
var forEach = /* @__PURE__ */ __name((obj, f) => {
  for (const key in obj) {
    f(obj[key], key);
  }
}, "forEach");
var size = /* @__PURE__ */ __name((obj) => keys(obj).length, "size");
var isEmpty = /* @__PURE__ */ __name((obj) => {
  for (const _k in obj) {
    return false;
  }
  return true;
}, "isEmpty");
var every2 = /* @__PURE__ */ __name((obj, f) => {
  for (const key in obj) {
    if (!f(obj[key], key)) {
      return false;
    }
  }
  return true;
}, "every");
var hasProperty = /* @__PURE__ */ __name((obj, key) => Object.prototype.hasOwnProperty.call(obj, key), "hasProperty");
var equalFlat = /* @__PURE__ */ __name((a, b) => a === b || size(a) === size(b) && every2(a, (val, key) => (val !== void 0 || hasProperty(b, key)) && equals(b[key], val)), "equalFlat");
var freeze = Object.freeze;
var deepFreeze = /* @__PURE__ */ __name((o) => {
  for (const key in o) {
    const c = o[key];
    if (typeof c === "object" || typeof c === "function") {
      deepFreeze(o[key]);
    }
  }
  return freeze(o);
}, "deepFreeze");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/function.js
var callAll = /* @__PURE__ */ __name((fs, args2, i = 0) => {
  try {
    for (; i < fs.length; i++) {
      fs[i](...args2);
    }
  } finally {
    if (i < fs.length) {
      callAll(fs, args2, i + 1);
    }
  }
}, "callAll");
var id = /* @__PURE__ */ __name((a) => a, "id");
var equalityDeep = /* @__PURE__ */ __name((a, b) => {
  if (a === b) {
    return true;
  }
  if (a == null || b == null || a.constructor !== b.constructor && (a.constructor || Object) !== (b.constructor || Object)) {
    return false;
  }
  if (a[EqualityTraitSymbol] != null) {
    return a[EqualityTraitSymbol](b);
  }
  switch (a.constructor) {
    case ArrayBuffer:
      a = new Uint8Array(a);
      b = new Uint8Array(b);
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      break;
    }
    case Set: {
      if (a.size !== b.size) {
        return false;
      }
      for (const value of a) {
        if (!b.has(value)) {
          return false;
        }
      }
      break;
    }
    case Map: {
      if (a.size !== b.size) {
        return false;
      }
      for (const key of a.keys()) {
        if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
          return false;
        }
      }
      break;
    }
    case void 0:
    case Object:
      if (size(a) !== size(b)) {
        return false;
      }
      for (const key in a) {
        if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
          return false;
        }
      }
      break;
    case Array:
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!equalityDeep(a[i], b[i])) {
          return false;
        }
      }
      break;
    default:
      return false;
  }
  return true;
}, "equalityDeep");
var isOneOf = /* @__PURE__ */ __name((value, options) => options.includes(value), "isOneOf");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/environment.js
var isNode = typeof process !== "undefined" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
var isMac = typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
var params;
var args = [];
var computeParams = /* @__PURE__ */ __name(() => {
  if (params === void 0) {
    if (isNode) {
      params = create();
      const pargs = process.argv;
      let currParamName = null;
      for (let i = 0; i < pargs.length; i++) {
        const parg = pargs[i];
        if (parg[0] === "-") {
          if (currParamName !== null) {
            params.set(currParamName, "");
          }
          currParamName = parg;
        } else {
          if (currParamName !== null) {
            params.set(currParamName, parg);
            currParamName = null;
          } else {
            args.push(parg);
          }
        }
      }
      if (currParamName !== null) {
        params.set(currParamName, "");
      }
    } else if (typeof location === "object") {
      params = create();
      (location.search || "?").slice(1).split("&").forEach((kv) => {
        if (kv.length !== 0) {
          const [key, value] = kv.split("=");
          params.set(`--${fromCamelCase(key, "-")}`, value);
          params.set(`-${fromCamelCase(key, "-")}`, value);
        }
      });
    } else {
      params = create();
    }
  }
  return params;
}, "computeParams");
var hasParam = /* @__PURE__ */ __name((name) => computeParams().has(name), "hasParam");
var getVariable = /* @__PURE__ */ __name((name) => isNode ? undefinedToNull(process.env[name.toUpperCase().replaceAll("-", "_")]) : undefinedToNull(varStorage.getItem(name)), "getVariable");
var hasConf = /* @__PURE__ */ __name((name) => hasParam("--" + name) || getVariable(name) !== null, "hasConf");
var production = hasConf("production");
var forceColor = isNode && isOneOf(process.env.FORCE_COLOR, ["true", "1", "2"]);
var supportsColor = forceColor || !hasParam("--no-colors") && // @todo deprecate --no-colors
!hasConf("no-color") && (!isNode || process.stdout.isTTY) && (!isNode || hasParam("--color") || getVariable("COLORTERM") !== null || (getVariable("TERM") || "").includes("color"));

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/buffer.js
var createUint8ArrayFromLen = /* @__PURE__ */ __name((len) => new Uint8Array(len), "createUint8ArrayFromLen");
var copyUint8Array = /* @__PURE__ */ __name((uint8Array) => {
  const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
  newBuf.set(uint8Array);
  return newBuf;
}, "copyUint8Array");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/pair.js
var Pair = class {
  static {
    __name(this, "Pair");
  }
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
};
var create5 = /* @__PURE__ */ __name((left, right) => new Pair(left, right), "create");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/prng.js
var bool = /* @__PURE__ */ __name((gen) => gen.next() >= 0.5, "bool");
var int53 = /* @__PURE__ */ __name((gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2), "int53");
var int32 = /* @__PURE__ */ __name((gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2), "int32");
var int31 = /* @__PURE__ */ __name((gen, min2, max2) => int32(gen, min2, max2), "int31");
var letter = /* @__PURE__ */ __name((gen) => fromCharCode(int31(gen, 97, 122)), "letter");
var word = /* @__PURE__ */ __name((gen, minLen = 0, maxLen = 20) => {
  const len = int31(gen, minLen, maxLen);
  let str = "";
  for (let i = 0; i < len; i++) {
    str += letter(gen);
  }
  return str;
}, "word");
var oneOf = /* @__PURE__ */ __name((gen, array) => array[int31(gen, 0, array.length - 1)], "oneOf");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/schema.js
var schemaSymbol = /* @__PURE__ */ Symbol("0schema");
var ValidationError = class {
  static {
    __name(this, "ValidationError");
  }
  constructor() {
    this._rerrs = [];
  }
  /**
   * @param {string?} path
   * @param {string} expected
   * @param {string} has
   * @param {string?} message
   */
  extend(path, expected, has, message = null) {
    this._rerrs.push({ path, expected, has, message });
  }
  toString() {
    const s = [];
    for (let i = this._rerrs.length - 1; i > 0; i--) {
      const r = this._rerrs[i];
      s.push(repeat(" ", (this._rerrs.length - i) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
    }
    return s.join("\n");
  }
};
var shapeExtends = /* @__PURE__ */ __name((a, b) => {
  if (a === b) return true;
  if (a == null || b == null || a.constructor !== b.constructor) return false;
  if (a[EqualityTraitSymbol]) return equals(a, b);
  if (isArray(a)) {
    return every(
      a,
      (aitem) => some(b, (bitem) => shapeExtends(aitem, bitem))
    );
  } else if (isObject(a)) {
    return every2(
      a,
      (aitem, akey) => shapeExtends(aitem, b[akey])
    );
  }
  return false;
}, "shapeExtends");
var Schema = class {
  static {
    __name(this, "Schema");
  }
  // this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
  /**
   * If true, the more things are added to the shape the more objects this schema will accept (e.g.
   * union). By default, the more objects are added, the the fewer objects this schema will accept.
   * @protected
   */
  static _dilutes = false;
  /**
   * @param {Schema<any>} other
   */
  extends(other) {
    let [a, b] = [
      /** @type {any} */
      this.shape,
      /** @type {any} */
      other.shape
    ];
    if (
      /** @type {typeof Schema<any>} */
      this.constructor._dilutes
    ) [b, a] = [a, b];
    return shapeExtends(a, b);
  }
  /**
   * Overwrite this when necessary. By default, we only check the `shape` property which every shape
   * should have.
   * @param {Schema<any>} other
   */
  equals(other) {
    return this.constructor === other.constructor && equalityDeep(this.shape, other.shape);
  }
  [schemaSymbol]() {
    return true;
  }
  /**
   * @param {object} other
   */
  [EqualityTraitSymbol](other) {
    return this.equals(
      /** @type {any} */
      other
    );
  }
  /**
   * Use `schema.validate(obj)` with a typed parameter that is already of typed to be an instance of
   * Schema. Validate will check the structure of the parameter and return true iff the instance
   * really is an instance of Schema.
   *
   * @param {T} o
   * @return {boolean}
   */
  validate(o) {
    return this.check(o);
  }
  /* c8 ignore start */
  /**
   * Similar to validate, but this method accepts untyped parameters.
   *
   * @param {any} _o
   * @param {ValidationError} [_err]
   * @return {_o is T}
   */
  check(_o, _err) {
    methodUnimplemented();
  }
  /* c8 ignore stop */
  /**
   * @type {Schema<T?>}
   */
  get nullable() {
    return $union(this, $null);
  }
  /**
   * @type {$Optional<Schema<T>>}
   */
  get optional() {
    return new $Optional(
      /** @type {Schema<T>} */
      this
    );
  }
  /**
   * Cast a variable to a specific type. Returns the casted value, or throws an exception otherwise.
   * Use this if you know that the type is of a specific type and you just want to convince the type
   * system.
   *
   * **Do not rely on these error messages!**
   * Performs an assertion check only if not in a production environment.
   *
   * @template OO
   * @param {OO} o
   * @return {Extract<OO, T> extends never ? T : (OO extends Array<never> ? T : Extract<OO,T>)}
   */
  cast(o) {
    assert3(o, this);
    return (
      /** @type {any} */
      o
    );
  }
  /**
   * EXPECTO PATRONUM!! 🪄
   * This function protects against type errors. Though it may not work in the real world.
   *
   * "After all this time?"
   * "Always." - Snape, talking about type safety
   *
   * Ensures that a variable is a a specific type. Returns the value, or throws an exception if the assertion check failed.
   * Use this if you know that the type is of a specific type and you just want to convince the type
   * system.
   *
   * Can be useful when defining lambdas: `s.lambda(s.$number, s.$void).expect((n) => n + 1)`
   *
   * **Do not rely on these error messages!**
   * Performs an assertion check if not in a production environment.
   *
   * @param {T} o
   * @return {o extends T ? T : never}
   */
  expect(o) {
    assert3(o, this);
    return o;
  }
};
var $ConstructedBy = class extends Schema {
  static {
    __name(this, "$ConstructedBy");
  }
  /**
   * @param {C} c
   * @param {((o:Instance<C>)=>boolean)|null} check
   */
  constructor(c, check) {
    super();
    this.shape = c;
    this._c = check;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is C extends ((...args:any[]) => infer T) ? T : (C extends (new (...args:any[]) => any) ? InstanceType<C> : never)} o
   */
  check(o, err = void 0) {
    const c = o?.constructor === this.shape && (this._c == null || this._c(o));
    !c && err?.extend(null, this.shape.name, o?.constructor.name, o?.constructor !== this.shape ? "Constructor match failed" : "Check failed");
    return c;
  }
};
var $constructedBy = /* @__PURE__ */ __name((c, check = null) => new $ConstructedBy(c, check), "$constructedBy");
var $$constructedBy = $constructedBy($ConstructedBy);
var $Custom = class extends Schema {
  static {
    __name(this, "$Custom");
  }
  /**
   * @param {(o:any) => boolean} check
   */
  constructor(check) {
    super();
    this.shape = check;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is any}
   */
  check(o, err) {
    const c = this.shape(o);
    !c && err?.extend(null, "custom prop", o?.constructor.name, "failed to check custom prop");
    return c;
  }
};
var $custom = /* @__PURE__ */ __name((check) => new $Custom(check), "$custom");
var $$custom = $constructedBy($Custom);
var $Literal = class extends Schema {
  static {
    __name(this, "$Literal");
  }
  /**
   * @param {Array<T>} literals
   */
  constructor(literals) {
    super();
    this.shape = literals;
  }
  /**
   *
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is T}
   */
  check(o, err) {
    const c = this.shape.some((a) => a === o);
    !c && err?.extend(null, this.shape.join(" | "), o.toString());
    return c;
  }
};
var $literal = /* @__PURE__ */ __name((...literals) => new $Literal(literals), "$literal");
var $$literal = $constructedBy($Literal);
var _regexEscape = (
  /** @type {any} */
  RegExp.escape || /** @type {(str:string) => string} */
  ((str) => str.replace(/[().|&,$^[\]]/g, (s) => "\\" + s))
);
var _schemaStringTemplateToRegex = /* @__PURE__ */ __name((s) => {
  if ($string.check(s)) {
    return [_regexEscape(s)];
  }
  if ($$literal.check(s)) {
    return (
      /** @type {Array<string|number>} */
      s.shape.map((v) => v + "")
    );
  }
  if ($$number.check(s)) {
    return ["[+-]?\\d+.?\\d*"];
  }
  if ($$string.check(s)) {
    return [".*"];
  }
  if ($$union.check(s)) {
    return s.shape.map(_schemaStringTemplateToRegex).flat(1);
  }
  unexpectedCase();
}, "_schemaStringTemplateToRegex");
var $StringTemplate = class extends Schema {
  static {
    __name(this, "$StringTemplate");
  }
  /**
   * @param {T} shape
   */
  constructor(shape) {
    super();
    this.shape = shape;
    this._r = new RegExp("^" + shape.map(_schemaStringTemplateToRegex).map((opts) => `(${opts.join("|")})`).join("") + "$");
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is CastStringTemplateArgsToTemplate<T>}
   */
  check(o, err) {
    const c = this._r.exec(o) != null;
    !c && err?.extend(null, this._r.toString(), o.toString(), "String doesn't match string template.");
    return c;
  }
};
var $$stringTemplate = $constructedBy($StringTemplate);
var isOptionalSymbol = /* @__PURE__ */ Symbol("optional");
var $Optional = class extends Schema {
  static {
    __name(this, "$Optional");
  }
  /**
   * @param {S} shape
   */
  constructor(shape) {
    super();
    this.shape = shape;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is (Unwrap<S>|undefined)}
   */
  check(o, err) {
    const c = o === void 0 || this.shape.check(o);
    !c && err?.extend(null, "undefined (optional)", "()");
    return c;
  }
  get [isOptionalSymbol]() {
    return true;
  }
};
var $$optional = $constructedBy($Optional);
var $Never = class extends Schema {
  static {
    __name(this, "$Never");
  }
  /**
   * @param {any} _o
   * @param {ValidationError} [err]
   * @return {_o is never}
   */
  check(_o, err) {
    err?.extend(null, "never", typeof _o);
    return false;
  }
};
var $never = new $Never();
var $$never = $constructedBy($Never);
var $Object = class _$Object extends Schema {
  static {
    __name(this, "$Object");
  }
  /**
   * @param {S} shape
   * @param {boolean} partial
   */
  constructor(shape, partial = false) {
    super();
    this.shape = shape;
    this._isPartial = partial;
  }
  static _dilutes = true;
  /**
   * @type {Schema<Partial<$ObjectToType<S>>>}
   */
  get partial() {
    return new _$Object(this.shape, true);
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is $ObjectToType<S>}
   */
  check(o, err) {
    if (o == null) {
      err?.extend(null, "object", "null");
      return false;
    }
    return every2(this.shape, (vv, vk) => {
      const c = this._isPartial && !hasProperty(o, vk) || vv.check(o[vk], err);
      !c && err?.extend(vk.toString(), vv.toString(), typeof o[vk], "Object property does not match");
      return c;
    });
  }
};
var $object = /* @__PURE__ */ __name((def) => (
  /** @type {any} */
  new $Object(def)
), "$object");
var $$object = $constructedBy($Object);
var $objectAny = $custom((o) => o != null && (o.constructor === Object || o.constructor == null));
var $Record = class extends Schema {
  static {
    __name(this, "$Record");
  }
  /**
   * @param {Keys} keys
   * @param {Values} values
   */
  constructor(keys2, values) {
    super();
    this.shape = {
      keys: keys2,
      values
    };
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is { [key in Unwrap<Keys>]: Unwrap<Values> }}
   */
  check(o, err) {
    return o != null && every2(o, (vv, vk) => {
      const ck = this.shape.keys.check(vk, err);
      !ck && err?.extend(vk + "", "Record", typeof o, ck ? "Key doesn't match schema" : "Value doesn't match value");
      return ck && this.shape.values.check(vv, err);
    });
  }
};
var $record = /* @__PURE__ */ __name((keys2, values) => new $Record(keys2, values), "$record");
var $$record = $constructedBy($Record);
var $Tuple = class extends Schema {
  static {
    __name(this, "$Tuple");
  }
  /**
   * @param {S} shape
   */
  constructor(shape) {
    super();
    this.shape = shape;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is { [K in keyof S]: S[K] extends Schema<infer Type> ? Type : never }}
   */
  check(o, err) {
    return o != null && every2(this.shape, (vv, vk) => {
      const c = (
        /** @type {Schema<any>} */
        vv.check(o[vk], err)
      );
      !c && err?.extend(vk.toString(), "Tuple", typeof vv);
      return c;
    });
  }
};
var $tuple = /* @__PURE__ */ __name((...def) => new $Tuple(def), "$tuple");
var $$tuple = $constructedBy($Tuple);
var $Array = class extends Schema {
  static {
    __name(this, "$Array");
  }
  /**
   * @param {Array<S>} v
   */
  constructor(v) {
    super();
    this.shape = v.length === 1 ? v[0] : new $Union(v);
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Array<S extends Schema<infer T> ? T : never>} o
   */
  check(o, err) {
    const c = isArray(o) && every(o, (oi) => this.shape.check(oi));
    !c && err?.extend(null, "Array", "");
    return c;
  }
};
var $array = /* @__PURE__ */ __name((...def) => new $Array(def), "$array");
var $$array = $constructedBy($Array);
var $arrayAny = $custom((o) => isArray(o));
var $InstanceOf = class extends Schema {
  static {
    __name(this, "$InstanceOf");
  }
  /**
   * @param {new (...args:any) => T} constructor
   * @param {((o:T) => boolean)|null} check
   */
  constructor(constructor, check) {
    super();
    this.shape = constructor;
    this._c = check;
  }
  /**
   * @param {any} o
   * @param {ValidationError} err
   * @return {o is T}
   */
  check(o, err) {
    const c = o instanceof this.shape && (this._c == null || this._c(o));
    !c && err?.extend(null, this.shape.name, o?.constructor.name);
    return c;
  }
};
var $instanceOf = /* @__PURE__ */ __name((c, check = null) => new $InstanceOf(c, check), "$instanceOf");
var $$instanceOf = $constructedBy($InstanceOf);
var $$schema = $instanceOf(Schema);
var $Lambda = class extends Schema {
  static {
    __name(this, "$Lambda");
  }
  /**
   * @param {Args} args
   */
  constructor(args2) {
    super();
    this.len = args2.length - 1;
    this.args = $tuple(...args2.slice(-1));
    this.res = args2[this.len];
  }
  /**
   * @param {any} f
   * @param {ValidationError} err
   * @return {f is _LArgsToLambdaDef<Args>}
   */
  check(f, err) {
    const c = f.constructor === Function && f.length <= this.len;
    !c && err?.extend(null, "function", typeof f);
    return c;
  }
};
var $$lambda = $constructedBy($Lambda);
var $function = $custom((o) => typeof o === "function");
var $Intersection = class extends Schema {
  static {
    __name(this, "$Intersection");
  }
  /**
   * @param {T} v
   */
  constructor(v) {
    super();
    this.shape = v;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is Intersect<UnwrapArray<T>>}
   */
  check(o, err) {
    const c = every(this.shape, (check) => check.check(o, err));
    !c && err?.extend(null, "Intersectinon", typeof o);
    return c;
  }
};
var $$intersect = $constructedBy($Intersection, (o) => o.shape.length > 0);
var $Union = class extends Schema {
  static {
    __name(this, "$Union");
  }
  static _dilutes = true;
  /**
   * @param {Array<Schema<S>>} v
   */
  constructor(v) {
    super();
    this.shape = v;
  }
  /**
   * @param {any} o
   * @param {ValidationError} [err]
   * @return {o is S}
   */
  check(o, err) {
    const c = some(this.shape, (vv) => vv.check(o, err));
    err?.extend(null, "Union", typeof o);
    return c;
  }
};
var $union = /* @__PURE__ */ __name((...schemas) => schemas.findIndex(($s) => $$union.check($s)) >= 0 ? $union(...schemas.map(($s) => $($s)).map(($s) => $$union.check($s) ? $s.shape : [$s]).flat(1)) : schemas.length === 1 ? schemas[0] : new $Union(schemas), "$union");
var $$union = (
  /** @type {Schema<$Union<any>>} */
  $constructedBy($Union)
);
var _t = /* @__PURE__ */ __name(() => true, "_t");
var $any = $custom(_t);
var $$any = (
  /** @type {Schema<Schema<any>>} */
  $constructedBy($Custom, (o) => o.shape === _t)
);
var $bigint = $custom((o) => typeof o === "bigint");
var $$bigint = (
  /** @type {Schema<Schema<BigInt>>} */
  $custom((o) => o === $bigint)
);
var $symbol = $custom((o) => typeof o === "symbol");
var $$symbol = (
  /** @type {Schema<Schema<Symbol>>} */
  $custom((o) => o === $symbol)
);
var $number = $custom((o) => typeof o === "number");
var $$number = (
  /** @type {Schema<Schema<number>>} */
  $custom((o) => o === $number)
);
var $string = $custom((o) => typeof o === "string");
var $$string = (
  /** @type {Schema<Schema<string>>} */
  $custom((o) => o === $string)
);
var $boolean = $custom((o) => typeof o === "boolean");
var $$boolean = (
  /** @type {Schema<Schema<Boolean>>} */
  $custom((o) => o === $boolean)
);
var $undefined = $literal(void 0);
var $$undefined = (
  /** @type {Schema<Schema<undefined>>} */
  $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === void 0)
);
var $void = $literal(void 0);
var $null = $literal(null);
var $$null = (
  /** @type {Schema<Schema<null>>} */
  $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === null)
);
var $uint8Array = $constructedBy(Uint8Array);
var $$uint8Array = (
  /** @type {Schema<Schema<Uint8Array>>} */
  $constructedBy($ConstructedBy, (o) => o.shape === Uint8Array)
);
var $primitive = $union($number, $string, $null, $undefined, $bigint, $boolean, $symbol);
var $json = (() => {
  const $jsonArr = (
    /** @type {$Array<$any>} */
    $array($any)
  );
  const $jsonRecord = (
    /** @type {$Record<$string,$any>} */
    $record($string, $any)
  );
  const $json2 = $union($number, $string, $null, $boolean, $jsonArr, $jsonRecord);
  $jsonArr.shape = $json2;
  $jsonRecord.shape.values = $json2;
  return $json2;
})();
var $ = /* @__PURE__ */ __name((o) => {
  if ($$schema.check(o)) {
    return (
      /** @type {any} */
      o
    );
  } else if ($objectAny.check(o)) {
    const o2 = {};
    for (const k in o) {
      o2[k] = $(o[k]);
    }
    return (
      /** @type {any} */
      $object(o2)
    );
  } else if ($arrayAny.check(o)) {
    return (
      /** @type {any} */
      $union(...o.map($))
    );
  } else if ($primitive.check(o)) {
    return (
      /** @type {any} */
      $literal(o)
    );
  } else if ($function.check(o)) {
    return (
      /** @type {any} */
      $constructedBy(
        /** @type {any} */
        o
      )
    );
  }
  unexpectedCase();
}, "$");
var assert3 = production ? () => {
} : (o, schema) => {
  const err = new ValidationError();
  if (!schema.check(o, err)) {
    throw create3(`Expected value to be of type ${schema.constructor.name}.
${err.toString()}`);
  }
};
var PatternMatcher = class {
  static {
    __name(this, "PatternMatcher");
  }
  /**
   * @param {Schema<State>} [$state]
   */
  constructor($state) {
    this.patterns = [];
    this.$state = $state;
  }
  /**
   * @template P
   * @template R
   * @param {P} pattern
   * @param {(o:NoInfer<Unwrap<ReadSchema<P>>>,s:State)=>R} handler
   * @return {PatternMatcher<State,Patterns|Pattern<Unwrap<ReadSchema<P>>,R>>}
   */
  if(pattern, handler) {
    this.patterns.push({ if: $(pattern), h: handler });
    return this;
  }
  /**
   * @template R
   * @param {(o:any,s:State)=>R} h
   */
  else(h) {
    return this.if($any, h);
  }
  /**
   * @return {State extends undefined
   *   ? <In extends Unwrap<Patterns['if']>>(o:In,state?:undefined)=>PatternMatchResult<Patterns,In>
   *   : <In extends Unwrap<Patterns['if']>>(o:In,state:State)=>PatternMatchResult<Patterns,In>}
   */
  done() {
    return (
      /** @type {any} */
      (o, s) => {
        for (let i = 0; i < this.patterns.length; i++) {
          const p = this.patterns[i];
          if (p.if.check(o)) {
            return p.h(o, s);
          }
        }
        throw create3("Unhandled pattern");
      }
    );
  }
};
var match2 = /* @__PURE__ */ __name((state) => new PatternMatcher(
  /** @type {any} */
  state
), "match");
var _random = (
  /** @type {any} */
  match2(
    /** @type {Schema<prng.PRNG>} */
    $any
  ).if($$number, (_o, gen) => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER)).if($$string, (_o, gen) => word(gen)).if($$boolean, (_o, gen) => bool(gen)).if($$bigint, (_o, gen) => BigInt(int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER))).if($$union, (o, gen) => random(gen, oneOf(gen, o.shape))).if($$object, (o, gen) => {
    const res = {};
    for (const k in o.shape) {
      let prop = o.shape[k];
      if ($$optional.check(prop)) {
        if (bool(gen)) {
          continue;
        }
        prop = prop.shape;
      }
      res[k] = _random(prop, gen);
    }
    return res;
  }).if($$array, (o, gen) => {
    const arr = [];
    const n = int32(gen, 0, 42);
    for (let i = 0; i < n; i++) {
      arr.push(random(gen, o.shape));
    }
    return arr;
  }).if($$literal, (o, gen) => {
    return oneOf(gen, o.shape);
  }).if($$null, (o, gen) => {
    return null;
  }).if($$lambda, (o, gen) => {
    const res = random(gen, o.res);
    return () => res;
  }).if($$any, (o, gen) => random(gen, oneOf(gen, [
    $number,
    $string,
    $null,
    $undefined,
    $bigint,
    $boolean,
    $array($number),
    $record($union("a", "b", "c"), $number)
  ]))).if($$record, (o, gen) => {
    const res = {};
    const keysN = int53(gen, 0, 3);
    for (let i = 0; i < keysN; i++) {
      const key = random(gen, o.shape.keys);
      const val = random(gen, o.shape.values);
      res[key] = val;
    }
    return res;
  }).done()
);
var random = /* @__PURE__ */ __name((gen, schema) => (
  /** @type {any} */
  _random($(schema), gen)
), "random");

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/dom.js
var doc = (
  /** @type {Document} */
  typeof document !== "undefined" ? document : {}
);
var $fragment = $custom((el) => el.nodeType === DOCUMENT_FRAGMENT_NODE);
var domParser = (
  /** @type {DOMParser} */
  typeof DOMParser !== "undefined" ? new DOMParser() : null
);
var $element = $custom((el) => el.nodeType === ELEMENT_NODE);
var $text = $custom((el) => el.nodeType === TEXT_NODE);
var mapToStyleString = /* @__PURE__ */ __name((m) => map(m, (value, key) => `${key}:${value};`).join(""), "mapToStyleString");
var ELEMENT_NODE = doc.ELEMENT_NODE;
var TEXT_NODE = doc.TEXT_NODE;
var CDATA_SECTION_NODE = doc.CDATA_SECTION_NODE;
var COMMENT_NODE = doc.COMMENT_NODE;
var DOCUMENT_NODE = doc.DOCUMENT_NODE;
var DOCUMENT_TYPE_NODE = doc.DOCUMENT_TYPE_NODE;
var DOCUMENT_FRAGMENT_NODE = doc.DOCUMENT_FRAGMENT_NODE;
var $node = $custom((el) => el.nodeType === DOCUMENT_NODE);

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/symbol.js
var create6 = Symbol;

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.common.js
var BOLD = create6();
var UNBOLD = create6();
var BLUE = create6();
var GREY = create6();
var GREEN = create6();
var RED = create6();
var PURPLE = create6();
var ORANGE = create6();
var UNCOLOR = create6();
var computeNoColorLoggingArgs = /* @__PURE__ */ __name((args2) => {
  if (args2.length === 1 && args2[0]?.constructor === Function) {
    args2 = /** @type {Array<string|Symbol|Object|number>} */
    /** @type {[function]} */
    args2[0]();
  }
  const strBuilder = [];
  const logArgs = [];
  let i = 0;
  for (; i < args2.length; i++) {
    const arg = args2[i];
    if (arg === void 0) {
      break;
    } else if (arg.constructor === String || arg.constructor === Number) {
      strBuilder.push(arg);
    } else if (arg.constructor === Object) {
      break;
    }
  }
  if (i > 0) {
    logArgs.push(strBuilder.join(""));
  }
  for (; i < args2.length; i++) {
    const arg = args2[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs;
}, "computeNoColorLoggingArgs");
var lastLoggingTime = getUnixTime();

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.js
var _browserStyleMap = {
  [BOLD]: create5("font-weight", "bold"),
  [UNBOLD]: create5("font-weight", "normal"),
  [BLUE]: create5("color", "blue"),
  [GREEN]: create5("color", "green"),
  [GREY]: create5("color", "grey"),
  [RED]: create5("color", "red"),
  [PURPLE]: create5("color", "purple"),
  [ORANGE]: create5("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [UNCOLOR]: create5("color", "black")
};
var computeBrowserLoggingArgs = /* @__PURE__ */ __name((args2) => {
  if (args2.length === 1 && args2[0]?.constructor === Function) {
    args2 = /** @type {Array<string|Symbol|Object|number>} */
    /** @type {[function]} */
    args2[0]();
  }
  const strBuilder = [];
  const styles = [];
  const currentStyle = create();
  let logArgs = [];
  let i = 0;
  for (; i < args2.length; i++) {
    const arg = args2[i];
    const style = _browserStyleMap[arg];
    if (style !== void 0) {
      currentStyle.set(style.left, style.right);
    } else {
      if (arg === void 0) {
        break;
      }
      if (arg.constructor === String || arg.constructor === Number) {
        const style2 = mapToStyleString(currentStyle);
        if (i > 0 || style2.length > 0) {
          strBuilder.push("%c" + arg);
          styles.push(style2);
        } else {
          strBuilder.push(arg);
        }
      } else {
        break;
      }
    }
  }
  if (i > 0) {
    logArgs = styles;
    logArgs.unshift(strBuilder.join(""));
  }
  for (; i < args2.length; i++) {
    const arg = args2[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs;
}, "computeBrowserLoggingArgs");
var computeLoggingArgs = supportsColor ? computeBrowserLoggingArgs : computeNoColorLoggingArgs;
var print = /* @__PURE__ */ __name((...args2) => {
  console.log(...computeLoggingArgs(args2));
  vconsoles.forEach((vc) => vc.print(args2));
}, "print");
var warn3 = /* @__PURE__ */ __name((...args2) => {
  console.warn(...computeLoggingArgs(args2));
  args2.unshift(ORANGE);
  vconsoles.forEach((vc) => vc.print(args2));
}, "warn");
var vconsoles = create2();

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/iterator.js
var createIterator = /* @__PURE__ */ __name((next) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next
}), "createIterator");
var iteratorFilter = /* @__PURE__ */ __name((iterator, filter) => createIterator(() => {
  let res;
  do {
    res = iterator.next();
  } while (!res.done && !filter(res.value));
  return res;
}), "iteratorFilter");
var iteratorMap = /* @__PURE__ */ __name((iterator, fmap) => createIterator(() => {
  const { done, value } = iterator.next();
  return { done, value: done ? void 0 : fmap(value) };
}), "iteratorMap");

// ../../node_modules/.pnpm/yjs@13.6.29/node_modules/yjs/dist/yjs.mjs
var DeleteItem = class {
  static {
    __name(this, "DeleteItem");
  }
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(clock, len) {
    this.clock = clock;
    this.len = len;
  }
};
var DeleteSet = class {
  static {
    __name(this, "DeleteSet");
  }
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
};
var iterateDeletedStructs = /* @__PURE__ */ __name((transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
  const structs = (
    /** @type {Array<GC|Item>} */
    transaction.doc.store.clients.get(clientid)
  );
  if (structs != null) {
    const lastStruct = structs[structs.length - 1];
    const clockState = lastStruct.id.clock + lastStruct.length;
    for (let i = 0, del = deletes[i]; i < deletes.length && del.clock < clockState; del = deletes[++i]) {
      iterateStructs(transaction, structs, del.clock, del.len, f);
    }
  }
}), "iterateDeletedStructs");
var findIndexDS = /* @__PURE__ */ __name((dis, clock) => {
  let left = 0;
  let right = dis.length - 1;
  while (left <= right) {
    const midindex = floor((left + right) / 2);
    const mid = dis[midindex];
    const midclock = mid.clock;
    if (midclock <= clock) {
      if (clock < midclock + mid.len) {
        return midindex;
      }
      left = midindex + 1;
    } else {
      right = midindex - 1;
    }
  }
  return null;
}, "findIndexDS");
var isDeleted = /* @__PURE__ */ __name((ds, id2) => {
  const dis = ds.clients.get(id2.client);
  return dis !== void 0 && findIndexDS(dis, id2.clock) !== null;
}, "isDeleted");
var sortAndMergeDeleteSet = /* @__PURE__ */ __name((ds) => {
  ds.clients.forEach((dels) => {
    dels.sort((a, b) => a.clock - b.clock);
    let i, j;
    for (i = 1, j = 1; i < dels.length; i++) {
      const left = dels[j - 1];
      const right = dels[i];
      if (left.clock + left.len >= right.clock) {
        left.len = max(left.len, right.clock + right.len - left.clock);
      } else {
        if (j < i) {
          dels[j] = right;
        }
        j++;
      }
    }
    dels.length = j;
  });
}, "sortAndMergeDeleteSet");
var mergeDeleteSets = /* @__PURE__ */ __name((dss) => {
  const merged = new DeleteSet();
  for (let dssI = 0; dssI < dss.length; dssI++) {
    dss[dssI].clients.forEach((delsLeft, client) => {
      if (!merged.clients.has(client)) {
        const dels = delsLeft.slice();
        for (let i = dssI + 1; i < dss.length; i++) {
          appendTo(dels, dss[i].clients.get(client) || []);
        }
        merged.clients.set(client, dels);
      }
    });
  }
  sortAndMergeDeleteSet(merged);
  return merged;
}, "mergeDeleteSets");
var addToDeleteSet = /* @__PURE__ */ __name((ds, client, clock, length2) => {
  setIfUndefined(ds.clients, client, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new DeleteItem(clock, length2));
}, "addToDeleteSet");
var createDeleteSet = /* @__PURE__ */ __name(() => new DeleteSet(), "createDeleteSet");
var createDeleteSetFromStructStore = /* @__PURE__ */ __name((ss) => {
  const ds = createDeleteSet();
  ss.clients.forEach((structs, client) => {
    const dsitems = [];
    for (let i = 0; i < structs.length; i++) {
      const struct = structs[i];
      if (struct.deleted) {
        const clock = struct.id.clock;
        let len = struct.length;
        if (i + 1 < structs.length) {
          for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) {
            len += next.length;
          }
        }
        dsitems.push(new DeleteItem(clock, len));
      }
    }
    if (dsitems.length > 0) {
      ds.clients.set(client, dsitems);
    }
  });
  return ds;
}, "createDeleteSetFromStructStore");
var writeDeleteSet = /* @__PURE__ */ __name((encoder, ds) => {
  writeVarUint(encoder.restEncoder, ds.clients.size);
  from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, dsitems]) => {
    encoder.resetDsCurVal();
    writeVarUint(encoder.restEncoder, client);
    const len = dsitems.length;
    writeVarUint(encoder.restEncoder, len);
    for (let i = 0; i < len; i++) {
      const item = dsitems[i];
      encoder.writeDsClock(item.clock);
      encoder.writeDsLen(item.len);
    }
  });
}, "writeDeleteSet");
var readDeleteSet = /* @__PURE__ */ __name((decoder) => {
  const ds = new DeleteSet();
  const numClients = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numClients; i++) {
    decoder.resetDsCurVal();
    const client = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    if (numberOfDeletes > 0) {
      const dsField = setIfUndefined(ds.clients, client, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let i2 = 0; i2 < numberOfDeletes; i2++) {
        dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
      }
    }
  }
  return ds;
}, "readDeleteSet");
var readAndApplyDeleteSet = /* @__PURE__ */ __name((decoder, transaction, store) => {
  const unappliedDS = new DeleteSet();
  const numClients = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numClients; i++) {
    decoder.resetDsCurVal();
    const client = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    const structs = store.clients.get(client) || [];
    const state = getState(store, client);
    for (let i2 = 0; i2 < numberOfDeletes; i2++) {
      const clock = decoder.readDsClock();
      const clockEnd = clock + decoder.readDsLen();
      if (clock < state) {
        if (state < clockEnd) {
          addToDeleteSet(unappliedDS, client, state, clockEnd - state);
        }
        let index = findIndexSS(structs, clock);
        let struct = structs[index];
        if (!struct.deleted && struct.id.clock < clock) {
          structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
          index++;
        }
        while (index < structs.length) {
          struct = structs[index++];
          if (struct.id.clock < clockEnd) {
            if (!struct.deleted) {
              if (clockEnd < struct.id.clock + struct.length) {
                structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
              }
              struct.delete(transaction);
            }
          } else {
            break;
          }
        }
      } else {
        addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
      }
    }
  }
  if (unappliedDS.clients.size > 0) {
    const ds = new UpdateEncoderV2();
    writeVarUint(ds.restEncoder, 0);
    writeDeleteSet(ds, unappliedDS);
    return ds.toUint8Array();
  }
  return null;
}, "readAndApplyDeleteSet");
var generateNewClientId = uint32;
var Doc = class _Doc extends ObservableV2 {
  static {
    __name(this, "Doc");
  }
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = /* @__PURE__ */ __name(() => true, "gcFilter"), meta = null, autoLoad = false, shouldLoad = true } = {}) {
    super();
    this.gc = gc;
    this.gcFilter = gcFilter;
    this.clientID = generateNewClientId();
    this.guid = guid;
    this.collectionid = collectionid;
    this.share = /* @__PURE__ */ new Map();
    this.store = new StructStore();
    this._transaction = null;
    this._transactionCleanups = [];
    this.subdocs = /* @__PURE__ */ new Set();
    this._item = null;
    this.shouldLoad = shouldLoad;
    this.autoLoad = autoLoad;
    this.meta = meta;
    this.isLoaded = false;
    this.isSynced = false;
    this.isDestroyed = false;
    this.whenLoaded = create4((resolve) => {
      this.on("load", () => {
        this.isLoaded = true;
        resolve(this);
      });
    });
    const provideSyncedPromise = /* @__PURE__ */ __name(() => create4((resolve) => {
      const eventHandler = /* @__PURE__ */ __name((isSynced) => {
        if (isSynced === void 0 || isSynced === true) {
          this.off("sync", eventHandler);
          resolve();
        }
      }, "eventHandler");
      this.on("sync", eventHandler);
    }), "provideSyncedPromise");
    this.on("sync", (isSynced) => {
      if (isSynced === false && this.isSynced) {
        this.whenSynced = provideSyncedPromise();
      }
      this.isSynced = isSynced === void 0 || isSynced === true;
      if (this.isSynced && !this.isLoaded) {
        this.emit("load", [this]);
      }
    });
    this.whenSynced = provideSyncedPromise();
  }
  /**
   * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
   *
   * `load()` might be used in the future to request any provider to load the most current data.
   *
   * It is safe to call `load()` multiple times.
   */
  load() {
    const item = this._item;
    if (item !== null && !this.shouldLoad) {
      transact(
        /** @type {any} */
        item.parent.doc,
        (transaction) => {
          transaction.subdocsLoaded.add(this);
        },
        null,
        true
      );
    }
    this.shouldLoad = true;
  }
  getSubdocs() {
    return this.subdocs;
  }
  getSubdocGuids() {
    return new Set(from(this.subdocs).map((doc2) => doc2.guid));
  }
  /**
   * Changes that happen inside of a transaction are bundled. This means that
   * the observer fires _after_ the transaction is finished and that all changes
   * that happened inside of the transaction are sent as one message to the
   * other peers.
   *
   * @template T
   * @param {function(Transaction):T} f The function that should be executed as a transaction
   * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
   * @return T
   *
   * @public
   */
  transact(f, origin = null) {
    return transact(this, f, origin);
  }
  /**
   * Define a shared data type.
   *
   * Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
   * and do not overwrite each other. I.e.
   * `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
   *
   * After this method is called, the type is also available on `ydoc.share.get(name)`.
   *
   * *Best Practices:*
   * Define all types right after the Y.Doc instance is created and store them in a separate object.
   * Also use the typed methods `getText(name)`, `getArray(name)`, ..
   *
   * @template {typeof AbstractType<any>} Type
   * @example
   *   const ydoc = new Y.Doc(..)
   *   const appState = {
   *     document: ydoc.getText('document')
   *     comments: ydoc.getArray('comments')
   *   }
   *
   * @param {string} name
   * @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
   * @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
   *
   * @public
   */
  get(name, TypeConstructor = (
    /** @type {any} */
    AbstractType
  )) {
    const type = setIfUndefined(this.share, name, () => {
      const t = new TypeConstructor();
      t._integrate(this, null);
      return t;
    });
    const Constr = type.constructor;
    if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
      if (Constr === AbstractType) {
        const t = new TypeConstructor();
        t._map = type._map;
        type._map.forEach(
          /** @param {Item?} n */
          (n) => {
            for (; n !== null; n = n.left) {
              n.parent = t;
            }
          }
        );
        t._start = type._start;
        for (let n = t._start; n !== null; n = n.right) {
          n.parent = t;
        }
        t._length = type._length;
        this.share.set(name, t);
        t._integrate(this, null);
        return (
          /** @type {InstanceType<Type>} */
          t
        );
      } else {
        throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
      }
    }
    return (
      /** @type {InstanceType<Type>} */
      type
    );
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YArray<T>}
   *
   * @public
   */
  getArray(name = "") {
    return (
      /** @type {YArray<T>} */
      this.get(name, YArray)
    );
  }
  /**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */
  getText(name = "") {
    return this.get(name, YText);
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YMap<T>}
   *
   * @public
   */
  getMap(name = "") {
    return (
      /** @type {YMap<T>} */
      this.get(name, YMap)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlElement}
   *
   * @public
   */
  getXmlElement(name = "") {
    return (
      /** @type {YXmlElement<{[key:string]:string}>} */
      this.get(name, YXmlElement)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(name = "") {
    return this.get(name, YXmlFragment);
  }
  /**
   * Converts the entire document into a js object, recursively traversing each yjs type
   * Doesn't log types that have not been defined (using ydoc.getType(..)).
   *
   * @deprecated Do not use this method and rather call toJSON directly on the shared types.
   *
   * @return {Object<string, any>}
   */
  toJSON() {
    const doc2 = {};
    this.share.forEach((value, key) => {
      doc2[key] = value.toJSON();
    });
    return doc2;
  }
  /**
   * Emit `destroy` event and unregister all event handlers.
   */
  destroy() {
    this.isDestroyed = true;
    from(this.subdocs).forEach((subdoc) => subdoc.destroy());
    const item = this._item;
    if (item !== null) {
      this._item = null;
      const content = (
        /** @type {ContentDoc} */
        item.content
      );
      content.doc = new _Doc({ guid: this.guid, ...content.opts, shouldLoad: false });
      content.doc._item = item;
      transact(
        /** @type {any} */
        item.parent.doc,
        (transaction) => {
          const doc2 = content.doc;
          if (!item.deleted) {
            transaction.subdocsAdded.add(doc2);
          }
          transaction.subdocsRemoved.add(this);
        },
        null,
        true
      );
    }
    this.emit("destroyed", [true]);
    this.emit("destroy", [this]);
    super.destroy();
  }
};
var DSDecoderV1 = class {
  static {
    __name(this, "DSDecoderV1");
  }
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(decoder) {
    this.restDecoder = decoder;
  }
  resetDsCurVal() {
  }
  /**
   * @return {number}
   */
  readDsClock() {
    return readVarUint(this.restDecoder);
  }
  /**
   * @return {number}
   */
  readDsLen() {
    return readVarUint(this.restDecoder);
  }
};
var UpdateDecoderV1 = class extends DSDecoderV1 {
  static {
    __name(this, "UpdateDecoderV1");
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return readVarUint(this.restDecoder);
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return readUint8(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readString() {
    return readVarString(this.restDecoder);
  }
  /**
   * @return {boolean} isKey
   */
  readParentInfo() {
    return readVarUint(this.restDecoder) === 1;
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readTypeRef() {
    return readVarUint(this.restDecoder);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number} len
   */
  readLen() {
    return readVarUint(this.restDecoder);
  }
  /**
   * @return {any}
   */
  readAny() {
    return readAny(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return copyUint8Array(readVarUint8Array(this.restDecoder));
  }
  /**
   * Legacy implementation uses JSON parse. We use any-decoding in v2.
   *
   * @return {any}
   */
  readJSON() {
    return JSON.parse(readVarString(this.restDecoder));
  }
  /**
   * @return {string}
   */
  readKey() {
    return readVarString(this.restDecoder);
  }
};
var DSDecoderV2 = class {
  static {
    __name(this, "DSDecoderV2");
  }
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(decoder) {
    this.dsCurrVal = 0;
    this.restDecoder = decoder;
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @return {number}
   */
  readDsClock() {
    this.dsCurrVal += readVarUint(this.restDecoder);
    return this.dsCurrVal;
  }
  /**
   * @return {number}
   */
  readDsLen() {
    const diff = readVarUint(this.restDecoder) + 1;
    this.dsCurrVal += diff;
    return diff;
  }
};
var UpdateDecoderV2 = class extends DSDecoderV2 {
  static {
    __name(this, "UpdateDecoderV2");
  }
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(decoder) {
    super(decoder);
    this.keys = [];
    readVarUint(decoder);
    this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
    this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
    this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
    this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new ID(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new ID(this.clientDecoder.read(), this.rightClockDecoder.read());
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return this.clientDecoder.read();
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return (
      /** @type {number} */
      this.infoDecoder.read()
    );
  }
  /**
   * @return {string}
   */
  readString() {
    return this.stringDecoder.read();
  }
  /**
   * @return {boolean}
   */
  readParentInfo() {
    return this.parentInfoDecoder.read() === 1;
  }
  /**
   * @return {number} An unsigned 8-bit integer
   */
  readTypeRef() {
    return this.typeRefDecoder.read();
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number}
   */
  readLen() {
    return this.lenDecoder.read();
  }
  /**
   * @return {any}
   */
  readAny() {
    return readAny(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return readVarUint8Array(this.restDecoder);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @return {any}
   */
  readJSON() {
    return readAny(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readKey() {
    const keyClock = this.keyClockDecoder.read();
    if (keyClock < this.keys.length) {
      return this.keys[keyClock];
    } else {
      const key = this.stringDecoder.read();
      this.keys.push(key);
      return key;
    }
  }
};
var DSEncoderV1 = class {
  static {
    __name(this, "DSEncoderV1");
  }
  constructor() {
    this.restEncoder = createEncoder();
  }
  toUint8Array() {
    return toUint8Array(this.restEncoder);
  }
  resetDsCurVal() {
  }
  /**
   * @param {number} clock
   */
  writeDsClock(clock) {
    writeVarUint(this.restEncoder, clock);
  }
  /**
   * @param {number} len
   */
  writeDsLen(len) {
    writeVarUint(this.restEncoder, len);
  }
};
var UpdateEncoderV1 = class extends DSEncoderV1 {
  static {
    __name(this, "UpdateEncoderV1");
  }
  /**
   * @param {ID} id
   */
  writeLeftID(id2) {
    writeVarUint(this.restEncoder, id2.client);
    writeVarUint(this.restEncoder, id2.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(id2) {
    writeVarUint(this.restEncoder, id2.client);
    writeVarUint(this.restEncoder, id2.clock);
  }
  /**
   * Use writeClient and writeClock instead of writeID if possible.
   * @param {number} client
   */
  writeClient(client) {
    writeVarUint(this.restEncoder, client);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(info3) {
    writeUint8(this.restEncoder, info3);
  }
  /**
   * @param {string} s
   */
  writeString(s) {
    writeVarString(this.restEncoder, s);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(isYKey) {
    writeVarUint(this.restEncoder, isYKey ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(info3) {
    writeVarUint(this.restEncoder, info3);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(len) {
    writeVarUint(this.restEncoder, len);
  }
  /**
   * @param {any} any
   */
  writeAny(any2) {
    writeAny(this.restEncoder, any2);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(buf) {
    writeVarUint8Array(this.restEncoder, buf);
  }
  /**
   * @param {any} embed
   */
  writeJSON(embed) {
    writeVarString(this.restEncoder, JSON.stringify(embed));
  }
  /**
   * @param {string} key
   */
  writeKey(key) {
    writeVarString(this.restEncoder, key);
  }
};
var DSEncoderV2 = class {
  static {
    __name(this, "DSEncoderV2");
  }
  constructor() {
    this.restEncoder = createEncoder();
    this.dsCurrVal = 0;
  }
  toUint8Array() {
    return toUint8Array(this.restEncoder);
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @param {number} clock
   */
  writeDsClock(clock) {
    const diff = clock - this.dsCurrVal;
    this.dsCurrVal = clock;
    writeVarUint(this.restEncoder, diff);
  }
  /**
   * @param {number} len
   */
  writeDsLen(len) {
    if (len === 0) {
      unexpectedCase();
    }
    writeVarUint(this.restEncoder, len - 1);
    this.dsCurrVal += len;
  }
};
var UpdateEncoderV2 = class extends DSEncoderV2 {
  static {
    __name(this, "UpdateEncoderV2");
  }
  constructor() {
    super();
    this.keyMap = /* @__PURE__ */ new Map();
    this.keyClock = 0;
    this.keyClockEncoder = new IntDiffOptRleEncoder();
    this.clientEncoder = new UintOptRleEncoder();
    this.leftClockEncoder = new IntDiffOptRleEncoder();
    this.rightClockEncoder = new IntDiffOptRleEncoder();
    this.infoEncoder = new RleEncoder(writeUint8);
    this.stringEncoder = new StringEncoder();
    this.parentInfoEncoder = new RleEncoder(writeUint8);
    this.typeRefEncoder = new UintOptRleEncoder();
    this.lenEncoder = new UintOptRleEncoder();
  }
  toUint8Array() {
    const encoder = createEncoder();
    writeVarUint(encoder, 0);
    writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
    writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
    writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
    writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
    writeUint8Array(encoder, toUint8Array(this.restEncoder));
    return toUint8Array(encoder);
  }
  /**
   * @param {ID} id
   */
  writeLeftID(id2) {
    this.clientEncoder.write(id2.client);
    this.leftClockEncoder.write(id2.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(id2) {
    this.clientEncoder.write(id2.client);
    this.rightClockEncoder.write(id2.clock);
  }
  /**
   * @param {number} client
   */
  writeClient(client) {
    this.clientEncoder.write(client);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(info3) {
    this.infoEncoder.write(info3);
  }
  /**
   * @param {string} s
   */
  writeString(s) {
    this.stringEncoder.write(s);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(isYKey) {
    this.parentInfoEncoder.write(isYKey ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(info3) {
    this.typeRefEncoder.write(info3);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(len) {
    this.lenEncoder.write(len);
  }
  /**
   * @param {any} any
   */
  writeAny(any2) {
    writeAny(this.restEncoder, any2);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(buf) {
    writeVarUint8Array(this.restEncoder, buf);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(embed) {
    writeAny(this.restEncoder, embed);
  }
  /**
   * Property keys are often reused. For example, in y-prosemirror the key `bold` might
   * occur very often. For a 3d application, the key `position` might occur very often.
   *
   * We cache these keys in a Map and refer to them via a unique number.
   *
   * @param {string} key
   */
  writeKey(key) {
    const clock = this.keyMap.get(key);
    if (clock === void 0) {
      this.keyClockEncoder.write(this.keyClock++);
      this.stringEncoder.write(key);
    } else {
      this.keyClockEncoder.write(clock);
    }
  }
};
var writeStructs = /* @__PURE__ */ __name((encoder, structs, client, clock) => {
  clock = max(clock, structs[0].id.clock);
  const startNewStructs = findIndexSS(structs, clock);
  writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
  encoder.writeClient(client);
  writeVarUint(encoder.restEncoder, clock);
  const firstStruct = structs[startNewStructs];
  firstStruct.write(encoder, clock - firstStruct.id.clock);
  for (let i = startNewStructs + 1; i < structs.length; i++) {
    structs[i].write(encoder, 0);
  }
}, "writeStructs");
var writeClientsStructs = /* @__PURE__ */ __name((encoder, store, _sm) => {
  const sm = /* @__PURE__ */ new Map();
  _sm.forEach((clock, client) => {
    if (getState(store, client) > clock) {
      sm.set(client, clock);
    }
  });
  getStateVector(store).forEach((_clock, client) => {
    if (!_sm.has(client)) {
      sm.set(client, 0);
    }
  });
  writeVarUint(encoder.restEncoder, sm.size);
  from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
    writeStructs(
      encoder,
      /** @type {Array<GC|Item>} */
      store.clients.get(client),
      client,
      clock
    );
  });
}, "writeClientsStructs");
var readClientsStructRefs = /* @__PURE__ */ __name((decoder, doc2) => {
  const clientRefs = create();
  const numOfStateUpdates = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numOfStateUpdates; i++) {
    const numberOfStructs = readVarUint(decoder.restDecoder);
    const refs = new Array(numberOfStructs);
    const client = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    clientRefs.set(client, { i: 0, refs });
    for (let i2 = 0; i2 < numberOfStructs; i2++) {
      const info3 = decoder.readInfo();
      switch (BITS5 & info3) {
        case 0: {
          const len = decoder.readLen();
          refs[i2] = new GC(createID(client, clock), len);
          clock += len;
          break;
        }
        case 10: {
          const len = readVarUint(decoder.restDecoder);
          refs[i2] = new Skip(createID(client, clock), len);
          clock += len;
          break;
        }
        default: {
          const cantCopyParentInfo = (info3 & (BIT7 | BIT8)) === 0;
          const struct = new Item(
            createID(client, clock),
            null,
            // left
            (info3 & BIT8) === BIT8 ? decoder.readLeftID() : null,
            // origin
            null,
            // right
            (info3 & BIT7) === BIT7 ? decoder.readRightID() : null,
            // right origin
            cantCopyParentInfo ? decoder.readParentInfo() ? doc2.get(decoder.readString()) : decoder.readLeftID() : null,
            // parent
            cantCopyParentInfo && (info3 & BIT6) === BIT6 ? decoder.readString() : null,
            // parentSub
            readItemContent(decoder, info3)
            // item content
          );
          refs[i2] = struct;
          clock += struct.length;
        }
      }
    }
  }
  return clientRefs;
}, "readClientsStructRefs");
var integrateStructs = /* @__PURE__ */ __name((transaction, store, clientsStructRefs) => {
  const stack = [];
  let clientsStructRefsIds = from(clientsStructRefs.keys()).sort((a, b) => a - b);
  if (clientsStructRefsIds.length === 0) {
    return null;
  }
  const getNextStructTarget = /* @__PURE__ */ __name(() => {
    if (clientsStructRefsIds.length === 0) {
      return null;
    }
    let nextStructsTarget = (
      /** @type {{i:number,refs:Array<GC|Item>}} */
      clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1])
    );
    while (nextStructsTarget.refs.length === nextStructsTarget.i) {
      clientsStructRefsIds.pop();
      if (clientsStructRefsIds.length > 0) {
        nextStructsTarget = /** @type {{i:number,refs:Array<GC|Item>}} */
        clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
      } else {
        return null;
      }
    }
    return nextStructsTarget;
  }, "getNextStructTarget");
  let curStructsTarget = getNextStructTarget();
  if (curStructsTarget === null) {
    return null;
  }
  const restStructs = new StructStore();
  const missingSV = /* @__PURE__ */ new Map();
  const updateMissingSv = /* @__PURE__ */ __name((client, clock) => {
    const mclock = missingSV.get(client);
    if (mclock == null || mclock > clock) {
      missingSV.set(client, clock);
    }
  }, "updateMissingSv");
  let stackHead = (
    /** @type {any} */
    curStructsTarget.refs[
      /** @type {any} */
      curStructsTarget.i++
    ]
  );
  const state = /* @__PURE__ */ new Map();
  const addStackToRestSS = /* @__PURE__ */ __name(() => {
    for (const item of stack) {
      const client = item.id.client;
      const inapplicableItems = clientsStructRefs.get(client);
      if (inapplicableItems) {
        inapplicableItems.i--;
        restStructs.clients.set(client, inapplicableItems.refs.slice(inapplicableItems.i));
        clientsStructRefs.delete(client);
        inapplicableItems.i = 0;
        inapplicableItems.refs = [];
      } else {
        restStructs.clients.set(client, [item]);
      }
      clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client);
    }
    stack.length = 0;
  }, "addStackToRestSS");
  while (true) {
    if (stackHead.constructor !== Skip) {
      const localClock = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client));
      const offset = localClock - stackHead.id.clock;
      if (offset < 0) {
        stack.push(stackHead);
        updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
        addStackToRestSS();
      } else {
        const missing = stackHead.getMissing(transaction, store);
        if (missing !== null) {
          stack.push(stackHead);
          const structRefs = clientsStructRefs.get(
            /** @type {number} */
            missing
          ) || { refs: [], i: 0 };
          if (structRefs.refs.length === structRefs.i) {
            updateMissingSv(
              /** @type {number} */
              missing,
              getState(store, missing)
            );
            addStackToRestSS();
          } else {
            stackHead = structRefs.refs[structRefs.i++];
            continue;
          }
        } else if (offset === 0 || offset < stackHead.length) {
          stackHead.integrate(transaction, offset);
          state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
        }
      }
    }
    if (stack.length > 0) {
      stackHead = /** @type {GC|Item} */
      stack.pop();
    } else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
      stackHead = /** @type {GC|Item} */
      curStructsTarget.refs[curStructsTarget.i++];
    } else {
      curStructsTarget = getNextStructTarget();
      if (curStructsTarget === null) {
        break;
      } else {
        stackHead = /** @type {GC|Item} */
        curStructsTarget.refs[curStructsTarget.i++];
      }
    }
  }
  if (restStructs.clients.size > 0) {
    const encoder = new UpdateEncoderV2();
    writeClientsStructs(encoder, restStructs, /* @__PURE__ */ new Map());
    writeVarUint(encoder.restEncoder, 0);
    return { missing: missingSV, update: encoder.toUint8Array() };
  }
  return null;
}, "integrateStructs");
var writeStructsFromTransaction = /* @__PURE__ */ __name((encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState), "writeStructsFromTransaction");
var readUpdateV2 = /* @__PURE__ */ __name((decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) => transact(ydoc, (transaction) => {
  transaction.local = false;
  let retry = false;
  const doc2 = transaction.doc;
  const store = doc2.store;
  const ss = readClientsStructRefs(structDecoder, doc2);
  const restStructs = integrateStructs(transaction, store, ss);
  const pending = store.pendingStructs;
  if (pending) {
    for (const [client, clock] of pending.missing) {
      if (clock < getState(store, client)) {
        retry = true;
        break;
      }
    }
    if (restStructs) {
      for (const [client, clock] of restStructs.missing) {
        const mclock = pending.missing.get(client);
        if (mclock == null || mclock > clock) {
          pending.missing.set(client, clock);
        }
      }
      pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
    }
  } else {
    store.pendingStructs = restStructs;
  }
  const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
  if (store.pendingDs) {
    const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
    readVarUint(pendingDSUpdate.restDecoder);
    const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
    if (dsRest && dsRest2) {
      store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
    } else {
      store.pendingDs = dsRest || dsRest2;
    }
  } else {
    store.pendingDs = dsRest;
  }
  if (retry) {
    const update = (
      /** @type {{update: Uint8Array}} */
      store.pendingStructs.update
    );
    store.pendingStructs = null;
    applyUpdateV2(transaction.doc, update);
  }
}, transactionOrigin, false), "readUpdateV2");
var applyUpdateV2 = /* @__PURE__ */ __name((ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
  const decoder = createDecoder(update);
  readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
}, "applyUpdateV2");
var applyUpdate = /* @__PURE__ */ __name((ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1), "applyUpdate");
var writeStateAsUpdate = /* @__PURE__ */ __name((encoder, doc2, targetStateVector = /* @__PURE__ */ new Map()) => {
  writeClientsStructs(encoder, doc2.store, targetStateVector);
  writeDeleteSet(encoder, createDeleteSetFromStructStore(doc2.store));
}, "writeStateAsUpdate");
var encodeStateAsUpdateV2 = /* @__PURE__ */ __name((doc2, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2()) => {
  const targetStateVector = decodeStateVector(encodedTargetStateVector);
  writeStateAsUpdate(encoder, doc2, targetStateVector);
  const updates = [encoder.toUint8Array()];
  if (doc2.store.pendingDs) {
    updates.push(doc2.store.pendingDs);
  }
  if (doc2.store.pendingStructs) {
    updates.push(diffUpdateV2(doc2.store.pendingStructs.update, encodedTargetStateVector));
  }
  if (updates.length > 1) {
    if (encoder.constructor === UpdateEncoderV1) {
      return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)));
    } else if (encoder.constructor === UpdateEncoderV2) {
      return mergeUpdatesV2(updates);
    }
  }
  return updates[0];
}, "encodeStateAsUpdateV2");
var encodeStateAsUpdate = /* @__PURE__ */ __name((doc2, encodedTargetStateVector) => encodeStateAsUpdateV2(doc2, encodedTargetStateVector, new UpdateEncoderV1()), "encodeStateAsUpdate");
var readStateVector = /* @__PURE__ */ __name((decoder) => {
  const ss = /* @__PURE__ */ new Map();
  const ssLength = readVarUint(decoder.restDecoder);
  for (let i = 0; i < ssLength; i++) {
    const client = readVarUint(decoder.restDecoder);
    const clock = readVarUint(decoder.restDecoder);
    ss.set(client, clock);
  }
  return ss;
}, "readStateVector");
var decodeStateVector = /* @__PURE__ */ __name((decodedState) => readStateVector(new DSDecoderV1(createDecoder(decodedState))), "decodeStateVector");
var EventHandler = class {
  static {
    __name(this, "EventHandler");
  }
  constructor() {
    this.l = [];
  }
};
var createEventHandler = /* @__PURE__ */ __name(() => new EventHandler(), "createEventHandler");
var addEventHandlerListener = /* @__PURE__ */ __name((eventHandler, f) => eventHandler.l.push(f), "addEventHandlerListener");
var removeEventHandlerListener = /* @__PURE__ */ __name((eventHandler, f) => {
  const l = eventHandler.l;
  const len = l.length;
  eventHandler.l = l.filter((g) => f !== g);
  if (len === eventHandler.l.length) {
    console.error("[yjs] Tried to remove event handler that doesn't exist.");
  }
}, "removeEventHandlerListener");
var callEventHandlerListeners = /* @__PURE__ */ __name((eventHandler, arg0, arg1) => callAll(eventHandler.l, [arg0, arg1]), "callEventHandlerListeners");
var ID = class {
  static {
    __name(this, "ID");
  }
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(client, clock) {
    this.client = client;
    this.clock = clock;
  }
};
var compareIDs = /* @__PURE__ */ __name((a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock, "compareIDs");
var createID = /* @__PURE__ */ __name((client, clock) => new ID(client, clock), "createID");
var findRootTypeKey = /* @__PURE__ */ __name((type) => {
  for (const [key, value] of type.doc.share.entries()) {
    if (value === type) {
      return key;
    }
  }
  throw unexpectedCase();
}, "findRootTypeKey");
var Snapshot = class {
  static {
    __name(this, "Snapshot");
  }
  /**
   * @param {DeleteSet} ds
   * @param {Map<number,number>} sv state map
   */
  constructor(ds, sv) {
    this.ds = ds;
    this.sv = sv;
  }
};
var createSnapshot = /* @__PURE__ */ __name((ds, sm) => new Snapshot(ds, sm), "createSnapshot");
var emptySnapshot = createSnapshot(createDeleteSet(), /* @__PURE__ */ new Map());
var isVisible = /* @__PURE__ */ __name((item, snapshot) => snapshot === void 0 ? !item.deleted : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id), "isVisible");
var splitSnapshotAffectedStructs = /* @__PURE__ */ __name((transaction, snapshot) => {
  const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create2);
  const store = transaction.doc.store;
  if (!meta.has(snapshot)) {
    snapshot.sv.forEach((clock, client) => {
      if (clock < getState(store, client)) {
        getItemCleanStart(transaction, createID(client, clock));
      }
    });
    iterateDeletedStructs(transaction, snapshot.ds, (_item) => {
    });
    meta.add(snapshot);
  }
}, "splitSnapshotAffectedStructs");
var StructStore = class {
  static {
    __name(this, "StructStore");
  }
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
    this.pendingStructs = null;
    this.pendingDs = null;
  }
};
var getStateVector = /* @__PURE__ */ __name((store) => {
  const sm = /* @__PURE__ */ new Map();
  store.clients.forEach((structs, client) => {
    const struct = structs[structs.length - 1];
    sm.set(client, struct.id.clock + struct.length);
  });
  return sm;
}, "getStateVector");
var getState = /* @__PURE__ */ __name((store, client) => {
  const structs = store.clients.get(client);
  if (structs === void 0) {
    return 0;
  }
  const lastStruct = structs[structs.length - 1];
  return lastStruct.id.clock + lastStruct.length;
}, "getState");
var addStruct = /* @__PURE__ */ __name((store, struct) => {
  let structs = store.clients.get(struct.id.client);
  if (structs === void 0) {
    structs = [];
    store.clients.set(struct.id.client, structs);
  } else {
    const lastStruct = structs[structs.length - 1];
    if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
      throw unexpectedCase();
    }
  }
  structs.push(struct);
}, "addStruct");
var findIndexSS = /* @__PURE__ */ __name((structs, clock) => {
  let left = 0;
  let right = structs.length - 1;
  let mid = structs[right];
  let midclock = mid.id.clock;
  if (midclock === clock) {
    return right;
  }
  let midindex = floor(clock / (midclock + mid.length - 1) * right);
  while (left <= right) {
    mid = structs[midindex];
    midclock = mid.id.clock;
    if (midclock <= clock) {
      if (clock < midclock + mid.length) {
        return midindex;
      }
      left = midindex + 1;
    } else {
      right = midindex - 1;
    }
    midindex = floor((left + right) / 2);
  }
  throw unexpectedCase();
}, "findIndexSS");
var find = /* @__PURE__ */ __name((store, id2) => {
  const structs = store.clients.get(id2.client);
  return structs[findIndexSS(structs, id2.clock)];
}, "find");
var getItem = (
  /** @type {function(StructStore,ID):Item} */
  find
);
var findIndexCleanStart = /* @__PURE__ */ __name((transaction, structs, clock) => {
  const index = findIndexSS(structs, clock);
  const struct = structs[index];
  if (struct.id.clock < clock && struct instanceof Item) {
    structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
    return index + 1;
  }
  return index;
}, "findIndexCleanStart");
var getItemCleanStart = /* @__PURE__ */ __name((transaction, id2) => {
  const structs = (
    /** @type {Array<Item>} */
    transaction.doc.store.clients.get(id2.client)
  );
  return structs[findIndexCleanStart(transaction, structs, id2.clock)];
}, "getItemCleanStart");
var getItemCleanEnd = /* @__PURE__ */ __name((transaction, store, id2) => {
  const structs = store.clients.get(id2.client);
  const index = findIndexSS(structs, id2.clock);
  const struct = structs[index];
  if (id2.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
    structs.splice(index + 1, 0, splitItem(transaction, struct, id2.clock - struct.id.clock + 1));
  }
  return struct;
}, "getItemCleanEnd");
var replaceStruct = /* @__PURE__ */ __name((store, struct, newStruct) => {
  const structs = (
    /** @type {Array<GC|Item>} */
    store.clients.get(struct.id.client)
  );
  structs[findIndexSS(structs, struct.id.clock)] = newStruct;
}, "replaceStruct");
var iterateStructs = /* @__PURE__ */ __name((transaction, structs, clockStart, len, f) => {
  if (len === 0) {
    return;
  }
  const clockEnd = clockStart + len;
  let index = findIndexCleanStart(transaction, structs, clockStart);
  let struct;
  do {
    struct = structs[index++];
    if (clockEnd < struct.id.clock + struct.length) {
      findIndexCleanStart(transaction, structs, clockEnd);
    }
    f(struct);
  } while (index < structs.length && structs[index].id.clock < clockEnd);
}, "iterateStructs");
var Transaction = class {
  static {
    __name(this, "Transaction");
  }
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(doc2, origin, local) {
    this.doc = doc2;
    this.deleteSet = new DeleteSet();
    this.beforeState = getStateVector(doc2.store);
    this.afterState = /* @__PURE__ */ new Map();
    this.changed = /* @__PURE__ */ new Map();
    this.changedParentTypes = /* @__PURE__ */ new Map();
    this._mergeStructs = [];
    this.origin = origin;
    this.meta = /* @__PURE__ */ new Map();
    this.local = local;
    this.subdocsAdded = /* @__PURE__ */ new Set();
    this.subdocsRemoved = /* @__PURE__ */ new Set();
    this.subdocsLoaded = /* @__PURE__ */ new Set();
    this._needFormattingCleanup = false;
  }
};
var writeUpdateMessageFromTransaction = /* @__PURE__ */ __name((encoder, transaction) => {
  if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
    return false;
  }
  sortAndMergeDeleteSet(transaction.deleteSet);
  writeStructsFromTransaction(encoder, transaction);
  writeDeleteSet(encoder, transaction.deleteSet);
  return true;
}, "writeUpdateMessageFromTransaction");
var addChangedTypeToTransaction = /* @__PURE__ */ __name((transaction, type, parentSub) => {
  const item = type._item;
  if (item === null || item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted) {
    setIfUndefined(transaction.changed, type, create2).add(parentSub);
  }
}, "addChangedTypeToTransaction");
var tryToMergeWithLefts = /* @__PURE__ */ __name((structs, pos) => {
  let right = structs[pos];
  let left = structs[pos - 1];
  let i = pos;
  for (; i > 0; right = left, left = structs[--i - 1]) {
    if (left.deleted === right.deleted && left.constructor === right.constructor) {
      if (left.mergeWith(right)) {
        if (right instanceof Item && right.parentSub !== null && /** @type {AbstractType<any>} */
        right.parent._map.get(right.parentSub) === right) {
          right.parent._map.set(
            right.parentSub,
            /** @type {Item} */
            left
          );
        }
        continue;
      }
    }
    break;
  }
  const merged = pos - i;
  if (merged) {
    structs.splice(pos + 1 - merged, merged);
  }
  return merged;
}, "tryToMergeWithLefts");
var tryGcDeleteSet = /* @__PURE__ */ __name((ds, store, gcFilter) => {
  for (const [client, deleteItems] of ds.clients.entries()) {
    const structs = (
      /** @type {Array<GC|Item>} */
      store.clients.get(client)
    );
    for (let di = deleteItems.length - 1; di >= 0; di--) {
      const deleteItem = deleteItems[di];
      const endDeleteItemClock = deleteItem.clock + deleteItem.len;
      for (let si = findIndexSS(structs, deleteItem.clock), struct = structs[si]; si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
        const struct2 = structs[si];
        if (deleteItem.clock + deleteItem.len <= struct2.id.clock) {
          break;
        }
        if (struct2 instanceof Item && struct2.deleted && !struct2.keep && gcFilter(struct2)) {
          struct2.gc(store, false);
        }
      }
    }
  }
}, "tryGcDeleteSet");
var tryMergeDeleteSet = /* @__PURE__ */ __name((ds, store) => {
  ds.clients.forEach((deleteItems, client) => {
    const structs = (
      /** @type {Array<GC|Item>} */
      store.clients.get(client)
    );
    for (let di = deleteItems.length - 1; di >= 0; di--) {
      const deleteItem = deleteItems[di];
      const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
      for (let si = mostRightIndexToCheck, struct = structs[si]; si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[si]) {
        si -= 1 + tryToMergeWithLefts(structs, si);
      }
    }
  });
}, "tryMergeDeleteSet");
var cleanupTransactions = /* @__PURE__ */ __name((transactionCleanups, i) => {
  if (i < transactionCleanups.length) {
    const transaction = transactionCleanups[i];
    const doc2 = transaction.doc;
    const store = doc2.store;
    const ds = transaction.deleteSet;
    const mergeStructs = transaction._mergeStructs;
    try {
      sortAndMergeDeleteSet(ds);
      transaction.afterState = getStateVector(transaction.doc.store);
      doc2.emit("beforeObserverCalls", [transaction, doc2]);
      const fs = [];
      transaction.changed.forEach(
        (subs, itemtype) => fs.push(() => {
          if (itemtype._item === null || !itemtype._item.deleted) {
            itemtype._callObserver(transaction, subs);
          }
        })
      );
      fs.push(() => {
        transaction.changedParentTypes.forEach((events, type) => {
          if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
            events = events.filter(
              (event) => event.target._item === null || !event.target._item.deleted
            );
            events.forEach((event) => {
              event.currentTarget = type;
              event._path = null;
            });
            events.sort((event1, event2) => event1.path.length - event2.path.length);
            fs.push(() => {
              callEventHandlerListeners(type._dEH, events, transaction);
            });
          }
        });
        fs.push(() => doc2.emit("afterTransaction", [transaction, doc2]));
        fs.push(() => {
          if (transaction._needFormattingCleanup) {
            cleanupYTextAfterTransaction(transaction);
          }
        });
      });
      callAll(fs, []);
    } finally {
      if (doc2.gc) {
        tryGcDeleteSet(ds, store, doc2.gcFilter);
      }
      tryMergeDeleteSet(ds, store);
      transaction.afterState.forEach((clock, client) => {
        const beforeClock = transaction.beforeState.get(client) || 0;
        if (beforeClock !== clock) {
          const structs = (
            /** @type {Array<GC|Item>} */
            store.clients.get(client)
          );
          const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
          for (let i2 = structs.length - 1; i2 >= firstChangePos; ) {
            i2 -= 1 + tryToMergeWithLefts(structs, i2);
          }
        }
      });
      for (let i2 = mergeStructs.length - 1; i2 >= 0; i2--) {
        const { client, clock } = mergeStructs[i2].id;
        const structs = (
          /** @type {Array<GC|Item>} */
          store.clients.get(client)
        );
        const replacedStructPos = findIndexSS(structs, clock);
        if (replacedStructPos + 1 < structs.length) {
          if (tryToMergeWithLefts(structs, replacedStructPos + 1) > 1) {
            continue;
          }
        }
        if (replacedStructPos > 0) {
          tryToMergeWithLefts(structs, replacedStructPos);
        }
      }
      if (!transaction.local && transaction.afterState.get(doc2.clientID) !== transaction.beforeState.get(doc2.clientID)) {
        print(ORANGE, BOLD, "[yjs] ", UNBOLD, RED, "Changed the client-id because another client seems to be using it.");
        doc2.clientID = generateNewClientId();
      }
      doc2.emit("afterTransactionCleanup", [transaction, doc2]);
      if (doc2._observers.has("update")) {
        const encoder = new UpdateEncoderV1();
        const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
        if (hasContent2) {
          doc2.emit("update", [encoder.toUint8Array(), transaction.origin, doc2, transaction]);
        }
      }
      if (doc2._observers.has("updateV2")) {
        const encoder = new UpdateEncoderV2();
        const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
        if (hasContent2) {
          doc2.emit("updateV2", [encoder.toUint8Array(), transaction.origin, doc2, transaction]);
        }
      }
      const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
      if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
        subdocsAdded.forEach((subdoc) => {
          subdoc.clientID = doc2.clientID;
          if (subdoc.collectionid == null) {
            subdoc.collectionid = doc2.collectionid;
          }
          doc2.subdocs.add(subdoc);
        });
        subdocsRemoved.forEach((subdoc) => doc2.subdocs.delete(subdoc));
        doc2.emit("subdocs", [{ loaded: subdocsLoaded, added: subdocsAdded, removed: subdocsRemoved }, doc2, transaction]);
        subdocsRemoved.forEach((subdoc) => subdoc.destroy());
      }
      if (transactionCleanups.length <= i + 1) {
        doc2._transactionCleanups = [];
        doc2.emit("afterAllTransactions", [doc2, transactionCleanups]);
      } else {
        cleanupTransactions(transactionCleanups, i + 1);
      }
    }
  }
}, "cleanupTransactions");
var transact = /* @__PURE__ */ __name((doc2, f, origin = null, local = true) => {
  const transactionCleanups = doc2._transactionCleanups;
  let initialCall = false;
  let result = null;
  if (doc2._transaction === null) {
    initialCall = true;
    doc2._transaction = new Transaction(doc2, origin, local);
    transactionCleanups.push(doc2._transaction);
    if (transactionCleanups.length === 1) {
      doc2.emit("beforeAllTransactions", [doc2]);
    }
    doc2.emit("beforeTransaction", [doc2._transaction, doc2]);
  }
  try {
    result = f(doc2._transaction);
  } finally {
    if (initialCall) {
      const finishCleanup = doc2._transaction === transactionCleanups[0];
      doc2._transaction = null;
      if (finishCleanup) {
        cleanupTransactions(transactionCleanups, 0);
      }
    }
  }
  return result;
}, "transact");
function* lazyStructReaderGenerator(decoder) {
  const numOfStateUpdates = readVarUint(decoder.restDecoder);
  for (let i = 0; i < numOfStateUpdates; i++) {
    const numberOfStructs = readVarUint(decoder.restDecoder);
    const client = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    for (let i2 = 0; i2 < numberOfStructs; i2++) {
      const info3 = decoder.readInfo();
      if (info3 === 10) {
        const len = readVarUint(decoder.restDecoder);
        yield new Skip(createID(client, clock), len);
        clock += len;
      } else if ((BITS5 & info3) !== 0) {
        const cantCopyParentInfo = (info3 & (BIT7 | BIT8)) === 0;
        const struct = new Item(
          createID(client, clock),
          null,
          // left
          (info3 & BIT8) === BIT8 ? decoder.readLeftID() : null,
          // origin
          null,
          // right
          (info3 & BIT7) === BIT7 ? decoder.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null,
          // parent
          cantCopyParentInfo && (info3 & BIT6) === BIT6 ? decoder.readString() : null,
          // parentSub
          readItemContent(decoder, info3)
          // item content
        );
        yield struct;
        clock += struct.length;
      } else {
        const len = decoder.readLen();
        yield new GC(createID(client, clock), len);
        clock += len;
      }
    }
  }
}
__name(lazyStructReaderGenerator, "lazyStructReaderGenerator");
var LazyStructReader = class {
  static {
    __name(this, "LazyStructReader");
  }
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(decoder, filterSkips) {
    this.gen = lazyStructReaderGenerator(decoder);
    this.curr = null;
    this.done = false;
    this.filterSkips = filterSkips;
    this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do {
      this.curr = this.gen.next().value || null;
    } while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip);
    return this.curr;
  }
};
var LazyStructWriter = class {
  static {
    __name(this, "LazyStructWriter");
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(encoder) {
    this.currClient = 0;
    this.startClock = 0;
    this.written = 0;
    this.encoder = encoder;
    this.clientStructs = [];
  }
};
var mergeUpdates = /* @__PURE__ */ __name((updates) => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1), "mergeUpdates");
var sliceStruct = /* @__PURE__ */ __name((left, diff) => {
  if (left.constructor === GC) {
    const { client, clock } = left.id;
    return new GC(createID(client, clock + diff), left.length - diff);
  } else if (left.constructor === Skip) {
    const { client, clock } = left.id;
    return new Skip(createID(client, clock + diff), left.length - diff);
  } else {
    const leftItem = (
      /** @type {Item} */
      left
    );
    const { client, clock } = leftItem.id;
    return new Item(
      createID(client, clock + diff),
      null,
      createID(client, clock + diff - 1),
      null,
      leftItem.rightOrigin,
      leftItem.parent,
      leftItem.parentSub,
      leftItem.content.splice(diff)
    );
  }
}, "sliceStruct");
var mergeUpdatesV2 = /* @__PURE__ */ __name((updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
  if (updates.length === 1) {
    return updates[0];
  }
  const updateDecoders = updates.map((update) => new YDecoder(createDecoder(update)));
  let lazyStructDecoders = updateDecoders.map((decoder) => new LazyStructReader(decoder, true));
  let currWrite = null;
  const updateEncoder = new YEncoder();
  const lazyStructEncoder = new LazyStructWriter(updateEncoder);
  while (true) {
    lazyStructDecoders = lazyStructDecoders.filter((dec) => dec.curr !== null);
    lazyStructDecoders.sort(
      /** @type {function(any,any):number} */
      (dec1, dec2) => {
        if (dec1.curr.id.client === dec2.curr.id.client) {
          const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
          if (clockDiff === 0) {
            return dec1.curr.constructor === dec2.curr.constructor ? 0 : dec1.curr.constructor === Skip ? 1 : -1;
          } else {
            return clockDiff;
          }
        } else {
          return dec2.curr.id.client - dec1.curr.id.client;
        }
      }
    );
    if (lazyStructDecoders.length === 0) {
      break;
    }
    const currDecoder = lazyStructDecoders[0];
    const firstClient = (
      /** @type {Item | GC} */
      currDecoder.curr.id.client
    );
    if (currWrite !== null) {
      let curr = (
        /** @type {Item | GC | null} */
        currDecoder.curr
      );
      let iterated = false;
      while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
        curr = currDecoder.next();
        iterated = true;
      }
      if (curr === null || // current decoder is empty
      curr.id.client !== firstClient || // check whether there is another decoder that has has updates from `firstClient`
      iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) {
        continue;
      }
      if (firstClient !== currWrite.struct.id.client) {
        writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
        currWrite = { struct: curr, offset: 0 };
        currDecoder.next();
      } else {
        if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
          if (currWrite.struct.constructor === Skip) {
            currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
          } else {
            writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
            const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
            const struct = new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff);
            currWrite = { struct, offset: 0 };
          }
        } else {
          const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
          if (diff > 0) {
            if (currWrite.struct.constructor === Skip) {
              currWrite.struct.length -= diff;
            } else {
              curr = sliceStruct(curr, diff);
            }
          }
          if (!currWrite.struct.mergeWith(
            /** @type {any} */
            curr
          )) {
            writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
            currWrite = { struct: curr, offset: 0 };
            currDecoder.next();
          }
        }
      }
    } else {
      currWrite = { struct: (
        /** @type {Item | GC} */
        currDecoder.curr
      ), offset: 0 };
      currDecoder.next();
    }
    for (let next = currDecoder.curr; next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip; next = currDecoder.next()) {
      writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
      currWrite = { struct: next, offset: 0 };
    }
  }
  if (currWrite !== null) {
    writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
    currWrite = null;
  }
  finishLazyStructWriting(lazyStructEncoder);
  const dss = updateDecoders.map((decoder) => readDeleteSet(decoder));
  const ds = mergeDeleteSets(dss);
  writeDeleteSet(updateEncoder, ds);
  return updateEncoder.toUint8Array();
}, "mergeUpdatesV2");
var diffUpdateV2 = /* @__PURE__ */ __name((update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
  const state = decodeStateVector(sv);
  const encoder = new YEncoder();
  const lazyStructWriter = new LazyStructWriter(encoder);
  const decoder = new YDecoder(createDecoder(update));
  const reader = new LazyStructReader(decoder, false);
  while (reader.curr) {
    const curr = reader.curr;
    const currClient = curr.id.client;
    const svClock = state.get(currClient) || 0;
    if (reader.curr.constructor === Skip) {
      reader.next();
      continue;
    }
    if (curr.id.clock + curr.length > svClock) {
      writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
      reader.next();
      while (reader.curr && reader.curr.id.client === currClient) {
        writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
        reader.next();
      }
    } else {
      while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) {
        reader.next();
      }
    }
  }
  finishLazyStructWriting(lazyStructWriter);
  const ds = readDeleteSet(decoder);
  writeDeleteSet(encoder, ds);
  return encoder.toUint8Array();
}, "diffUpdateV2");
var flushLazyStructWriter = /* @__PURE__ */ __name((lazyWriter) => {
  if (lazyWriter.written > 0) {
    lazyWriter.clientStructs.push({ written: lazyWriter.written, restEncoder: toUint8Array(lazyWriter.encoder.restEncoder) });
    lazyWriter.encoder.restEncoder = createEncoder();
    lazyWriter.written = 0;
  }
}, "flushLazyStructWriter");
var writeStructToLazyStructWriter = /* @__PURE__ */ __name((lazyWriter, struct, offset) => {
  if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) {
    flushLazyStructWriter(lazyWriter);
  }
  if (lazyWriter.written === 0) {
    lazyWriter.currClient = struct.id.client;
    lazyWriter.encoder.writeClient(struct.id.client);
    writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
  }
  struct.write(lazyWriter.encoder, offset);
  lazyWriter.written++;
}, "writeStructToLazyStructWriter");
var finishLazyStructWriting = /* @__PURE__ */ __name((lazyWriter) => {
  flushLazyStructWriter(lazyWriter);
  const restEncoder = lazyWriter.encoder.restEncoder;
  writeVarUint(restEncoder, lazyWriter.clientStructs.length);
  for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
    const partStructs = lazyWriter.clientStructs[i];
    writeVarUint(restEncoder, partStructs.written);
    writeUint8Array(restEncoder, partStructs.restEncoder);
  }
}, "finishLazyStructWriting");
var convertUpdateFormat = /* @__PURE__ */ __name((update, blockTransformer, YDecoder, YEncoder) => {
  const updateDecoder = new YDecoder(createDecoder(update));
  const lazyDecoder = new LazyStructReader(updateDecoder, false);
  const updateEncoder = new YEncoder();
  const lazyWriter = new LazyStructWriter(updateEncoder);
  for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
    writeStructToLazyStructWriter(lazyWriter, blockTransformer(curr), 0);
  }
  finishLazyStructWriting(lazyWriter);
  const ds = readDeleteSet(updateDecoder);
  writeDeleteSet(updateEncoder, ds);
  return updateEncoder.toUint8Array();
}, "convertUpdateFormat");
var convertUpdateFormatV2ToV1 = /* @__PURE__ */ __name((update) => convertUpdateFormat(update, id, UpdateDecoderV2, UpdateEncoderV1), "convertUpdateFormatV2ToV1");
var errorComputeChanges = "You must not compute changes after the event-handler fired.";
var YEvent = class {
  static {
    __name(this, "YEvent");
  }
  /**
   * @param {T} target The changed type.
   * @param {Transaction} transaction
   */
  constructor(target, transaction) {
    this.target = target;
    this.currentTarget = target;
    this.transaction = transaction;
    this._changes = null;
    this._keys = null;
    this._delta = null;
    this._path = null;
  }
  /**
   * Computes the path from `y` to the changed type.
   *
   * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
   *
   * The following property holds:
   * @example
   *   let type = y
   *   event.path.forEach(dir => {
   *     type = type.get(dir)
   *   })
   *   type === event.target // => true
   */
  get path() {
    return this._path || (this._path = getPathTo(this.currentTarget, this.target));
  }
  /**
   * Check if a struct is deleted by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  deletes(struct) {
    return isDeleted(this.transaction.deleteSet, struct.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) {
        throw create3(errorComputeChanges);
      }
      const keys2 = /* @__PURE__ */ new Map();
      const target = this.target;
      const changed = (
        /** @type Set<string|null> */
        this.transaction.changed.get(target)
      );
      changed.forEach((key) => {
        if (key !== null) {
          const item = (
            /** @type {Item} */
            target._map.get(key)
          );
          let action;
          let oldValue;
          if (this.adds(item)) {
            let prev = item.left;
            while (prev !== null && this.adds(prev)) {
              prev = prev.left;
            }
            if (this.deletes(item)) {
              if (prev !== null && this.deletes(prev)) {
                action = "delete";
                oldValue = last(prev.content.getContent());
              } else {
                return;
              }
            } else {
              if (prev !== null && this.deletes(prev)) {
                action = "update";
                oldValue = last(prev.content.getContent());
              } else {
                action = "add";
                oldValue = void 0;
              }
            }
          } else {
            if (this.deletes(item)) {
              action = "delete";
              oldValue = last(
                /** @type {Item} */
                item.content.getContent()
              );
            } else {
              return;
            }
          }
          keys2.set(key, { action, oldValue });
        }
      });
      this._keys = keys2;
    }
    return this._keys;
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
   */
  get delta() {
    return this.changes.delta;
  }
  /**
   * Check if a struct is added by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  adds(struct) {
    return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    let changes = this._changes;
    if (changes === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) {
        throw create3(errorComputeChanges);
      }
      const target = this.target;
      const added = create2();
      const deleted = create2();
      const delta = [];
      changes = {
        added,
        deleted,
        delta,
        keys: this.keys
      };
      const changed = (
        /** @type Set<string|null> */
        this.transaction.changed.get(target)
      );
      if (changed.has(null)) {
        let lastOp = null;
        const packOp = /* @__PURE__ */ __name(() => {
          if (lastOp) {
            delta.push(lastOp);
          }
        }, "packOp");
        for (let item = target._start; item !== null; item = item.right) {
          if (item.deleted) {
            if (this.deletes(item) && !this.adds(item)) {
              if (lastOp === null || lastOp.delete === void 0) {
                packOp();
                lastOp = { delete: 0 };
              }
              lastOp.delete += item.length;
              deleted.add(item);
            }
          } else {
            if (this.adds(item)) {
              if (lastOp === null || lastOp.insert === void 0) {
                packOp();
                lastOp = { insert: [] };
              }
              lastOp.insert = lastOp.insert.concat(item.content.getContent());
              added.add(item);
            } else {
              if (lastOp === null || lastOp.retain === void 0) {
                packOp();
                lastOp = { retain: 0 };
              }
              lastOp.retain += item.length;
            }
          }
        }
        if (lastOp !== null && lastOp.retain === void 0) {
          packOp();
        }
      }
      this._changes = changes;
    }
    return (
      /** @type {any} */
      changes
    );
  }
};
var getPathTo = /* @__PURE__ */ __name((parent, child) => {
  const path = [];
  while (child._item !== null && child !== parent) {
    if (child._item.parentSub !== null) {
      path.unshift(child._item.parentSub);
    } else {
      let i = 0;
      let c = (
        /** @type {AbstractType<any>} */
        child._item.parent._start
      );
      while (c !== child._item && c !== null) {
        if (!c.deleted && c.countable) {
          i += c.length;
        }
        c = c.right;
      }
      path.unshift(i);
    }
    child = /** @type {AbstractType<any>} */
    child._item.parent;
  }
  return path;
}, "getPathTo");
var warnPrematureAccess = /* @__PURE__ */ __name(() => {
  warn3("Invalid access: Add Yjs type to a document before reading data.");
}, "warnPrematureAccess");
var maxSearchMarker = 80;
var globalSearchMarkerTimestamp = 0;
var ArraySearchMarker = class {
  static {
    __name(this, "ArraySearchMarker");
  }
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(p, index) {
    p.marker = true;
    this.p = p;
    this.index = index;
    this.timestamp = globalSearchMarkerTimestamp++;
  }
};
var refreshMarkerTimestamp = /* @__PURE__ */ __name((marker) => {
  marker.timestamp = globalSearchMarkerTimestamp++;
}, "refreshMarkerTimestamp");
var overwriteMarker = /* @__PURE__ */ __name((marker, p, index) => {
  marker.p.marker = false;
  marker.p = p;
  p.marker = true;
  marker.index = index;
  marker.timestamp = globalSearchMarkerTimestamp++;
}, "overwriteMarker");
var markPosition = /* @__PURE__ */ __name((searchMarker, p, index) => {
  if (searchMarker.length >= maxSearchMarker) {
    const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
    overwriteMarker(marker, p, index);
    return marker;
  } else {
    const pm = new ArraySearchMarker(p, index);
    searchMarker.push(pm);
    return pm;
  }
}, "markPosition");
var findMarker = /* @__PURE__ */ __name((yarray, index) => {
  if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
    return null;
  }
  const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
  let p = yarray._start;
  let pindex = 0;
  if (marker !== null) {
    p = marker.p;
    pindex = marker.index;
    refreshMarkerTimestamp(marker);
  }
  while (p.right !== null && pindex < index) {
    if (!p.deleted && p.countable) {
      if (index < pindex + p.length) {
        break;
      }
      pindex += p.length;
    }
    p = p.right;
  }
  while (p.left !== null && pindex > index) {
    p = p.left;
    if (!p.deleted && p.countable) {
      pindex -= p.length;
    }
  }
  while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
    p = p.left;
    if (!p.deleted && p.countable) {
      pindex -= p.length;
    }
  }
  if (marker !== null && abs(marker.index - pindex) < /** @type {YText|YArray<any>} */
  p.parent.length / maxSearchMarker) {
    overwriteMarker(marker, p, pindex);
    return marker;
  } else {
    return markPosition(yarray._searchMarker, p, pindex);
  }
}, "findMarker");
var updateMarkerChanges = /* @__PURE__ */ __name((searchMarker, index, len) => {
  for (let i = searchMarker.length - 1; i >= 0; i--) {
    const m = searchMarker[i];
    if (len > 0) {
      let p = m.p;
      p.marker = false;
      while (p && (p.deleted || !p.countable)) {
        p = p.left;
        if (p && !p.deleted && p.countable) {
          m.index -= p.length;
        }
      }
      if (p === null || p.marker === true) {
        searchMarker.splice(i, 1);
        continue;
      }
      m.p = p;
      p.marker = true;
    }
    if (index < m.index || len > 0 && index === m.index) {
      m.index = max(index, m.index + len);
    }
  }
}, "updateMarkerChanges");
var callTypeObservers = /* @__PURE__ */ __name((type, transaction, event) => {
  const changedType = type;
  const changedParentTypes = transaction.changedParentTypes;
  while (true) {
    setIfUndefined(changedParentTypes, type, () => []).push(event);
    if (type._item === null) {
      break;
    }
    type = /** @type {AbstractType<any>} */
    type._item.parent;
  }
  callEventHandlerListeners(changedType._eH, event, transaction);
}, "callTypeObservers");
var AbstractType = class {
  static {
    __name(this, "AbstractType");
  }
  constructor() {
    this._item = null;
    this._map = /* @__PURE__ */ new Map();
    this._start = null;
    this.doc = null;
    this._length = 0;
    this._eH = createEventHandler();
    this._dEH = createEventHandler();
    this._searchMarker = null;
  }
  /**
   * @return {AbstractType<any>|null}
   */
  get parent() {
    return this._item ? (
      /** @type {AbstractType<any>} */
      this._item.parent
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item|null} item
   */
  _integrate(y, item) {
    this.doc = y;
    this._item = item;
  }
  /**
   * @return {AbstractType<EventType>}
   */
  _copy() {
    throw methodUnimplemented();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {AbstractType<EventType>}
   */
  clone() {
    throw methodUnimplemented();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
   */
  _write(_encoder) {
  }
  /**
   * The first non-deleted item
   */
  get _first() {
    let n = this._start;
    while (n !== null && n.deleted) {
      n = n.right;
    }
    return n;
  }
  /**
   * Creates YEvent and calls all type observers.
   * Must be implemented by each type.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, _parentSubs) {
    if (!transaction.local && this._searchMarker) {
      this._searchMarker.length = 0;
    }
  }
  /**
   * Observe all events that are created on this type.
   *
   * @param {function(EventType, Transaction):void} f Observer function
   */
  observe(f) {
    addEventHandlerListener(this._eH, f);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(f) {
    addEventHandlerListener(this._dEH, f);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(f) {
    removeEventHandlerListener(this._eH, f);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(f) {
    removeEventHandlerListener(this._dEH, f);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
};
var typeListSlice = /* @__PURE__ */ __name((type, start, end) => {
  type.doc ?? warnPrematureAccess();
  if (start < 0) {
    start = type._length + start;
  }
  if (end < 0) {
    end = type._length + end;
  }
  let len = end - start;
  const cs = [];
  let n = type._start;
  while (n !== null && len > 0) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      if (c.length <= start) {
        start -= c.length;
      } else {
        for (let i = start; i < c.length && len > 0; i++) {
          cs.push(c[i]);
          len--;
        }
        start = 0;
      }
    }
    n = n.right;
  }
  return cs;
}, "typeListSlice");
var typeListToArray = /* @__PURE__ */ __name((type) => {
  type.doc ?? warnPrematureAccess();
  const cs = [];
  let n = type._start;
  while (n !== null) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      for (let i = 0; i < c.length; i++) {
        cs.push(c[i]);
      }
    }
    n = n.right;
  }
  return cs;
}, "typeListToArray");
var typeListForEach = /* @__PURE__ */ __name((type, f) => {
  let index = 0;
  let n = type._start;
  type.doc ?? warnPrematureAccess();
  while (n !== null) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      for (let i = 0; i < c.length; i++) {
        f(c[i], index++, type);
      }
    }
    n = n.right;
  }
}, "typeListForEach");
var typeListMap = /* @__PURE__ */ __name((type, f) => {
  const result = [];
  typeListForEach(type, (c, i) => {
    result.push(f(c, i, type));
  });
  return result;
}, "typeListMap");
var typeListCreateIterator = /* @__PURE__ */ __name((type) => {
  let n = type._start;
  let currentContent = null;
  let currentContentIndex = 0;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next: /* @__PURE__ */ __name(() => {
      if (currentContent === null) {
        while (n !== null && n.deleted) {
          n = n.right;
        }
        if (n === null) {
          return {
            done: true,
            value: void 0
          };
        }
        currentContent = n.content.getContent();
        currentContentIndex = 0;
        n = n.right;
      }
      const value = currentContent[currentContentIndex++];
      if (currentContent.length <= currentContentIndex) {
        currentContent = null;
      }
      return {
        done: false,
        value
      };
    }, "next")
  };
}, "typeListCreateIterator");
var typeListGet = /* @__PURE__ */ __name((type, index) => {
  type.doc ?? warnPrematureAccess();
  const marker = findMarker(type, index);
  let n = type._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
  }
  for (; n !== null; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index < n.length) {
        return n.content.getContent()[index];
      }
      index -= n.length;
    }
  }
}, "typeListGet");
var typeListInsertGenericsAfter = /* @__PURE__ */ __name((transaction, parent, referenceItem, content) => {
  let left = referenceItem;
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  const store = doc2.store;
  const right = referenceItem === null ? parent._start : referenceItem.right;
  let jsonContent = [];
  const packJsonContent = /* @__PURE__ */ __name(() => {
    if (jsonContent.length > 0) {
      left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
      left.integrate(transaction, 0);
      jsonContent = [];
    }
  }, "packJsonContent");
  content.forEach((c) => {
    if (c === null) {
      jsonContent.push(c);
    } else {
      switch (c.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          jsonContent.push(c);
          break;
        default:
          packJsonContent();
          switch (c.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(
                /** @type {Uint8Array} */
                c
              )));
              left.integrate(transaction, 0);
              break;
            case Doc:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(
                /** @type {Doc} */
                c
              ));
              left.integrate(transaction, 0);
              break;
            default:
              if (c instanceof AbstractType) {
                left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
                left.integrate(transaction, 0);
              } else {
                throw new Error("Unexpected content type in insert operation");
              }
          }
      }
    }
  });
  packJsonContent();
}, "typeListInsertGenericsAfter");
var lengthExceeded = /* @__PURE__ */ __name(() => create3("Length exceeded!"), "lengthExceeded");
var typeListInsertGenerics = /* @__PURE__ */ __name((transaction, parent, index, content) => {
  if (index > parent._length) {
    throw lengthExceeded();
  }
  if (index === 0) {
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, index, content.length);
    }
    return typeListInsertGenericsAfter(transaction, parent, null, content);
  }
  const startIndex = index;
  const marker = findMarker(parent, index);
  let n = parent._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
    if (index === 0) {
      n = n.prev;
      index += n && n.countable && !n.deleted ? n.length : 0;
    }
  }
  for (; n !== null; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index <= n.length) {
        if (index < n.length) {
          getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
        }
        break;
      }
      index -= n.length;
    }
  }
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, startIndex, content.length);
  }
  return typeListInsertGenericsAfter(transaction, parent, n, content);
}, "typeListInsertGenerics");
var typeListPushGenerics = /* @__PURE__ */ __name((transaction, parent, content) => {
  const marker = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, { index: 0, p: parent._start });
  let n = marker.p;
  if (n) {
    while (n.right) {
      n = n.right;
    }
  }
  return typeListInsertGenericsAfter(transaction, parent, n, content);
}, "typeListPushGenerics");
var typeListDelete = /* @__PURE__ */ __name((transaction, parent, index, length2) => {
  if (length2 === 0) {
    return;
  }
  const startIndex = index;
  const startLength = length2;
  const marker = findMarker(parent, index);
  let n = parent._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
  }
  for (; n !== null && index > 0; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index < n.length) {
        getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
      }
      index -= n.length;
    }
  }
  while (length2 > 0 && n !== null) {
    if (!n.deleted) {
      if (length2 < n.length) {
        getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length2));
      }
      n.delete(transaction);
      length2 -= n.length;
    }
    n = n.right;
  }
  if (length2 > 0) {
    throw lengthExceeded();
  }
  if (parent._searchMarker) {
    updateMarkerChanges(
      parent._searchMarker,
      startIndex,
      -startLength + length2
      /* in case we remove the above exception */
    );
  }
}, "typeListDelete");
var typeMapDelete = /* @__PURE__ */ __name((transaction, parent, key) => {
  const c = parent._map.get(key);
  if (c !== void 0) {
    c.delete(transaction);
  }
}, "typeMapDelete");
var typeMapSet = /* @__PURE__ */ __name((transaction, parent, key, value) => {
  const left = parent._map.get(key) || null;
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  let content;
  if (value == null) {
    content = new ContentAny([value]);
  } else {
    switch (value.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        content = new ContentAny([value]);
        break;
      case Uint8Array:
        content = new ContentBinary(
          /** @type {Uint8Array} */
          value
        );
        break;
      case Doc:
        content = new ContentDoc(
          /** @type {Doc} */
          value
        );
        break;
      default:
        if (value instanceof AbstractType) {
          content = new ContentType(value);
        } else {
          throw new Error("Unexpected content type");
        }
    }
  }
  new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
}, "typeMapSet");
var typeMapGet = /* @__PURE__ */ __name((parent, key) => {
  parent.doc ?? warnPrematureAccess();
  const val = parent._map.get(key);
  return val !== void 0 && !val.deleted ? val.content.getContent()[val.length - 1] : void 0;
}, "typeMapGet");
var typeMapGetAll = /* @__PURE__ */ __name((parent) => {
  const res = {};
  parent.doc ?? warnPrematureAccess();
  parent._map.forEach((value, key) => {
    if (!value.deleted) {
      res[key] = value.content.getContent()[value.length - 1];
    }
  });
  return res;
}, "typeMapGetAll");
var typeMapHas = /* @__PURE__ */ __name((parent, key) => {
  parent.doc ?? warnPrematureAccess();
  const val = parent._map.get(key);
  return val !== void 0 && !val.deleted;
}, "typeMapHas");
var typeMapGetAllSnapshot = /* @__PURE__ */ __name((parent, snapshot) => {
  const res = {};
  parent._map.forEach((value, key) => {
    let v = value;
    while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) {
      v = v.left;
    }
    if (v !== null && isVisible(v, snapshot)) {
      res[key] = v.content.getContent()[v.length - 1];
    }
  });
  return res;
}, "typeMapGetAllSnapshot");
var createMapIterator = /* @__PURE__ */ __name((type) => {
  type.doc ?? warnPrematureAccess();
  return iteratorFilter(
    type._map.entries(),
    /** @param {any} entry */
    (entry) => !entry[1].deleted
  );
}, "createMapIterator");
var YArrayEvent = class extends YEvent {
  static {
    __name(this, "YArrayEvent");
  }
};
var YArray = class _YArray extends AbstractType {
  static {
    __name(this, "YArray");
  }
  constructor() {
    super();
    this._prelimContent = [];
    this._searchMarker = [];
  }
  /**
   * Construct a new YArray containing the specified items.
   * @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
   * @param {Array<T>} items
   * @return {YArray<T>}
   */
  static from(items) {
    const a = new _YArray();
    a.push(items);
    return a;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    );
    this._prelimContent = null;
  }
  /**
   * @return {YArray<T>}
   */
  _copy() {
    return new _YArray();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const arr = new _YArray();
    arr.insert(0, this.toArray().map(
      (el) => el instanceof AbstractType ? (
        /** @type {typeof el} */
        el.clone()
      ) : el
    ));
    return arr;
  }
  get length() {
    this.doc ?? warnPrematureAccess();
    return this._length;
  }
  /**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    super._callObserver(transaction, parentSubs);
    callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
  }
  /**
   * Inserts new content at an index.
   *
   * Important: This function expects an array of content. Not just a content
   * object. The reason for this "weirdness" is that inserting several elements
   * is very efficient when it is done as a single operation.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  yarray.insert(0, ['a'])
   *  // Insert numbers 1, 2 at position 1
   *  yarray.insert(1, [1, 2])
   *
   * @param {number} index The index to insert content at.
   * @param {Array<T>} content The array of content
   */
  insert(index, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListInsertGenerics(
          transaction,
          this,
          index,
          /** @type {any} */
          content
        );
      });
    } else {
      this._prelimContent.splice(index, 0, ...content);
    }
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<T>} content Array of content to append.
   *
   * @todo Use the following implementation in all types.
   */
  push(content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListPushGenerics(
          transaction,
          this,
          /** @type {any} */
          content
        );
      });
    } else {
      this._prelimContent.push(...content);
    }
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<T>} content Array of content to prepend.
   */
  unshift(content) {
    this.insert(0, content);
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} length The number of elements to remove. Defaults to 1.
   */
  delete(index, length2 = 1) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListDelete(transaction, this, index, length2);
      });
    } else {
      this._prelimContent.splice(index, length2);
    }
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(index) {
    return typeListGet(this, index);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return typeListToArray(this);
  }
  /**
   * Returns a portion of this YArray into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<T>}
   */
  slice(start = 0, end = this.length) {
    return typeListSlice(this, start, end);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((c) => c instanceof AbstractType ? c.toJSON() : c);
  }
  /**
   * Returns an Array with the result of calling a provided function on every
   * element of this YArray.
   *
   * @template M
   * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
   * @return {Array<M>} A new array with each element being the result of the
   *                 callback function
   */
  map(f) {
    return typeListMap(
      this,
      /** @type {any} */
      f
    );
  }
  /**
   * Executes a provided function once on every element of this YArray.
   *
   * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
   */
  forEach(f) {
    typeListForEach(this, f);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return typeListCreateIterator(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YArrayRefID);
  }
};
var readYArray = /* @__PURE__ */ __name((_decoder) => new YArray(), "readYArray");
var YMapEvent = class extends YEvent {
  static {
    __name(this, "YMapEvent");
  }
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(ymap, transaction, subs) {
    super(ymap, transaction);
    this.keysChanged = subs;
  }
};
var YMap = class _YMap extends AbstractType {
  static {
    __name(this, "YMap");
  }
  /**
   *
   * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
   */
  constructor(entries) {
    super();
    this._prelimContent = null;
    if (entries === void 0) {
      this._prelimContent = /* @__PURE__ */ new Map();
    } else {
      this._prelimContent = new Map(entries);
    }
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    this._prelimContent.forEach((value, key) => {
      this.set(key, value);
    });
    this._prelimContent = null;
  }
  /**
   * @return {YMap<MapType>}
   */
  _copy() {
    return new _YMap();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YMap<MapType>}
   */
  clone() {
    const map2 = new _YMap();
    this.forEach((value, key) => {
      map2.set(key, value instanceof AbstractType ? (
        /** @type {typeof value} */
        value.clone()
      ) : value);
    });
    return map2;
  }
  /**
   * Creates YMapEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Object<string,any>}
   */
  toJSON() {
    this.doc ?? warnPrematureAccess();
    const map2 = {};
    this._map.forEach((item, key) => {
      if (!item.deleted) {
        const v = item.content.getContent()[item.length - 1];
        map2[key] = v instanceof AbstractType ? v.toJSON() : v;
      }
    });
    return map2;
  }
  /**
   * Returns the size of the YMap (count of key/value pairs)
   *
   * @return {number}
   */
  get size() {
    return [...createMapIterator(this)].length;
  }
  /**
   * Returns the keys for each element in the YMap Type.
   *
   * @return {IterableIterator<string>}
   */
  keys() {
    return iteratorMap(
      createMapIterator(this),
      /** @param {any} v */
      (v) => v[0]
    );
  }
  /**
   * Returns the values for each element in the YMap Type.
   *
   * @return {IterableIterator<MapType>}
   */
  values() {
    return iteratorMap(
      createMapIterator(this),
      /** @param {any} v */
      (v) => v[1].content.getContent()[v[1].length - 1]
    );
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  entries() {
    return iteratorMap(
      createMapIterator(this),
      /** @param {any} v */
      (v) => (
        /** @type {any} */
        [v[0], v[1].content.getContent()[v[1].length - 1]]
      )
    );
  }
  /**
   * Executes a provided function on once on every key-value pair.
   *
   * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
   */
  forEach(f) {
    this.doc ?? warnPrematureAccess();
    this._map.forEach((item, key) => {
      if (!item.deleted) {
        f(item.content.getContent()[item.length - 1], key, this);
      }
    });
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  [Symbol.iterator]() {
    return this.entries();
  }
  /**
   * Remove a specified element from this YMap.
   *
   * @param {string} key The key of the element to remove.
   */
  delete(key) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, key);
      });
    } else {
      this._prelimContent.delete(key);
    }
  }
  /**
   * Adds or updates an element with a specified key and value.
   * @template {MapType} VAL
   *
   * @param {string} key The key of the element to add to this YMap
   * @param {VAL} value The value of the element to add
   * @return {VAL}
   */
  set(key, value) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(
          transaction,
          this,
          key,
          /** @type {any} */
          value
        );
      });
    } else {
      this._prelimContent.set(key, value);
    }
    return value;
  }
  /**
   * Returns a specified element from this YMap.
   *
   * @param {string} key
   * @return {MapType|undefined}
   */
  get(key) {
    return (
      /** @type {any} */
      typeMapGet(this, key)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(key) {
    return typeMapHas(this, key);
  }
  /**
   * Removes all elements from this YMap.
   */
  clear() {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        this.forEach(function(_value, key, map2) {
          typeMapDelete(transaction, map2, key);
        });
      });
    } else {
      this._prelimContent.clear();
    }
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YMapRefID);
  }
};
var readYMap = /* @__PURE__ */ __name((_decoder) => new YMap(), "readYMap");
var equalAttrs = /* @__PURE__ */ __name((a, b) => a === b || typeof a === "object" && typeof b === "object" && a && b && equalFlat(a, b), "equalAttrs");
var ItemTextListPosition = class {
  static {
    __name(this, "ItemTextListPosition");
  }
  /**
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {number} index
   * @param {Map<string,any>} currentAttributes
   */
  constructor(left, right, index, currentAttributes) {
    this.left = left;
    this.right = right;
    this.index = index;
    this.currentAttributes = currentAttributes;
  }
  /**
   * Only call this if you know that this.right is defined
   */
  forward() {
    if (this.right === null) {
      unexpectedCase();
    }
    switch (this.right.content.constructor) {
      case ContentFormat:
        if (!this.right.deleted) {
          updateCurrentAttributes(
            this.currentAttributes,
            /** @type {ContentFormat} */
            this.right.content
          );
        }
        break;
      default:
        if (!this.right.deleted) {
          this.index += this.right.length;
        }
        break;
    }
    this.left = this.right;
    this.right = this.right.right;
  }
};
var findNextPosition = /* @__PURE__ */ __name((transaction, pos, count3) => {
  while (pos.right !== null && count3 > 0) {
    switch (pos.right.content.constructor) {
      case ContentFormat:
        if (!pos.right.deleted) {
          updateCurrentAttributes(
            pos.currentAttributes,
            /** @type {ContentFormat} */
            pos.right.content
          );
        }
        break;
      default:
        if (!pos.right.deleted) {
          if (count3 < pos.right.length) {
            getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count3));
          }
          pos.index += pos.right.length;
          count3 -= pos.right.length;
        }
        break;
    }
    pos.left = pos.right;
    pos.right = pos.right.right;
  }
  return pos;
}, "findNextPosition");
var findPosition = /* @__PURE__ */ __name((transaction, parent, index, useSearchMarker) => {
  const currentAttributes = /* @__PURE__ */ new Map();
  const marker = useSearchMarker ? findMarker(parent, index) : null;
  if (marker) {
    const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
    return findNextPosition(transaction, pos, index - marker.index);
  } else {
    const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
    return findNextPosition(transaction, pos, index);
  }
}, "findPosition");
var insertNegatedAttributes = /* @__PURE__ */ __name((transaction, parent, currPos, negatedAttributes) => {
  while (currPos.right !== null && (currPos.right.deleted === true || currPos.right.content.constructor === ContentFormat && equalAttrs(
    negatedAttributes.get(
      /** @type {ContentFormat} */
      currPos.right.content.key
    ),
    /** @type {ContentFormat} */
    currPos.right.content.value
  ))) {
    if (!currPos.right.deleted) {
      negatedAttributes.delete(
        /** @type {ContentFormat} */
        currPos.right.content.key
      );
    }
    currPos.forward();
  }
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  negatedAttributes.forEach((val, key) => {
    const left = currPos.left;
    const right = currPos.right;
    const nextFormat = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
    nextFormat.integrate(transaction, 0);
    currPos.right = nextFormat;
    currPos.forward();
  });
}, "insertNegatedAttributes");
var updateCurrentAttributes = /* @__PURE__ */ __name((currentAttributes, format) => {
  const { key, value } = format;
  if (value === null) {
    currentAttributes.delete(key);
  } else {
    currentAttributes.set(key, value);
  }
}, "updateCurrentAttributes");
var minimizeAttributeChanges = /* @__PURE__ */ __name((currPos, attributes) => {
  while (true) {
    if (currPos.right === null) {
      break;
    } else if (currPos.right.deleted || currPos.right.content.constructor === ContentFormat && equalAttrs(
      attributes[
        /** @type {ContentFormat} */
        currPos.right.content.key
      ] ?? null,
      /** @type {ContentFormat} */
      currPos.right.content.value
    )) ;
    else {
      break;
    }
    currPos.forward();
  }
}, "minimizeAttributeChanges");
var insertAttributes = /* @__PURE__ */ __name((transaction, parent, currPos, attributes) => {
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  const negatedAttributes = /* @__PURE__ */ new Map();
  for (const key in attributes) {
    const val = attributes[key];
    const currentVal = currPos.currentAttributes.get(key) ?? null;
    if (!equalAttrs(currentVal, val)) {
      negatedAttributes.set(key, currentVal);
      const { left, right } = currPos;
      currPos.right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
      currPos.right.integrate(transaction, 0);
      currPos.forward();
    }
  }
  return negatedAttributes;
}, "insertAttributes");
var insertText = /* @__PURE__ */ __name((transaction, parent, currPos, text2, attributes) => {
  currPos.currentAttributes.forEach((_val, key) => {
    if (attributes[key] === void 0) {
      attributes[key] = null;
    }
  });
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  minimizeAttributeChanges(currPos, attributes);
  const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
  const content = text2.constructor === String ? new ContentString(
    /** @type {string} */
    text2
  ) : text2 instanceof AbstractType ? new ContentType(text2) : new ContentEmbed(text2);
  let { left, right, index } = currPos;
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
  }
  right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
  right.integrate(transaction, 0);
  currPos.right = right;
  currPos.index = index;
  currPos.forward();
  insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
}, "insertText");
var formatText = /* @__PURE__ */ __name((transaction, parent, currPos, length2, attributes) => {
  const doc2 = transaction.doc;
  const ownClientId = doc2.clientID;
  minimizeAttributeChanges(currPos, attributes);
  const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
  iterationLoop: while (currPos.right !== null && (length2 > 0 || negatedAttributes.size > 0 && (currPos.right.deleted || currPos.right.content.constructor === ContentFormat))) {
    if (!currPos.right.deleted) {
      switch (currPos.right.content.constructor) {
        case ContentFormat: {
          const { key, value } = (
            /** @type {ContentFormat} */
            currPos.right.content
          );
          const attr = attributes[key];
          if (attr !== void 0) {
            if (equalAttrs(attr, value)) {
              negatedAttributes.delete(key);
            } else {
              if (length2 === 0) {
                break iterationLoop;
              }
              negatedAttributes.set(key, value);
            }
            currPos.right.delete(transaction);
          } else {
            currPos.currentAttributes.set(key, value);
          }
          break;
        }
        default:
          if (length2 < currPos.right.length) {
            getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
          }
          length2 -= currPos.right.length;
          break;
      }
    }
    currPos.forward();
  }
  if (length2 > 0) {
    let newlines = "";
    for (; length2 > 0; length2--) {
      newlines += "\n";
    }
    currPos.right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
    currPos.right.integrate(transaction, 0);
    currPos.forward();
  }
  insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
}, "formatText");
var cleanupFormattingGap = /* @__PURE__ */ __name((transaction, start, curr, startAttributes, currAttributes) => {
  let end = start;
  const endFormats = create();
  while (end && (!end.countable || end.deleted)) {
    if (!end.deleted && end.content.constructor === ContentFormat) {
      const cf = (
        /** @type {ContentFormat} */
        end.content
      );
      endFormats.set(cf.key, cf);
    }
    end = end.right;
  }
  let cleanups = 0;
  let reachedCurr = false;
  while (start !== end) {
    if (curr === start) {
      reachedCurr = true;
    }
    if (!start.deleted) {
      const content = start.content;
      switch (content.constructor) {
        case ContentFormat: {
          const { key, value } = (
            /** @type {ContentFormat} */
            content
          );
          const startAttrValue = startAttributes.get(key) ?? null;
          if (endFormats.get(key) !== content || startAttrValue === value) {
            start.delete(transaction);
            cleanups++;
            if (!reachedCurr && (currAttributes.get(key) ?? null) === value && startAttrValue !== value) {
              if (startAttrValue === null) {
                currAttributes.delete(key);
              } else {
                currAttributes.set(key, startAttrValue);
              }
            }
          }
          if (!reachedCurr && !start.deleted) {
            updateCurrentAttributes(
              currAttributes,
              /** @type {ContentFormat} */
              content
            );
          }
          break;
        }
      }
    }
    start = /** @type {Item} */
    start.right;
  }
  return cleanups;
}, "cleanupFormattingGap");
var cleanupContextlessFormattingGap = /* @__PURE__ */ __name((transaction, item) => {
  while (item && item.right && (item.right.deleted || !item.right.countable)) {
    item = item.right;
  }
  const attrs = /* @__PURE__ */ new Set();
  while (item && (item.deleted || !item.countable)) {
    if (!item.deleted && item.content.constructor === ContentFormat) {
      const key = (
        /** @type {ContentFormat} */
        item.content.key
      );
      if (attrs.has(key)) {
        item.delete(transaction);
      } else {
        attrs.add(key);
      }
    }
    item = item.left;
  }
}, "cleanupContextlessFormattingGap");
var cleanupYTextFormatting = /* @__PURE__ */ __name((type) => {
  let res = 0;
  transact(
    /** @type {Doc} */
    type.doc,
    (transaction) => {
      let start = (
        /** @type {Item} */
        type._start
      );
      let end = type._start;
      let startAttributes = create();
      const currentAttributes = copy(startAttributes);
      while (end) {
        if (end.deleted === false) {
          switch (end.content.constructor) {
            case ContentFormat:
              updateCurrentAttributes(
                currentAttributes,
                /** @type {ContentFormat} */
                end.content
              );
              break;
            default:
              res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
              startAttributes = copy(currentAttributes);
              start = end;
              break;
          }
        }
        end = end.right;
      }
    }
  );
  return res;
}, "cleanupYTextFormatting");
var cleanupYTextAfterTransaction = /* @__PURE__ */ __name((transaction) => {
  const needFullCleanup = /* @__PURE__ */ new Set();
  const doc2 = transaction.doc;
  for (const [client, afterClock] of transaction.afterState.entries()) {
    const clock = transaction.beforeState.get(client) || 0;
    if (afterClock === clock) {
      continue;
    }
    iterateStructs(
      transaction,
      /** @type {Array<Item|GC>} */
      doc2.store.clients.get(client),
      clock,
      afterClock,
      (item) => {
        if (!item.deleted && /** @type {Item} */
        item.content.constructor === ContentFormat && item.constructor !== GC) {
          needFullCleanup.add(
            /** @type {any} */
            item.parent
          );
        }
      }
    );
  }
  transact(doc2, (t) => {
    iterateDeletedStructs(transaction, transaction.deleteSet, (item) => {
      if (item instanceof GC || !/** @type {YText} */
      item.parent._hasFormatting || needFullCleanup.has(
        /** @type {YText} */
        item.parent
      )) {
        return;
      }
      const parent = (
        /** @type {YText} */
        item.parent
      );
      if (item.content.constructor === ContentFormat) {
        needFullCleanup.add(parent);
      } else {
        cleanupContextlessFormattingGap(t, item);
      }
    });
    for (const yText of needFullCleanup) {
      cleanupYTextFormatting(yText);
    }
  });
}, "cleanupYTextAfterTransaction");
var deleteText = /* @__PURE__ */ __name((transaction, currPos, length2) => {
  const startLength = length2;
  const startAttrs = copy(currPos.currentAttributes);
  const start = currPos.right;
  while (length2 > 0 && currPos.right !== null) {
    if (currPos.right.deleted === false) {
      switch (currPos.right.content.constructor) {
        case ContentType:
        case ContentEmbed:
        case ContentString:
          if (length2 < currPos.right.length) {
            getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
          }
          length2 -= currPos.right.length;
          currPos.right.delete(transaction);
          break;
      }
    }
    currPos.forward();
  }
  if (start) {
    cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
  }
  const parent = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (currPos.left || currPos.right).parent
  );
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length2);
  }
  return currPos;
}, "deleteText");
var YTextEvent = class extends YEvent {
  static {
    __name(this, "YTextEvent");
  }
  /**
   * @param {YText} ytext
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed
   */
  constructor(ytext, transaction, subs) {
    super(ytext, transaction);
    this.childListChanged = false;
    this.keysChanged = /* @__PURE__ */ new Set();
    subs.forEach((sub) => {
      if (sub === null) {
        this.childListChanged = true;
      } else {
        this.keysChanged.add(sub);
      }
    });
  }
  /**
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    if (this._changes === null) {
      const changes = {
        keys: this.keys,
        delta: this.delta,
        added: /* @__PURE__ */ new Set(),
        deleted: /* @__PURE__ */ new Set()
      };
      this._changes = changes;
    }
    return (
      /** @type {any} */
      this._changes
    );
  }
  /**
   * Compute the changes in the delta format.
   * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
   *
   * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
   *
   * @public
   */
  get delta() {
    if (this._delta === null) {
      const y = (
        /** @type {Doc} */
        this.target.doc
      );
      const delta = [];
      transact(y, (transaction) => {
        const currentAttributes = /* @__PURE__ */ new Map();
        const oldAttributes = /* @__PURE__ */ new Map();
        let item = this.target._start;
        let action = null;
        const attributes = {};
        let insert = "";
        let retain = 0;
        let deleteLen = 0;
        const addOp = /* @__PURE__ */ __name(() => {
          if (action !== null) {
            let op = null;
            switch (action) {
              case "delete":
                if (deleteLen > 0) {
                  op = { delete: deleteLen };
                }
                deleteLen = 0;
                break;
              case "insert":
                if (typeof insert === "object" || insert.length > 0) {
                  op = { insert };
                  if (currentAttributes.size > 0) {
                    op.attributes = {};
                    currentAttributes.forEach((value, key) => {
                      if (value !== null) {
                        op.attributes[key] = value;
                      }
                    });
                  }
                }
                insert = "";
                break;
              case "retain":
                if (retain > 0) {
                  op = { retain };
                  if (!isEmpty(attributes)) {
                    op.attributes = assign({}, attributes);
                  }
                }
                retain = 0;
                break;
            }
            if (op) delta.push(op);
            action = null;
          }
        }, "addOp");
        while (item !== null) {
          switch (item.content.constructor) {
            case ContentType:
            case ContentEmbed:
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  addOp();
                  action = "insert";
                  insert = item.content.getContent()[0];
                  addOp();
                }
              } else if (this.deletes(item)) {
                if (action !== "delete") {
                  addOp();
                  action = "delete";
                }
                deleteLen += 1;
              } else if (!item.deleted) {
                if (action !== "retain") {
                  addOp();
                  action = "retain";
                }
                retain += 1;
              }
              break;
            case ContentString:
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  if (action !== "insert") {
                    addOp();
                    action = "insert";
                  }
                  insert += /** @type {ContentString} */
                  item.content.str;
                }
              } else if (this.deletes(item)) {
                if (action !== "delete") {
                  addOp();
                  action = "delete";
                }
                deleteLen += item.length;
              } else if (!item.deleted) {
                if (action !== "retain") {
                  addOp();
                  action = "retain";
                }
                retain += item.length;
              }
              break;
            case ContentFormat: {
              const { key, value } = (
                /** @type {ContentFormat} */
                item.content
              );
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  const curVal = currentAttributes.get(key) ?? null;
                  if (!equalAttrs(curVal, value)) {
                    if (action === "retain") {
                      addOp();
                    }
                    if (equalAttrs(value, oldAttributes.get(key) ?? null)) {
                      delete attributes[key];
                    } else {
                      attributes[key] = value;
                    }
                  } else if (value !== null) {
                    item.delete(transaction);
                  }
                }
              } else if (this.deletes(item)) {
                oldAttributes.set(key, value);
                const curVal = currentAttributes.get(key) ?? null;
                if (!equalAttrs(curVal, value)) {
                  if (action === "retain") {
                    addOp();
                  }
                  attributes[key] = curVal;
                }
              } else if (!item.deleted) {
                oldAttributes.set(key, value);
                const attr = attributes[key];
                if (attr !== void 0) {
                  if (!equalAttrs(attr, value)) {
                    if (action === "retain") {
                      addOp();
                    }
                    if (value === null) {
                      delete attributes[key];
                    } else {
                      attributes[key] = value;
                    }
                  } else if (attr !== null) {
                    item.delete(transaction);
                  }
                }
              }
              if (!item.deleted) {
                if (action === "insert") {
                  addOp();
                }
                updateCurrentAttributes(
                  currentAttributes,
                  /** @type {ContentFormat} */
                  item.content
                );
              }
              break;
            }
          }
          item = item.right;
        }
        addOp();
        while (delta.length > 0) {
          const lastOp = delta[delta.length - 1];
          if (lastOp.retain !== void 0 && lastOp.attributes === void 0) {
            delta.pop();
          } else {
            break;
          }
        }
      });
      this._delta = delta;
    }
    return (
      /** @type {any} */
      this._delta
    );
  }
};
var YText = class _YText extends AbstractType {
  static {
    __name(this, "YText");
  }
  /**
   * @param {String} [string] The initial value of the YText.
   */
  constructor(string) {
    super();
    this._pending = string !== void 0 ? [() => this.insert(0, string)] : [];
    this._searchMarker = [];
    this._hasFormatting = false;
  }
  /**
   * Number of characters of this text type.
   *
   * @type {number}
   */
  get length() {
    this.doc ?? warnPrematureAccess();
    return this._length;
  }
  /**
   * @param {Doc} y
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    try {
      this._pending.forEach((f) => f());
    } catch (e) {
      console.error(e);
    }
    this._pending = null;
  }
  _copy() {
    return new _YText();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YText}
   */
  clone() {
    const text2 = new _YText();
    text2.applyDelta(this.toDelta());
    return text2;
  }
  /**
   * Creates YTextEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    super._callObserver(transaction, parentSubs);
    const event = new YTextEvent(this, transaction, parentSubs);
    callTypeObservers(this, transaction, event);
    if (!transaction.local && this._hasFormatting) {
      transaction._needFormattingCleanup = true;
    }
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @public
   */
  toString() {
    this.doc ?? warnPrematureAccess();
    let str = "";
    let n = this._start;
    while (n !== null) {
      if (!n.deleted && n.countable && n.content.constructor === ContentString) {
        str += /** @type {ContentString} */
        n.content.str;
      }
      n = n.right;
    }
    return str;
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @return {string}
   * @public
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Apply a {@link Delta} on this shared YText type.
   *
   * @param {Array<any>} delta The changes to apply on this element.
   * @param {object}  opts
   * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
   *
   *
   * @public
   */
  applyDelta(delta, { sanitize = true } = {}) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        const currPos = new ItemTextListPosition(null, this._start, 0, /* @__PURE__ */ new Map());
        for (let i = 0; i < delta.length; i++) {
          const op = delta[i];
          if (op.insert !== void 0) {
            const ins = !sanitize && typeof op.insert === "string" && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === "\n" ? op.insert.slice(0, -1) : op.insert;
            if (typeof ins !== "string" || ins.length > 0) {
              insertText(transaction, this, currPos, ins, op.attributes || {});
            }
          } else if (op.retain !== void 0) {
            formatText(transaction, this, currPos, op.retain, op.attributes || {});
          } else if (op.delete !== void 0) {
            deleteText(transaction, currPos, op.delete);
          }
        }
      });
    } else {
      this._pending.push(() => this.applyDelta(delta));
    }
  }
  /**
   * Returns the Delta representation of this YText type.
   *
   * @param {Snapshot} [snapshot]
   * @param {Snapshot} [prevSnapshot]
   * @param {function('removed' | 'added', ID):any} [computeYChange]
   * @return {any} The Delta representation of this type.
   *
   * @public
   */
  toDelta(snapshot, prevSnapshot, computeYChange) {
    this.doc ?? warnPrematureAccess();
    const ops = [];
    const currentAttributes = /* @__PURE__ */ new Map();
    const doc2 = (
      /** @type {Doc} */
      this.doc
    );
    let str = "";
    let n = this._start;
    function packStr() {
      if (str.length > 0) {
        const attributes = {};
        let addAttributes = false;
        currentAttributes.forEach((value, key) => {
          addAttributes = true;
          attributes[key] = value;
        });
        const op = { insert: str };
        if (addAttributes) {
          op.attributes = attributes;
        }
        ops.push(op);
        str = "";
      }
    }
    __name(packStr, "packStr");
    const computeDelta = /* @__PURE__ */ __name(() => {
      while (n !== null) {
        if (isVisible(n, snapshot) || prevSnapshot !== void 0 && isVisible(n, prevSnapshot)) {
          switch (n.content.constructor) {
            case ContentString: {
              const cur = currentAttributes.get("ychange");
              if (snapshot !== void 0 && !isVisible(n, snapshot)) {
                if (cur === void 0 || cur.user !== n.id.client || cur.type !== "removed") {
                  packStr();
                  currentAttributes.set("ychange", computeYChange ? computeYChange("removed", n.id) : { type: "removed" });
                }
              } else if (prevSnapshot !== void 0 && !isVisible(n, prevSnapshot)) {
                if (cur === void 0 || cur.user !== n.id.client || cur.type !== "added") {
                  packStr();
                  currentAttributes.set("ychange", computeYChange ? computeYChange("added", n.id) : { type: "added" });
                }
              } else if (cur !== void 0) {
                packStr();
                currentAttributes.delete("ychange");
              }
              str += /** @type {ContentString} */
              n.content.str;
              break;
            }
            case ContentType:
            case ContentEmbed: {
              packStr();
              const op = {
                insert: n.content.getContent()[0]
              };
              if (currentAttributes.size > 0) {
                const attrs = (
                  /** @type {Object<string,any>} */
                  {}
                );
                op.attributes = attrs;
                currentAttributes.forEach((value, key) => {
                  attrs[key] = value;
                });
              }
              ops.push(op);
              break;
            }
            case ContentFormat:
              if (isVisible(n, snapshot)) {
                packStr();
                updateCurrentAttributes(
                  currentAttributes,
                  /** @type {ContentFormat} */
                  n.content
                );
              }
              break;
          }
        }
        n = n.right;
      }
      packStr();
    }, "computeDelta");
    if (snapshot || prevSnapshot) {
      transact(doc2, (transaction) => {
        if (snapshot) {
          splitSnapshotAffectedStructs(transaction, snapshot);
        }
        if (prevSnapshot) {
          splitSnapshotAffectedStructs(transaction, prevSnapshot);
        }
        computeDelta();
      }, "cleanup");
    } else {
      computeDelta();
    }
    return ops;
  }
  /**
   * Insert text at a given index.
   *
   * @param {number} index The index at which to start inserting.
   * @param {String} text The text to insert at the specified position.
   * @param {TextAttributes} [attributes] Optionally define some formatting
   *                                    information to apply on the inserted
   *                                    Text.
   * @public
   */
  insert(index, text2, attributes) {
    if (text2.length <= 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, !attributes);
        if (!attributes) {
          attributes = {};
          pos.currentAttributes.forEach((v, k) => {
            attributes[k] = v;
          });
        }
        insertText(transaction, this, pos, text2, attributes);
      });
    } else {
      this._pending.push(() => this.insert(index, text2, attributes));
    }
  }
  /**
   * Inserts an embed at a index.
   *
   * @param {number} index The index to insert the embed at.
   * @param {Object | AbstractType<any>} embed The Object that represents the embed.
   * @param {TextAttributes} [attributes] Attribute information to apply on the
   *                                    embed
   *
   * @public
   */
  insertEmbed(index, embed, attributes) {
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, !attributes);
        insertText(transaction, this, pos, embed, attributes || {});
      });
    } else {
      this._pending.push(() => this.insertEmbed(index, embed, attributes || {}));
    }
  }
  /**
   * Deletes text starting from an index.
   *
   * @param {number} index Index at which to start deleting.
   * @param {number} length The number of characters to remove. Defaults to 1.
   *
   * @public
   */
  delete(index, length2) {
    if (length2 === 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        deleteText(transaction, findPosition(transaction, this, index, true), length2);
      });
    } else {
      this._pending.push(() => this.delete(index, length2));
    }
  }
  /**
   * Assigns properties to a range of text.
   *
   * @param {number} index The position where to start formatting.
   * @param {number} length The amount of characters to assign properties to.
   * @param {TextAttributes} attributes Attribute information to apply on the
   *                                    text.
   *
   * @public
   */
  format(index, length2, attributes) {
    if (length2 === 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, false);
        if (pos.right === null) {
          return;
        }
        formatText(transaction, this, pos, length2, attributes);
      });
    } else {
      this._pending.push(() => this.format(index, length2, attributes));
    }
  }
  /**
   * Removes an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(attributeName) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, attributeName);
      });
    } else {
      this._pending.push(() => this.removeAttribute(attributeName));
    }
  }
  /**
   * Sets or updates an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be set.
   * @param {any} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(attributeName, attributeValue) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(transaction, this, attributeName, attributeValue);
      });
    } else {
      this._pending.push(() => this.setAttribute(attributeName, attributeValue));
    }
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {any} The queried attribute value.
   *
   * @public
   */
  getAttribute(attributeName) {
    return (
      /** @type {any} */
      typeMapGet(this, attributeName)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @return {Object<string, any>} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes() {
    return typeMapGetAll(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YTextRefID);
  }
};
var readYText = /* @__PURE__ */ __name((_decoder) => new YText(), "readYText");
var YXmlTreeWalker = class {
  static {
    __name(this, "YXmlTreeWalker");
  }
  /**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
  constructor(root, f = () => true) {
    this._filter = f;
    this._root = root;
    this._currentNode = /** @type {Item} */
    root._start;
    this._firstCall = true;
    root.doc ?? warnPrematureAccess();
  }
  [Symbol.iterator]() {
    return this;
  }
  /**
   * Get the next node.
   *
   * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
   *
   * @public
   */
  next() {
    let n = this._currentNode;
    let type = n && n.content && /** @type {any} */
    n.content.type;
    if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) {
      do {
        type = /** @type {any} */
        n.content.type;
        if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
          n = type._start;
        } else {
          while (n !== null) {
            const nxt = n.next;
            if (nxt !== null) {
              n = nxt;
              break;
            } else if (n.parent === this._root) {
              n = null;
            } else {
              n = /** @type {AbstractType<any>} */
              n.parent._item;
            }
          }
        }
      } while (n !== null && (n.deleted || !this._filter(
        /** @type {ContentType} */
        n.content.type
      )));
    }
    this._firstCall = false;
    if (n === null) {
      return { value: void 0, done: true };
    }
    this._currentNode = n;
    return { value: (
      /** @type {any} */
      n.content.type
    ), done: false };
  }
};
var YXmlFragment = class _YXmlFragment extends AbstractType {
  static {
    __name(this, "YXmlFragment");
  }
  constructor() {
    super();
    this._prelimContent = [];
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get firstChild() {
    const first = this._first;
    return first ? first.content.getContent()[0] : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    );
    this._prelimContent = null;
  }
  _copy() {
    return new _YXmlFragment();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const el = new _YXmlFragment();
    el.insert(0, this.toArray().map((item) => item instanceof AbstractType ? item.clone() : item));
    return el;
  }
  get length() {
    this.doc ?? warnPrematureAccess();
    return this._prelimContent === null ? this._length : this._prelimContent.length;
  }
  /**
   * Create a subtree of childNodes.
   *
   * @example
   * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
   * for (let node in walker) {
   *   // `node` is a div node
   *   nop(node)
   * }
   *
   * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
   *                          returns a Boolean indicating whether the child
   *                          is to be included in the subtree.
   * @return {YXmlTreeWalker} A subtree and a position within it.
   *
   * @public
   */
  createTreeWalker(filter) {
    return new YXmlTreeWalker(this, filter);
  }
  /**
   * Returns the first YXmlElement that matches the query.
   * Similar to DOM's {@link querySelector}.
   *
   * Query support:
   *   - tagname
   * TODO:
   *   - id
   *   - attribute
   *
   * @param {CSS_Selector} query The query on the children.
   * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
   *
   * @public
   */
  querySelector(query) {
    query = query.toUpperCase();
    const iterator = new YXmlTreeWalker(this, (element2) => element2.nodeName && element2.nodeName.toUpperCase() === query);
    const next = iterator.next();
    if (next.done) {
      return null;
    } else {
      return next.value;
    }
  }
  /**
   * Returns all YXmlElements that match the query.
   * Similar to Dom's {@link querySelectorAll}.
   *
   * @todo Does not yet support all queries. Currently only query by tagName.
   *
   * @param {CSS_Selector} query The query on the children
   * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
   *
   * @public
   */
  querySelectorAll(query) {
    query = query.toUpperCase();
    return from(new YXmlTreeWalker(this, (element2) => element2.nodeName && element2.nodeName.toUpperCase() === query));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(transaction, parentSubs) {
    callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return typeListMap(this, (xml) => xml.toString()).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks = {}, binding2) {
    const fragment = _document.createDocumentFragment();
    if (binding2 !== void 0) {
      binding2._createAssociation(fragment, this);
    }
    typeListForEach(this, (xmlType) => {
      fragment.insertBefore(xmlType.toDOM(_document, hooks, binding2), null);
    });
    return fragment;
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {number} index The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insert(index, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListInsertGenerics(transaction, this, index, content);
      });
    } else {
      this._prelimContent.splice(index, 0, ...content);
    }
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insertAfter(ref2, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        const refItem = ref2 && ref2 instanceof AbstractType ? ref2._item : ref2;
        typeListInsertGenericsAfter(transaction, this, refItem, content);
      });
    } else {
      const pc = (
        /** @type {Array<any>} */
        this._prelimContent
      );
      const index = ref2 === null ? 0 : pc.findIndex((el) => el === ref2) + 1;
      if (index === 0 && ref2 !== null) {
        throw create3("Reference item not found");
      }
      pc.splice(index, 0, ...content);
    }
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} [length=1] The number of elements to remove. Defaults to 1.
   */
  delete(index, length2 = 1) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListDelete(transaction, this, index, length2);
      });
    } else {
      this._prelimContent.splice(index, length2);
    }
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return typeListToArray(this);
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
   */
  push(content) {
    this.insert(this.length, content);
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
   */
  unshift(content) {
    this.insert(0, content);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {YXmlElement|YXmlText}
   */
  get(index) {
    return typeListGet(this, index);
  }
  /**
   * Returns a portion of this YXmlFragment into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<YXmlElement|YXmlText>}
   */
  slice(start = 0, end = this.length) {
    return typeListSlice(this, start, end);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(f) {
    typeListForEach(this, f);
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlFragmentRefID);
  }
};
var readYXmlFragment = /* @__PURE__ */ __name((_decoder) => new YXmlFragment(), "readYXmlFragment");
var YXmlElement = class _YXmlElement extends YXmlFragment {
  static {
    __name(this, "YXmlElement");
  }
  constructor(nodeName = "UNDEFINED") {
    super();
    this.nodeName = nodeName;
    this._prelimAttrs = /* @__PURE__ */ new Map();
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const n = this._item ? this._item.next : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const n = this._item ? this._item.prev : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(y, item) {
    super._integrate(y, item);
    /** @type {Map<string, any>} */
    this._prelimAttrs.forEach((value, key) => {
      this.setAttribute(key, value);
    });
    this._prelimAttrs = null;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   *
   * @return {YXmlElement}
   */
  _copy() {
    return new _YXmlElement(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const el = new _YXmlElement(this.nodeName);
    const attrs = this.getAttributes();
    forEach(attrs, (value, key) => {
      el.setAttribute(
        key,
        /** @type {any} */
        value
      );
    });
    el.insert(0, this.toArray().map((v) => v instanceof AbstractType ? v.clone() : v));
    return el;
  }
  /**
   * Returns the XML serialization of this YXmlElement.
   * The attributes are ordered by attribute-name, so you can easily use this
   * method to compare YXmlElements
   *
   * @return {string} The string representation of this type.
   *
   * @public
   */
  toString() {
    const attrs = this.getAttributes();
    const stringBuilder = [];
    const keys2 = [];
    for (const key in attrs) {
      keys2.push(key);
    }
    keys2.sort();
    const keysLen = keys2.length;
    for (let i = 0; i < keysLen; i++) {
      const key = keys2[i];
      stringBuilder.push(key + '="' + attrs[key] + '"');
    }
    const nodeName = this.nodeName.toLocaleLowerCase();
    const attrsString = stringBuilder.length > 0 ? " " + stringBuilder.join(" ") : "";
    return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`;
  }
  /**
   * Removes an attribute from this YXmlElement.
   *
   * @param {string} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(attributeName) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, attributeName);
      });
    } else {
      this._prelimAttrs.delete(attributeName);
    }
  }
  /**
   * Sets or updates an attribute.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that is to be set.
   * @param {KV[KEY]} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(attributeName, attributeValue) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(transaction, this, attributeName, attributeValue);
      });
    } else {
      this._prelimAttrs.set(attributeName, attributeValue);
    }
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {KV[KEY]|undefined} The queried attribute value.
   *
   * @public
   */
  getAttribute(attributeName) {
    return (
      /** @type {any} */
      typeMapGet(this, attributeName)
    );
  }
  /**
   * Returns whether an attribute exists
   *
   * @param {string} attributeName The attribute name to check for existence.
   * @return {boolean} whether the attribute exists.
   *
   * @public
   */
  hasAttribute(attributeName) {
    return (
      /** @type {any} */
      typeMapHas(this, attributeName)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @param {Snapshot} [snapshot]
   * @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes(snapshot) {
    return (
      /** @type {any} */
      snapshot ? typeMapGetAllSnapshot(this, snapshot) : typeMapGetAll(this)
    );
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks = {}, binding2) {
    const dom = _document.createElement(this.nodeName);
    const attrs = this.getAttributes();
    for (const key in attrs) {
      const value = attrs[key];
      if (typeof value === "string") {
        dom.setAttribute(key, value);
      }
    }
    typeListForEach(this, (yxml) => {
      dom.appendChild(yxml.toDOM(_document, hooks, binding2));
    });
    if (binding2 !== void 0) {
      binding2._createAssociation(dom, this);
    }
    return dom;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlElementRefID);
    encoder.writeKey(this.nodeName);
  }
};
var readYXmlElement = /* @__PURE__ */ __name((decoder) => new YXmlElement(decoder.readKey()), "readYXmlElement");
var YXmlEvent = class extends YEvent {
  static {
    __name(this, "YXmlEvent");
  }
  /**
   * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
   * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
   *                   child list changed.
   * @param {Transaction} transaction The transaction instance with which the
   *                                  change was created.
   */
  constructor(target, subs, transaction) {
    super(target, transaction);
    this.childListChanged = false;
    this.attributesChanged = /* @__PURE__ */ new Set();
    subs.forEach((sub) => {
      if (sub === null) {
        this.childListChanged = true;
      } else {
        this.attributesChanged.add(sub);
      }
    });
  }
};
var YXmlHook = class _YXmlHook extends YMap {
  static {
    __name(this, "YXmlHook");
  }
  /**
   * @param {string} hookName nodeName of the Dom Node.
   */
  constructor(hookName) {
    super();
    this.hookName = hookName;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   */
  _copy() {
    return new _YXmlHook(this.hookName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlHook}
   */
  clone() {
    const el = new _YXmlHook(this.hookName);
    this.forEach((value, key) => {
      el.set(key, value);
    });
    return el;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type
   * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks = {}, binding2) {
    const hook = hooks[this.hookName];
    let dom;
    if (hook !== void 0) {
      dom = hook.createDom(this);
    } else {
      dom = document.createElement(this.hookName);
    }
    dom.setAttribute("data-yjs-hook", this.hookName);
    if (binding2 !== void 0) {
      binding2._createAssociation(dom, this);
    }
    return dom;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlHookRefID);
    encoder.writeKey(this.hookName);
  }
};
var readYXmlHook = /* @__PURE__ */ __name((decoder) => new YXmlHook(decoder.readKey()), "readYXmlHook");
var YXmlText = class _YXmlText extends YText {
  static {
    __name(this, "YXmlText");
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const n = this._item ? this._item.next : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const n = this._item ? this._item.prev : null;
    return n ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      n.content.type
    ) : null;
  }
  _copy() {
    return new _YXmlText();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlText}
   */
  clone() {
    const text2 = new _YXmlText();
    text2.applyDelta(this.toDelta());
    return text2;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlText.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(_document = document, hooks, binding2) {
    const dom = _document.createTextNode(this.toString());
    if (binding2 !== void 0) {
      binding2._createAssociation(dom, this);
    }
    return dom;
  }
  toString() {
    return this.toDelta().map((delta) => {
      const nestedNodes = [];
      for (const nodeName in delta.attributes) {
        const attrs = [];
        for (const key in delta.attributes[nodeName]) {
          attrs.push({ key, value: delta.attributes[nodeName][key] });
        }
        attrs.sort((a, b) => a.key < b.key ? -1 : 1);
        nestedNodes.push({ nodeName, attrs });
      }
      nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
      let str = "";
      for (let i = 0; i < nestedNodes.length; i++) {
        const node = nestedNodes[i];
        str += `<${node.nodeName}`;
        for (let j = 0; j < node.attrs.length; j++) {
          const attr = node.attrs[j];
          str += ` ${attr.key}="${attr.value}"`;
        }
        str += ">";
      }
      str += delta.insert;
      for (let i = nestedNodes.length - 1; i >= 0; i--) {
        str += `</${nestedNodes[i].nodeName}>`;
      }
      return str;
    }).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(encoder) {
    encoder.writeTypeRef(YXmlTextRefID);
  }
};
var readYXmlText = /* @__PURE__ */ __name((decoder) => new YXmlText(), "readYXmlText");
var AbstractStruct = class {
  static {
    __name(this, "AbstractStruct");
  }
  /**
   * @param {ID} id
   * @param {number} length
   */
  constructor(id2, length2) {
    this.id = id2;
    this.length = length2;
  }
  /**
   * @type {boolean}
   */
  get deleted() {
    throw methodUnimplemented();
  }
  /**
   * Merge this struct with the item to the right.
   * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
   * Also this method does *not* remove right from StructStore!
   * @param {AbstractStruct} right
   * @return {boolean} whether this merged with right
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   * @param {number} encodingRef
   */
  write(encoder, offset, encodingRef) {
    throw methodUnimplemented();
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    throw methodUnimplemented();
  }
};
var structGCRefNumber = 0;
var GC = class extends AbstractStruct {
  static {
    __name(this, "GC");
  }
  get deleted() {
    return true;
  }
  delete() {
  }
  /**
   * @param {GC} right
   * @return {boolean}
   */
  mergeWith(right) {
    if (this.constructor !== right.constructor) {
      return false;
    }
    this.length += right.length;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    if (offset > 0) {
      this.id.clock += offset;
      this.length -= offset;
    }
    addStruct(transaction.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeInfo(structGCRefNumber);
    encoder.writeLen(this.length - offset);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(transaction, store) {
    return null;
  }
};
var ContentBinary = class _ContentBinary {
  static {
    __name(this, "ContentBinary");
  }
  /**
   * @param {Uint8Array} content
   */
  constructor(content) {
    this.content = content;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.content];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentBinary}
   */
  copy() {
    return new _ContentBinary(this.content);
  }
  /**
   * @param {number} offset
   * @return {ContentBinary}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentBinary} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeBuf(this.content);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 3;
  }
};
var readContentBinary = /* @__PURE__ */ __name((decoder) => new ContentBinary(decoder.readBuf()), "readContentBinary");
var ContentDeleted = class _ContentDeleted {
  static {
    __name(this, "ContentDeleted");
  }
  /**
   * @param {number} len
   */
  constructor(len) {
    this.len = len;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.len;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return false;
  }
  /**
   * @return {ContentDeleted}
   */
  copy() {
    return new _ContentDeleted(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(offset) {
    const right = new _ContentDeleted(this.len - offset);
    this.len = offset;
    return right;
  }
  /**
   * @param {ContentDeleted} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.len += right.len;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
    addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
    item.markDeleted();
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeLen(this.len - offset);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 1;
  }
};
var readContentDeleted = /* @__PURE__ */ __name((decoder) => new ContentDeleted(decoder.readLen()), "readContentDeleted");
var createDocFromOpts = /* @__PURE__ */ __name((guid, opts) => new Doc({ guid, ...opts, shouldLoad: opts.shouldLoad || opts.autoLoad || false }), "createDocFromOpts");
var ContentDoc = class _ContentDoc {
  static {
    __name(this, "ContentDoc");
  }
  /**
   * @param {Doc} doc
   */
  constructor(doc2) {
    if (doc2._item) {
      console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.");
    }
    this.doc = doc2;
    const opts = {};
    this.opts = opts;
    if (!doc2.gc) {
      opts.gc = false;
    }
    if (doc2.autoLoad) {
      opts.autoLoad = true;
    }
    if (doc2.meta !== null) {
      opts.meta = doc2.meta;
    }
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.doc];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentDoc}
   */
  copy() {
    return new _ContentDoc(createDocFromOpts(this.doc.guid, this.opts));
  }
  /**
   * @param {number} offset
   * @return {ContentDoc}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentDoc} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
    this.doc._item = item;
    transaction.subdocsAdded.add(this.doc);
    if (this.doc.shouldLoad) {
      transaction.subdocsLoaded.add(this.doc);
    }
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
    if (transaction.subdocsAdded.has(this.doc)) {
      transaction.subdocsAdded.delete(this.doc);
    } else {
      transaction.subdocsRemoved.add(this.doc);
    }
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeString(this.doc.guid);
    encoder.writeAny(this.opts);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 9;
  }
};
var readContentDoc = /* @__PURE__ */ __name((decoder) => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny())), "readContentDoc");
var ContentEmbed = class _ContentEmbed {
  static {
    __name(this, "ContentEmbed");
  }
  /**
   * @param {Object} embed
   */
  constructor(embed) {
    this.embed = embed;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.embed];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentEmbed}
   */
  copy() {
    return new _ContentEmbed(this.embed);
  }
  /**
   * @param {number} offset
   * @return {ContentEmbed}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentEmbed} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeJSON(this.embed);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 5;
  }
};
var readContentEmbed = /* @__PURE__ */ __name((decoder) => new ContentEmbed(decoder.readJSON()), "readContentEmbed");
var ContentFormat = class _ContentFormat {
  static {
    __name(this, "ContentFormat");
  }
  /**
   * @param {string} key
   * @param {Object} value
   */
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return false;
  }
  /**
   * @return {ContentFormat}
   */
  copy() {
    return new _ContentFormat(this.key, this.value);
  }
  /**
   * @param {number} _offset
   * @return {ContentFormat}
   */
  splice(_offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentFormat} _right
   * @return {boolean}
   */
  mergeWith(_right) {
    return false;
  }
  /**
   * @param {Transaction} _transaction
   * @param {Item} item
   */
  integrate(_transaction, item) {
    const p = (
      /** @type {YText} */
      item.parent
    );
    p._searchMarker = null;
    p._hasFormatting = true;
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeKey(this.key);
    encoder.writeJSON(this.value);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 6;
  }
};
var readContentFormat = /* @__PURE__ */ __name((decoder) => new ContentFormat(decoder.readKey(), decoder.readJSON()), "readContentFormat");
var ContentJSON = class _ContentJSON {
  static {
    __name(this, "ContentJSON");
  }
  /**
   * @param {Array<any>} arr
   */
  constructor(arr) {
    this.arr = arr;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentJSON}
   */
  copy() {
    return new _ContentJSON(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentJSON}
   */
  splice(offset) {
    const right = new _ContentJSON(this.arr.slice(offset));
    this.arr = this.arr.slice(0, offset);
    return right;
  }
  /**
   * @param {ContentJSON} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.arr = this.arr.concat(right.arr);
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    const len = this.arr.length;
    encoder.writeLen(len - offset);
    for (let i = offset; i < len; i++) {
      const c = this.arr[i];
      encoder.writeString(c === void 0 ? "undefined" : JSON.stringify(c));
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 2;
  }
};
var readContentJSON = /* @__PURE__ */ __name((decoder) => {
  const len = decoder.readLen();
  const cs = [];
  for (let i = 0; i < len; i++) {
    const c = decoder.readString();
    if (c === "undefined") {
      cs.push(void 0);
    } else {
      cs.push(JSON.parse(c));
    }
  }
  return new ContentJSON(cs);
}, "readContentJSON");
var isDevMode = getVariable("node_env") === "development";
var ContentAny = class _ContentAny {
  static {
    __name(this, "ContentAny");
  }
  /**
   * @param {Array<any>} arr
   */
  constructor(arr) {
    this.arr = arr;
    isDevMode && deepFreeze(arr);
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentAny}
   */
  copy() {
    return new _ContentAny(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(offset) {
    const right = new _ContentAny(this.arr.slice(offset));
    this.arr = this.arr.slice(0, offset);
    return right;
  }
  /**
   * @param {ContentAny} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.arr = this.arr.concat(right.arr);
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    const len = this.arr.length;
    encoder.writeLen(len - offset);
    for (let i = offset; i < len; i++) {
      const c = this.arr[i];
      encoder.writeAny(c);
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 8;
  }
};
var readContentAny = /* @__PURE__ */ __name((decoder) => {
  const len = decoder.readLen();
  const cs = [];
  for (let i = 0; i < len; i++) {
    cs.push(decoder.readAny());
  }
  return new ContentAny(cs);
}, "readContentAny");
var ContentString = class _ContentString {
  static {
    __name(this, "ContentString");
  }
  /**
   * @param {string} str
   */
  constructor(str) {
    this.str = str;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.str.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.str.split("");
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentString}
   */
  copy() {
    return new _ContentString(this.str);
  }
  /**
   * @param {number} offset
   * @return {ContentString}
   */
  splice(offset) {
    const right = new _ContentString(this.str.slice(offset));
    this.str = this.str.slice(0, offset);
    const firstCharCode = this.str.charCodeAt(offset - 1);
    if (firstCharCode >= 55296 && firstCharCode <= 56319) {
      this.str = this.str.slice(0, offset - 1) + "\uFFFD";
      right.str = "\uFFFD" + right.str.slice(1);
    }
    return right;
  }
  /**
   * @param {ContentString} right
   * @return {boolean}
   */
  mergeWith(right) {
    this.str += right.str;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
  }
  /**
   * @return {number}
   */
  getRef() {
    return 4;
  }
};
var readContentString = /* @__PURE__ */ __name((decoder) => new ContentString(decoder.readString()), "readContentString");
var typeRefs = [
  readYArray,
  readYMap,
  readYText,
  readYXmlElement,
  readYXmlFragment,
  readYXmlHook,
  readYXmlText
];
var YArrayRefID = 0;
var YMapRefID = 1;
var YTextRefID = 2;
var YXmlElementRefID = 3;
var YXmlFragmentRefID = 4;
var YXmlHookRefID = 5;
var YXmlTextRefID = 6;
var ContentType = class _ContentType {
  static {
    __name(this, "ContentType");
  }
  /**
   * @param {AbstractType<any>} type
   */
  constructor(type) {
    this.type = type;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.type];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return true;
  }
  /**
   * @return {ContentType}
   */
  copy() {
    return new _ContentType(this.type._copy());
  }
  /**
   * @param {number} offset
   * @return {ContentType}
   */
  splice(offset) {
    throw methodUnimplemented();
  }
  /**
   * @param {ContentType} right
   * @return {boolean}
   */
  mergeWith(right) {
    return false;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(transaction, item) {
    this.type._integrate(transaction.doc, item);
  }
  /**
   * @param {Transaction} transaction
   */
  delete(transaction) {
    let item = this.type._start;
    while (item !== null) {
      if (!item.deleted) {
        item.delete(transaction);
      } else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) {
        transaction._mergeStructs.push(item);
      }
      item = item.right;
    }
    this.type._map.forEach((item2) => {
      if (!item2.deleted) {
        item2.delete(transaction);
      } else if (item2.id.clock < (transaction.beforeState.get(item2.id.client) || 0)) {
        transaction._mergeStructs.push(item2);
      }
    });
    transaction.changed.delete(this.type);
  }
  /**
   * @param {StructStore} store
   */
  gc(store) {
    let item = this.type._start;
    while (item !== null) {
      item.gc(store, true);
      item = item.right;
    }
    this.type._start = null;
    this.type._map.forEach(
      /** @param {Item | null} item */
      (item2) => {
        while (item2 !== null) {
          item2.gc(store, true);
          item2 = item2.left;
        }
      }
    );
    this.type._map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    this.type._write(encoder);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 7;
  }
};
var readContentType = /* @__PURE__ */ __name((decoder) => new ContentType(typeRefs[decoder.readTypeRef()](decoder)), "readContentType");
var splitItem = /* @__PURE__ */ __name((transaction, leftItem, diff) => {
  const { client, clock } = leftItem.id;
  const rightItem = new Item(
    createID(client, clock + diff),
    leftItem,
    createID(client, clock + diff - 1),
    leftItem.right,
    leftItem.rightOrigin,
    leftItem.parent,
    leftItem.parentSub,
    leftItem.content.splice(diff)
  );
  if (leftItem.deleted) {
    rightItem.markDeleted();
  }
  if (leftItem.keep) {
    rightItem.keep = true;
  }
  if (leftItem.redone !== null) {
    rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
  }
  leftItem.right = rightItem;
  if (rightItem.right !== null) {
    rightItem.right.left = rightItem;
  }
  transaction._mergeStructs.push(rightItem);
  if (rightItem.parentSub !== null && rightItem.right === null) {
    rightItem.parent._map.set(rightItem.parentSub, rightItem);
  }
  leftItem.length = diff;
  return rightItem;
}, "splitItem");
var Item = class _Item extends AbstractStruct {
  static {
    __name(this, "Item");
  }
  /**
   * @param {ID} id
   * @param {Item | null} left
   * @param {ID | null} origin
   * @param {Item | null} right
   * @param {ID | null} rightOrigin
   * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
   * @param {string | null} parentSub
   * @param {AbstractContent} content
   */
  constructor(id2, left, origin, right, rightOrigin, parent, parentSub, content) {
    super(id2, content.getLength());
    this.origin = origin;
    this.left = left;
    this.right = right;
    this.rightOrigin = rightOrigin;
    this.parent = parent;
    this.parentSub = parentSub;
    this.redone = null;
    this.content = content;
    this.info = this.content.isCountable() ? BIT2 : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(isMarked) {
    if ((this.info & BIT4) > 0 !== isMarked) {
      this.info ^= BIT4;
    }
  }
  get marker() {
    return (this.info & BIT4) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & BIT1) > 0;
  }
  set keep(doKeep) {
    if (this.keep !== doKeep) {
      this.info ^= BIT1;
    }
  }
  get countable() {
    return (this.info & BIT2) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & BIT3) > 0;
  }
  set deleted(doDelete) {
    if (this.deleted !== doDelete) {
      this.info ^= BIT3;
    }
  }
  markDeleted() {
    this.info |= BIT3;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(transaction, store) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) {
      return this.origin.client;
    }
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) {
      return this.rightOrigin.client;
    }
    if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) {
      return this.parent.client;
    }
    if (this.origin) {
      this.left = getItemCleanEnd(transaction, store, this.origin);
      this.origin = this.left.lastId;
    }
    if (this.rightOrigin) {
      this.right = getItemCleanStart(transaction, this.rightOrigin);
      this.rightOrigin = this.right.id;
    }
    if (this.left && this.left.constructor === GC || this.right && this.right.constructor === GC) {
      this.parent = null;
    } else if (!this.parent) {
      if (this.left && this.left.constructor === _Item) {
        this.parent = this.left.parent;
        this.parentSub = this.left.parentSub;
      } else if (this.right && this.right.constructor === _Item) {
        this.parent = this.right.parent;
        this.parentSub = this.right.parentSub;
      }
    } else if (this.parent.constructor === ID) {
      const parentItem = getItem(store, this.parent);
      if (parentItem.constructor === GC) {
        this.parent = null;
      } else {
        this.parent = /** @type {ContentType} */
        parentItem.content.type;
      }
    }
    return null;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    if (offset > 0) {
      this.id.clock += offset;
      this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
      this.origin = this.left.lastId;
      this.content = this.content.splice(offset);
      this.length -= offset;
    }
    if (this.parent) {
      if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
        let left = this.left;
        let o;
        if (left !== null) {
          o = left.right;
        } else if (this.parentSub !== null) {
          o = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null;
          while (o !== null && o.left !== null) {
            o = o.left;
          }
        } else {
          o = /** @type {AbstractType<any>} */
          this.parent._start;
        }
        const conflictingItems = /* @__PURE__ */ new Set();
        const itemsBeforeOrigin = /* @__PURE__ */ new Set();
        while (o !== null && o !== this.right) {
          itemsBeforeOrigin.add(o);
          conflictingItems.add(o);
          if (compareIDs(this.origin, o.origin)) {
            if (o.id.client < this.id.client) {
              left = o;
              conflictingItems.clear();
            } else if (compareIDs(this.rightOrigin, o.rightOrigin)) {
              break;
            }
          } else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) {
            if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
              left = o;
              conflictingItems.clear();
            }
          } else {
            break;
          }
          o = o.right;
        }
        this.left = left;
      }
      if (this.left !== null) {
        const right = this.left.right;
        this.right = right;
        this.left.right = this;
      } else {
        let r;
        if (this.parentSub !== null) {
          r = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null;
          while (r !== null && r.left !== null) {
            r = r.left;
          }
        } else {
          r = /** @type {AbstractType<any>} */
          this.parent._start;
          this.parent._start = this;
        }
        this.right = r;
      }
      if (this.right !== null) {
        this.right.left = this;
      } else if (this.parentSub !== null) {
        this.parent._map.set(this.parentSub, this);
        if (this.left !== null) {
          this.left.delete(transaction);
        }
      }
      if (this.parentSub === null && this.countable && !this.deleted) {
        this.parent._length += this.length;
      }
      addStruct(transaction.doc.store, this);
      this.content.integrate(transaction, this);
      addChangedTypeToTransaction(
        transaction,
        /** @type {AbstractType<any>} */
        this.parent,
        this.parentSub
      );
      if (
        /** @type {AbstractType<any>} */
        this.parent._item !== null && /** @type {AbstractType<any>} */
        this.parent._item.deleted || this.parentSub !== null && this.right !== null
      ) {
        this.delete(transaction);
      }
    } else {
      new GC(this.id, this.length).integrate(transaction, 0);
    }
  }
  /**
   * Returns the next non-deleted item
   */
  get next() {
    let n = this.right;
    while (n !== null && n.deleted) {
      n = n.right;
    }
    return n;
  }
  /**
   * Returns the previous non-deleted item
   */
  get prev() {
    let n = this.left;
    while (n !== null && n.deleted) {
      n = n.left;
    }
    return n;
  }
  /**
   * Computes the last content address of this Item.
   */
  get lastId() {
    return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1);
  }
  /**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */
  mergeWith(right) {
    if (this.constructor === right.constructor && compareIDs(right.origin, this.lastId) && this.right === right && compareIDs(this.rightOrigin, right.rightOrigin) && this.id.client === right.id.client && this.id.clock + this.length === right.id.clock && this.deleted === right.deleted && this.redone === null && right.redone === null && this.content.constructor === right.content.constructor && this.content.mergeWith(right.content)) {
      const searchMarker = (
        /** @type {AbstractType<any>} */
        this.parent._searchMarker
      );
      if (searchMarker) {
        searchMarker.forEach((marker) => {
          if (marker.p === right) {
            marker.p = this;
            if (!this.deleted && this.countable) {
              marker.index -= this.length;
            }
          }
        });
      }
      if (right.keep) {
        this.keep = true;
      }
      this.right = right.right;
      if (this.right !== null) {
        this.right.left = this;
      }
      this.length += right.length;
      return true;
    }
    return false;
  }
  /**
   * Mark this Item as deleted.
   *
   * @param {Transaction} transaction
   */
  delete(transaction) {
    if (!this.deleted) {
      const parent = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (this.countable && this.parentSub === null) {
        parent._length -= this.length;
      }
      this.markDeleted();
      addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
      addChangedTypeToTransaction(transaction, parent, this.parentSub);
      this.content.delete(transaction);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(store, parentGCd) {
    if (!this.deleted) {
      throw unexpectedCase();
    }
    this.content.gc(store);
    if (parentGCd) {
      replaceStruct(store, this, new GC(this.id, this.length));
    } else {
      this.content = new ContentDeleted(this.length);
    }
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   */
  write(encoder, offset) {
    const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
    const rightOrigin = this.rightOrigin;
    const parentSub = this.parentSub;
    const info3 = this.content.getRef() & BITS5 | (origin === null ? 0 : BIT8) | // origin is defined
    (rightOrigin === null ? 0 : BIT7) | // right origin is defined
    (parentSub === null ? 0 : BIT6);
    encoder.writeInfo(info3);
    if (origin !== null) {
      encoder.writeLeftID(origin);
    }
    if (rightOrigin !== null) {
      encoder.writeRightID(rightOrigin);
    }
    if (origin === null && rightOrigin === null) {
      const parent = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (parent._item !== void 0) {
        const parentItem = parent._item;
        if (parentItem === null) {
          const ykey = findRootTypeKey(parent);
          encoder.writeParentInfo(true);
          encoder.writeString(ykey);
        } else {
          encoder.writeParentInfo(false);
          encoder.writeLeftID(parentItem.id);
        }
      } else if (parent.constructor === String) {
        encoder.writeParentInfo(true);
        encoder.writeString(parent);
      } else if (parent.constructor === ID) {
        encoder.writeParentInfo(false);
        encoder.writeLeftID(parent);
      } else {
        unexpectedCase();
      }
      if (parentSub !== null) {
        encoder.writeString(parentSub);
      }
    }
    this.content.write(encoder, offset);
  }
};
var readItemContent = /* @__PURE__ */ __name((decoder, info3) => contentRefs[info3 & BITS5](decoder), "readItemContent");
var contentRefs = [
  () => {
    unexpectedCase();
  },
  // GC is not ItemContent
  readContentDeleted,
  // 1
  readContentJSON,
  // 2
  readContentBinary,
  // 3
  readContentString,
  // 4
  readContentEmbed,
  // 5
  readContentFormat,
  // 6
  readContentType,
  // 7
  readContentAny,
  // 8
  readContentDoc,
  // 9
  () => {
    unexpectedCase();
  }
  // 10 - Skip is not ItemContent
];
var structSkipRefNumber = 10;
var Skip = class extends AbstractStruct {
  static {
    __name(this, "Skip");
  }
  get deleted() {
    return true;
  }
  delete() {
  }
  /**
   * @param {Skip} right
   * @return {boolean}
   */
  mergeWith(right) {
    if (this.constructor !== right.constructor) {
      return false;
    }
    this.length += right.length;
    return true;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    unexpectedCase();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(encoder, offset) {
    encoder.writeInfo(structSkipRefNumber);
    writeVarUint(encoder.restEncoder, this.length - offset);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(transaction, store) {
    return null;
  }
};
var glo = (
  /** @type {any} */
  typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}
);
var importIdentifier = "__ $YJS$ __";
if (glo[importIdentifier] === true) {
  console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
}
glo[importIdentifier] = true;

// src/durable-objects/game-room.ts
var GameRoomDO = class extends DurableObject3 {
  static {
    __name(this, "GameRoomDO");
  }
  sql;
  roomId = null;
  ydoc;
  connections = /* @__PURE__ */ new Map();
  saveTimeout = null;
  constructor(ctx, env2) {
    super(ctx, env2);
    this.sql = ctx.storage.sql;
    this.ydoc = new Doc();
    this.ctx.blockConcurrencyWhile(async () => {
      await this.initializeSchema();
    });
    this.ydoc.on("update", (update) => {
      this.broadcastUpdate(update);
      this.scheduleSave();
    });
  }
  /**
   * Initialize SQLite schema
   */
  async initializeSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS game_state (
        room_id TEXT PRIMARY KEY,
        yjs_state BLOB NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_sync_log_room
      ON sync_log(room_id, timestamp)
    `);
  }
  /**
   * Load Yjs state from storage
   */
  loadState() {
    if (!this.roomId) return;
    const rows = this.sql.exec("SELECT yjs_state FROM game_state WHERE room_id = ?", this.roomId).toArray();
    if (rows.length > 0 && rows[0].yjs_state) {
      const state = rows[0].yjs_state;
      applyUpdate(this.ydoc, new Uint8Array(state));
      console.log(`[GameRoom] Loaded state for room ${this.roomId}`);
    } else {
      this.initializeDefaultState();
    }
  }
  /**
   * Initialize default game state for new users
   */
  initializeDefaultState() {
    const gameState = this.ydoc.getMap("gameState");
    if (gameState.size === 0) {
      gameState.set("level", 1);
      gameState.set("xp", 0);
      gameState.set("xpToNextLevel", 100);
      gameState.set("stage", "egg");
      gameState.set("name", "Baby");
      const stats = new YMap();
      stats.set("energy", 100);
      stats.set("happiness", 100);
      stats.set("hunger", 100);
      stats.set("health", 100);
      gameState.set("stats", stats);
      const achievements = new YArray();
      gameState.set("achievements", achievements);
      gameState.set("totalHashes", 0);
      gameState.set("totalShares", 0);
      gameState.set("lastSyncAt", Date.now());
      console.log(
        `[GameRoom] Initialized default state for room ${this.roomId}`
      );
    }
  }
  /**
   * Save Yjs state to storage (debounced)
   */
  scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveState();
    }, 1e3);
  }
  /**
   * Save state immediately
   */
  saveState() {
    if (!this.roomId) return;
    const state = encodeStateAsUpdate(this.ydoc);
    const now = Date.now();
    this.sql.exec(
      `INSERT INTO game_state (room_id, yjs_state, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(room_id) DO UPDATE SET
         yjs_state = excluded.yjs_state,
         updated_at = excluded.updated_at`,
      this.roomId,
      state.buffer,
      now,
      now
    );
    console.log(`[GameRoom] Saved state for room ${this.roomId}`);
  }
  /**
   * Broadcast Yjs update to all connected clients
   */
  broadcastUpdate(update) {
    const message = JSON.stringify({
      type: "yjs-update",
      data: Array.from(update)
    });
    for (const [clientId, conn] of this.connections) {
      try {
        conn.webSocket.send(message);
      } catch (error3) {
        console.error(`[GameRoom] Failed to send to ${clientId}:`, error3);
        this.connections.delete(clientId);
      }
    }
  }
  /**
   * Log sync action
   */
  logSyncAction(clientId, action) {
    if (!this.roomId) return;
    this.sql.exec(
      `INSERT INTO sync_log (room_id, client_id, action, timestamp)
       VALUES (?, ?, ?, ?)`,
      this.roomId,
      clientId,
      action,
      Date.now()
    );
  }
  /**
   * Handle incoming requests
   */
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length < 2 || pathParts[0] !== "game") {
        return this.errorResponse("Invalid path", 400);
      }
      this.roomId = pathParts[1];
      this.loadState();
      const action = pathParts[2] || "connect";
      if (request.headers.get("Upgrade") === "websocket") {
        return this.handleWebSocket();
      }
      switch (action) {
        case "state":
          return this.handleGetState();
        case "reset":
          if (request.method === "POST") {
            return this.handleReset();
          }
          break;
      }
      return this.errorResponse("Not found", 404);
    } catch (error3) {
      console.error("[GameRoom] Error:", error3);
      return this.errorResponse(
        error3 instanceof Error ? error3.message : "Internal error",
        500
      );
    }
  }
  /**
   * Handle WebSocket connection
   */
  handleWebSocket() {
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    const clientId = crypto.randomUUID();
    this.ctx.acceptWebSocket(server);
    this.connections.set(clientId, {
      webSocket: server,
      clientId,
      connectedAt: Date.now()
    });
    this.logSyncAction(clientId, "connected");
    server.addEventListener("message", (event) => {
      this.handleWebSocketMessage(clientId, event.data);
    });
    server.addEventListener("close", () => {
      this.connections.delete(clientId);
      this.logSyncAction(clientId, "disconnected");
      console.log(`[GameRoom] Client ${clientId} disconnected`);
    });
    server.addEventListener("error", (error3) => {
      console.error(`[GameRoom] WebSocket error for ${clientId}:`, error3);
      this.connections.delete(clientId);
    });
    const state = encodeStateAsUpdate(this.ydoc);
    server.send(
      JSON.stringify({
        type: "yjs-sync",
        data: Array.from(state),
        clientId
      })
    );
    console.log(
      `[GameRoom] Client ${clientId} connected to room ${this.roomId}`
    );
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
  /**
   * Handle WebSocket message
   */
  handleWebSocketMessage(clientId, data) {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case "yjs-update": {
          const update = new Uint8Array(message.data);
          applyUpdate(this.ydoc, update);
          this.logSyncAction(clientId, "update");
          break;
        }
        case "ping": {
          const conn = this.connections.get(clientId);
          if (conn) {
            conn.webSocket.send(JSON.stringify({ type: "pong" }));
          }
          break;
        }
        case "get-state": {
          const conn = this.connections.get(clientId);
          if (conn) {
            const state = encodeStateAsUpdate(this.ydoc);
            conn.webSocket.send(
              JSON.stringify({
                type: "yjs-sync",
                data: Array.from(state)
              })
            );
          }
          break;
        }
      }
    } catch (error3) {
      console.error(
        `[GameRoom] Failed to handle message from ${clientId}:`,
        error3
      );
    }
  }
  /**
   * GET /game/{roomId}/state - Get current state as JSON
   */
  handleGetState() {
    const gameState = this.ydoc.getMap("gameState");
    const stats = gameState.get("stats");
    const achievements = gameState.get("achievements");
    const state = {
      level: gameState.get("level") || 1,
      xp: gameState.get("xp") || 0,
      xpToNextLevel: gameState.get("xpToNextLevel") || 100,
      stage: gameState.get("stage") || "egg",
      name: gameState.get("name") || "Baby",
      stats: stats ? {
        energy: stats.get("energy") || 100,
        happiness: stats.get("happiness") || 100,
        hunger: stats.get("hunger") || 100,
        health: stats.get("health") || 100
      } : {
        energy: 100,
        happiness: 100,
        hunger: 100,
        health: 100
      },
      achievements: achievements ? achievements.toArray() : [],
      totalHashes: gameState.get("totalHashes") || 0,
      totalShares: gameState.get("totalShares") || 0,
      lastSyncAt: gameState.get("lastSyncAt") || Date.now()
    };
    const response = {
      success: true,
      data: state,
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * POST /game/{roomId}/reset - Reset game state
   */
  handleReset() {
    this.ydoc.destroy();
    this.ydoc = new Doc();
    this.initializeDefaultState();
    this.saveState();
    const state = encodeStateAsUpdate(this.ydoc);
    for (const [, conn] of this.connections) {
      try {
        conn.webSocket.send(
          JSON.stringify({
            type: "yjs-sync",
            data: Array.from(state),
            reset: true
          })
        );
      } catch {
      }
    }
    this.logSyncAction("system", "reset");
    const response = {
      success: true,
      data: { reset: true },
      timestamp: Date.now()
    };
    return Response.json(response);
  }
  /**
   * Helper to create error response
   */
  errorResponse(message, status) {
    const response = {
      success: false,
      error: message,
      timestamp: Date.now()
    };
    return Response.json(response, { status });
  }
  /**
   * Handle WebSocket hibernation wake
   */
  async webSocketMessage(ws, message) {
    let clientId = null;
    for (const [id2, conn] of this.connections) {
      if (conn.webSocket === ws) {
        clientId = id2;
        break;
      }
    }
    if (clientId && typeof message === "string") {
      this.handleWebSocketMessage(clientId, message);
    }
  }
  /**
   * Handle WebSocket close during hibernation
   */
  async webSocketClose(ws) {
    for (const [clientId, conn] of this.connections) {
      if (conn.webSocket === ws) {
        this.connections.delete(clientId);
        this.logSyncAction(clientId, "disconnected");
        console.log(`[GameRoom] Client ${clientId} disconnected (hibernation)`);
        break;
      }
    }
  }
};

// src/index.ts
var app = new Hono2();
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://bitcoinbaby.app",
      "https://*.bitcoinbaby.app"
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Request-Id"],
    maxAge: 86400,
    credentials: true
  })
);
app.use("*", logger());
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  c.header("X-Request-Id", requestId);
  await next();
});
app.get("/", (c) => {
  return c.json({
    name: "BitcoinBaby API",
    version: "1.0.0",
    status: "healthy",
    timestamp: Date.now()
  });
});
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    environment: c.env.ENVIRONMENT,
    timestamp: Date.now()
  });
});
app.get("/api/balance/:address", async (c) => {
  const address = c.req.param("address");
  if (!address || !isValidBitcoinAddress(address)) {
    return c.json(
      {
        success: false,
        error: "Invalid Bitcoin address",
        timestamp: Date.now()
      },
      400
    );
  }
  const id2 = c.env.VIRTUAL_BALANCE.idFromName(address);
  const stub = c.env.VIRTUAL_BALANCE.get(id2);
  const response = await stub.fetch(
    new Request(`http://internal/balance/${address}/get`)
  );
  return response;
});
app.post("/api/balance/:address/credit", async (c) => {
  const address = c.req.param("address");
  if (!address || !isValidBitcoinAddress(address)) {
    return c.json(
      {
        success: false,
        error: "Invalid Bitcoin address",
        timestamp: Date.now()
      },
      400
    );
  }
  const body = await c.req.json();
  const id2 = c.env.VIRTUAL_BALANCE.idFromName(address);
  const stub = c.env.VIRTUAL_BALANCE.get(id2);
  const response = await stub.fetch(
    new Request(`http://internal/balance/${address}/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
  );
  return response;
});
app.get("/api/pool/:poolType/status", async (c) => {
  const poolType = c.req.param("poolType");
  if (!isValidPoolType(poolType)) {
    return c.json(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400
    );
  }
  const id2 = c.env.WITHDRAW_POOL.idFromName(poolType);
  const stub = c.env.WITHDRAW_POOL.get(id2);
  const response = await stub.fetch(
    new Request(`http://internal/pool/${poolType}/status`)
  );
  return response;
});
app.get("/api/pool/:poolType/requests", async (c) => {
  const poolType = c.req.param("poolType");
  if (!isValidPoolType(poolType)) {
    return c.json(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400
    );
  }
  const id2 = c.env.WITHDRAW_POOL.idFromName(poolType);
  const stub = c.env.WITHDRAW_POOL.get(id2);
  const response = await stub.fetch(
    new Request(`http://internal/pool/${poolType}/requests`)
  );
  return response;
});
app.post("/api/pool/:poolType/request", async (c) => {
  const poolType = c.req.param("poolType");
  if (!isValidPoolType(poolType)) {
    return c.json(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400
    );
  }
  const body = await c.req.json();
  if (!body.fromAddress || !body.toAddress || !body.amount) {
    return c.json(
      {
        success: false,
        error: "Missing required fields: fromAddress, toAddress, amount",
        timestamp: Date.now()
      },
      400
    );
  }
  const balanceId = c.env.VIRTUAL_BALANCE.idFromName(body.fromAddress);
  const balanceStub = c.env.VIRTUAL_BALANCE.get(balanceId);
  const requestId = crypto.randomUUID();
  const reserveResponse = await balanceStub.fetch(
    new Request(`http://internal/balance/${body.fromAddress}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: body.amount,
        requestId
      })
    })
  );
  if (!reserveResponse.ok) {
    return reserveResponse;
  }
  const poolId = c.env.WITHDRAW_POOL.idFromName(poolType);
  const poolStub = c.env.WITHDRAW_POOL.get(poolId);
  const response = await poolStub.fetch(
    new Request(`http://internal/pool/${poolType}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        requestId
      })
    })
  );
  return response;
});
app.post("/api/pool/:poolType/cancel", async (c) => {
  const poolType = c.req.param("poolType");
  if (!isValidPoolType(poolType)) {
    return c.json(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400
    );
  }
  const body = await c.req.json();
  if (!body.requestId || !body.fromAddress) {
    return c.json(
      {
        success: false,
        error: "Missing required fields: requestId, fromAddress",
        timestamp: Date.now()
      },
      400
    );
  }
  const poolId = c.env.WITHDRAW_POOL.idFromName(poolType);
  const poolStub = c.env.WITHDRAW_POOL.get(poolId);
  const poolResponse = await poolStub.fetch(
    new Request(`http://internal/pool/${poolType}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: body.requestId })
    })
  );
  if (!poolResponse.ok) {
    return poolResponse;
  }
  const poolData = await poolResponse.json();
  const balanceId = c.env.VIRTUAL_BALANCE.idFromName(body.fromAddress);
  const balanceStub = c.env.VIRTUAL_BALANCE.get(balanceId);
  const response = await balanceStub.fetch(
    new Request(`http://internal/balance/${body.fromAddress}/cancel-withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: poolData.data?.cancelledAmount,
        requestId: body.requestId
      })
    })
  );
  return response;
});
app.get("/api/game/:roomId", async (c) => {
  const roomId = c.req.param("roomId");
  const upgradeHeader = c.req.header("Upgrade");
  if (upgradeHeader !== "websocket") {
    return c.json(
      {
        success: false,
        error: "Expected WebSocket connection",
        timestamp: Date.now()
      },
      426
    );
  }
  const id2 = c.env.GAME_ROOM.idFromName(roomId);
  const stub = c.env.GAME_ROOM.get(id2);
  return stub.fetch(c.req.raw);
});
app.get("/api/game/:roomId/state", async (c) => {
  const roomId = c.req.param("roomId");
  const id2 = c.env.GAME_ROOM.idFromName(roomId);
  const stub = c.env.GAME_ROOM.get(id2);
  const response = await stub.fetch(
    new Request(`http://internal/game/${roomId}/state`)
  );
  return response;
});
async function handleScheduled(event, env2) {
  const hour = new Date(event.scheduledTime).getUTCHours();
  const dayOfWeek = new Date(event.scheduledTime).getUTCDay();
  const dayOfMonth = new Date(event.scheduledTime).getUTCDate();
  console.log(
    `[Scheduled] Running at hour=${hour}, dayOfWeek=${dayOfWeek}, dayOfMonth=${dayOfMonth}`
  );
  if (dayOfWeek === 0 && hour === 0) {
    console.log("[Scheduled] Processing weekly pool...");
    const id2 = env2.WITHDRAW_POOL.idFromName("weekly");
    const stub = env2.WITHDRAW_POOL.get(id2);
    await stub.fetch(
      new Request("http://internal/pool/weekly/process", { method: "POST" })
    );
  }
  if (dayOfMonth === 1 && hour === 0) {
    console.log("[Scheduled] Processing monthly pool...");
    const id2 = env2.WITHDRAW_POOL.idFromName("monthly");
    const stub = env2.WITHDRAW_POOL.get(id2);
    await stub.fetch(
      new Request("http://internal/pool/monthly/process", { method: "POST" })
    );
  }
  if (hour % 6 === 0) {
    console.log("[Scheduled] Checking low-fee opportunities...");
    const id2 = env2.WITHDRAW_POOL.idFromName("low_fee");
    const stub = env2.WITHDRAW_POOL.get(id2);
    try {
      const feeResponse = await fetch(
        "https://mempool.space/testnet4/api/v1/fees/recommended"
      );
      const fees = await feeResponse.json();
      const maxFee = parseInt(env2.MAX_FEE_RATE_SAT_VB || "10");
      if (fees.hourFee <= maxFee) {
        console.log(
          `[Scheduled] Fee rate ${fees.hourFee} <= ${maxFee}, processing low_fee pool`
        );
        await stub.fetch(
          new Request("http://internal/pool/low_fee/process", {
            method: "POST"
          })
        );
      }
    } catch (error3) {
      console.error("[Scheduled] Failed to check fees:", error3);
    }
  }
}
__name(handleScheduled, "handleScheduled");
function isValidBitcoinAddress(address) {
  const patterns = [
    /^tb1[a-zA-HJ-NP-Z0-9]{39,59}$/,
    // Testnet bech32
    /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    // Testnet P2PKH
    /^2[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    // Testnet P2SH
    /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/,
    // Mainnet bech32
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
    // Mainnet P2PKH/P2SH
  ];
  return patterns.some((p) => p.test(address));
}
__name(isValidBitcoinAddress, "isValidBitcoinAddress");
function isValidPoolType(poolType) {
  return ["weekly", "monthly", "low_fee", "immediate"].includes(poolType);
}
__name(isValidPoolType, "isValidPoolType");
var src_default = {
  fetch: app.fetch,
  scheduled: handleScheduled
};

// ../../node_modules/.pnpm/wrangler@4.69.0_@cloudflare+workers-types@4.20260305.0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.pnpm/wrangler@4.69.0_@cloudflare+workers-types@4.20260305.0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-CPuHxZ/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/.pnpm/wrangler@4.69.0_@cloudflare+workers-types@4.20260305.0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args2) {
  __facade_middleware__.push(...args2.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-CPuHxZ/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  GameRoomDO,
  VirtualBalanceDO,
  WithdrawPoolDO,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
