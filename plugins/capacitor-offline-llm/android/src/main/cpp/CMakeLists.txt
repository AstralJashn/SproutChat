cmake_minimum_required(VERSION 3.22.1)

project("offlinellm")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(llama/include)

add_library(offlinellm-jni SHARED
    offlinellm-jni.cpp
)

add_library(llama SHARED IMPORTED)
set_target_properties(llama PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}/libllama.so
)

target_link_libraries(offlinellm-jni
    llama
    android
    log
)
