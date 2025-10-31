cmake_minimum_required(VERSION 3.22.1)

project("llama_bridge")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(llama/include)

add_library(llama_bridge SHARED
    llama_bridge.cpp
    llama_bridge.h
)

add_library(llama SHARED IMPORTED)
set_target_properties(llama PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}/libllama.so
)

target_link_libraries(llama_bridge
    llama
    android
    log
)
