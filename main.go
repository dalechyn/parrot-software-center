/*
 * Copyright 2019 Lorenzo "Palinuro" Faletra <palinuro@parrotsec.org>
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
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/sirupsen/logrus"
	"github.com/zserge/webview"
)

const (
	windowWidth  = 920
	windowHeight = 600

	reactServePort = 5452
)

func init() {
	if _, err := os.Stat("frontend/build/index.html"); os.IsNotExist(err) {
		logrus.Fatal(`Nothing to serve! Probably you didn't build react frontend.
cd frontend &&
npm i &&
npm run build

Then try again`)
	}

	// Serving React build
	http.Handle("/", http.FileServer(http.Dir("frontend/build")))
	logrus.Debug("Starting server on ", reactServePort)
	go func() {
		if err := http.ListenAndServe(fmt.Sprintf(":%d", reactServePort), nil); err != nil {
			logrus.Fatal(err)
		}
	}()
}

func main() {
	w := webview.New(true)
	defer w.Destroy()

	w.SetTitle("Parrot Software Center")
	w.Navigate(fmt.Sprintf("http://localhost:%d", reactServePort))
	w.SetSize(windowWidth, windowHeight, webview.HintMin)

	signalChannel := make(chan os.Signal, 2)
	signal.Notify(signalChannel, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-signalChannel
		log.Printf("Exit by signal: %s", sig)
		os.Exit(1)
	}()

	w.Run()
}
