#!/bin/bash

# JSON file paths
json_file="app.json"
package_file="package.json"

# Get the update type argument (major, minor, patch, or build)
update_type="$1"

# Validate the update type argument
if [ -z "$update_type" ] || ! [[ "$update_type" =~ ^(major|minor|patch|build)$ ]]; then
  echo "Error: Use one of these for the update: <major|minor|patch|build>"
  exit 1
fi

# Check if the JSON files exist
if [ ! -f "$json_file" ]; then
  echo "Error: JSON file not found at path: $json_file"
  exit 1
fi

if [ ! -f "$package_file" ]; then
  echo "Error: Package file not found at path: $package_file"
  exit 1
fi

# Display a starting message
echo "Bumping $update_type version"

# Extract the current version, buildNumber, and versionCode from the JSON file
current_version=$(jq -r '.expo.version' "$json_file")
current_build_number=$(jq -r '.expo.ios.buildNumber' "$json_file")
current_version_code=$(jq -r '.expo.android.versionCode' "$json_file")

# Split the version into major, minor, and patch components
IFS='.' read -r -a version_parts <<< "$current_version"

if [ "${#version_parts[@]}" -lt 4 ]; then
    version_parts[3]=0
fi

# Update the appropriate version component
case "$update_type" in
  "major")
    ((version_parts[0]++))
     version_parts[1]=0
     version_parts[2]=0
     version_parts[3]=0
    ;;
  "minor")
    ((version_parts[1]++))
     version_parts[2]=0
     version_parts[3]=0
    ;;
  "patch")
    ((version_parts[2]++))
    version_parts[3]=0
    ;;
  "build")
    ((version_parts[3]++))
    ;;
esac

# Ensure that the new version components are within the range 0-99
for i in "${!version_parts[@]}"; do
  if ((version_parts[i] < 0)); then
    version_parts[i]=0
  elif ((version_parts[i] > 99)); then
    version_parts[i]=99
  fi
done

# Create the new version string
new_version="${version_parts[0]}.${version_parts[1]}.${version_parts[2]}.${version_parts[3]}"

# Calculate the new versionCode simply by incrementing the existing one by 1
new_version_code=$((current_version_code + 1))

# Handle iOS buildNumber: Reset to 0 on version bump, Increment on build bump
if [ "$update_type" == "build" ]; then
  new_build_number=$((current_build_number + 1))
else
  new_build_number=0
fi

# Update the version, buildNumber, and versionCode fields in the JSON file
jq --arg new_version "$new_version" \
   --arg new_version_code "$new_version_code" \
   --arg new_build_number "$new_build_number" \
   '.expo.version = $new_version | .expo.ios.buildNumber = $new_build_number | .expo.android.versionCode = ($new_version_code | tonumber)' \
   "$json_file" > tmp.json && mv tmp.json "$json_file"

# Update the version field in package.json
jq --arg new_version "$new_version" '.version = $new_version' "$package_file" > tmp_package.json && mv tmp_package.json "$package_file"

# Display a success message
echo "Bumped version from $current_version to $new_version"
echo "app.json version: $new_version"
echo "package.json version: $new_version"
echo "buildNumber (iOS): $new_build_number"
echo "versionCode (Android): $new_version_code"
