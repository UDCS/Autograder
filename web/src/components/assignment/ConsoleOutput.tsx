import "./ConsoleOutput.css"

interface ConsoleOutputProps {
    output: string;
}
function ConsoleOutput({output}: ConsoleOutputProps) {
    return <div className="consoleOutput">
        {output}
    </div>
}
export default ConsoleOutput;