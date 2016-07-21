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
        this.changeStatus = this.changeStatus.bind(this);
    }

    componentDidMount() {
        this.props.sock.on('status', this.setState.bind(this));
    }

    changeStatus(e) {
        if (this.state.status === 'Disconnected') {
            this.props.sock.emit('connect-vpn', this.state.id);
        } else {
            this.props.sock.emit('disconnect-vpn');
        }
    }

    render() {
        let {
            country,
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

        const buttonRel = {
            'Disconnected': 'success',
            'Connecting': 'danger',
            'Connected': 'danger',
        };

        const buttonTypeRel = {
            'Disconnected': 'play',
            'Connecting': 'stop',
            'Connected': 'stop',
        };

        users = parseInt(users).toLocaleString();

        return (
            <div class="col-md-3 connection-status">
                <div class={`panel panel-${statusPanelRel[status]}`}>
                    <div class="panel-heading">
                        <h3 class="panel-title">Status: {status}</h3>
                        <button
                            type="button"
                            class={`btn btn-sm btn-${buttonRel[status]}`}
                            onClick={this.changeStatus}
                        >
                            <span class={`glyphicon glyphicon-${buttonTypeRel[status]}`}></span>
                        </button>
                    </div>

                    <div class="panel-body">
                        <table class="table">
                            <tbody>
                                <tr class="status-country">
                                    <th>Country:</th>
                                    <td>
                                        {countryName}
                                        <img src={`http://www.vpngate.net/images/flags/${country}.png`}/>
                                    </td>
                                </tr>
                                <tr class="status-host">
                                    <th>Host Name:</th>
                                    <td>{host}</td>
                                </tr>
                                <tr class="status-ip">
                                    <th>IP:</th>
                                    <td>{ip}</td>
                                </tr>
                                <tr class="status-throughput">
                                    <th>Throughput:</th>
                                    <td>{speed}</td>
                                </tr>
                                <tr class="status-ping">
                                    <th>Ping:</th>
                                    <td>{ping}</td>
                                </tr>
                                <tr class="status-operator">
                                    <th>Operator:</th>
                                    <td>{operator}</td>
                                </tr>
                                <tr class="status-logtype">
                                    <th>Logging policy:</th>
                                    <td>{logType}</td>
                                </tr>
                                <tr class="status-score">
                                    <th>Score:</th>
                                    <td>{score}</td>
                                </tr>
                                <tr class="status-traffic">
                                    <th>Cumulative transfers:</th>
                                    <td>{traffic}</td>
                                </tr>
                                <tr class="status-uptime">
                                    <th>Uptime:</th>
                                    <td>{uptime}</td>
                                </tr>
                                <tr class="status-users">
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