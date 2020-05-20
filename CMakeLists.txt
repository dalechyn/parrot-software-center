cmake_minimum_required(VERSION 3.16)
project(parrot-software-center)

set(CMAKE_CXX_STANDARD 14)

find_package(PkgConfig REQUIRED)

# include webview
pkg_check_modules(WEBVIEW REQUIRED webkit2gtk-4.0)

include_directories(${WEBVIEW_INCLUDE_DIRS})
link_directories(${WEBVIEW_LIBRARY_DIRS})
add_definitions(${WEBVIEW_CFLAGS_OTHER})

#include gtk3
pkg_check_modules(GTK3 REQUIRED gtk+-3.0)

include_directories(${GTK3_INCLUDE_DIRS})
link_directories(${GTK3_LIBRARY_DIRS})
add_definitions(${GTK3_CFLAGS_OTHER})

add_executable(parrot-software-center main.cpp webview.h Injector.cpp Injector.h)
target_sources(parrot-software-center PUBLIC webview.h)
target_link_libraries(parrot-software-center ${WEBVIEW_LIBRARIES} ${GTK3_LIBRARIES})
