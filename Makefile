##
## Js makefile
##
## @author BrendonCrawford
##

all: clean lint compress
	@echo "Done."

lint:
	@echo "Running lint tests..."
	@js ./util/jslint-check.js nomouse.user-full.js

compress:
	@echo "Compressing js files..."
	@./builders/compress.bash ./build/tmp.js ./build/compressed.js

clean:
	@echo "Cleaning..."
	@rm -fr ./nomouse.user.js

