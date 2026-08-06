Pod::Spec.new do |s|
  s.name           = 'LiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'Prayer countdown Live Activity bridge.'
  s.description    = 'Starts, refreshes and ends the next-prayer ActivityKit Live Activity.'
  s.license        = 'MIT'
  s.author         = 'Grays Park Masjid'
  s.homepage       = 'https://graysparkmasjid.org.uk'

  # Deliberately left at the Expo SDK 54 baseline rather than 16.2. ActivityKit
  # was introduced in iOS 16.1, so keeping the pod's minimum below that makes
  # Xcode weak-link the framework automatically — every call site is guarded
  # with `if #available(iOS 16.2, *)`.
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
