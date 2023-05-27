const sliceAudioBuffer = async (buffer, duration) => {
  if (buffer.length === 0) return null;
  const audioCtx = new AudioContext();
  return new Promise((resolve) => {
    audioCtx.decodeAudioData(buffer, async (audioBuffer) => {
      const ReqBuffers = [];
      const channels = audioBuffer.numberOfChannels;
      const rate = audioBuffer.sampleRate;
      const step = 5;
      const count = Math.ceil(duration / step);
      for (let index = 0; index < count; index++) {
        // 截取时间段
        const startOffset = rate * index * step;
        const endOffset = rate * (index + 1) * step;
        // 对应的帧数
        const frameCount = endOffset - startOffset;
        // 创建同样采用率、同样声道数量，长度是前3秒的空的AudioBuffer
        const newAudioBuffer = new AudioContext().createBuffer(
          channels,
          endOffset - startOffset,
          rate,
        );
        // 创建临时的Array存放复制的buffer数据
        const anotherArray = new Float32Array(frameCount);
        // 声道的数据的复制和写入
        const offset = 0;
        for (var channel = 0; channel < channels; channel++) {
          audioBuffer.copyFromChannel(anotherArray, channel, startOffset);
          newAudioBuffer.copyToChannel(anotherArray, channel, offset);
        }
        ReqBuffers.push({ audioBuffer: newAudioBuffer, frameCount });
      }
      resolve(ReqBuffers);
    });
  });
};

export default sliceAudioBuffer;
