# Autograder

## How to setup the development environment (Linux/Mac)

1. Make sure you have `go` and `yarn` installed on your computer
2. On the terminal, run `chmod +x ./dev.sh` to modify permissions
3. Add the following to `~/.bashrc` on Linux or `~/.zshrc` on Mac:
```
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export GOBIN=$GOPATH/bin
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```
4. On the terminal, run `./dev.sh`
5. Open http://localhost:8080/ to access the web app.

## How to build the binary

### For Linux / Mac
Run `go build main.go` on the terminal. This will create a new binary file. 

You can now run the binary using `./main` on the terminal.

### For Windows
Run `env GOOS=windows GOARCH=arm64 go build main.go` on the terminal.

If the above doesn't generate a binary or generates a binary that doesn't run on your computer, change the `GOARCH` value from `arm64` to the correct one for your CPU. You can find the list for valid `GOARCH` values [here](https://gist.github.com/asukakenji/f15ba7e588ac42795f421b48b8aede63#goarch-values).

You can now run the using `main.exe`
