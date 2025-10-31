#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ModelInfo : NSObject
@property (nonatomic, assign) BOOL loaded;
@property (nonatomic, strong, nullable) NSString *modelPath;
@property (nonatomic, assign) NSInteger nCtx;
@property (nonatomic, assign) NSInteger nThreads;
@end

@interface LlamaBridge : NSObject

+ (instancetype)sharedInstance;

- (BOOL)loadModelWithPath:(NSString *)path nCtx:(NSInteger)nCtx nThreads:(NSInteger)nThreads useMetal:(BOOL)useMetal;
- (void)unloadModel;
- (void)clearContext;
- (void)generateWithPrompt:(NSString *)prompt
                 maxTokens:(NSInteger)maxTokens
               temperature:(float)temperature
                      topP:(float)topP
                      topK:(NSInteger)topK
             repeatPenalty:(float)repeatPenalty
                   onToken:(void (^)(NSString *))onToken;
- (void)stopInference;
- (ModelInfo *)getModelInfo;

@end

NS_ASSUME_NONNULL_END
