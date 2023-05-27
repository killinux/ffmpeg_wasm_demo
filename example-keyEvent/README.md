# ccall
>tips Emscripten从v1.38开始，ccall/cwrap辅助函数默认没有导出，在编译时需要通过-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']"选项显式导出。

```js
function onKeyDown(event) {
  Module.ccall('on_key_down', 'null', ['string'], [event.key]);
}
```

注意ccall和cwrap的区别，ccall直接调用了，cwrap返回这个函数的js形式。

# 编译

```sh
em++ -o2 keyEvent.cpp -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']" -s EXPORTED_FUNCTIONS='["_main", "_on_key_down"]' -o keyEvent.js
```


