import "./../scss/Dashboard.scss";
import React from "react";
import io from "socket.io-client";

import Status from "./Status.react";
import ConfigList from "./ConfigList.react";
import Logs from "./Logs.react";

class Dashboard extends React.Component {

    constructor() {
        super();
    }

    componentDidMount() {
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {

        const socket = io(this.props.url, {
            transports: ['websocket']
        });

        return (
            <div>
                <div class="row row-dashboard">
                    <Status sock={socket} />
                    <ConfigList sock={socket} />
                </div>
                <div class="row row-logs">
                    <Logs sock={socket} />
                </div>
            </div>
        );
    }

}

Dashboard.propTypes = {
    url: React.PropTypes.string.isRequired
};

export default Dashboard;
