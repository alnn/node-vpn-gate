import "./../scss/ConfigList.scss";
import React from "react";
import ConfigRow from "./ConfigRow.react";
import UpdateConfigs from "./UpdateConfigs.react";

class ConfigList extends React.Component {

    configs = [];

    constructor() {
        super();
        this.state = {
            configs: [],
            countries: {}
        };
        this.connect            = this.connect.bind(this);
        this.changeCountry      = this.changeCountry.bind(this);
        this.updateCsvConfigs   = this.updateCsvConfigs.bind(this);
    }

    componentDidMount() {
        this.props.sock.emit('require-configs');
        this.props.sock.on('csv-loaded', () => {
            this.props.sock.emit('require-configs');
            this.refs.updateBtn.setUpdated();
        });
        this.props.sock.on('configs', (data) => {
            this.configs = data.configs;
            this.setState(data);
        });
    }

    connect(e) {
        const id = e.currentTarget.getAttribute('data-id');
        this.props.sock.emit('connect-vpn', id);
        //e.currentTarget.cla
    }

    changeCountry(e) {
        const country = e.currentTarget.value;

        const configs = country.length > 0
            ? this.configs.filter(config => config.country === country)
            : this.configs;
        this.setState({configs});
    }

    updateCsvConfigs(e) {
        let updateBtn = this.refs.updateBtn;
        if (!updateBtn.isUpdating()) {
            this.props.sock.emit('csv-reload');
            updateBtn.setUpdating();
        }
    }

    render() {
        let {configs, countries} = this.state;

        countries = Object.keys(countries).map(key =>
            <option key={key} value={key}>{countries[key]}</option>
        );
        configs = configs.map((config, key) =>
            <ConfigRow key={key} num={key} onClick={this.connect} {...config}/>
        );

        return (
            <div class="col-md-8 col-configlist">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h4>Choose available connection</h4>
                        <select class="form-control input-sm" id="select-country" onChange={this.changeCountry}>
                            <option value="">-- Select Country --</option>
                            {countries}
                        </select>
                        <UpdateConfigs ref="updateBtn" update={this.updateCsvConfigs} />
                    </div>
                    <div class="configlist-tableholder">
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
            </div>
        );
    }

}

ConfigList.propTypes = {
    sock: React.PropTypes.object.isRequired
};

export default ConfigList;
