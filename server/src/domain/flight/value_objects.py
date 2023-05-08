import enum


class FlightPurpose(str, enum.Enum):
    test = "Test"
    pilot_training = "Pilot Training"
    mission = "Mission"


class FlightRating(str, enum.Enum):
    good = "good"
    problems = "problems"
    crash = "crash"


class WindIntensity(str, enum.Enum):
    strong = "strong"
    medium = "medium"
    low = "low"


class AllowedFiles(str, enum.Enum):
    rosbag = "rosbag"
    log = "log"
    apm = "apm"
    tlog = "tlog"


class FlightProcessingStatus(str, enum.Enum):
    not_processed = 0
    processing = 1
    success = 2
    error = 3
