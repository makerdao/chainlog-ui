#! /usr/bin/env python3

import os
import requests

def get_version(chain):
    infura_key = os.environ["INFURA_KEY"]
    endpoint = "https://{}.infura.io/v3/{}".format(chain, infura_key)
    response = requests.post(endpoint, json={
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [{
            "to": "0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F",
            "data": "0x54fd4d50"
        }, "latest"],
        "id": 0
    })
    result = response.json()
    if "result" not in result:
        print(result)
        exit()
    data = result["result"]
    version_hex = data[2 * (1 + 2 * 32):]
    version_bytes32 = bytes.fromhex(version_hex)
    version_bytes = version_bytes32.replace(b"\x00", b"")
    version = version_bytes.decode("ascii")
    return version

chain = "mainnet"
version = get_version(chain)
path = "{}/{}.json".format(chain, version)
print(os.path.exists(path))
