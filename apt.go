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

	err = w.Bind("aptSearch", func (packageName string) (string, error) {
		if packageName == "" {
			return "", errors.New("aptShow: no packages passed")
		}

		args := []string{"show", "2>/dev/null", packageName}
		cmd := exec.Command("apt-cache", args...)
		res, err := cmd.CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("Can't find package %s", packageName)
		}

		return string(res), nil
	})

	err = w.Bind("dpkgQuery", func (packageName string) bool {
		args := []string{"-W", packageName}
		cmd := exec.Command("dpkg-query", args...)

		res, err := cmd.Output()
		if len(res) == 0|| err != nil {
			return false
		}
		return true
	})

	err = w.Bind("aptAutoComplete", func (prefix string) string {
		args := fmt.Sprintf("apt-cache pkgnames %s | sort -n | head -5", prefix)
		cmd := exec.Command("bash", "-c", args)

		res, _ := cmd.CombinedOutput()
		return string(res)
	})

	err = w.Bind("getUrl", func () string {
		return fmt.Sprintf("%s:%d/", backendUrl, backendPort)
	})

	return nil
}
