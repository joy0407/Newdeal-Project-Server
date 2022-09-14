
function caculateLocation(centerLatitude, centerLongitude, currentLatitude, currentLongitude) {
    if(Math.abs(parseFloat(centerLatitude) - parseFloat(currentLatitude)) < parseFloat(0.5) &&
        Math.abs(parseFloat(centerLongitude) - parseFloat(currentLongitude)) < parseFloat(0.5))
        return true
    else
        return false
}

export {
    caculateLocation
}
