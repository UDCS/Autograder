import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:8080/api"); // temporary
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

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     rollupOptions: {
//       input: {
//         main: 'index.html',
//         login: 'login/index.html',
//         // Add more pages as needed
//       }
//     }
//   }
// });