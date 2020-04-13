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

	err = w.Bind("aptInstall", func(packageNames []string) error {
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

	err = w.Bind("aptShow", func(packageNames []string) (string, error) {
		if len(packageNames) == 0 {
			return "", errors.New("aptShow: no packages passed")
		}

		args := []string{"show"}
		for _, pkg := range packageNames {
			if pkg == "" {
				return "", fmt.Errorf("aptShow: invalid package with empty name")
			}
			args = append(args, pkg)
		}

		cmd := exec.Command("apt-get", args...)
		res, err := cmd.CombinedOutput()
		if err != nil {
			return "", err
		}

		return string(res), nil
	})

	return nil
}
