import enum


class DroneStatus(str, enum.Enum):
    ready_for_flight = "Ready for flight"
    needs_repair = "Needs repair"
    lost = "Lost"
    out_of_service = "Out of service"
