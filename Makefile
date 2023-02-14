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

back-unit-test:
	python -m pytest server/tests --cov ./server/app --cov-report=xml

run-migrations:
	docker compose up migrations
