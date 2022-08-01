.ONESHELL:


auto-model:
	python devdocs/model/autogenerate.py

install-back-deps:
	python -m pip install -r server/requirements.txt

install-back-test-deps:
	python -m pip install -r server/requirements-dev.txt

run-server:
	docker compose up server --build

back-unit-test:
	python -m pytest server/tests
