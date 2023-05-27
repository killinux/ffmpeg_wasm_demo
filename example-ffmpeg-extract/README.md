# 安装emscripten：  
```shell
git clone https://github.com/emscripten-core/emsdk.git   
./emsdk install latest  
./emsdk activate latest  
source ./emsdk_env.sh  
emcc --version
emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 3.1.39  
```


# 安装编译 ffmpeg to wasm  
```
git clone --depth 1 --branch n4.3.1 https://github.com/FFmpeg/FFmpeg  
```


https://blog.csdn.net/fengfan_tracking/article/details/110129951

FFmpeg/libswscale/yuv2rgb.c  
注释掉3行
``` c
//    av_log(c, AV_LOG_WARNING,
//           "No accelerated colorspace conversion found from %s to %s.\n",
//          av_get_pix_fmt_name(c->srcFormat), av_get_pix_fmt_name(c->dstFormat));
```

``` shell
emconfigure ./configure --cc="emcc" --cxx="em++"  --ar="emar" --ranlib=emranlib --prefix=$(pwd)/dist --cpu=generic \--target-os=none --arch=x86_32  --enable-cross-compile --disable-stripping --disable-programs --disable-doc --disable-devices --disable-postproc --disable-hwaccels --disable-parsers --disable-bsfs --disable-protocols --disable-indevs --disable-outdevs --disable-network --disable-asm --disable-debug  --enable-protocol=file

emmake make -j8
make install 


```
生成dist 下面的 include 和lib
```shell
cd dist
cp -r include lib /opt/mycode/ffmpeg/ffmpeg_wasm_demo/example-ffmpeg-extract

```

生成：ffmpeg_wasm_demo/example-ffmpeg-extract/dist/extract.js   和 ffmpeg_wasm_demo/example-ffmpeg-extract/dist/extract.wasm
```shell
cd /opt/mycode/ffmpeg/ffmpeg_wasm_demo/example-ffmpeg-extract
em++ -O3 src/extract.cpp  -I ./include lib/libavformat.a lib/libavcodec.a lib/libswscale.a lib/libswresample.a lib/libavutil.a -lworkerfs.js --pre-js src/worker.js -s WASM=1 -o dist/extract.js -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -s EXPORTED_FUNCTIONS='["_main", "_destroy", "_extract_image","_extract_audio"]' -s ALLOW_MEMORY_GROWTH=1  -s TOTAL_MEMORY=33554432
```














