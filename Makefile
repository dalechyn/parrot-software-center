build:
	go build
	strip keyboard-selector

run:
	./keyboard-selector

clean:
	rm keyboard-selector
