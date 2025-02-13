#!/bin/bash

# Read current version
VERSION=$(cat VERSION)
echo "Current version: v$VERSION"

# Create builds directory if it doesn't exist
mkdir -p builds

# Function to build for specific platform
build_platform() {
    local os=$1
    local arch=$2
    local suffix=$3
    echo "Building for $os $arch..."
    GOOS=$os GOARCH=$arch go build -o builds/crypticker_${os}_${arch}_v${VERSION}${suffix}
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    echo "Building Crypto Ticker v$VERSION for all platforms..."
    
    # Build all platforms
    build_platform windows amd64 .exe
    # build_platform windows arm64 .exe
    # build_platform darwin amd64 ""
    build_platform darwin arm64 ""
    # build_platform linux amd64 ""
    # build_platform linux arm64 ""
else
    echo "Building Crypto Ticker v$VERSION for selected platforms..."
    
    # Build only specified platforms
    for platform in "$@"; do
        case $platform in
            winamd)
                build_platform windows amd64 .exe
                ;;
            winarm)
                build_platform windows arm64 .exe
                ;;
            macamd)
                build_platform darwin amd64 ""
                ;;
            macarm)
                build_platform darwin arm64 ""
                ;;
            linuxamd)
                build_platform linux amd64 ""
                ;;
            linuxarm)
                build_platform linux arm64 ""
                ;;
            *)
                echo "Unknown platform: $platform"
                echo "Valid platforms: winamd, winarm, macamd, macarm, linuxamd, linuxarm"
                exit 1
                ;;
        esac
    done
fi

echo "Build complete! Binaries are in the builds directory."
echo
echo "Generated binaries:"
ls -1 builds/crypticker_*_v${VERSION}*

# Increment version for next build
NEXT_VERSION=$((VERSION + 1))
echo $NEXT_VERSION > VERSION
echo
echo "Version incremented to v$NEXT_VERSION for next build" 