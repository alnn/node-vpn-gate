# vpn-gate
Connect via openvpn using free vpngate.net config data from the CLI

![Screenshot](http://i.imgur.com/F8qPjID.png)

## Install

```bash
$ npm install --global vpn-gate
```

## Usage

```bash
$ sudo vpn-gate [<COUNTRY>]
```

## Examples
You can omit parameter, then openvpn will use config data with the highest score
```bash
$ sudo vpn-gate
```

...or you can use short country name, next command will load config data by openvpn that applies to Japan country and has highest score
```bash
$ sudo vpn-gate jp
```

...or with full country name
```bash
$ sudo vpn-gate japan
```

A little bit more freedom you can get by going to http://localhost:3333 after vpn-gate started

Browser interface
 
![Screenshot](http://i.imgur.com/TbSWNOu.png)
