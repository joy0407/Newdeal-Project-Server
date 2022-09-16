
//전달받은 두 값이 중심값(center)를 기준으로 일정거리내에 있으면 true를 반환하는 함수
//판별은 현재 사각형을 기준으로 판별
//현재 기준은 1.0
function caculateLocation(centerLatitude, centerLongitude, currentLatitude, currentLongitude) {
    if(Math.abs(parseFloat(centerLatitude) - parseFloat(currentLatitude)) < parseFloat(1.0) &&
        Math.abs(parseFloat(centerLongitude) - parseFloat(currentLongitude)) < parseFloat(1.0))
        return true
    else
        return false
}

export {
    caculateLocation
}
