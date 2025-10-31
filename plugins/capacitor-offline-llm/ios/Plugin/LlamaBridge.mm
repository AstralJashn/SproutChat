#import "LlamaBridge.h"
#include <string>
#include <atomic>

@implementation ModelInfo
@end

struct LlamaContext {
    void* model = nullptr;
    void* context = nullptr;
    std::string modelPath;
    int contextSize = 0;
    int numThreads = 0;
    std::atomic<bool> shouldStop{false};
};

@interface LlamaBridge() {
    LlamaContext *_ctx;
    dispatch_queue_t _workQueue;
}
@end

@implementation LlamaBridge

+ (instancetype)sharedInstance {
    static LlamaBridge *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _ctx = new LlamaContext();
        _workQueue = dispatch_queue_create("com.sproutchat.llama", DISPATCH_QUEUE_SERIAL);
        NSLog(@"[LlamaBridge] Initialized");
    }
    return self;
}

- (void)dealloc {
    [self unloadModel];
    delete _ctx;
}

- (BOOL)loadModelWithPath:(NSString *)path
                     nCtx:(NSInteger)nCtx
                 nThreads:(NSInteger)nThreads
                 useMetal:(BOOL)useMetal {
    if (_ctx->model != nullptr) {
        NSLog(@"[LlamaBridge] Model already loaded, unload first");
        return NO;
    }

    NSLog(@"[LlamaBridge] Loading model: %@, ctx=%ld, threads=%ld, metal=%d",
          path, (long)nCtx, (long)nThreads, useMetal);

    _ctx->modelPath = [path UTF8String];
    _ctx->contextSize = (int)nCtx;
    _ctx->numThreads = (int)nThreads;

    NSLog(@"[LlamaBridge] Model loaded successfully (stub implementation)");
    return YES;
}

- (void)unloadModel {
    if (_ctx->model != nullptr) {
        NSLog(@"[LlamaBridge] Unloading model");
        _ctx->model = nullptr;
    }

    if (_ctx->context != nullptr) {
        NSLog(@"[LlamaBridge] Freeing context");
        _ctx->context = nullptr;
    }

    _ctx->modelPath.clear();
    _ctx->contextSize = 0;
    _ctx->numThreads = 0;
}

- (void)clearContext {
    NSLog(@"[LlamaBridge] Clearing context");
}

- (void)generateWithPrompt:(NSString *)prompt
                 maxTokens:(NSInteger)maxTokens
               temperature:(float)temperature
                      topP:(float)topP
                      topK:(NSInteger)topK
             repeatPenalty:(float)repeatPenalty
                   onToken:(void (^)(NSString *))onToken {
    _ctx->shouldStop = false;

    NSLog(@"[LlamaBridge] Generate: prompt='%@', maxTokens=%ld, temp=%.2f",
          prompt, (long)maxTokens, temperature);

    dispatch_async(_workQueue, ^{
        for (int i = 0; i < maxTokens && !self->_ctx->shouldStop; i++) {
            @autoreleasepool {
                NSString *token = [NSString stringWithFormat:@"token_%d ", i];
                dispatch_async(dispatch_get_main_queue(), ^{
                    onToken(token);
                });

                [NSThread sleepForTimeInterval:0.01];
            }
        }
    });
}

- (void)stopInference {
    NSLog(@"[LlamaBridge] Stopping inference");
    _ctx->shouldStop = true;
}

- (ModelInfo *)getModelInfo {
    ModelInfo *info = [[ModelInfo alloc] init];
    info.loaded = (_ctx->model != nullptr);
    info.modelPath = _ctx->modelPath.empty() ? nil : [NSString stringWithUTF8String:_ctx->modelPath.c_str()];
    info.nCtx = _ctx->contextSize;
    info.nThreads = _ctx->numThreads;
    return info;
}

@end
