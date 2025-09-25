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

test-path:
	npx jest -- -t 'loadPaths'

test-loader:
	npx jest -- -t 'loader'

test-error:
	npx jest -- -t 'handling'