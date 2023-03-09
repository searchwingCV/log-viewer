auto-model:
	python devdocs/model/autogenerate.py

install-back-deps:
	python -m pip install -r server/requirements.txt

install-back-test-deps:
	python -m pip install -r server/requirements-dev.txt

lint-server:
	python -m flake8 ./server
	python -m isort ./server --profile black --line-length 120 --filter-files

run-server:
	docker compose up server --build

test-server: test-unit-server test-integration-server

test-unit-server:
	python -m pytest server/tests/unit --cov ./server/src --cov-report=xml -vvvv --disable-warnings

test-integration-server:
	python -m pytest server/tests/integration --cov ./server/src --cov-append --disable-warnings --cov-report=xml -vvvv
run-migrations:
	docker compose up migrations
