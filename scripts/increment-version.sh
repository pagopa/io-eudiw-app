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

# Ensure version_parts has at least 3 components
for i in {0..2}; do
  if [ -z "${version_parts[$i]}" ]; then
    version_parts[$i]=0
  fi
done

# Initialize or get the 4th number (build) for package.json
# We use the current ios buildNumber as the reference for the 4th digit
current_pkg_build=$current_build_number

# Update the appropriate version component
case "$update_type" in
  "major")
    ((version_parts[0]++))
     version_parts[1]=0
     version_parts[2]=0
     current_pkg_build=0
    ;;
  "minor")
    ((version_parts[1]++))
     version_parts[2]=0
     current_pkg_build=0
    ;;
  "patch")
    ((version_parts[2]++))
     current_pkg_build=0
    ;;
  "build")
    ((current_pkg_build++))
    ;;
esac

# Create the new version string for app.json (Strictly 3 numbers)
new_version_app="${version_parts[0]}.${version_parts[1]}.${version_parts[2]}"

# Create the new version string for package.json (4 numbers)
new_version_pkg="${version_parts[0]}.${version_parts[1]}.${version_parts[2]}.${current_pkg_build}"

# Calculate the new versionCode simply by incrementing the existing one by 1
new_version_code=$((current_version_code + 1))

# Handle iOS buildNumber: Reset to 0 on version bump, Increment on build bump
if [ "$update_type" == "build" ]; then
  new_build_number=$((current_build_number + 1))
else
  new_build_number=0
fi

# Update the version, buildNumber, and versionCode fields in the JSON file
jq --arg new_version "$new_version_app" \
   --arg new_version_code "$new_version_code" \
   --arg new_build_number "$new_build_number" \
   '.expo.version = $new_version | .expo.ios.buildNumber = $new_build_number | .expo.android.versionCode = ($new_version_code | tonumber)' \
   "$json_file" > tmp.json && mv tmp.json "$json_file"

# Update the version field in package.json (using the 4-digit version)
jq --arg new_version "$new_version_pkg" '.version = $new_version' "$package_file" > tmp_package.json && mv tmp_package.json "$package_file"

# Display a success message
echo "Bumped version successfully"
echo "app.json version: $new_version_app"
echo "package.json version: $new_version_pkg"
echo "buildNumber (iOS): $new_build_number"
echo "versionCode (Android): $new_version_code"