// eslint-disable
import React, { useEffect, useCallback } from 'react';
import styles from './index.less';

import type { IndexModelState } from './model';

let core: any = null;
interface Iprops {
  home: IndexModelState;
}

function IndexPage(props: Iprops) {
  return <div className={styles.ScheduleIndex}>多媒体处理， 图像，音视频</div>;
}

export default IndexPage;
