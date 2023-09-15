import React, { useState, useEffect } from "react";
import axios from "axios";

import logo from "../assests/logo2.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let host = process.env.REACT_APP_HOST;
const Header = () => {
  const [showPopup, setShowPopup] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isExistingMember, setIsExistingMember] = useState(false);
  const [isSuccess, setIsSuccess] = useState("");

  useEffect(() => {}, []);

  const handleButtonClick = () => {
    setShowPopup(false);

    const getServerData = async () => {
      try {
        const response = await axios.get(`${host}/`);

        if (response.status != 200) {
          setShowPopup(null);
          await toast("Something went wrong. Please try again later.");
        } else {
          setShowPopup(true);
        }
      } catch (error) {
        // console.log(error);
        setShowPopup(null);

        await toast("Something went wrong. Please try again later.");
      }
    };
    getServerData();
  };

  const handlePopupClose = () => {
    setShowPopup(null);
    setWhatsappNumber("");
    setIsExistingMember(false);
    setIsSuccess(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${host}/api/saveWhatsappNumber`, {
        whatsappNumber,
      });
    setWhatsappNumber(null);


      if (response.data.isExistingMember) {
        setIsExistingMember(true);
        await toast("You already hold our membership");
        handlePopupClose();
      } else {
        setIsExistingMember(true);
        await toast("Congratulations! You saved 10%.");
        handlePopupClose();
      }
    } catch (error) {
      console.log(error);
      handlePopupClose();
      await toast.danger("Something went wrong. Please try again later.");
    }
  };

  return (
    <div>
      <ToastContainer className="toastContainer" />
      <div className="header">
        <img src={logo} alt="logo" width={320} className="logo" />
        <button onClick={handleButtonClick} className="main-button">
          Get Discount
        </button>
      </div>

      {showPopup ? (
        <div className="overlay">
          <div className="popup">
            <h2>Enter your WhatsApp number</h2>
            <span
              class="material-symbols-outlined close-icon"
              onClick={handlePopupClose}
            >
              close
            </span>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="WhatsApp number"
              />
              <button className="popup-submit" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      ) : (
        showPopup === false && (
          <div className="overlay">
            {/* <div className="popup"> */}
              <span class="loader"></span>
            {/* </div> */}
          </div>
        )
      )}
    </div>
  );
};

export default Header;
