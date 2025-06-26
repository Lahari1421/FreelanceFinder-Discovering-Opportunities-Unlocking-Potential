import React, { createContext, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socketIoClient from 'socket.io-client';

export const GeneralContext = createContext();

const GeneralContextProvider = ({ children }) => {
  const WS = 'http://localhost:6001';
  const socket = socketIoClient(WS);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('');

  const login = async () => {
    try {
      const loginInputs = { email, password };

      const res = await axios.post('http://localhost:6001/login', loginInputs);

      // ✅ Save in localStorage
      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('usertype', res.data.usertype);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('email', res.data.email);

      // ✅ Navigate based on usertype
      if (res.data.usertype === 'freelancer') {
        navigate('/freelancer');
      } else if (res.data.usertype === 'client') {
        navigate('/client');
      } else if (res.data.usertype === 'admin') {
        navigate('/admin');
      }

    } catch (err) {
      alert("Login failed! Please check credentials.");
      console.error("Login error:", err.response?.data || err.message);
    }
  };

  const inputs = { username, email, password, usertype };

  const register = async () => {
    try {
      const res = await axios.post('http://localhost:6001/register', inputs);

      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('usertype', res.data.usertype);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('email', res.data.email);

      if (res.data.usertype === 'freelancer') {
        navigate('/freelancer');
      } else if (res.data.usertype === 'client') {
        navigate('/client');
      } else if (res.data.usertype === 'admin') {
        navigate('/admin');
      }

    } catch (err) {
      alert("Registration failed!");
      console.error("Registration error:", err.response?.data || err.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <GeneralContext.Provider value={{
      socket,
      login,
      register,
      logout,
      username, setUsername,
      email, setEmail,
      password, setPassword,
      usertype, setUsertype
    }}>
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;
