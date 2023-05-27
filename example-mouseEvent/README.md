# 需求
创建包含了一个Canvas的页面，当鼠标在Canvas上移动时将调用C函数，输出光标在Canvas中的坐标及该坐标处的像素的颜色（RGBA）值。


## cpp代码解读

`get_img_buf()`用于分配保存位图数据的缓冲区. `on_mouse_move()`函数根据传入参数进行颜色拾取和日志输出

## js
这里是本节的重点copy img_data to Emscripten
```js
Module.HEAPU8.set(img_data, buf_addr);  //copy img_data to Emscripten
```

### 在emcc或者em++编译的时候时额外导出

```sh
em++ -o2 mouseEvent.cpp -s EXPORTED_FUNCTIONS='["_main", "_get_img_buf", "_on_mouse_move"]' -o mouseEvent.js
```

### 项目运行
运行本地服务，我这里使用的`http-server`这个包，
```
<!-- 在example-mouseEvent根目录下 -->
http-server --cors
```

启动后访问：http://localhost:8080/，
打开控制台，可以看到鼠标移动时输出
```
mouse_x:503; mouse_y:234; RGBA:(81, 95, 132, 255)
```

### 补充
- example-mouseEvent
- example-canvas
这里的例子中都用的Module.HEAPU8数据类型，其实并没有限制你也可以使用Module.HEAPU32，在example-ffmpeg-extract中你可以看到。
另外在js中有此种类型数据Uint8ClampedArray适合与图像操作。一般来说，我们看到的彩色图像中，都有三个通道，这三个通道就是R、G、B通道,（有的时候还会有Alpha值，代表透明度) 通常R、G、B各占8个位，我们称这种图像是8bit图像。
>Uint8ClampedArray（8 位无符号整型固定数组） 类型化数组表示一个由值固定在 0-255 区间的 8 位无符号整型组成的数组；如果你指定一个在 [0,255] 区间外的值，它将被替换为 0 或 255；如果你指定一个非整数，那么它将被设置为最接近它的整数。（数组）内容被初始化为 0。一旦（数组）被创建，你可以使用对象的方法引用数组里的元素，或使用标准的数组索引语法（即使用方括号标记）。






