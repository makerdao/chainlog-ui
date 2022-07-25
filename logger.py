#! /usr/bin/env python3

import os
import requests
import json
import time
from datetime import datetime
from eth_utils import to_checksum_address
from github import Github, GithubException

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
        address_checksum = to_checksum_address(address)
        log[name] = address_checksum
    return log

def push(path, contents, message):
    try:
        file = repo.get_contents(path)
        repo.update_file(path, message, contents, file.sha)
    except:
        repo.create_file(path, message, contents)

def update(chain):
    version = get_version(chain)
    path = "api/{}/{}.json".format(chain, version)
    index_file = open("api/index.json", "r")
    index = json.load(index_file)
    index_file.close()
    if not os.path.exists(path) or version not in index[chain]["all"]:
        print("downloading {} chainlog v{}... ".format(chain, version))
        log = get_log(chain)
        print("done.")
        log_file = open(path, "w")
        contents = json.dumps(log, indent=2)
        log_file.write(contents)
        log_file.close()
        message = "feat: add chainlog file for {} v{}".format(chain, version)
        push(path, contents, message)
        active_path = "api/{}/active.json".format(chain)
        active_file = open(active_path, "w")
        active_file.write(contents)
        active_file.close()
        message = "feat: update active file for {} v{}".format(chain, version)
        push(active_path, contents, message)
        if version not in index[chain]["all"]:
            index[chain]["all"].insert(0, version)
        index[chain]["active"] = version
        index_path = "api/index.json"
        index_file = open(index_path, "w")
        index_contents = json.dumps(index, indent=2)
        index_file.write(index_contents)
        index_file.close()
        message = "feat: update index file for {} v{}".format(chain, version)
        push(index_path, index_contents, message)
    else:
        print("{} - no changes on {}".format(datetime.now(), chain))

g = Github(os.environ["GITHUB_TOKEN"])
repo = g.get_repo(os.environ["CHAINLOG_REPO"])
chains = ["mainnet", "goerli"]
while True:
    for chain in chains:
        update(chain)
    time.sleep(5 * 60)
