function createWorker() {
  const extractWorker = new Worker('/extract-from-video/extract.js');
  return extractWorker;
}

class WorkerManager {
  constructor(worker) {
    this.callbacks = {};
    this.worker = worker;
    this.worker.onmessage = (e) => {
      const { id, data } = e.data;
      this.callbacks[id]?.call(this, data);
      delete this.callbacks[id];
    };
  }
  postMessage(action, callback) {
    const id = WorkerManager.msgId++;
    this.worker.postMessage(Object.assign({ id }, action));
    this.callbacks[id] = callback;
  }
}
WorkerManager.msgId = 1;

if (!window.webExtract) {
  const extractWorker = new WorkerManager(createWorker());

  const noop = function () {};

  const webExtract = {
    extractAudio(file, callback = noop) {
      extractWorker.postMessage(
        {
          type: 'extractAudio',
          data: {
            file,
          },
        },
        callback,
      );
    },
    extractImage(file, timeStamp, callback = noop) {
      extractWorker.postMessage(
        {
          type: 'extractImage',
          data: {
            file,
            timeStamp,
          },
        },
        callback,
      );
    },
    extractImageList(file, timeStamp = 0, frameConfig, callback = noop) {
      extractWorker.postMessage(
        {
          type: 'extractImageList',
          data: {
            file,
            timeStamp,
            frameConfig,
          },
        },
        callback,
      );
    },
  };
  window.webExtract = webExtract;
}
