declare const webExtract: {
  extractAudio: (file: File, cb: (data: any) => void) => void;
  extractImage: (
    file: File,
    timeStamp: number,
    cb: (data: any) => void,
  ) => void;
  extractImageList: (
    file: File,
    timeStamp: number,
    frameConfig: { height: number; wrapperWidth: number },
    cb: (data: any) => void,
  ) => void;
};
