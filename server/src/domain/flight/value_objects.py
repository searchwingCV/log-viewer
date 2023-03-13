import enum


class WeatherCondititions(str, enum.Enum):
    sunny = "sunny"
    windy = "windy"
    cloudy = "cloudy"
    rainy = "rainy"
    snow = "snow"


class AllowedFiles(str, enum.Enum):
    rosbag = "rosbag"
    log = "log"
    apm = "apm"
    tlog = "tlog"
