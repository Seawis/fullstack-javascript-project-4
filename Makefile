prettier:
	npx prettier --write .

lint:
	npx eslint --fix .

install:
	npm ci

test:
	npx jest

test-watch:
	npx jest --watch

test-coverage:
	npm test -- --coverage

run:
	npx page-loader 'filepath'

help:
	node bin/page-loader.js -h