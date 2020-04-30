package main

import (
	"errors"
	"fmt"
	"github.com/sirupsen/logrus"
	"github.com/zserge/webview"
	"os/exec"
	"strings"
)

func aptInject(w webview.WebView) error {
	var err error

	err = w.Bind("aptCheckForUpdates", func () (string, error) {
		logrus.Debug("aptCheckForUpdates called")
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
		logrus.Debugf("aptInstall called: %s", strings.Join(packageNames, ", "))
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

	err = w.Bind("aptSearch", func (packageNames []string) ([]string, error) {
		logrus.Debugf("aptSearch called: %s", strings.Join(packageNames, ", "))
		if len(packageNames) == 0 {
			return []string{}, errors.New("aptSearch: no packages passed")
		}

		args := []string{"show"}
		for _, name := range packageNames {
			if name != "" {
				args = append(args, name)
			}
		}

		cmd := exec.Command("apt-cache", args...)
		res, err := cmd.CombinedOutput()
		if err != nil {
			return []string{}, err
		}

		return strings.Split(string(res), "\n\n"), nil
	})

	err = w.Bind("dpkgQuery", func (packageName string) bool {
		logrus.Debugf("dpkgQuery called: %s", packageName)
		args := []string{"-W", packageName}
		cmd := exec.Command("dpkg-query", args...)

		res, err := cmd.Output()
		if len(res) == 0|| err != nil {
			return false
		}
		return true
	})

	err = w.Bind("aptSearchPackageNames", func (prefix string) ([]string, error) {
		logrus.Debugf("aptSearchPackageNames called: %s", prefix)
		args := fmt.Sprintf("apt-cache search %s --names-only | egrep -o '^([a-z0-9.-]*)'", prefix)
		cmd := exec.Command("bash", "-c", args)

		res, _ := cmd.CombinedOutput()
		if len(res) == 0 {
			return []string{}, fmt.Errorf("aptSearchPackageNames: Package %s not found", prefix)
		}
		splitted := strings.Split(string(res), "\n")
		return splitted[:len(splitted) - 1], nil
	})

	err = w.Bind("getUrl", func () string {
		return API
	})

	return nil
}
