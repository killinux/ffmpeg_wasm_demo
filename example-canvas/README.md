# demo需求
创建包含了一个Canvas的页面，Canvas上将绘制一个直径周而复始变大变小的红色的圆。其中：
C代码负责图像数据的管理以及圆的绘制；
JavaScript代码负责图像数据向Canvas的更新及动画调度。

## 导出main函数之外的自定义方法
### 定义宏
```c
// 定义宏
#ifndef EM_PORT_API
#	if defined(__EMSCRIPTEN__)
#		include <emscripten.h>
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#		else
#			define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#		endif
#	else
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype
#		else
#			define EM_PORT_API(rettype) rettype
#		endif
#	endif
#endif
```
你也可以不定义，根据直接添加c或者c++中定义方法名前添加：`EMSCRIPTEN_KEEPALIVE`
```c
EMSCRIPTEN_KEEPALIVE
uint8_t *get_img_buf(){
  ...
}
```

### 在emcc或者em++编译的时候时额外导出

```sh
em++ -o2 canvas.cpp2 -s EXPORTED_FUNCTIONS='["_main", "_get_img_buf", "_draw_circle"]' -o canvas.js

# 或者这样 但是在cpp导出的方法名前需要添加EMSCRIPTEN_KEEPALIVE标志
em++ -o2 canvas.cpp -o canvas.js
```

## 补充：图像内存计算
1. 图片内存大小跟占用空间大小有什么关系？
占用空间的大小不是图片占用内存的大小。占用空间是在磁盘上占用的空间，内存大小是加载到内存中占用的内存大小。两个只是单位是一样的，本质不是一个概念。

2. 一张图片到底占用多少内存呢？
图片占用内存的计算公式：图片高度 * 图片宽度 * 一个像素占用的内存大小,浏览器端采用rgba方式展示图片，我们直接采用4就可以



