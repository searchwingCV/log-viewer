import json
from unittest.mock import Mock

import pytest
from application.services import DroneService
from domain.drone.entities import Drone
from presentation.rest.dependencies import get_drone_service


@pytest.fixture
def mock_drone_service():
    mock_drone_service = Mock(spec=DroneService)
    mock_drone_service._entity_type = "Drone"
    return mock_drone_service


def test_patch_drones_batch_no_error(test_client, mock_drone_service):
    mock_drone_service.update.return_value = Drone(
        **{
            "id": 1,
            "created_at": "2023-03-28T13:46:39.995894",
            "updated_at": "2023-04-03T09:22:57.805712",
            "name": "Pepe",
            "model": "Mini Talon",
            "description": "Best drone ever",
            "status": "Ready for flight",
            "sys_thismav": 11,
        }
    )
    test_client.app.dependency_overrides[get_drone_service] = lambda: mock_drone_service
    expected = """
    {
        "success": true,
        "items":[
            {
                "id": 1,
                "createdAt": "2023-03-28T13:46:39.995894",
                "updatedAt": "2023-04-03T09:22:57.805712",
                "name": "Pepe",
                "model": "Mini Talon",
                "description": "Best drone ever",
                "status": "Ready for flight",
                "sysThismav": 11
            }
        ],
        "errors": []
    }
    """
    body = """
    {
        "items": [
            {
                "id": 1,
                "name": "Pepe",
                "sysThismav": 11
            }
        ]
    }
    """
    response = test_client.patch("/drone", data=body)

    assert response.status_code == 200
    assert response.json() == json.loads(expected)

    test_client.app.dependency_overrides.clear()


def test_patch_drone_batch_error(test_client, mock_drone_service):
    mock_drone_service.update.side_effect = [
        Drone(
            **{
                "id": 1,
                "created_at": "2023-03-28T13:46:39.995894",
                "updated_at": "2023-04-03T09:22:57.805712",
                "name": "Pepe",
                "model": "Mini Talon",
                "description": "Best drone ever",
                "status": "Ready for flight",
                "sys_thismav": 11,
            }
        ),
        Drone(
            **{
                "id": 2,
                "created_at": "2023-03-28T13:46:39.995894",
                "updated_at": "2023-04-03T09:22:57.805712",
                "name": "Pepe 2",
                "model": "Mini Talon",
                "description": "Best 2 drone ever",
                "status": "Ready for flight",
                "sys_thismav": 22,
            }
        ),
        None,
    ]
    test_client.app.dependency_overrides[get_drone_service] = lambda: mock_drone_service
    expected = """
    {
        "success": false,
        "items":[
            {
                "id": 1,
                "createdAt": "2023-03-28T13:46:39.995894",
                "updatedAt": "2023-04-03T09:22:57.805712",
                "name": "Pepe",
                "model": "Mini Talon",
                "description": "Best drone ever",
                "status": "Ready for flight",
                "sysThismav": 11
            },
            {
                "id": 2,
                "createdAt": "2023-03-28T13:46:39.995894",
                "updatedAt": "2023-04-03T09:22:57.805712",
                "name": "Pepe 2",
                "model": "Mini Talon",
                "description": "Best 2 drone ever",
                "status": "Ready for flight",
                "sysThismav": 22
            }
        ],
        "errors": [
            {
                "id": 4,
                "title": "Resource not found",
                "code": "not-found",
                "detail": "Drone not found"
            }
        ]
    }
    """
    body = """
    {
        "items": [
            {
                "id": 1,
                "name": "Pepe",
                "sysThismav": 11
            },
            {
                "id": 2,
                "name": "Pepe 2",
                "sysThismav": 22
            },
            {
                "id": 4,
                "name": "Pepe 4",
                "sysThismav": 44
            }
        ]
    }
    """
    response = test_client.patch("/drone", data=body)

    assert response.status_code == 200
    print(response.json())
    assert response.json() == json.loads(expected)

    test_client.app.dependency_overrides.clear()


def test_patch_drones_batch_validation_error(test_client):
    body = b"{}"
    response = test_client.patch("/drone", data=body)

    assert response.status_code == 422

    test_client.app.dependency_overrides.clear()
