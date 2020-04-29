/*
 * Copyright 2019 Lorenzo "Palinuro" Faletra <palinuro@parrotsec.org>,
 * Vladyslav "h0tw4t3r" Dalechyn <h0tw4t3r@parrotsec.org>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 */

package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"
	"github.com/zserge/webview"
)

const (
	windowWidth  = 920
	windowHeight = 600
)

var (
	API string
	reactServePort int
)

func init() {
	debug := flag.BoolP("debug", "v", false, "debug")

	flag.StringVar(&API, "api", "http://127.0.0.1:8000/", "api endpoint")
	flag.IntVar(&reactServePort, "reactPort", 3000, "react serve port")

	flag.Parse()

	if *debug {
		logrus.SetLevel(logrus.DebugLevel)
	}

	if _, err := os.Stat("frontend/build/index.html"); os.IsNotExist(err) {
		logrus.Fatal(`Nothing to serve! Probably you didn't build react frontend.
cd frontend &&
npm i &&
npm run build

Then try again`)
	}

	// Serving React build
	//http.Handle("/", http.FileServer(http.Dir("frontend/build")))
	logrus.Debug("Starting server on ", reactServePort)

	go func() {
		//log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", reactServePort), nil))
	}()
}

func main() {
	w := webview.New(true)
	defer w.Destroy()

	w.SetTitle("Parrot Software Center")
	w.Navigate(fmt.Sprintf("http://localhost:%d", reactServePort))
	w.SetSize(windowWidth, windowHeight, webview.HintMin)
	if err := aptInject(w); err != nil {
		logrus.Fatal(err)
	}

	signalChannel := make(chan os.Signal, 2)
	signal.Notify(signalChannel, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-signalChannel
		logrus.Fatal("Exit by signal: %s", sig)
	}()

	w.Run()
}
