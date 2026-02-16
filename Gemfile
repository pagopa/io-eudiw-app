source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 3.3.6"

#Fastlane 
gem "fastlane", "~> 2.223.1"

#CocoaPods
gem 'cocoapods', '>= 1.13', '!= 1.15.1', '!= 1.15.0'

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
