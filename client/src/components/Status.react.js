import "./../scss/Status.scss";
import React from "react";

class Status extends React.Component {

    constructor() {
        super();
        this.state = {
            country:        "-",
            countryName:    "-",
            host:           "-",
            id:             0,
            ip:             "-",
            logType:        "-",
            message:        "-",
            operator:       "-",
            ping:           "-",
            score:          "-",
            speed:          "-",
            status:         "Disconnected",
            traffic:        "-",
            uptime:         "-",
            users:          "-"
        };
    }

    componentDidMount() {
        this.props.sock.on('status', this.setState.bind(this));
    }

    render() {
        let {
            countryName,
            host,
            ip,
            logType,
            message,
            operator,
            ping,
            score,
            speed,
            status,
            traffic,
            uptime,
            users,
        } = this.state;

        const statusPanelRel = {
            'Disconnected' :    'danger',
            'Connecting' :      'warning',
            'Connected' :       'success',
        };

        users = parseInt(users).toLocaleString();

        return (
            <div class="col-md-3">
                <div class={`panel panel-${statusPanelRel[status]}`}>
                    <div class="panel-heading">
                        <h3 class="panel-title">Status: {status}</h3>
                    </div>

                    <div class="panel-body">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th>Country:</th>
                                    <td>{countryName}</td>
                                </tr>
                                <tr>
                                    <th>Host Name:</th>
                                    <td>{host}</td>
                                </tr>
                                <tr>
                                    <th>IP:</th>
                                    <td>{ip}</td>
                                </tr>
                                <tr>
                                    <th>Throughput:</th>
                                    <td>{speed}</td>
                                </tr>
                                <tr>
                                    <th>Ping:</th>
                                    <td>{ping}</td>
                                </tr>
                                <tr>
                                    <th>Operator:</th>
                                    <td>{operator}</td>
                                </tr>
                                <tr>
                                    <th>Logging policy:</th>
                                    <td>{logType}</td>
                                </tr>
                                <tr>
                                    <th>Score:</th>
                                    <td>{score}</td>
                                </tr>
                                <tr>
                                    <th>Cumulative transfers:</th>
                                    <td>{traffic}</td>
                                </tr>
                                <tr>
                                    <th>Uptime:</th>
                                    <td>{uptime}</td>
                                </tr>
                                <tr>
                                    <th>Cumulative users:</th>
                                    <td>{users}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

}

Status.propTypes = {
    sock: React.PropTypes.object.isRequired
};

export default Status;