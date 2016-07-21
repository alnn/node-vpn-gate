import React from "react";

class TryNextBox extends React.Component {

    constructor() {
        super();
    }

    render() {

        return (
            <div class="try-next">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" onChange={this.props.onChange} checked={this.props.checked} />
                        Try next config if failed
                    </label>
                </div>
            </div>
        );
    }

}

TryNextBox.propTypes = {
    onChange: React.PropTypes.func.isRequired,
    checked: React.PropTypes.string.isRequired
};

export default TryNextBox;
