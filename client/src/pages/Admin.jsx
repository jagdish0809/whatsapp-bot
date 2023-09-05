import { React, useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
let host = process.env.REACT_APP_HOST;
console.log(host)

const Admin = () => {
  const [message, setMessage] = useState("");
  const [localmsg, setLocalmsg] = useState("");
  const [imgValue, setImgValue] = useState("");
  const [oldImg, setOldImg] = useState("");

  useEffect(() => {
    axios
      .get(`${host}/api/akshay2`)
      .then((response) => {
        setLocalmsg(response.data.message);
        const img = response.data.img;
        let imgUrl = `data:image/jpeg;base64,${img}`;
        setOldImg(imgUrl);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const saveForm = async (e) => {
    e.preventDefault();
    localStorage.setItem("message", message);
    setLocalmsg(localStorage.getItem("message"));
    setOldImg(imgValue);
    const formData = new FormData();
    formData.append("message", message);
    formData.append("image", imgValue);
    try {
      await axios.post(`${host}/api/akshay`, formData);
    } catch (error) {
      console.log(error);
    }
    window.location.reload();
  };

  const sendtoall = async () => {
    try {
      await axios.post(`${host}/api/sendtoall`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="app-card">
      <form className="app-form" onSubmit={saveForm}>
        <label htmlFor="">Message: </label>
        <textarea
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          required
        />
        <input
          type="file"
          onChange={(e) => setImgValue(e.target.files[0])}
          required
          style={{ border: "none" }}
        />
        <button type="submit" className="app-form-submit popup-submit">
          Set message
        </button>
      </form>
      <div className="msg__app">
        <p> Current message: {localmsg}</p>
        <img
          src={oldImg}
          alt=""
          width="300"
          style={{ objectFit: "contain" }}
          height="300"
        />
      </div>
      <button
        type="submit"
        onClick={sendtoall}
        className="app-send-toall popup-submit"
      >
        Send to all
      </button>
    </div>
  );
};

export default Admin;
