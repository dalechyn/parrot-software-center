build:
	npm run --prefix frontend build
	serve -l 5245 -s frontend/build
	go build
	strip parrot-software-center

run:
	./parrot-software-center

clean:
	rm parrot-software-center
