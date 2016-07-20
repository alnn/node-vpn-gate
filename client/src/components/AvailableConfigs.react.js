import "./../scss/AvailableConfigs.scss";
import React from "react";
import ConfigRow from "./ConfigRow.react";

class AvailableConfigs extends React.Component {

    constructor() {
        super();
        this.state = {
            configs: [],
            countries: {}
        };
        this.connect = this.connect.bind(this);
    }

    componentDidMount() {
        this.props.sock.emit('require-configs');
        this.props.sock.on('csv-loaded', function() {
            this.props.sock.emit('require-configs');
        });
        this.props.sock.on('configs', this.setState.bind(this));
    }

    connect(e) {
        const id = e.currentTarget.getAttribute('data-id');
        this.props.sock.emit('connect-vpn', id);
    }

    onCountryChange() {
        // ???
    }

    render() {
        let {configs, countries} = this.state;

        countries = Object.keys(countries).map(key => <option key={key} value={key}>{countries[key]}</option>);
        configs = configs.map((config, key) => <ConfigRow key={key} num={key} onClick={this.connect} {...config}/>);

        return (
            <div class="col-md-8">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        Choose available connection
                        <select id="select-country">
                            <option value="">-- Select Country --</option>
                            {countries}
                        </select>
                    </div>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Country</th>
                                <th>
                                    <span>DDNS Host Name</span>
                                    <br/>
                                    <span>IP Address</span>
                                </th>
                                <th>
                                    <span>VPN Sessions</span>
                                    <br/>
                                    <span>Uptime</span>
                                    <br/>
                                    <span>Cumulative users</span>
                                </th>
                                <th>
                                    <span>Line quality</span>
                                    <br/>
                                    <span>Throughput and Ping</span>
                                    <br/>
                                    <span>Cumulative transfers</span>
                                </th>
                                <th>Operator</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}

AvailableConfigs.propTypes = {
    sock: React.PropTypes.object.isRequired
};

export default AvailableConfigs;
