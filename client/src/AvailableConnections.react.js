//import "./../scss/Status.scss";
import React from "react";

//import NewProject from "./NewProject.react";

export default class AvailableConnections extends React.Component {

    constructor() {
        super();
        this._getProjects = this._getProjects.bind(this);
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
            <div class="col-md-8">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        Choose available connection
                        <select id="select-country">
                            <option value="">-- Select Country --</option>
                            <option value="us">USA</option>
                            <option value="ru">Russia</option>
                            <option value="uk">Ukraine</option>
                            <option value="de">Germany</option>
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
                            <tr class="config-row" country="JP" vpn-id="1">
                                <th>1.</th>
                                <td>
                                    <img src="http://www.vpngate.net/images/flags/JP.png"/>
                                    <br/>
                                    <span>Japan</span>
                                </td>
                                <td>
                                    <b>vpn108204491</b>
                                    <br/>
                                    <span>111.241.44.75</span>
                                </td>
                                <td class="vpn-sessions">
                                    <b>121 sessions</b>
                                    <br/>
                                    <span>16 hours</span>
                                    <br/>
                                    <span>Total 11,657 users</span>
                                </td>
                                <td class="vpn-line-quality">
                                    <b>22.49 Mbps</b>
                                    <br/>
                                    <span>Ping: 20 ms</span>
                                    <br/>
                                    <b>481.09 GB</b>
                                    <br/>
                                    <span>Logging policy:</span>
                                        <br/>
                                    <span>2 Weeks</span>
                                </td>
                                <td>
                                    <b>By DESKTOP-5E893's Owner</b>
                                    <br/>
                                    <i>My network. Kind of sucks... Using Pentium Duel-Core CPU</i>
                                </td>
                                <td>610,155</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    _getProjects() {
        this.setState({
            //projects: projectStore.getAll()
        });
    }

}
