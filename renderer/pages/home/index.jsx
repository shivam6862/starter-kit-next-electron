import React, { useState, useEffect } from "react";
import classes from "../../styles/Home.module.css";
import Head from "next/head";
import Header from "../../component/Header";

const Home = () => {
  const [message, setMessage] = useState("Hii, Shivam kumar!");

  useEffect(() => {
    window.ipc.on("message", (message) => {
      setMessage(message);
    });
  }, []);

  return (
    <div className={classes.container}>
      <Head>
        <title>Home</title>
      </Head>
      <div className={classes.box}>
        <Header href={"/explorer"} page={"Home"} />
        <div className={classes.button_text}>
          <button
            onClick={() => {
              window.ipc.send("message", "Starter-kit-");
            }}
          >
            Test IPC
          </button>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
