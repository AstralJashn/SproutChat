require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'CapacitorOfflineLlm'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target  = '13.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'

  s.vendored_libraries = 'ios/llama/lib/arm64/libllama.a'
  s.preserve_paths = 'ios/llama/**/*'
  s.xcconfig = {
    'HEADER_SEARCH_PATHS' => '"${PODS_ROOT}/CapacitorOfflineLlm/ios/llama/include"',
    'OTHER_LDFLAGS' => '-force_load ${PODS_ROOT}/CapacitorOfflineLlm/ios/llama/lib/arm64/libllama.a'
  }

  s.frameworks = 'Accelerate'
  s.weak_frameworks = 'Metal', 'MetalKit', 'MetalPerformanceShaders'
end
