#ifndef LLAMA_H
#define LLAMA_H

#ifdef __cplusplus
extern "C" {
#endif

struct llama_model;
struct llama_context;

struct llama_model_params {
    int n_gpu_layers;
    int use_mmap;
    int use_mlock;
};

struct llama_context_params {
    int n_ctx;
    int n_threads;
    float rope_freq_base;
    float rope_freq_scale;
};

struct llama_model* llama_load_model_from_file(
    const char* path_model,
    struct llama_model_params params);

struct llama_context* llama_new_context_with_model(
    struct llama_model* model,
    struct llama_context_params params);

void llama_free(struct llama_context* ctx);
void llama_free_model(struct llama_model* model);

int llama_eval(
    struct llama_context* ctx,
    const int* tokens,
    int n_tokens,
    int n_past);

int llama_sample_token(
    struct llama_context* ctx,
    const float* logits);

const char* llama_token_to_str(
    struct llama_context* ctx,
    int token);

#ifdef __cplusplus
}
#endif

#endif
