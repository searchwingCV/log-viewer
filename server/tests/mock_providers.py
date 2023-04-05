import datetime
import random

from domain.drone.entities import BaseDrone
from domain.flight.entities import BaseFlight
from domain.flight.value_objects import FlightPurpose, FlightRating, WindIntensity
from domain.flight_file.entities import BaseFlightFile
from domain.flight_file.value_objects import AllowedFiles
from domain.mission.entities import BaseMission
from faker import Faker
from faker.providers import BaseProvider

fake = Faker()


class FlightLogProvider(BaseProvider):
    __provider__ = "flight_log"

    def mission(self):
        start_date = fake.date_between(datetime.date(2020, 1, 1))
        end_date = fake.date_between(start_date)
        return BaseMission(
            name=fake.sentence(nb_words=2),
            location=fake.country(),
            description=fake.paragraph(nb_sentences=3),
            partner_organization=random.choice(["SeaWatch", "NASA", "Mission Lifeline", "SeaEye", "OpenArms"]),
            start_date=start_date,
            end_date=end_date,
        )

    def drone(self):
        return BaseDrone(
            name=fake.first_name() + fake.last_name(),
            model=fake.domain_word(),
            sys_thismav=fake.pyint(min_value=1, max_value=3),
            description=fake.paragraph(nb_sentences=1),
        )

    def flight(self, mission_id: int = None, drone_id: int = 1):
        log_start_time = fake.date_time_between(start_date=datetime.datetime(2020, 1, 1))
        max_duration = datetime.timedelta(hours=1)
        log_end_time = fake.date_time_between(start_date=log_start_time, end_date=log_start_time + max_duration)
        max_battery_voltage = fake.pyfloat(right_digits=2, min_value=12, max_value=14)
        min_battery_voltage = fake.pyfloat(right_digits=2, min_value=10, max_value=12)

        return BaseFlight(
            fk_drone=drone_id,
            fk_mission=mission_id,
            location=fake.country(),
            pilot=fake.first_name() + fake.last_name(),
            observer=fake.first_name() + fake.last_name(),
            rating=fake.enum(FlightRating),
            purpose=fake.enum(FlightPurpose),
            notes=fake.paragraph(nb_sentences=3),
            drone_needs_repair=fake.pybool(truth_probability=25),
            temperature_celsius=fake.pyfloat(min_value=-5, max_value=40, right_digits=1),
            wind=fake.enum(WindIntensity),
            log_start_time=log_start_time,
            log_end_time=log_end_time,
            log_duration=log_end_time - log_start_time,
            start_latitude=fake.latitude(),
            start_longitude=fake.longitude(),
            end_latitude=fake.latitude(),
            end_longitude=fake.longitude(),
            hardware_version=f"{fake.random_digit_not_null()}.{fake.random_digit_not_null()}",
            firmware_version=f"{fake.random_digit_not_null()}.{fake.random_digit_not_null()}",
            distance_km=fake.pyfloat(right_digits=2, min_value=0, max_value=100.0),
            max_groundspeed_kmh=fake.pyfloat(right_digits=2, min_value=25.0, max_value=50.0),
            min_groundspeed_kmh=fake.pyfloat(right_digits=2, min_value=0, max_value=25.0),
            avg_groundspeed_kmh=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            max_vertical_speed_up_kmh=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            max_vertical_speed_down_kmh=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            max_airspeed_kmh=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            min_airspeed_kmh=fake.pyfloat(right_digits=2, min_value=2, max_value=12.0),
            avg_airspeed_kmh=fake.pyfloat(right_digits=2, min_value=5, max_value=15),
            max_telemetry_distance_km=fake.pyfloat(right_digits=2, min_value=10.0, max_value=20.0),
            max_battery_voltage=max_battery_voltage,
            min_battery_voltage=min_battery_voltage,
            avg_battery_voltage=(max_battery_voltage + min_battery_voltage) / 2,
            delta_battery_voltage=max_battery_voltage - min_battery_voltage,
            min_power_w=fake.pyfloat(right_digits=2, min_value=0, max_value=12.0),
            max_power_w=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            avg_power_w=fake.pyfloat(right_digits=2, min_value=10, max_value=25.0),
            min_windspeed_kmh=fake.pyfloat(right_digits=2, min_value=0, max_value=10.0),
            max_windspeed_kmh=fake.pyfloat(right_digits=2, min_value=10, max_value=25.0),
            avg_windspeed_kmh=fake.pyfloat(right_digits=2, min_value=12, max_value=20.0),
            max_battery_current_a=fake.pyfloat(right_digits=2, min_value=12, max_value=20.0),
            min_battery_current_a=fake.pyfloat(right_digits=2, min_value=2, max_value=12),
            avg_battery_current_a=fake.pyfloat(right_digits=2, min_value=5, max_value=15),
            energy_consumed_wh=fake.pyfloat(right_digits=2, min_value=10, max_value=100.0),
        )

    def flight_file(
        self,
        flight_id: int = 1,
        file_type: AllowedFiles = AllowedFiles.log,
        version: int = 1,
    ):
        filename = fake.file_name(extension=file_type)
        return BaseFlightFile(
            location=f"{flight_id}/{file_type}/{filename}",
            file_type=file_type,
            fk_flight=flight_id,
            version=version,
        )
