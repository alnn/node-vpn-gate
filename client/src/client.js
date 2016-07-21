import "./scss/Layout.scss";

import React from "react";
import ReactDom from "react-dom";

import appConfig from "./../../configs/config.js";
import Dashboard from "./components/Dashboard.react";

const app = document.getElementById('app');

ReactDom.render(<Dashboard url={`${appConfig.host}:${appConfig.port}`} />, app);
