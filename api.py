#! /usr/bin/env python3

import requests

r = requests.post("https://mainnet.infura.io/v3/541446fd85024043bb8a18e8d8b375c9", json={"jsonrpc": "2.0", "method": "eth_call", "params": [{"to": "0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F", "data": "0x54fd4d50"}, "latest"], "id": 0});
print(r.text);
