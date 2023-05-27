#include <iostream>
#include <emscripten.h>
using namespace std;

uint8_t *img_buf = NULL;
int img_width = 0, img_height = 0;

extern "C"
{
	EMSCRIPTEN_KEEPALIVE
	void draw_circle(int cx, int cy, int radii);
	EMSCRIPTEN_KEEPALIVE
	uint8_t *get_img_buf(int w, int h);
	EMSCRIPTEN_KEEPALIVE
  void destroy(uint8_t *p);
};

int main() {
  return 0;
};


uint8_t *get_img_buf(int w, int h) {
	if (img_buf == NULL || w != img_width || h != img_height) {
		if (img_buf) {
			free(img_buf);
		}
		img_buf = (uint8_t*)malloc(w * h * 4);
		img_width = w;
		img_height = h;
	}

	return img_buf;
};


void draw_circle(int cx, int cy, int radii) {
	int sq = radii * radii;
	for (int y = 0; y < img_height; y++) {
		for (int x = 0; x < img_width; x++) {
			int d = (y - cy) * (y - cy) + (x - cx) * (x - cx);
			if (d < sq) {
				img_buf[(y * img_width + x) * 4] = 255;		//r
				img_buf[(y * img_width + x) * 4 + 1] = 0;	//g
				img_buf[(y * img_width + x) * 4 + 2] = 0;	//b
				img_buf[(y * img_width + x) * 4 + 3] = 255;	//a
			}
			else {
				img_buf[(y * img_width + x) * 4] = 0;		//r
				img_buf[(y * img_width + x) * 4 + 1] = 255;	//g
				img_buf[(y * img_width + x) * 4 + 2] = 255;	//b
				img_buf[(y * img_width + x) * 4 + 3] = 255;	//a
			}
		}
	}
}



