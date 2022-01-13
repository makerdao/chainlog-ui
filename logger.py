#! /usr/bin/env python3

import os
import requests
import json
import time

def call(chain, calldata):
    infura_key = os.environ["INFURA_KEY"]
    endpoint = "https://{}.infura.io/v3/{}".format(chain, infura_key)
    response = requests.post(endpoint, json={
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [{
            "to": "0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F",
            "data": calldata
        }, "latest"],
        "id": 0
    })
    result = response.json()
    if "result" not in result:
        print(result)
        exit()
    data = result["result"]
    return data

def to_ascii(hex_string):
    bytes32_string = bytes.fromhex(hex_string)
    bytes_string = bytes32_string.replace(b"\x00", b"")
    ascii_string = bytes_string.decode("ascii")
    return ascii_string

def get_version(chain):
    version_signature = "0x54fd4d50"
    data = call(chain, version_signature)
    version_hex = data[2 * (1 + 2 * 32):]
    version = to_ascii(version_hex)
    return version

def get_log(chain):
    list_signature = "0x0f560cd7";
    get_address_signature = "0x21f8a721";
    data = call(chain, list_signature)
    length_hex = data[2 * (1 + 32) : 2 * (1 + 32 + 32)]
    length = int(length_hex, 16)
    names = data[2 * (1 + 2 * 32):]
    if length != len(names) / 64:
        print("error:", data)
        exit()
    log = {}
    for i in range(0, len(names), 64):
        print("{}%".format(int(i / len(names) * 100)), end="\r")
        name_hex = names[i : i + 64]
        address_bytes32 = call(chain, get_address_signature + name_hex)
        name = to_ascii(name_hex)
        address = "0x" + address_bytes32[2 * (1 + 12) :]
        log[name] = address
    return log

def update(chain):
    version = get_version(chain)
    path = "{}/{}.json".format(chain, version)
    index_file = open("index.json", "r")
    index = json.load(index_file)
    index_file.close()
    if not os.path.exists(path) or version not in index[chain]["all"]:
        print("downloading {} chainlog v{}... ".format(chain, version))
        log = get_log(chain)
        print("done.")
        log_file = open(path, "w")
        json.dump(log, log_file, indent=2)
        log_file.close()
        active_file = open("{}/active.json".format(chain), "w")
        json.dump(log, active_file, indent=2)
        active_file.close()
        if version not in index[chain]["all"]:
            index[chain]["all"].insert(0, version)
        index[chain]["active"] = version
        index_file = open("index.json", "w")
        json.dump(index, index_file, indent=2)
        index_file.close()

chains = ["mainnet", "goerli"]
while True:
    for chain in chains:
        update(chain)
    time.sleep(5 * 60)
