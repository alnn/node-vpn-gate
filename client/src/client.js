import "./scss/Layout.scss";

import React from "react";
import ReactDom from "react-dom";

import Dashboard from "./components/Dashboard.react";

const appConfig = (function(params) {
    let conf = {};
    params.split(";").forEach(function(item, indx) {
        const arr = item.trim().split("=");
        conf[arr[0]] = decodeURIComponent(arr[1]);
    });
    return conf;
}(document.cookie));

const app = document.getElementById('app');

ReactDom.render(<Dashboard url={`${appConfig.host}:${appConfig.port}`} />, app);
