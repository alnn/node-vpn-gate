import "./../scss/Dashboard.scss";
import React from "react";
import io from "socket.io-client";

import Status from "./Status.react";
import ConfigList from "./ConfigList.react";
import Logs from "./Logs.react";

class Dashboard extends React.Component {

    socket;

    constructor() {
        super();
        this.state = {
            activeConfig: {id: 0}
        };
        this.setActiveConfig = this.setActiveConfig.bind(this);
    }

    componentDidMount() {
    }

    componentWillMount() {
        this.socket = io(this.props.url, {
            transports: ['websocket']
        });
    }

    componentWillUnmount() {
        this.socket.disconnect();
    }

    setActiveConfig(config) {
        this.setState({
            activeConfig: config
        });
    }

    render() {

        return (
            <div>
                <div class="row">
                    <div class="col-md-12">
                        <h3 class="donate">
                            If you find it useful, please donate <a href="https://blockchain.info/address/1E15F65jvWYzp8xWxB2XASWVEVXb6pyrUF" target="_blank">Bitcoins</a>
                        </h3>
                    </div>
                </div>
                <div class="row row-dashboard">
                    <Status sock={this.socket} setActive={this.setActiveConfig}/>
                    <ConfigList sock={this.socket} activeConfig={this.state.activeConfig} />
                </div>
                <div class="row row-logs">
                    <Logs sock={this.socket} />
                </div>
            </div>
        );
    }

}

Dashboard.propTypes = {
    url: React.PropTypes.string.isRequired
};

export default Dashboard;
