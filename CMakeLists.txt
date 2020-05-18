cmake_minimum_required(VERSION 3.16)
project(parrot-software-center)

find_package(PkgConfig REQUIRED)

# include webview
pkg_check_modules(WEBVIEW REQUIRED webkit2gtk-4.0)

INCLUDE_DIRECTORIES(${WEBVIEW_INCLUDE_DIRS})
LINK_DIRECTORIES(${WEBVIEW_LIBRARY_DIRS})
ADD_DEFINITIONS(${WEBVIEW_CFLAGS_OTHER})

#include gtk3
pkg_check_modules(GTK3 REQUIRED gtk+-3.0)

INCLUDE_DIRECTORIES(${GTK3_INCLUDE_DIRS})
LINK_DIRECTORIES(${GTK3_LIBRARY_DIRS})
ADD_DEFINITIONS(${GTK3_CFLAGS_OTHER})

set(CMAKE_CXX_STANDARD 14)

add_executable(parrot-software-center main.cpp webview.h)
target_link_libraries(parrot-software-center ${GTK3_LIBRARIES} ${WEBVIEW_LIBRARIES})