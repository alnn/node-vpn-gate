import React from "react";

class UpdateConfigs extends React.Component {

    constructor() {
        super();
        this.state = {
            disabled: '',
            status: this.getIcon(),
        };
    }

    getIcon() {
        return <span class={`glyphicon glyphicon-refresh`}></span>;
    }

    setUpdated() {
        this.setState({
            disabled: '',
            status: this.getIcon()
        });
    };

    setUpdating() {
        this.setState({
            disabled: 'disabled',
            status: 'Updating vpngate.net configs'
        });
    }

    isUpdating() {
        return this.state.disabled === 'disabled';
    }

    render() {
        let {update} = this.props;

        return (
            <button
                type="button"
                class={`btn btn-sm btn-primary`}
                onClick={update}
                title="Update vpngate.net configs"
                disabled={this.state.disabled}
            >
                {this.state.status}
            </button>
        );
    }
}

export default UpdateConfigs;
