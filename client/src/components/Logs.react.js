import "./../scss/Logs.scss";
import React from "react";
import ReactDOM from "react-dom";

class Logs extends React.Component {

    logs = [];

    constructor() {
        super();
        this.state = {
            logs: [],
        };

    }

    componentDidMount() {
        this.props.sock.on('log', logString => {

            logString.split("\n").forEach((item) => {
                this.logs.push(item);
            });

            this.setState({
                logs: this.logs
            });
        });
    }

    componentDidUpdate() {
        let logsHolder = ReactDOM.findDOMNode(this.refs.logsHolder);
        logsHolder.scrollTop = logsHolder.scrollHeight;
    }

    render() {

        return (
            <div class="col-md-11 col-logs">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h4>Openvpn Logs</h4>
                    </div>
                    <div ref="logsHolder" class="panel-body">
                        {this.state.logs.map((logString, key) => <p key={key}>{logString}</p>)}
                    </div>
                </div>
            </div>
        );
    }

}

Logs.propTypes = {
    sock: React.PropTypes.object.isRequired
};

export default Logs;
