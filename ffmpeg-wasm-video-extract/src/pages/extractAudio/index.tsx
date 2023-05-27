// eslint-disable
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Button, Spin } from 'antd';
import { videoToAudio } from './videoToAudio.js';
import VideoUploadByDrag from '../../components/VideoUploadByDrag';
import { getText } from './service';
import bufferToAAC from '../../utils/bufferToAAC';
import sliceAudioBuffer from '../../utils/sliceAudioBufffer';
import styles from './index.less';

interface SliceAudioBuffer {
  audioBuffer: Buffer;
  frameCount: number;
}

let core: any = null;

function IndexPage() {
  const [voiceBlob, setVoiceBlob] = useState<string>();
  const [texts, setTexts] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState<number>(0);
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    // 方案一： 纯前端转
    videoToAudio(file).then(async (audio) => {
      const blob = new Blob([audio?.buffer!], { type: 'audio/aac' });
      const blobURL = URL.createObjectURL(blob);
      setVoiceBlob(blobURL);
      const audioFile = new File([audio?.buffer!], 'test.aac', {
        type: blob.type,
      });
      const formData = new FormData();
      formData.append('audio', audioFile);
      const res_text: any = await getText(formData);
      if (res_text.code === 0) {
        setTexts(
          res_text.data.ResultDetail.map(
            (detail: { sentence: string }) => detail.sentence,
          ),
        );
      }
    });

    // 方案二： ffmpeg
    // webExtract.extractAudio(file, async (data) => {
    //   const { audioBuffer } = data;
    //   const blob = new Blob([audioBuffer], { type: 'audio/aac' });
    //   const blobURL = URL.createObjectURL(blob);
    //   setVoiceBlob(blobURL);

    //   const audioFile = new File([blob], 'test.aac', {
    //     type: blob.type,
    //   });
    //   const formData = new FormData();
    //   formData.append('audio', audioFile);
    //   const startTime = new Date().getTime();
    //   const res_text: any = await getText(formData);
    //   if (res_text.code === 0) {
    //     setTexts(
    //       res_text.data.ResultDetail.map(
    //         (detail: { sentence: string }) => detail.sentence,
    //       ),
    //     );
    //   }
    //   const endTime = new Date().getTime();
    //   setTime(Math.round((endTime - startTime) / 1000));
    //   // 音频数据切片
    //   // let consumerTimeFlag = 0;
    //   // setTimeout(async () => {
    //   //   const startTime = new Date().getTime();
    //   //   let pendingReqBuffers: SliceAudioBuffer[] = await sliceAudioBuffer(
    //   //     res.buffer,
    //   //     audioRef.current?.duration,
    //   //   );
    //   //   while (pendingReqBuffers.length) {
    //   //     const _pendingReqBuffers = pendingReqBuffers.splice(0, 3);
    //   //     const pendingReqAudio2Text: any = _pendingReqBuffers.map(
    //   //       async (text: SliceAudioBuffer) => {
    //   //         if (!text) return null;
    //   //         const sliceBlob = bufferToAAC(text.audioBuffer, text.frameCount);
    //   //         const audioFile = new File([sliceBlob], 'test.aac', {
    //   //           type: sliceBlob.type,
    //   //         });
    //   //         const formData = new FormData();
    //   //         formData.append('audio', audioFile);
    //   //         return new Promise(async (resolve) => {
    //   //           const res: any = await getText(formData);
    //   //           if (res.code === 0) {
    //   //             resolve(
    //   //               res.data.ResultDetail.map(
    //   //                 (detail: { sentence: string }) => detail.sentence,
    //   //               ).join(','),
    //   //             );
    //   //           }
    //   //         });
    //   //       },
    //   //     );
    //   //     await Promise.all(pendingReqAudio2Text).then((restText: any) => {
    //   //       setTexts((texts) => texts.concat(restText));
    //   //       const endTime = new Date().getTime();
    //   //       !consumerTimeFlag &&
    //   //         setTime(Math.round((endTime - startTime) / 1000));
    //   //       consumerTimeFlag = 1;
    //   //     });
    //   //   }
    //   // }, 30);
    // });
  }, []);
  const onDropRejected = useCallback((acceptedFiles) => {}, []);
  const renderMoreAction = () => (
    <div className={styles.moreAction}>
      <Button type="primary" style={{ width: '150px', height: '40px' }}>
        本地上传
      </Button>
    </div>
  );
  return (
    <div className={styles.extractAudio}>
      {!voiceBlob ? (
        <VideoUploadByDrag
          onDrop={onDrop}
          onDropRejected={onDropRejected}
          renderMoreAction={renderMoreAction}
        />
      ) : (
        <div className={styles.resWrapper}>
          <div className={styles.audioWrapper}>
            <span>语音：</span>
            <audio
              ref={audioRef}
              controls
              src={voiceBlob}
              className={styles.audioControls}
            >
              播放
            </audio>
            <a href={voiceBlob}>下载</a>
          </div>
          <div className={styles.textWrapper}>
            <span className={styles.label}>文本：</span>
            <div className={styles.text}>
              {time > 0 ? texts.join(',') : <Spin />}
            </div>
          </div>
          <div>耗时：{time}s </div>
        </div>
      )}
    </div>
  );
}

export default IndexPage;
