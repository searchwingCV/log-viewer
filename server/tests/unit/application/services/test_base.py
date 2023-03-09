from unittest.mock import Mock

from src.application.services.base import BaseCRUDService
from src.infrastructure.repositories.base import BaseRepository


def test_get_by_id(mock_session_factory):
    mock_repository = Mock(spec=BaseRepository)
    service = BaseCRUDService(mock_repository, mock_session_factory)

    service.get_by_id(1)

    mock_repository.get_by_id.assert_called_once()


def test_delete_by_id(mock_session_factory):
    mock_repository = Mock(spec=BaseRepository)
    service = BaseCRUDService(mock_repository, mock_session_factory)

    service.delete_by_id(1)

    mock_repository.delete_by_id.assert_called_once()


def test_upsert(mock_session_factory):
    mock_repository = Mock(spec=BaseRepository)
    service = BaseCRUDService(mock_repository, mock_session_factory)

    service.upsert(1)

    mock_repository.upsert.assert_called_once()


def test_get_all_pagination(mock_session_factory):
    mock_repository = Mock(spec=BaseRepository)
    service = BaseCRUDService(mock_repository, mock_session_factory)

    service.get_all_with_pagination(1, 1)

    mock_repository.get_with_pagination.assert_called_once()
