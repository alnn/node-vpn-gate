//import "./../scss/Dashboard.scss";
import React from "react";

import Status from "./Status.react.js";
import AvailConnections from "./AvailableConnections.react.js";

export default class Dashboard extends React.Component {

    constructor() {
        super();
        //this._getProjects = this._getProjects.bind(this);
        this.state = {
            //projects: projectStore.getAll()
        };
    }

    componentWillMount() {
        //projectStore.on("change", this._getProjects);
        //console.log("count", projectStore.listenerCount("change"));
    }

    componentWillUnmount() {
        //projectStore.removeListener("change", this._getProjects);
    }

    render() {
        return (
            <div class="row">
                <Status />
                <AvailConnections />
            </div>
        );
    }

    _getProjects() {
        this.setState({
            //projects: projectStore.getAll()
        });
    }

}
