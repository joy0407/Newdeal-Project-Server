# -*- coding: utf-8 -*-
"""분류모델적용

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/19xodrB1lrh63aAee_T3oTug7c0uw3rmK
"""

import tensorflow as tf
import pandas as pd
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt
from tensorflow.keras.applications.inception_resnet_v2 import preprocess_input
from keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import numpy as np

## 모델 불러오기
model = load_model('/content/drive/MyDrive/어종분류모델.h5') # 모델 경로 입력

## 모델에 이미지 넣고 예측

IMAGE_SIZE    = (224, 224) # 모델에 넣기 전 이미지 사이즈 조정
test_image = image.load_img('/content/drive/MyDrive/test이미지2/test11.jpg' # 이미지 경로 입력
                            ,target_size =IMAGE_SIZE )
test_image = image.img_to_array(test_image)

test_image = test_image.reshape((1, test_image.shape[0], test_image.shape[1], test_image.shape[2])) # shape 조정
test_image = preprocess_input(test_image) # 이미지를 모델에 필요한 형식에 맞춤
prediction = model.predict(test_image) # 테스트 이미지 예측

df = pd.DataFrame({'pred':prediction[0]})
df = df.sort_values(by='pred', ascending=False, na_position='first') # 예측결과를 데이터 프레임 형식으로 변환

class_dictionary = {'감성돔':0,'넙치':1,'돌돔':2, '조피볼락':3, '참돔':4}
for x in class_dictionary:
  if class_dictionary[x] == (df[df == df.iloc[0]].index[0]):
    print(f"어종: {x}")
    break

