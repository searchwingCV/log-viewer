import enum


class AllowedFiles(str, enum.Enum):
    rosbag = "rosbag"
    log = "log"
    apm = "apm"
    tlog = "tlog"
