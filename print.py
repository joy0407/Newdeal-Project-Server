# -*- coding: utf-8 -*-
import sys

if __name__ == '__main__':
    utf8stdout = open(1, 'w', encoding='utf-8', closefd=False)
    print("1 + 1 = 2 입니다.", file=utf8stdout)
    sys.stdout.flush()