import ioClient from "socket.io-client";

const socket = ioClient('localhost:9000', {
    transports: ['websocket']
});

export default {

    connectVpn: function(country, ID) {
        console.log('connect vpn');
        socket.emit('connect-vpn', JSON.stringify({
            country: country,
            ID: ID,
        }));

    },

    disconnectVpn: function() {
        socket.emit('disconnect-vpn');
    },

};
