# Autograder

## How to setup the development environment 

### On Linux/Mac

1. Make sure you have [`go`](https://go.dev/dl/) (v1.23 preferably) and `yarn` installed on your computer. (Mac) `brew` seems to have issues on Mac with installing go for this project. Downloading it from the official [website](https://go.dev/dl/) seems to work. Just download and run the installer.
2. On the terminal, run `chmod +x ./dev.sh` to modify permissions
3. On the terminal, run `cd web && yarn && yarn run dev` to install the React dependencies. Once you see the `build in <time>ms` message, you can exit out of the command using `Ctrl+C`
4. Add the following to `~/.bashrc` on Linux or `~/.zshrc` on Mac. Then either restart the terminal or run `source ~/.zshrc`
```
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export GOBIN=$GOPATH/bin
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```
5. Install `air` by running `go install github.com/air-verse/air@latest`
6. On the terminal, run `./dev.sh`
7. Open http://localhost:8080/ to access the web app.

### On Windows w/o WSL

1. Install [`go`](https://go.dev/dl/) and [`nodejs`](https://nodejs.org/en)
2. Install `yarn` with the command `npm install --global yarn`
3. If yarn cannot run because of security restrictions, run the command `Set-ExecutionPolicy -ExecutionPolicy Unrestricted` in PowerShell as an admin. (read [this](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.4) for more info)
4. With the terminal opened from the project, run `cd web` `yarn` then `yarn run dev`. It will show in the terminal "built in <x>ms" after it is finished, during which point you can Ctrl+C to exit out of the command.
5. With the terminal opened from the main project folder, run `go install github.com/air-verse/air@latest` to install air

## How to build the binary

### For Linux / Mac
Run `go build main.go` on the terminal. This will create a new binary file. 

You can now run the binary using `./main` on the terminal.

### For Windows
Run `env GOOS=windows GOARCH=arm64 go build main.go` on the terminal.

If the above doesn't generate a binary or generates a binary that doesn't run on your computer, change the `GOARCH` value from `arm64` to the correct one for your CPU. You can find the list for valid `GOARCH` values [here](https://gist.github.com/asukakenji/f15ba7e588ac42795f421b48b8aede63#goarch-values).

You can now run the using `main.exe`

