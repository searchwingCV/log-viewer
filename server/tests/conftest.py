import datetime
import random

import pytest
from domain.drone.entities import BaseDrone
from domain.flight.entities import BaseFlight
from domain.flight.value_objects import FlightPurpose, FlightRating, WindIntensity
from domain.flight_file.entities import BaseFlightFile
from domain.flight_file.value_objects import AllowedFiles
from domain.mission.entities import BaseMission
from faker import Faker

fake = Faker()


@pytest.fixture
def get_sample_drone():
    def _get_sample_drone():
        return BaseDrone(
            name=fake.first_name() + fake.last_name(),
            model=fake.domain_word(),
            sys_thismav=fake.pyint(min_value=1, max_value=3),
            description=fake.paragraph(nb_sentences=1),
        )

    return _get_sample_drone


@pytest.fixture
def get_sample_mission():
    def _get_sample_mission():
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

    return _get_sample_mission


@pytest.fixture
def get_sample_flight():
    def _get_sample_flight(drone_id=1, mission_id=None):
        log_start_time = fake.date_time_between(start_date=datetime.datetime(2020, 1, 1))
        log_end_time = fake.date_time_between(start_date=log_start_time)
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
            max_groundspeed=fake.pyfloat(right_digits=2, min_value=25.0, max_value=50.0),
            min_groundspeed=fake.pyfloat(right_digits=2, min_value=0, max_value=25.0),
            avg_groundspeed=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            max_vertical_speed_up=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            max_vertical_speed_down=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            max_telemetry_distance_km=fake.pyfloat(right_digits=2, min_value=10.0, max_value=20.0),
            max_battery_voltage=max_battery_voltage,
            min_battery_voltage=min_battery_voltage,
            delta_battery_voltage=max_battery_voltage - min_battery_voltage,
            min_power_w=fake.pyfloat(right_digits=2, min_value=0, max_value=12.0),
            max_power_w=fake.pyfloat(right_digits=2, min_value=12, max_value=30.0),
            avg_power_w=fake.pyfloat(right_digits=2, min_value=10, max_value=25.0),
            min_windspeed_kmh=fake.pyfloat(right_digits=2, min_value=0, max_value=10.0),
            max_windspeed_kmh=fake.pyfloat(right_digits=2, min_value=10, max_value=25.0),
            avg_windspeed_kmh=fake.pyfloat(right_digits=2, min_value=12, max_value=20.0),
            energy_consumed_wh=fake.pyfloat(right_digits=2, min_value=10, max_value=100.0),
        )

    return _get_sample_flight


@pytest.fixture
def get_sample_flight_file():
    def _get_sample_flight_file(flight_id=1, file_type=AllowedFiles.log, version=random.randint(1, 10)):
        filename = fake.file_name(extension=file_type)
        return BaseFlightFile(
            location=f"{flight_id}/{file_type}/{filename}", file_type=file_type, fk_flight=flight_id, version=version
        )

    return _get_sample_flight_file
