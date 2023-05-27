#include <stdio.h>
#include <vector>

extern "C"
{
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavutil/imgutils.h>
#include <libswscale/swscale.h>
};

// 抽帧图片数据结构
typedef struct
{
  uint32_t width;
  uint32_t height;
  uint32_t duration;
  uint8_t *data;
} ImageData;

// 音频数据结构
typedef struct
{
  uint32_t len;
  uint8_t *data;
} AudioData;

// Declare this so it's exported as non-mangled symbol "_capture_audio", "_extract_audio", "_destroy"
extern "C"
{
  
  ImageData *extract_image(int ms, char *path);
  uint8_t *extract_audio(char *path, uint32_t *len);
  void destroy(uint8_t *p);
}

int main(int argc, char const *argv[])
{
  av_register_all();
  return 0;
}

AVFrame *initAVFrame(AVCodecContext *pCodecCtx, uint8_t **frameBuffer)
{
  AVFrame *pFrameRGB = av_frame_alloc();
  if (pFrameRGB == NULL)
  {
    return NULL;
  }

  int numBytes;
  numBytes = av_image_get_buffer_size(AV_PIX_FMT_RGB24, pCodecCtx->width, pCodecCtx->height, 1);

  *frameBuffer = (uint8_t *)av_malloc(numBytes * sizeof(uint8_t));

  av_image_fill_arrays(pFrameRGB->data, pFrameRGB->linesize, *frameBuffer, AV_PIX_FMT_RGB24, pCodecCtx->width, pCodecCtx->height, 1);

  return pFrameRGB;
}

AVFrame *readAVFrame(AVCodecContext *pCodecCtx, AVFormatContext *pFormatCtx, AVFrame *pFrameRGB, int videoStream, int ms)
{
  struct SwsContext *sws_ctx = NULL;

  AVPacket packet;
  AVFrame *pFrame = NULL;

  pFrame = av_frame_alloc();

  sws_ctx = sws_getContext(pCodecCtx->width, pCodecCtx->height, pCodecCtx->pix_fmt, pCodecCtx->width, pCodecCtx->height, AV_PIX_FMT_RGB24, SWS_BILINEAR, NULL, NULL, NULL);

  int timeStamp = ((double)ms / (double)1000) * pFormatCtx->streams[videoStream]->time_base.den / pFormatCtx->streams[videoStream]->time_base.num;

  int ret = av_seek_frame(pFormatCtx, videoStream, timeStamp, AVSEEK_FLAG_BACKWARD);

  if (ret < 0)
  {
    fprintf(stderr, "av_seek_frame failed\n");
    return NULL;
  }

  while (av_read_frame(pFormatCtx, &packet) >= 0)
  {
    if (packet.stream_index == videoStream)
    {
      if (avcodec_send_packet(pCodecCtx, &packet) != 0)
      {
        fprintf(stderr, "avcodec_send_packet failed\n");
        av_packet_unref(&packet);
        continue;
      }

      if (avcodec_receive_frame(pCodecCtx, pFrame) == 0)
      {
        sws_scale(sws_ctx, (uint8_t const *const *)pFrame->data, pFrame->linesize, 0, pCodecCtx->height, pFrameRGB->data, pFrameRGB->linesize);

        sws_freeContext(sws_ctx);
        av_frame_free(&pFrame);
        av_packet_unref(&packet);

        return pFrameRGB;
      }
    }
  }

  sws_freeContext(sws_ctx);
  av_frame_free(&pFrame);
  av_packet_unref(&packet);

  return NULL;
}

// 读取帧数据并返回 uint8 buffer
uint8_t *getFrameBuffer(AVFrame *pFrame, AVCodecContext *pCodecCtx)
{
  int width = pCodecCtx->width;
  int height = pCodecCtx->height;

  uint8_t *buffer = (uint8_t *)malloc(height * width * 3);
  for (int y = 0; y < height; y++)
  {
    memcpy(buffer + y * pFrame->linesize[0], pFrame->data[0] + y * pFrame->linesize[0], width * 3);
  }
  return buffer;
}

// 截取指定位置视频画面
ImageData *extract_image(int ms, char *path)
{
  ImageData *imageData = NULL;

  AVFormatContext *pFormatCtx = avformat_alloc_context();

  if (avformat_open_input(&pFormatCtx, path, NULL, NULL) < 0)
  {
    fprintf(stderr, "avformat_open_input failed\n");
    return NULL;
  }

  if (avformat_find_stream_info(pFormatCtx, NULL) < 0)
  {
    fprintf(stderr, "avformat_find_stream_info failed\n");
    return NULL;
  }

  int videoStream = -1;
  for (int i = 0; i < pFormatCtx->nb_streams; i++)
  {
    if (pFormatCtx->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_VIDEO)
    {
      videoStream = i;
      break;
    }
  }

  if (videoStream == -1)
  {
    return NULL;
  }

  AVCodecContext *pCodecCtx = pFormatCtx->streams[videoStream]->codec;

  AVCodec *pCodec = NULL;

  // 获取解码器
  pCodec = avcodec_find_decoder(pCodecCtx->codec_id);
  if (pCodec == NULL)
  {
    fprintf(stderr, "avcodec_find_decoder failed\n");
    return NULL;
  }
  // 配置解码器
  AVCodecContext *pNewCodecCtx = avcodec_alloc_context3(pCodec);
  if (avcodec_copy_context(pNewCodecCtx, pCodecCtx) != 0)
  {
    fprintf(stderr, "avcodec_copy_context failed\n");
    return NULL;
  }

  if (avcodec_open2(pNewCodecCtx, pCodec, NULL) < 0)
  {
    fprintf(stderr, "avcodec_open2 failed\n");
    return NULL;
  }

  if (!pNewCodecCtx)
  {
    fprintf(stderr, "pNewCodecCtx is NULL\n");
    return NULL;
  }

  uint8_t *frameBuffer;
  AVFrame *pFrameRGB = initAVFrame(pNewCodecCtx, &frameBuffer);
  pFrameRGB = readAVFrame(pNewCodecCtx, pFormatCtx, pFrameRGB, videoStream, ms);

  if (pFrameRGB == NULL)
  {
    fprintf(stderr, "readAVFrame failed\n");
    return NULL;
  }

  imageData = (ImageData *)malloc(sizeof(ImageData));
  imageData->width = (uint32_t)pNewCodecCtx->width;
  imageData->height = (uint32_t)pNewCodecCtx->height;
  imageData->duration = (uint32_t)pFormatCtx->duration;
  imageData->data = getFrameBuffer(pFrameRGB, pNewCodecCtx);

  avcodec_close(pNewCodecCtx);
  av_free(pCodec);
  avcodec_close(pCodecCtx);
  av_frame_free(&pFrameRGB);
  av_free(frameBuffer);
  avformat_close_input(&pFormatCtx);

  return imageData;
}

//采样率对应表
const int sampleFrequencyTable[] = {96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350};

//获取音频数据传输流的头
int addHeader(char *header, int packetSize, int profile, int sampleRate, int channels)
{
  int sampleIndex = 3; //48000
  int len = packetSize + 7;

  for (int i = 0; i < sizeof(sampleFrequencyTable) / sizeof(sampleFrequencyTable[0]); i++)
  {
    if (sampleRate == sampleFrequencyTable[i])
    {
      sampleIndex = i;
      break;
    }
  }
  //0,1是固定的
  header[0] = (uint8_t)0xff; //syncword:0xfff                          高8bits
  header[1] = (uint8_t)0xf0; //syncword:0xfff                          低4bits
  header[1] |= (0 << 3);     //MPEG Version:0 for MPEG-4,1 for MPEG-2  1bit
  header[1] |= (0 << 1);     //Layer:0                                 2bits
  header[1] |= 1;            //protection absent:1                     1bit
  //根据aac类型,采样率,通道数来配置
  header[2] = (profile) << 6;             //profile:audio_object_type - 1                      2bits
  header[2] |= (sampleIndex & 0x0f) << 2; //sampling frequency index:sampling_frequency_index  4bits
  header[2] |= (0 << 1);                  //private bit:0                                      1bit
  header[2] |= (channels & 0x04) >> 2;    //channel configuration:channel_config               高1bit
  //根据通道数+数据长度来配置
  header[3] = (channels & 0x03) << 6;  //channel configuration:channel_config      低2bits
  header[3] |= (0 << 5);               //original：0                               1bit
  header[3] |= (0 << 4);               //home：0                                   1bit
  header[3] |= (0 << 3);               //copyright id bit：0                       1bit
  header[3] |= (0 << 2);               //copyright id start：0                     1bit
  header[3] |= ((len & 0x1800) >> 11); //frame length：value   高2bits
  //根据数据长度来配置
  header[4] = (uint8_t)((len & 0x7f8) >> 3); //frame length:value    中间8bits
  header[5] = (uint8_t)((len & 0x7) << 5);   //frame length:value    低3bits
  header[5] |= (uint8_t)0x1f;                //buffer fullness:0x7ff 高5bits
  header[6] = (uint8_t)0xfc;
  return 0;
}

uint8_t *extract_audio(char *path, uint32_t *len)
{
  AVFormatContext *pFormatCtx = NULL;
  if (avformat_open_input(&pFormatCtx, path, NULL, NULL) < 0)
  {
    fprintf(stderr, "avformat_open_input failed\n");
    return NULL;
  }

  if (avformat_find_stream_info(pFormatCtx, NULL) < 0)
  {
    fprintf(stderr, "avformat_find_stream_info failed\n");
    avformat_close_input(&pFormatCtx);
    return NULL;
  }

  //查找音频流
  int audioStream = av_find_best_stream(pFormatCtx, AVMEDIA_TYPE_AUDIO, -1, -1, NULL, 0);
  ;
  if (audioStream < 0)
  {
    fprintf(stderr, "av_find_best_stream audio failed\n");
    avformat_close_input(&pFormatCtx);
    return NULL;
  }

  //检查是否是aac
  AVCodecContext *pCodecCtx = pFormatCtx->streams[audioStream]->codec;
  if (pCodecCtx->codec_id != AV_CODEC_ID_AAC)
  {
    avformat_close_input(&pFormatCtx);
    return NULL;
  }

  AVPacket packet;                  //数据包
  std::vector<AudioData> audio_vec; //创建缓存容器
  uint32_t totalsize = 0;           //总音频数据量

  //解析音频
  while (av_read_frame(pFormatCtx, &packet) >= 0)
  {
    if (packet.stream_index == audioStream) //如果为音频标志
    {
      AudioData audio;
      audio.len = packet.size + 7; //加上acc的7个字节头
      totalsize += audio.len;      //数据总量
      audio.data = (uint8_t *)av_malloc(audio.len);
      //添加acc头
      addHeader((char *)audio.data, packet.size, pCodecCtx->profile, pCodecCtx->sample_rate, pCodecCtx->channels); ////添加acc数据
      //添加音源
      memcpy(audio.data + 7, packet.data, packet.size);
      audio_vec.push_back(audio);
    }
    //释放数据包
    av_packet_unref(&packet);
  }

  uint8_t *out_buf = (uint8_t *)malloc(totalsize);
  uint32_t currindex = 0;
  for (size_t i = 0; i < audio_vec.size(); i++)
  {
    AudioData &audio = audio_vec[i];
    memcpy(out_buf + currindex, audio.data, audio.len);
    currindex += audio.len;
    av_free(audio.data);
  }
  *len = totalsize;
  //内存清理
  std::vector<AudioData>().swap(audio_vec);
  avcodec_close(pCodecCtx);
  avformat_close_input(&pFormatCtx);
  return out_buf;
}

void destroy(uint8_t *p)
{
  free(p);
}
