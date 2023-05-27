## 编译
```sh
emcc -o2 hello.cc -o hello.js
```
生成下面两个文件：
- hello.js 相关的胶水代码，包括加载WASM文件并执行调用等相关逻辑
- hello.wasm 编译得到的核心WebAssembly执行文件


## html中使用

默认情况下，Emscripten 生成的代码会调用 main() 函数，其它的函数将被视为无用代码

在html中引入hello.js,`·Module.onRuntimeInitialized`初始化加载完毕后，`_main`方法是默认导出的，可以直接`Module._main()`调用。