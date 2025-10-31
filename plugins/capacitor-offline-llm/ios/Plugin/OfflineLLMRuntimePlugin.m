#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(OfflineLLMRuntimePlugin, "OfflineLLMRuntime",
    CAP_PLUGIN_METHOD(ensureModel, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(loadModel, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(generate, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(unload, CAPPluginReturnPromise);
)
