"""
Script that fills up the database with mock data
"""

import random
from argparse import ArgumentParser

from common.logging import get_logger
from domain.flight_file.value_objects import AllowedFiles
from faker import Faker
from infrastructure.db.orm import Drone, Flight, FlightFile, Mission
from infrastructure.db.session import SessionContextManager
from sqlalchemy.orm import Session
from tests.mock_providers import FlightLogProvider

fake = Faker()
fake.add_provider(FlightLogProvider)
logger = get_logger("db-faker")
db = SessionContextManager()


def insert_drones(nb_drones: int, session: Session):
    for _ in range(nb_drones):
        drone = Drone(**fake.drone().dict())
        session.add(drone)
        session.commit()
        session.refresh(drone)


def insert_missions(nb_missions: int, session: Session):
    for _ in range(nb_missions):
        mission = Mission(**fake.mission().dict())
        session.add(mission)
        session.commit()
        session.refresh(mission)


def insert_flights(nb_drones: int, nb_flights: int, nb_missions: int, session: Session):
    for _ in range(nb_flights):
        flight = Flight(
            **fake.flight(
                drone_id=random.randint(1, nb_drones),
                mission_id=random.choice([None, random.randint(1, nb_missions)]),
            ).dict()
        )
        session.add(flight)
        session.commit()
        session.refresh(flight)


def insert_flight_files(nb_flights: int, chances_missing_file: float, session: Session):
    allowed_files = [
        AllowedFiles.log,
        AllowedFiles.apm,
        AllowedFiles.tlog,
        AllowedFiles.rosbag,
    ]
    for flight_id in range(1, nb_flights + 1):
        for file_type in allowed_files:
            # simulate that some flights do not contain one or more files
            if random.random() < chances_missing_file:
                continue
            flight_file = FlightFile(**fake.flight_file(flight_id, file_type).dict())
            session.add(flight_file)
            session.commit()
            session.refresh(flight_file)


def get_args():
    parser = ArgumentParser()
    parser.add_argument(
        "--flights",
        "-f",
        help="Number of flights to add, default is 40",
        type=int,
        default=40,
    )
    parser.add_argument(
        "--missions",
        "-m",
        help="Number of missions to add, default is 10",
        type=int,
        default=10,
    )
    parser.add_argument(
        "--drones",
        "-d",
        help="Number of drones to add, default is 10",
        type=int,
        default=10,
    )
    parser.add_argument(
        "--missing-file",
        "-mf",
        help="The probability with which a file (one of log, apm..) is missing, default is 0.1",
        type=float,
        default=0.10,
    )
    return parser.parse_args()


def check_db_has_data(session: Session):
    drone_has_data = bool(session.query(Drone).all())
    mission_has_data = bool(session.query(Mission).all())
    flight_has_data = bool(session.query(Flight).all())
    flight_file_has_data = bool(session.query(FlightFile).all())

    if any([drone_has_data, mission_has_data, flight_has_data, flight_file_has_data]):
        return True


if __name__ == "__main__":

    args = get_args()

    with db as session:
        if check_db_has_data(session):
            logger.warning("The db already contains data, aborting")
            exit(0)
        logger.info(f"Adding drones to db, number of rows: {args.drones}")
        insert_drones(args.drones, session)
        logger.info(f"Adding missions to db, number of rows: {args.missions}")
        insert_missions(args.missions, session)
        logger.info(f"Adding flights to db, number of rows: {args.flights}")
        insert_flights(args.drones, args.flights, args.missions, session)
        logger.info(f"Adding flight files to db, missing probability: {args.missing_file}")
        insert_flight_files(args.flights, args.missing_file, session)
