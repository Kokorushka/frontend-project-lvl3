install:
		npm install

publish:
		npm publish --dry-run

lint:
		npx eslint .

gendiff:
		node bin/gendiff.js

test:
		npm test --watchAll

test-coverage:
		npm test -- --coverage --coverageProvider=v8

develop:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack

test:
	npm test --watchAllma

lint:
	npx eslint .
