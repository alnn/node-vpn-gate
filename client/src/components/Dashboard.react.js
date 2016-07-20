import "./../scss/Dashboard.scss";
import React from "react";
import io from "socket.io-client";

import Status from "./Status.react.js";
import AvailConnections from "./AvailableConfigs.react.js";

class Dashboard extends React.Component {

    constructor() {
        super();
    }

    componentDidMount() {

    }

    componentWillMount() {
        //projectStore.on("change", this._getProjects);
        //console.log("count", projectStore.listenerCount("change"));
    }

    componentWillUnmount() {
        //projectStore.removeListener("change", this._getProjects);
    }

    render() {

        const socket = io(this.props.url, {
            transports: ['websocket']
        });

        return (
            <div class="row">
                <Status sock={socket} />
                <AvailConnections sock={socket} />
            </div>
        );
    }

}

Dashboard.propTypes = {
    url: React.PropTypes.string.isRequired
};

export default Dashboard;
