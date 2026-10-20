# CG50 Pro Max

mac/: macOS source, calculator skin and packaging scripts.

ipad/core/: Go emulator and WebAssembly bridge.

ipad/web/: calculator interface and offline support.

Upstream: https://github.com/hexbinoct/casio-cg50
Retain the included upstream licenses and attribution.

## Development

Mac development requires Go, Python 3 and Apple Command Line Tools.
Run the packaging script inside mac/ after supplying its local resources.

To build the browser core, run inside ipad/core/:

    GOOS=js GOARCH=wasm CGO_ENABLED=0 go build -trimpath -o ../web/cg50.wasm .

Copy wasm_exec.js from the same Go version's GOROOT/lib/wasm/ to ipad/web/.

Automatic startup requires local files, excluded from Git:

    ipad/web/defaults/flash_full.bin
    ipad/web/defaults/cg50_state.bin

Use initial data without personal information and ensure permission to distribute firmware.

From the repository root, test locally with:

    python3 -m http.server 8089 --bind 127.0.0.1 --directory ipad/web

Deploy ipad/web/ to HTTPS hosting for iPad installation.
Use Safari Add to Home Screen and wait for offline caching to finish.
Progress is stored in IndexedDB; export backups regularly.
