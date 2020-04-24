package main

import (
	"errors"
	"fmt"
	"github.com/zserge/webview"
	"os/exec"
)

func aptInject(w webview.WebView) error {
	var err error

	err = w.Bind("aptCheckForUpdates", func () (string, error) {
		cmd := exec.Command("apt-get", "update", "-q")
		res, err := cmd.CombinedOutput()
		if err != nil {
			return "", err
		}
		return string(res), nil
	})
	if err != nil {
		return err
	}

	err = w.Bind("aptInstall", func (packageNames []string) error {
		if len(packageNames) == 0 {
			return errors.New("aptInstall: no packages passed")
		}

		args := []string{"install", "-y"}
		for _, pkg := range packageNames {
			if pkg == "" {
				return fmt.Errorf("aptInstall: invalid package with empty Nnme")
			}
			args = append(args, pkg)
		}

		cmd := exec.Command("apt-get", args...)
		_, err := cmd.CombinedOutput()
		if err != nil {
			return err
		}

		return nil
	})

	err = w.Bind("aptShow", func (packageNames []string) (string, error) {
		/*if len(packageNames) == 0 {
			return "", errors.New("aptShow: no packages passed")
		}

		args := []string{"show", "2>/dev/null"}
		for _, pkg := range packageNames {
			if pkg == "" {
				return "", fmt.Errorf("aptShow: invalid package with empty name")
			}
			args = append(args, pkg)
		}

		cmd := exec.Command("apt-get", args...)
		res, err := cmd.CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("Can't find package %s",
				strings.Join(packageNames[:], " "))
		}
*/
		const str = `WARNING: apt does not have a stable CLI interface. Use with caution in scripts.

Package: nodejs
Version: 10.19.0~dfsg-3
Priority: optional
Section: web
Maintainer: Debian Javascript Maintainers <pkg-javascript-devel@lists.alioth.debian.org>
Installed-Size: 161 kB
Depends: libc6 (>= 2.4), libnode64 (= 10.19.0~dfsg-3)
Recommends: ca-certificates, nodejs-doc
Suggests: npm
Conflicts: nodejs-legacy
Replaces: nodejs-legacy
Homepage: http://nodejs.org/
Tag: devel::interpreter, devel::lang:ecmascript, devel::runtime, devel::web,
 implemented-in::c++, implemented-in::ecmascript,
 interface::commandline, interface::shell, protocol::dns,
 protocol::http, protocol::tcp, role::program, scope::application,
 works-with-format::json
Download-Size: 88.1 kB
APT-Manual-Installed: yes
APT-Sources: https://mirrors.up.pt/parrot rolling/main amd64 Packages
Description: evented I/O for V8 javascript - runtime executable
 Node.js is a platform built on Chrome's JavaScript runtime for easily
 building fast, scalable network applications. Node.js uses an
 event-driven, non-blocking I/O model that makes it lightweight and
 efficient, perfect for data-intensive real-time applications that run
 across distributed devices.
 .
 Node.js is bundled with several useful libraries to handle server
 tasks:
 .
 System, Events, Standard I/O, Modules, Timers, Child Processes, POSIX,
 HTTP, Multipart Parsing, TCP, DNS, Assert, Path, URL, Query Strings.

Package: python
Version: 2.7.17-2
Priority: standard
Section: python
Source: python-defaults
Maintainer: Matthias Klose <doko@debian.org>
Installed-Size: 69.6 kB
Provides: python-ctypes, python-email, python-importlib, python-profiler, python-wsgiref
Pre-Depends: python-minimal (= 2.7.17-2)
Depends: python2.7 (>= 2.7.17~rc1-1~), libpython-stdlib (= 2.7.17-2), python2 (= 2.7.17-2)
Suggests: python-doc (= 2.7.17-2), python-tk (>= 2.7.17~rc1-1~)
Conflicts: python-central (<< 0.5.5)
Breaks: update-manager-core (<< 0.200.5-2)
Replaces: python-dev (<< 2.6.5-2)
Homepage: https://www.python.org/
Tag: devel::interpreter, devel::lang:python, implemented-in::c,
 implemented-in::python, interface::commandline, role::metapackage,
 role::program, scope::utility
Cnf-Extra-Commands: python
Cnf-Priority-Bonus: 3
Download-Size: 22.9 kB
APT-Manual-Installed: yes
APT-Sources: https://mirrors.up.pt/parrot rolling/main amd64 Packages
Description: interactive high-level object-oriented language (Python2 version)
 Python2, the high-level, interactive object oriented language,
 includes an extensive class library with lots of goodies for
 network programming, system administration, sounds and graphics.
 .
 This package is a dependency package, which depends on Debian's Python2
 version (currently v2.7).`
		return str, nil
	})

	err = w.Bind("getUrl", func () string {
		return fmt.Sprintf("%s:%d/", backendUrl, backendPort)
	})

	return nil
}
