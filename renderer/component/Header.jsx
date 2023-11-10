import React, { useState, useEffect } from "react";
import classes from "../styles/Header.module.css";
import Link from "next/link";
import Image from "next/image";
import socketIoClient from "socket.io-client";
import { BsMoonFill, BsSunFill } from "react-icons/bs";

const Header = ({ href, page }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const deafultTheme = async () => {
      const response = await window.darkMode.system();
      setIsDark(response);
    };
    deafultTheme();
  }, []);

  const handleChangeTheme = async () => {
    const response = await window.darkMode.toggle();
    setIsDark(response);
  };

  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const establishSocketConnection = async () => {
      const socket = socketIoClient(`http://127.0.0.1:8000`, {});
      console.log(socket);
      setSocket(socket);
      socket.emit("serialData", "value");
      socket.on("messagesForYou", (response) => {
        console.log(response);
      });
      socket.on("messagesUpdated", (response) => {
        console.log(response);
      });
    };
    establishSocketConnection();
  }, []);

  return (
    <div className={classes.header}>
      <div className={classes.header_left}>
        <Image src="/logo.png" alt="Logo" width={150} height={150} />
        <h1>{page}</h1>
      </div>
      <div className={classes.header_right}>
        <div className={classes.links}>
          <Link href={`${href}`}>Explorer</Link>
        </div>
        <div className={classes.day_night_mode}>
          {!isDark ? (
            <BsSunFill color="#fff" size={25} onClick={handleChangeTheme} />
          ) : (
            <BsMoonFill color="#fff" size={25} onClick={handleChangeTheme} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
