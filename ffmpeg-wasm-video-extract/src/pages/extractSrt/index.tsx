// eslint-disable
import React, { useEffect, useCallback, useState, useRef } from 'react';
// import { createWorker } from 'tesseract.js'; // 识别准确率低 耗时长
import { Utf8ArrayToStr } from './utils';
import styles from './index.less';

let core: any = null;

function IndexPage() {
  const onInputFile = useCallback((e) => {
    // const files = e.target.files;
    // const file = files[0];
    // const reader = new FileReader();
    // reader.onload = async () => {
    //   // 当读取完成时，内容只在`reader.result`中
    //   const bf = new Uint8Array(reader.result as ArrayBufferLike);
    //   await core.FS.writeFile(file.name, bf);
    //   try {
    //     const res = await ffmpeg({
    //       core,
    //       args: ['-i', file.name, '-map', '0:s:0', 'subtitle.srt'],
    //     });
    //     const text = Utf8ArrayToStr(res);
    //     console.log('text===>', text);
    //   } catch (error) {
    //     console.log('11111', 1111);
    //   }
    // };
    // reader.readAsArrayBuffer(file);
  }, []);
  return (
    <div className={styles.extractAudio}>
      <input
        type="file"
        onChange={onInputFile}
        style={{ marginBottom: '10px' }}
      />
    </div>
  );
}

export default IndexPage;
