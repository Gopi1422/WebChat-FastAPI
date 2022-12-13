/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Home() {
  const [user, setUser] = useState({});
  // add random cliend id by date time
  const [clientId] = useState(Math.floor(new Date().getTime() / 1000));

  const [websckt, setWebsckt] = useState();
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // get token from local storage
    const auth_token = localStorage.getItem("auth_token");
    const auth_token_type = localStorage.getItem("auth_token_type");
    const token = auth_token_type + " " + auth_token;

    //  fetch data from get user api
    axios
      .get("http://localhost:8888/users/", {
        headers: { Authorization: token },
      })
      .then((response) => {
        console.log(response);
        setUser(response.data.result);
      })
      .catch((error) => {
        console.log(error);
        // remove token form local storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_token_type");

        // reload page
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });

    const url = "ws://localhost:8888/chat/ws/" + clientId;
    const ws = new WebSocket(url);

    ws.onopen = (event) => {
      ws.send("Connect");
    };

    // recieve message every start page
    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages([...messages, message]);
    };

    setWebsckt(ws);
    //clean up function when we close page
    return () => ws.close();
  }, []);

  const sendMessage = () => {
    websckt.send(message);
    // recieve message every send message
    websckt.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages([...messages, message]);
    };
    setMessage([]);
  };

  const onClickHandler = (event) => {
    event.preventDefault();

    // remove token form local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token_type");

    // notif
    toast("See You !", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // reload page
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="main-container">
      <div class="absolute mt-5 left-5 top-0 text-3xl font-bold text-yellow-500 ...">
        ChatApp
      </div>
      <div class="absolute mt-5 right-5 top-0 ...">
        <button
          onClick={(event) => {
            onClickHandler(event);
          }}
          className="py-3 w-32 text-lg font-bold text-black-100 outline-none rounded bg-red-100 hover:bg-orange-100 active:bg-gray-200"
        >
          Log out
        </button>
      </div>
      <div className="container">
        <div className="card w-96 mt-10 bg-white hover:shadow">
          <div className="text-center font-bold mt-1 text-md">
            <span className="text-blue-500">Name: </span>
            <span className="text-black-500">{user.name}</span>
          </div>
          <hr className="mt-2"></hr>
          <div className="text-center font-bold mt-1 text-md">
            <span className="text-blue-500">Email: </span>
            <span className="text-black-500">{user.email}</span>
          </div>
          <hr className="mt-2"></hr>
          <div className="text-center font-bold mt-1 text-md">
            <span className="text-blue-500">Client ID: </span>
            <span className="text-black-500">{clientId}</span>
          </div>
          <hr className="mt-2"></hr>
        </div>
        <div className="chat-container">
          <div className="chat">
            {messages.map((value, index) => {
              if (value.clientId === clientId) {
                return (
                  <div key={index} className="my-message-container">
                    <div className="my-message">
                      <p className="client">client id : {clientId}</p>
                      <p className="message">{value.message}</p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="another-message-container">
                    <div className="another-message">
                      <p className="client">client id : {clientId}</p>
                      <p className="message">{value.message}</p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
          <div className="input-chat-container">
            <input
              className="input-chat"
              type="text"
              placeholder="Chat message ..."
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            ></input>
            <button className="submit-chat" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
