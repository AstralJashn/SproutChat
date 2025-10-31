#include <jni.h>
#include <string>
#include <android/log.h>

#define LOG_TAG "OfflineLLM"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

extern "C" {

JNIEXPORT jstring JNICALL
Java_com_sproutchat_offlinellm_OfflineLLMRuntimePlugin_nativeInit(
    JNIEnv* env,
    jobject /* this */) {
    LOGI("Native llama.cpp runtime initialized");
    return env->NewStringUTF("llama.cpp ready");
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_OfflineLLMRuntimePlugin_nativeLoadModel(
    JNIEnv* env,
    jobject /* this */,
    jstring path,
    jint nCtx,
    jint nThreads,
    jboolean useMetal) {
    const char* modelPath = env->GetStringUTFChars(path, nullptr);
    LOGI("Loading model: %s, ctx=%d, threads=%d", modelPath, nCtx, nThreads);
    env->ReleaseStringUTFChars(path, modelPath);
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_OfflineLLMRuntimePlugin_nativeGenerate(
    JNIEnv* env,
    jobject /* this */,
    jstring prompt,
    jint maxTokens,
    jfloat temperature,
    jfloat topP,
    jint topK,
    jfloat repeatPenalty) {
    const char* promptStr = env->GetStringUTFChars(prompt, nullptr);
    LOGI("Generate: %s, maxTokens=%d, temp=%.2f", promptStr, maxTokens, temperature);
    env->ReleaseStringUTFChars(prompt, promptStr);
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_OfflineLLMRuntimePlugin_nativeStop(
    JNIEnv* env,
    jobject /* this */) {
    LOGI("Stop generation");
}

JNIEXPORT void JNICALL
Java_com_sproutchat_offlinellm_OfflineLLMRuntimePlugin_nativeUnload(
    JNIEnv* env,
    jobject /* this */) {
    LOGI("Unload model");
}

}
