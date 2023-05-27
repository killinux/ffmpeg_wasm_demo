import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { Spin } from 'antd';
import styles from './index.less';

const VideoUploadByDrag = ({
  renderMoreAction,
  onDrop,
  onDropRejected,
  multiple = true,
  loading = false,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple,
    accept: { 'video/*': [] },
  });
  return (
    <div
      className={`${styles.actionArea} ${
        isDragActive ? styles.actionAreaActive : ''
      }`}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className={styles.drag}>
        <div className={styles.dragDesc}>
          {isDragActive ? '释放文件开始上传' : '将视频文件拖入此区域也可以上传'}
        </div>
      </div>
      {renderMoreAction && renderMoreAction()}
      {loading && (
        <div className={styles.spin}>
          <Spin />
        </div>
      )}
    </div>
  );
};
VideoUploadByDrag.propTypes = {
  RenderMoreAction: PropTypes.element,
  onDrop: PropTypes.func,
  onDropRejected: PropTypes.func,
  loading: PropTypes.bool,
};
export default React.memo(VideoUploadByDrag);
