#include <iostream>
using namespace std;

int main() {
  return 0;
};

extern "C"
{
	void on_key_down(const char* key);
};

void on_key_down(const char* key) {
	printf("on_key_down(); key:%s\n", key);
}
