import electron from 'electron';
import React, { useState } from 'react';

// prevent SSR webpacking
const ipcRenderer = electron.ipcRenderer || false;

const Home = () => {

  return (
    <React.Fragment>
      <h1>azer</h1>
    </React.Fragment>
  );
};

export default Home;
