build:
	npm i --prefix frontend
	npm run --prefix frontend build
	go build
	strip parrot-software-center

run:
	./parrot-software-center

clean:
	rm parrot-software-center
	rm -r frontend/build
