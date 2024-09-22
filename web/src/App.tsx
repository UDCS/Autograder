import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8080/api')
      const data = await response.text()
      setData(data);
    };
    fetchData().catch((err) => console.error(err)); }, []);

  return (
  <div className="App">{data}<h1>Hello from the front-end!</h1></div>
  );
}

export default App
