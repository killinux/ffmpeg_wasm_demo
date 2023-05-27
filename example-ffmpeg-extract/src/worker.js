class WebExtract {
  constructor() {
    this.isMKDIR = false;
    this.MOUNT_DIR = '/working';
    this.cExtractImage = null;
    this.cExtractAudio = null;
  }
  _getImageInfo(imgDataPtr) {
    const width = Module.HEAPU32[imgDataPtr / 4],
      height = Module.HEAPU32[imgDataPtr / 4 + 1],
      duration = Module.HEAPU32[imgDataPtr / 4 + 2],
      imageBufferPtr = Module.HEAPU32[imgDataPtr / 4 + 3],
      imageBuffer = Module.HEAPU8.slice(imageBufferPtr, imageBufferPtr + width * height * 3);

    Module._destroy(imgDataPtr);
    Module._destroy(imageBufferPtr);

    const imageDataBuffer = new Uint8ClampedArray(width * height * 4);

    let j = 0;
    for (let i = 0; i < imageBuffer.length; i++) {
      if (i && i % 3 == 0) {
        imageDataBuffer[j] = 255;
        j += 1;
      }

      imageDataBuffer[j] = imageBuffer[i];
      j += 1;
    }
    return {
      width,
      height,
      duration: duration / 1000,
      imageDataBuffer
    };
  }
  _extractImage({ file, timeStamp }) {
    if (!this.isMKDIR) {
      FS.mkdir(this.MOUNT_DIR);
      this.isMKDIR = true;
    }
    FS.mount(WORKERFS, { files: [file] }, this.MOUNT_DIR);
    if (!this.cExtractImage) {
      this.cExtractImage = Module.cwrap('extract_image', 'number', ['number', 'string']);
    }
    let imgDataPtr = this.cExtractImage(timeStamp, `${this.MOUNT_DIR}/${file.name}`);
    return Object.assign({}, this._getImageInfo(imgDataPtr), { timeStamp });
  }
  _extractMoreFrame({ file, timeStamps }) {
    const moreFrames = [];
    timeStamps.forEach(timeStamp => {
      const imgDataPtr = this.cExtractImage(timeStamp, `${this.MOUNT_DIR}/${file.name}`);
      const videoInfo = this._getImageInfo(imgDataPtr);
      moreFrames.push(videoInfo);
    });
    return moreFrames;
  }
  extractImage({ file, timeStamp }, id) {
    const videoBasicInfo = this._extractImage({ file, timeStamp });
    FS.unmount(this.MOUNT_DIR);
    const evt = {
      type: 'extractImage',
      data: videoBasicInfo,
      id,
    };
    self.postMessage(evt, [evt.data.imageDataBuffer.buffer]);
  }
  extractImageList({ file, startTime = 0, frameConfig }, id) {
    const videoBasicInfo = this._extractImage({ file, startTime });
    const { width, height, duration } = videoBasicInfo;
    const transWidth = frameConfig.height / height * width;
    const captureFrameCount = Math.round(frameConfig.wrapperWidth / transWidth);
    const step = (duration - startTime) / captureFrameCount; // ms
    const timeStamps = [];
    for (let index = 0; index < captureFrameCount; index++) {
      timeStamps.push(startTime + index * step)
    }
    const captureList = this._extractMoreFrame({ file, timeStamps });
    const _frameConfig = Object.assign({}, frameConfig, {width: transWidth});
    const evt = {
      type: 'extractImageList',
      data: captureList.map(capture => Object.assign({}, capture, { frameConfig: _frameConfig })),
      id,
    };
    FS.unmount(this.MOUNT_DIR);
    self.postMessage(evt);
  }
  extractImageMore({ file, timeStamp = 0, captureFrameCount = 1 }, id) {
    const videoBasicInfo = this._extractImage({ file, timeStamp: 0 });
    const { duration: durationMs } = videoBasicInfo;
    if (durationMs) {
      const step = (durationMs - timeStamp) / captureFrameCount;
      const timeStamps = [];
      for (let index = 0; index < captureFrameCount; index++) {
        timeStamps.push(timeStamp + index * step)
      }
      const moreFrame = this._extractMoreFrame({ file, timeStamps });
      const evt = {
        type: 'extractImageMore',
        data: moreFrame,
        id,
      };
      FS.unmount(this.MOUNT_DIR);
      self.postMessage(evt);
    } else {
      self.postMessage({
        type: 'extractImageMore',
        data: null
      })
    }
  }
  _getAudioInfo(audioDataPtr, len) {
    const realLen = Module.HEAPU32[len / 4];
    let audioBuffer = Module.HEAPU8.slice(audioDataPtr, audioDataPtr + realLen);
    Module._destroy(audioDataPtr);
    console.log('最终结果：', realLen, audioDataPtr);
    return {
      realLen,
      audioBuffer
    };
  }
  extractAudio({ file }, id) {
    const MOUNT_DIR = '/working';
    if (!this.isMKDIR) {
      FS.mkdir(MOUNT_DIR);
      this.isMKDIR = true;
    }
    FS.mount(WORKERFS, { files: [file] }, MOUNT_DIR);
    if (!this.cExtractAudio) {
      this.cExtractAudio = Module.cwrap('extract_audio', 'number', ['string', 'number']);
    }
    const len = Module._malloc(8); // uint64_t
    // 音频内存地址
    let audioDataPtr = this.cExtractAudio(`${MOUNT_DIR}/${file.name}`, len);
    const audioData = this._getAudioInfo(audioDataPtr, len);
    const evt = {
      type: 'extractAudio',
      data: audioData,
      id,
    };
    FS.unmount(MOUNT_DIR);
    self.postMessage(evt);
  }
}

const webExtract = new WebExtract();
let isInit = false;
self.onmessage = function (evt) {
  const evtData = evt.data;
  if (isInit && webExtract[evtData.type]) {
    webExtract[evtData.type](evtData.data, evtData.id);
  }
};
self.Module = {
  instantiateWasm: (info, receiveInstance) => {
    WebAssembly.instantiateStreaming(fetch('extract.wasm'), info).then(result => {
      receiveInstance(result.instance);
    })
  },
  onRuntimeInitialized: () => {
    isInit = true;
    self.postMessage({
      type: 'init',
      data: {}
    });
  }
};
