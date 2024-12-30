import { useState, useEffect } from "react";
import "./App.css"; 

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:8080/api");
      const data = await response.text();
      setData(data);
    };

    fetchData().catch((err) => console.log(err));
  }, []);



  return (
    <div className="App">
      <h1>{data}</h1>
    </div>
  );

}

export default App;
