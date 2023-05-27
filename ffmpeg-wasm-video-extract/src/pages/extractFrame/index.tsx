// eslint-disable
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Button, Modal } from 'antd';
import VideoUploadByDrag from '../../components/VideoUploadByDrag';
import { convertTime, throttle } from './utils';
import './index.css';
import styles from './index.less';

interface EVT {
  data: {
    type: string;
    data: any;
  };
}
interface ExtImageData {
  width: number;
  height: number;
  imageDataBuffer: Uint8ClampedArray;
  frameConfig: {
    width: number;
    height: number;
  };
}
interface VIDEOINFO {
  width: number;
  height: number;
  duration: number;
}
function IndexPage() {
  const [visible, setVisible] = useState<boolean>(false);
  const [frames, setFrames] = useState([]);
  const videoBasicInfo = useRef<VIDEOINFO | null>(null);
  const [centerImg, setCenterImg] = useState<string>();
  const durationRef = useRef(0);
  const fileRef = useRef<any>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [slidingX, setSlidingX] = useState(-6);
  const [currentTime, setCurrentTime] = useState('00:00');
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    fileRef.current = file;
    webExtract.extractImageList(
      file,
      0,
      { height: 66, wrapperWidth: 720 },
      (data) => {
        const { width, height, duration } = data[0];
        videoBasicInfo.current = {
          height,
          width,
          duration,
        };
        setVisible(true);
        durationRef.current = Math.floor(duration / 1000);
        const frames = data.map((imageData: ExtImageData) => {
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;
          const image = new ImageData(imageData.imageDataBuffer, width, height);
          ctx?.putImageData(image, 0, 0, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg');
        });
        setFrames(frames);
        setCenterImg(frames[0]);
      },
    );
  }, []);
  const onDropRejected = useCallback((acceptedFiles) => {}, []);
  const renderMoreAction = () => (
    <div className={styles.moreAction}>
      <Button type="primary" style={{ width: '150px', height: '40px' }}>
        本地上传
      </Button>
    </div>
  );

  const onChangeTime = useCallback((e: any) => {
    // @ts-ignore
    const { x, width } = timelineRef.current?.getBoundingClientRect();
    const { clientX } = e;
    const gap = 6;
    let newSlidingX = clientX - x;
    if (newSlidingX < 0) newSlidingX = 0;
    if (newSlidingX > width) newSlidingX = width;
    const newTime = durationRef.current * (newSlidingX / width);
    setSlidingX(newSlidingX - gap);
    setCurrentTime(convertTime(newTime));
    webExtract.extractImage(fileRef.current, newTime * 1000, (data) => {
      const { width, height, imageDataBuffer } = data;
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      const image = new ImageData(imageDataBuffer, width, height);
      ctx?.putImageData(image, 0, 0, 0, 0, width, height);
      setCenterImg(canvas.toDataURL('image/jpeg'));
    });
  }, []);

  const onMouseMove = useCallback(throttle(onChangeTime, 30), []);

  const onMouseDown = useCallback(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const onMouseUp = useCallback((e) => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }, []);

  const onCancel = () => {
    setVisible(false);
  };
  return (
    <div>
      <VideoUploadByDrag
        onDrop={onDrop}
        onDropRejected={onDropRejected}
        renderMoreAction={renderMoreAction}
      />
      <Modal
        width={800}
        bodyStyle={{ textAlign: 'center', paddingBottom: 0 }}
        visible={visible}
        onCancel={onCancel}
      >
        <img
          src={centerImg}
          style={{
            display: 'inline-block',
            maxWidth: '600px',
            marginBottom: 20,
            maxHeight: 350,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            onClick={onChangeTime}
            className="vfc-timeline"
            ref={timelineRef}
          >
            {frames?.map((frame, index) => (
              <img
                style={{
                  height: 66,
                  width:
                    (66 / Number(videoBasicInfo?.current?.height)) *
                    Number(videoBasicInfo.current?.width),
                }}
                className="vfc-frame"
                src={frame}
                key={index}
              ></img>
            ))}
            {frames.length ? (
              <div
                onMouseDown={onMouseDown}
                className="vfc-sliding-block"
                style={{ left: slidingX + 'px' }}
              >
                <div className="vfc-sliding-block-tips-left"></div>
                <div className="vfc-sliding-block-tips-right"></div>
                <div className="vfc-sliding-block-tips">{currentTime}</div>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default IndexPage;
