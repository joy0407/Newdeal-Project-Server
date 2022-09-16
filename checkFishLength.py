# -*- coding: utf-8 -*-
"""mearsuring size_최종ver2

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1E0sYLvKPDPgMW8Bs-oXHIzzTJMsxPE1n
"""

from scipy.spatial import distance as dist
from imutils import perspective
from imutils import contours
import argparse
import numpy as np
import imutils
import cv2
import matplotlib.pyplot as plt
import sys

## 원본 이미지 불러오고 배경 제거

#!pip install removebg # 배경제거 라이브러리 removebg
from removebg import RemoveBg



#path = 'image.jpg' # 원본 이미지 경로 입력
#path = 'uploads/image1.jpg'
path = sys.argv[1]

#print(path)
#rmbg = RemoveBg("EDTerV9xcfE3wRJbWLU1UiGd", "error.log") # api키 입력
#rmbg.remove_background_from_img_file(path) # 원본 이미지의 배경을 제거하고 png파일로 저장

#path = '/content/drive/MyDrive/test이미지2/testimage.jpg'
image_bgr = cv2.imread(path) # 이미지 불러오기
if image_bgr.shape[0]*image_bgr.shape[1] > 10000000:
    image_bgr = cv2.resize(image_bgr, dsize=(0,0), fx=0.25, fy=0.25, interpolation=cv2.INTER_LINEAR)

image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB) # 이미지 색 배열을 bgr에서 rgb로 변환

rectangle = (1, 1, image_rgb.shape[1]-1, image_rgb.shape[0]-1) # 객체 판별 범위 지정

mask = np.zeros(image_rgb.shape[:2], np.uint8) # 마스크 지정

bgdModel = np.zeros((1, 65), np.float64) # 임시 배경 
fgdModel = np.zeros((1, 65), np.float64) # 임시 전경

cv2.grabCut(image_rgb, # 원본 이미지
           mask,       # 마스크
           rectangle,  # 판별 범위 사각형
           bgdModel,   # 배경을 위한 임시 배열, 결과값 개선을 위해 설정
           fgdModel,   # 전경을 위한 임시 배열, 결과값 개선을 위해 설정
           5,          # 반복 횟수
           cv2.GC_INIT_WITH_RECT) # 초기화 mode
mask_2 = np.where((mask==2) | (mask==0), 0, 1).astype('uint8') # mask == 2 or mask == 0을 만족하면 0으로 설정 아니면 1로 설정

image_rgb_nobg = image_rgb * mask_2[:, :, np.newaxis] # 차원 확장

#image_nbg = cv2.imread(path+'_no_bg.png') # 배경제거된 이미지 불러오기 (png파일)

#plt.imshow(image_nbg) # 배경제거된 이미지 출력

## 객체 크기 측정
#ap = argparse.ArgumentParser() # 파이썬 인자값을 받을 인스턴스 생성
#ap.add_argument("-i", "--image", default = image_nbg) # 배경을 제거한 이미지 불러오는 argument 추가
#ap.add_argument("-w", "--width", type=float, default=8.8) # 특정 객체의 길이값 8.8로 고정하는 argument 추가
#ap.add_argument('-f') # 더미 변수

#print(ap)

#args = vars(ap.parse_args())

#image_1 = args['image'] # 이미지 불러오기
image_1 = image_rgb_nobg
gray = cv2.cvtColor(image_1, cv2.COLOR_BGR2GRAY) # 배경제거한 이미지 회색조로 변환하고 불러오기
gray = cv2.GaussianBlur(gray, (7, 7), 0) # 지정한 커널(7,7)에 맞춰 블러처리

edged = cv2.Canny(gray, 50, 100) # 윤곽선 도출
edged = cv2.dilate(edged, None, iterations=1) # 윤곽선 팽창
edged = cv2.erode(edged, None, iterations=1) # 윤곽선을 배경으로 만듦

cnts = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE) # 윤곽선 정보 검출
cnts = imutils.grab_contours(cnts) # 윤곽선 총갯수 구하기
#print("Total number of contours are: ", len(cnts))

(cnts,_) = contours.sort_contours(cnts, ) # 왼쪽에서 오른쪽으로 셀 정렬 ,method='left-to-right'
pixelPerMetric = None # 1픽셀 대비 cm값을 구하는 함수
def midpoint(ptA, ptB):
    return ((ptA[0] + ptB[0]) * 0.5, (ptA[1] + ptB[1]) * 0.5) # 직선의 가운데 위치를 찾는 함수

count = 0
c = max(cnts, key=cv2.contourArea)

dimA = 0
dimB = 0

for c in cnts:
    if cv2.contourArea(c) < 1000:
      
        continue 
        
         # 이미지 맨 왼쪽에 위치한 기준객체의 면적구하기
    
    #print(count)

    count += 1
    if count==3:
      break              # 기준 객체와 물고기 객체만 인식하도록 설정

    orig = image_1.copy()
    box = cv2.minAreaRect(c) # 윤곽선에 접하면서 가장 작은 직사각형 구하기
    box = cv2.cv.BoxPoints(box) if imutils.is_cv2() else cv2.boxPoints(box) # 직사각형의 꼭지점 좌표 구하기
    box = np.array(box, dtype="int") # 좌표를 배열로 변환

    box = perspective.order_points(box)
    cv2.drawContours(orig, [box.astype("int")], -1, (0, 255, 0), 2) # 직사각형에 색깔 입히기

    for (x, y) in box:
        cv2.circle(orig, (int(x), int(y)), 5, (0, 0, 255), -1)


    (tl, tr, br, bl) = box
    (tltrX, tltrY) = midpoint(tl, tr)
    (blbrX, blbrY) = midpoint(bl, br)
    (tlblX, tlblY) = midpoint(tl, bl)
    (trbrX, trbrY) = midpoint(tr, br) # 직사각형의 꼭지점과 직선들의 가운데 위치에 포인트 넣기

    cv2.circle(orig, (int(tltrX), int(tltrY)), 5, (255, 0, 0), -1)
    cv2.circle(orig, (int(blbrX), int(blbrY)), 5, (255, 0, 0), -1)
    cv2.circle(orig, (int(tlblX), int(tlblY)), 5, (255, 0, 0), -1)
    cv2.circle(orig, (int(trbrX), int(trbrY)), 5, (255, 0, 0), -1) # 빨간색 원으로 꼭지점 표현

    cv2.line(orig, (int(tltrX), int(tltrY)), (int(blbrX), int(blbrY)), (255, 0, 255), 2)
    cv2.line(orig, (int(tlblX), int(tlblY)), (int(trbrX), int(trbrY)), (255, 0, 255), 2) # 직사각형 각 직선의 중간지점을 잇는 선분 그리기

    dA = dist.euclidean((tltrX, tltrY), (blbrX, blbrY)) # 직사각형의 높이 구하기
    dB = dist.euclidean((tlblX, tlblY), (trbrX, trbrY)) # 직사각형의 너비 구하기

    if pixelPerMetric is None:
        pixelPerMetric = dA / 8.8
        #pixelPerMetric = dA / args["width"] # 고정된 높이 값(8.8)을 픽셀 당 단위로 주기


    dimA = dA / pixelPerMetric # 실제 높이 값
    dimB = dB / pixelPerMetric # 실제 너비 값

    cv2.putText(orig, "{:.1f}cm".format(dimA), (int(tltrX - 15), int(tltrY - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 0, 255), 2)
    cv2.putText(orig, "{:.1f}cm".format(dimB), (int(trbrX + 10), int(trbrY)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 0, 255), 2) # 화면에 길이 표시

    plt.figure(figsize=(12,8))

    plt.imshow(orig)
    plt.axis('off')
    # plt.show() # 화면 출력
    
utf8stdout = open(1, 'w', encoding='utf-8', closefd=False)
print("측정길이:","{:.1f}cm".format(dimA), file=utf8stdout) 
print("측정너비:","{:.1f}cm".format(dimB), file=utf8stdout)

