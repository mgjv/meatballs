TESTS = test/*.js
REPORTER = tap

test:
	mocha $(TESTS) --reporter $(REPORTER)

test-w:
	@NODE_ENV=test mocha \
    --growl \
    --watch \
    --reporter $(REPORTER)

test-cover:
	@istanbul cover _mocha test

.PHONY: test test-w test-cover
