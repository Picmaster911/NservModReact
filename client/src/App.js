import React from "react"
import './App.css';
import axios from 'axios'
import { useState, useEffect } from "react";

function App() {

  // https://gregstoll.com/~gregstoll/floattohex/

  function convertToFloat(arr) {
    let buf = new ArrayBuffer(4);
    let view = new DataView(buf);
    arr.forEach((item, index) => {
      view.setUint8(index, item); //пишу по 8 байт 
    });
    var num = view.getFloat32(0);
    return num.toFixed(2);
  }


  const [modbusData, setModbusData] = useState({});

  const apiCall = () => {
    axios.get('http://localhost:3003/read-data').then((res) => {
      setModbusData(res.data);
      console.log(res);

    })
      .catch(err => { console.error(err) })
  }

  useEffect(() => {
    const intervalId = setInterval(apiCall, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {(!modbusData.data) ?
          <h1> Load Data </h1> :
          <div>
            <h1>Online = {modbusData.online}</h1>
            <h1>Request count = {modbusData.data._id}</h1>
            <h1>Response0 =  {modbusData.data._body._values[0]}</h1>
            <h1>Response1 = {modbusData.data._body._values[1]}</h1>
            <h1>Float = {convertToFloat(modbusData.data._body._valuesAsBuffer.data)}</h1>
          </div>
        }
        <button onClick={apiCall}>Make API Call</button>
      </header>
    </div>
  );
}

export default App;
