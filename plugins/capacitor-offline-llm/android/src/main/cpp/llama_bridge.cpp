#include "llama_bridge.h"
#include <android/log.h>
#include <mutex>

#define LOG_TAG "LlamaBridge"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static std::mutex bridgeMutex;

LlamaBridge& LlamaBridge::getInstance() {
    static LlamaBridge instance;
    return instance;
}

LlamaBridge::~LlamaBridge() {
    unloadModel();
}

bool LlamaBridge::loadModel(const std::string& path, int nCtx, int nThreads) {
    std::lock_guard<std::mutex> lock(bridgeMutex);

    if (model != nullptr) {
        LOGE("Model already loaded, unload first");
        return false;
    }

    LOGI("Loading model: %s, ctx=%d, threads=%d", path.c_str(), nCtx, nThreads);

    modelPath = path;
    contextSize = nCtx;
    numThreads = nThreads;

    LOGI("Model loaded successfully (stub implementation)");
    return true;
}

void LlamaBridge::unloadModel() {
    std::lock_guard<std::mutex> lock(bridgeMutex);

    if (model != nullptr) {
        LOGI("Unloading model");
        model = nullptr;
    }

    if (context != nullptr) {
        LOGI("Freeing context");
        context = nullptr;
    }

    modelPath.clear();
    contextSize = 0;
    numThreads = 0;
}

void LlamaBridge::clearContext() {
    std::lock_guard<std::mutex> lock(bridgeMutex);
    LOGI("Clearing context");
}

void LlamaBridge::generate(
    const std::string& prompt,
    int maxTokens,
    float temperature,
    float topP,
    int topK,
    float repeatPenalty,
    JNIEnv* env,
    jobject callback
) {
    shouldStop = false;

    LOGI("Generate: prompt='%s', maxTokens=%d, temp=%.2f",
         prompt.c_str(), maxTokens, temperature);

    jclass callbackClass = env->GetObjectClass(callback);
    jmethodID invokeMethod = env->GetMethodID(callbackClass, "invoke", "(Ljava/lang/Object;)Ljava/lang/Object;");

    for (int i = 0; i < maxTokens && !shouldStop; i++) {
        std::string token = "token_" + std::to_string(i) + " ";
        jstring jtoken = env->NewStringUTF(token.c_str());
        env->CallObjectMethod(callback, invokeMethod, jtoken);
        env->DeleteLocalRef(jtoken);

        if (env->ExceptionCheck()) {
            env->ExceptionDescribe();
            env->ExceptionClear();
            break;
        }
    }

    env->DeleteLocalRef(callbackClass);
}

void LlamaBridge::stopInference() {
    LOGI("Stopping inference");
    shouldStop = true;
}

extern "C" {

JNIEXPORT jstring JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeInit(JNIEnv* env, jobject) {
    LOGI("Native bridge initialized");
    return env->NewStringUTF("llama.cpp bridge ready");
}

JNIEXPORT jboolean JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeLoadModel(
    JNIEnv* env, jobject, jstring path, jint nCtx, jint nThreads
) {
    const char* pathStr = env->GetStringUTFChars(path, nullptr);
    bool result = LlamaBridge::getInstance().loadModel(pathStr, nCtx, nThreads);
    env->ReleaseStringUTFChars(path, pathStr);
    return result;
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeUnloadModel(JNIEnv*, jobject) {
    LlamaBridge::getInstance().unloadModel();
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeClearContext(JNIEnv*, jobject) {
    LlamaBridge::getInstance().clearContext();
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeGenerate(
    JNIEnv* env, jobject,
    jstring prompt, jint maxTokens, jfloat temperature,
    jfloat topP, jint topK, jfloat repeatPenalty, jobject callback
) {
    const char* promptStr = env->GetStringUTFChars(prompt, nullptr);
    LlamaBridge::getInstance().generate(
        promptStr, maxTokens, temperature, topP, topK, repeatPenalty, env, callback
    );
    env->ReleaseStringUTFChars(prompt, promptStr);
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeStopInference(JNIEnv*, jobject) {
    LlamaBridge::getInstance().stopInference();
}

JNIEXPORT jboolean JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeIsLoaded(JNIEnv*, jobject) {
    return LlamaBridge::getInstance().isLoaded();
}

JNIEXPORT jstring JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeGetModelPath(JNIEnv* env, jobject) {
    std::string path = LlamaBridge::getInstance().getModelPath();
    return path.empty() ? nullptr : env->NewStringUTF(path.c_str());
}

JNIEXPORT jint JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeGetContextSize(JNIEnv*, jobject) {
    return LlamaBridge::getInstance().getContextSize();
}

JNIEXPORT jint JNICALL
Java_com_sproutchat_offlinellm_LlamaBridge_nativeGetThreads(JNIEnv*, jobject) {
    return LlamaBridge::getInstance().getThreads();
}

}
