//import "./../scss/Status.scss";
import React from "react";

//import NewProject from "./NewProject.react";

export default class Status extends React.Component {

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
            <div class="col-md-2">
                <div class="panel panel-success panel-warning panel-danger">
                    <div class="panel-heading">
                        <h3 class="panel-title">Status: Connected!</h3>
                    </div>

                    <div class="panel-body">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th> Country:</th>
                                    <td>Japan</td>
                                </tr>
                                <tr>
                                    <th>IP:</th>
                                    <td>83.232.98.32</td>
                                </tr>
                                <tr>
                                    <th>Throughput:</th>
                                    <td>89.5 Mbps</td>
                                </tr>
                                <tr>
                                    <th>Ping:</th>
                                    <td>84 ms</td>
                                </tr>
                                <tr>
                                    <th>Operator:</th>
                                    <td>Gossipman328-PC's owner</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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
