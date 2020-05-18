/*
 * Copyright 2020 Vladyslav "h0tw4t3r" Dalechyn <h0tw4t3r@parrotsec.org>
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

const int width = 920;
const int height = 600;

#include "webview.h"

int main() {
	webview::webview w(true, nullptr);
	w.set_title("Minimal example");
	w.set_size(width, height, WEBVIEW_HINT_MIN);
	w.navigate("https://en.m.wikipedia.org/wiki/Main_Page");
	w.run();
	return 0;
}
