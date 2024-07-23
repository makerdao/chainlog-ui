document.addEventListener("DOMContentLoaded", function() {
    document.title = "Chainlog - MakerDAO";

    const IPFS_CID = config.IPFS_CID;
    const infuraApiKey = config.INFURA_API_KEY;
    const etherscanApiKey = config.ETHERSCAN_API_KEY;

    const ipfsDiv = document.createElement("div");
    ipfsDiv.innerHTML = "IPFS CID: ";
    const ipfsCID = document.createElement("a");
    ipfsCID.innerHTML = IPFS_CID;
    ipfsCID.href = "https://ipfs.io/ipfs/" + IPFS_CID;
    ipfsDiv.append(ipfsCID);
    const ipfsCopy = document.createElement("button");
    ipfsCopy.style.marginLeft = "10px";
    ipfsCopy.innerHTML = "copy";
    ipfsCopy.className = "copy";
    ipfsCopy.name = "copy";
    ipfsCopy.addEventListener("click", () => {
        navigator.clipboard.writeText(IPFS_CID);
        uncopy();
        ipfsCopy.innerHTML = "copied";
    });
    ipfsDiv.append(ipfsCopy);
    document.body.append(ipfsDiv);

    const chainNames = {
        "0x1": "Ethereum mainnet",
        "0x3": "Ropsten",
        "0x4": "Rinkeby",
        "0x5": "Görli",
        "0x2a": "Kovan"
    };

    const chainPrefixes = {
        "0x1": "",
        "0x3": "ropsten.",
        "0x4": "rinkeby.",
        "0x5": "goerli.",
        "0x2a": "kovan."
    };

    const chainApiPrefixes = {
        "0x1": "",
        "0x3": "-ropsten",
        "0x4": "-rinkeby",
        "0x5": "-goerli",
        "0x2a": "-kovan"
    };

    const infuraPrefixes = {
        "0x1": "mainnet",
        "0x3": "ropsten",
        "0x4": "rinkeby",
        "0x5": "goerli",
        "0x2a": "kovan"
    };

    let provider, chain, chainPrefix, chainApiPrefix, infuraPrefix, notice;
    const chainlog = "0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F";

    const title = document.createElement("h1");
    title.innerHTML = "MakerDAO Deployment Registry";
    document.body.append(title);

    const linksDiv = document.createElement("div");
    const sourceLink = document.createElement("a");
    sourceLink.innerHTML = "source code";
    sourceLink.href = "https://github.com/makerdao/chainlog-ui";
    sourceLink.target = "_blank";
    linksDiv.append(sourceLink);
    const separator = document.createElement("span");
    separator.innerHTML = " · ";
    linksDiv.append(separator);
    const apiLink = document.createElement("a");
    apiLink.innerHTML = "historical API";
    apiLink.href = "/api.html";
    apiLink.target = "_blank";
    linksDiv.append(apiLink);
    document.body.append(linksDiv);

    const connTable = document.createElement("table");
    connTable.style.marginTop = "10px";
    connTable.style.backgroundColor = "lightgrey";
    connTable.style.marginBottom = "10px";
    const providerRow = document.createElement("tr");
    const providerName = document.createElement("td");
    providerName.innerHTML = "provider:";
    providerRow.append(providerName);
    const providerValue = document.createElement("td");
    providerValue.innerHTML = "loading…";
    providerRow.append(providerValue);
    connTable.append(providerRow);
    const chainRow = document.createElement("tr");
    const chainName = document.createElement("td");
    chainName.innerHTML = "chain:";
    chainRow.append(chainName);
    const chainValue = document.createElement("td");
    const chainSelect = document.createElement("select");
    chainSelect.disabled = true;
    chainSelect.style.color = "black";
    const chainOption = document.createElement("option");
    chainOption.innerHTML = "loading…";
    chainOption.value = "mainnet";
    chainSelect.append(chainOption);
    const chainGoerli = document.createElement("option");
    chainGoerli.innerHTML = "Görli";
    chainGoerli.value = "goerli";
    chainSelect.addEventListener("change", () => {
        infuraPrefix = chainSelect.value;
        chainPrefix = infuraPrefix === "mainnet" ? "" : "goerli.";
        chainApiPrefix = infuraPrefix === "mainnet" ? "" : "-goerli";
        endpoint = "https://" + infuraPrefix + ".infura.io/v3/" + infuraApiKey;
        setUp();
    });
    chainValue.append(chainSelect);
    chainRow.append(chainValue);
    const chainNotice = document.createElement("td");
    chainRow.append(chainNotice);
    connTable.append(chainRow);
    document.body.append(connTable);

    const canvas = document.createElement("div");
    canvas.innerHTML = "loading…";
    document.body.append(canvas);

    let endpoint = `https://mainnet.infura.io/v3/${config.INFURA_API_KEY}`;
    
    const setUp = () => {
        canvas.innerHTML = "loading…";
        providerValue.innerHTML = provider;
        chainOption.innerHTML = chain;
        chainNotice.innerHTML = notice;
        call({
            to: chainlog,
            data: "0x0f560cd7" // list()
        }, draw);
    };

    window.addEventListener("load", () => {
        if (typeof window.ethereum !== "undefined") {
            setTimeout(() => {
                if (!window.ethereum.isConnected()) {
                    console.log("Metamask connection timed out. Falling back to Infura mainnet");
                    setInfura();
                }
            }, 1000);
            window.ethereum.on("connect", conn => {
                provider = "Metamask";
                chain = chainNames[conn.chainId] || "Unknown";
                chainPrefix = chainPrefixes[conn.chainId];
                chainApiPrefix = chainApiPrefixes[conn.chainId];
                infuraPrefix = infuraPrefixes[conn.chainId];
                endpoint = "https://" + infuraPrefix + ".infura.io/v3/" + infuraApiKey;
                notice = "change this in your Metamask plugin (you don’t need to unlock Metamask)";
                setUp();
            });
            window.ethereum.on("chainChanged", chainId => {
                chain = chainNames[chainId] || "Unknown";
                chainPrefix = chainPrefixes[chainId];
                chainApiPrefix = chainApiPrefixes[chainId];
                infuraPrefix = infuraPrefixes[chainId];
                endpoint = "https://" + infuraPrefix + ".infura.io/v3/" + infuraApiKey;
                notice = "";
                setUp();
            });
        } else {
            setInfura();
        }
    });

    const setInfura = () => {
        provider = "Infura";
        chain = "Ethereum mainnet";
        chainPrefix = "";
        chainApiPrefix = "";
        infuraPrefix = "mainnet";
        notice = "";
        chainSelect.removeAttribute("disabled");
        chainSelect.append(chainGoerli);
        setUp();
    };

    const hex2a = hexx => {
        const hex = hexx.toString();
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            const ch = hex.substr(i, 2);
            if (ch === '00') continue;
            str += String.fromCharCode(parseInt(ch, 16));
        }
        return str;
    };

    const infuraCall = (params, callback) => {
        const options = {
            method: "POST",
            body: '{"jsonrpc": "2.0", "method": "eth_call", "params": [' + JSON.stringify(params) + ', "latest"], "id": 0}'
        };
        fetch(endpoint, options).then(response => {
            if (response.ok) {
                response.json().then(content => callback(content.result))
            } else {
                response.json().then(content => {
                    console.error("Infura: " + content.error.message);
                    canvas.innerHTML = "error";
                });
            }
        });
    };

    const call = (params, callback) => {
        if (provider === "Metamask" && window.ethereum.isConnected()) {
            window.ethereum.request({
                method: "eth_call",
                params: [params, "latest"]
            }).then(response => callback(response))
                .catch(error => {
                    console.log("falling back to Infura " + infuraPrefix);
                    infuraCall(params, callback)
                });
        } else {
            infuraCall(params, callback);
        }
    };

    const getAddress = (keyHex, callback) => {
        call({
            to: chainlog,
            data: "0x21f8a721" + keyHex // getAddress(bytes32)
        }, addressHex => {
            const address = "0x" + addressHex.substring(26);
            callback(address);
        });
    };

    const getChecksum = (address, callback) => {
        fetch(`https://chainlog.makerdao.com/checksum/${address}`).then(response => {
            if (response.ok) {
                response.text().then(checksum => {
                    if (checksum.toLowerCase() === address) {
                        callback(checksum);
                    } else {
                        callback(address);
                    }
                }).catch(e => {
                    callback(address);
                });
            } else {
                callback(address);
            }
        }).catch(e => {
            callback(address);
        });
    };

    const draw = data => {
        canvas.innerHTML = "";
        if (data === "0x") {
            const chainTitle = document.createElement("h3");
            chainTitle.innerHTML = "Wrong chain";
            canvas.append(chainTitle);
            const chainText = document.createElement("div");
            chainText.innerHTML = "The chainlog was not deployed to this chain at address " + chainlog;
            canvas.append(chainText);
            const chainAdvice = document.createElement("h4");
            chainAdvice.innerHTML = "Select another chain on your Metamask plugin";
            canvas.append(chainAdvice);
            return;
        }
        const divVersion = document.createElement("div");
        divVersion.style.margin = "20px";
        canvas.append(divVersion);
        call({
            to: chainlog,
            data: "0x54fd4d50" // version()
        }, versionString => {
            const versionHex = versionString.substring(2 + 2 * 32 * 2);
            const version = hex2a(versionHex);
            divVersion.innerHTML = "Chainlog " + chainlog + " version " + version;
        });
        data = data.substring(2 + 64 * 2);
        const formatsDiv = document.createElement("div");
        const formatsTitle = document.createElement("span");
        formatsTitle.id = "formatsTitle";
        formatsTitle.innerHTML = "copy entire chainlog as ";
        formatsTitle.setAttribute("entire", "copy entire chainlog as ");
        formatsTitle.setAttribute("filtered", "copy filtered addresses as ");
        formatsDiv.append(formatsTitle);
        const json = document.createElement("button");
        json.id = "json";
        json.className = "copy";
        json.name = "JSON";
        json.innerHTML = "JSON";
        json.addEventListener("click", () => {
            json.innerHTML = "load…";
            json.disabled = true;
            const object = {};
            let length = 0;
            for (let i = 0; i < data.length; i += 64) {
                const keyHex = data.substring(i, i + 64);
                getAddress(keyHex, address => {
                    const key = hex2a(keyHex);
                    const queryLower = filter.value.toLowerCase().replace(" ", "_");
                    const queryAllLower = filterAll.value.toLowerCase();
                    const keyLower = key.toLowerCase();
                    if (keyLower.includes(queryLower) && address.includes(queryAllLower)) {
                        object[key] = address;
                    }
                    length += 64;
                    if (length === data.length) {
                        const text = JSON.stringify(object, null, 2);
                        navigator.clipboard.writeText(text);
                        uncopy();
                        json.innerHTML = "copied";
                        json.disabled = false;
                    }
                });
            }
        });
        formatsDiv.append(json);
        const bash = document.createElement("button");
        bash.id = "bash";
        bash.className = "copy";
        bash.name = "BASH";
        bash.innerHTML = "BASH";
        bash.style.marginLeft = "5px";
        bash.addEventListener("click", () => {
            bash.innerHTML = "load…";
            bash.disabled = true;
            let text = "";
            let length = 0;
            for (let i = 0; i < data.length; i += 64) {
                const keyHex = data.substring(i, i + 64);
                getAddress(keyHex, address => {
                    const key = hex2a(keyHex);
                    const queryLower = filter.value.toLowerCase().replace(" ", "_");
                    const queryAllLower = filterAll.value.toLowerCase();
                    const keyLower = key.toLowerCase();
                    if (keyLower.includes(queryLower) && address.includes(queryAllLower)) {
                        const statement = `export ${key}=${address}\n`;
                        text += statement;
                    }
                    length += 64;
                    if (length === data.length) {
                        navigator.clipboard.writeText(text);
                        uncopy();
                        bash.innerHTML = "copied";
                        bash.disabled = false;
                    }
                });
            }
        });
        formatsDiv.append(bash);
        canvas.append(formatsDiv);
        const table = document.createElement("table");
        const header = document.createElement("tr");
        header.style.backgroundColor = "lightgrey";
        const tdContract = document.createElement("td");
        tdContract.innerHTML = "contract";
        header.append(tdContract);
        const tdAddress = document.createElement("td");
        tdAddress.innerHTML = "address";
        tdAddress.colSpan = 3;
        header.append(tdAddress);
        const tdAbi = document.createElement("td");
        tdAbi.innerHTML = "ABI";
        tdAbi.colSpan = 2;
        header.append(tdAbi);
        table.append(header);
        const tools = document.createElement("tr");

        const tdKey = document.createElement("td");
        const filter = document.createElement("input");
        filter.id = "filter";
        filter.placeholder = "filter";
        const trs = document.getElementsByClassName("tr");
        filter.addEventListener("focus", () => filter.select());
        filter.addEventListener("keyup", () => {
            toggleAll("filter");
            const filterAll = document.getElementById("filterAll");
            let filtered = false;
            for (let i = 0; i < trs.length; i++) {
                const tr = trs[i];
                const key = tr.children[0].innerHTML;
                const address = tr.children[1].innerHTML.toLowerCase();
                const notShowing = address.startsWith("<button");
                const queryLower = filter.value.toLowerCase().replace(" ", "_");
                const queryAllLower = filterAll.value.toLowerCase();
                const keyLower = key.toLowerCase();
                if (keyLower.includes(queryLower) && (
                    notShowing || address.includes(queryAllLower))
                ) {
                    tr.style.display = "table-row";
                    tr.setAttribute("name", "tr-visible");
                    if (tr.children[1].innerHTML.includes("<button>")) {
                        toggleAll("button");
                    }
                } else {
                    tr.style.display = "none";
                    tr.setAttribute("name", "tr-hidden");
                    filtered = true;
                }
            }
            const formatsTitle = document.getElementById("formatsTitle");
            if (filtered) {
                formatsTitle.innerHTML = formatsTitle.getAttribute("filtered");
            } else {
                formatsTitle.innerHTML = formatsTitle.getAttribute("entire");
            }
            const json = document.getElementById("json");
            json.innerHTML = json.name;
            const bash = document.getElementById("bash");
            bash.innerHTML = bash.name;
        });
        tdKey.append(filter);
        tools.append(tdKey);

        const tdView = document.createElement("td");
        const viewAll = document.createElement("button");
        viewAll.id = "viewAll";
        viewAll.innerHTML = "show all";
        viewAll.addEventListener("click", () => {
            viewAll.innerHTML = "loading…";
            viewAll.disabled = true;
            const trs = document.getElementsByName("tr-visible");
            for (let i = 0; i < trs.length; i++) {
                const tr = trs[i];
                const tds = tr.children;
                const tdKey = tds[0];
                const keyHex = tdKey.id;
                const tdView = tds[1];
                tdView.innerHTML = "loading…";
                getAddress(keyHex, address => {
                    tdView.innerHTML = address;
                    if (i === trs.length - 1) {
                        toggleAll("filter");
                        viewAll.innerHTML = "show all";
                        viewAll.disabled = false;
                    }
                    getChecksum(address, checksum => {
                        tdView.innerHTML = checksum;
                    });
                });
            }
        });
        tdView.append(viewAll);
        const filterAll = document.createElement("input");
        filterAll.id = "filterAll";
        filterAll.placeholder = "filter";
        filterAll.style.width = "100%";
        filterAll.style.display = "none";
        filterAll.addEventListener("focus", () => filterAll.select());
        filterAll.addEventListener("keyup", () => {
            const filter = document.getElementById("filter");
            let filtered = false;
            for (let i = 0; i < trs.length; i++) {
                const tr = trs[i];
                const key = tr.children[0].innerHTML;
                const address = tr.children[1].innerHTML.toLowerCase();
                const notShowing = address.startsWith("<button");
                const queryLower = filter.value.toLowerCase().replace(" ", "_");
                const queryAllLower = filterAll.value.toLowerCase();
                const keyLower = key.toLowerCase();
                if (keyLower.includes(queryLower) && (
                    notShowing || address.includes(queryAllLower))
                ) {
                    tr.style.display = "table-row";
                    tr.setAttribute("name", "tr-visible");
                    if (tr.children[1].innerHTML.includes("<button>")) {
                        toggleAll("button");
                    }
                } else {
                    tr.style.display = "none";
                    tr.setAttribute("name", "tr-hidden");
                    filtered = true;
                }
            }
            const formatsTitle = document.getElementById("formatsTitle");
            if (filtered) {
                formatsTitle.innerHTML = formatsTitle.getAttribute("filtered");
            } else {
                formatsTitle.innerHTML = formatsTitle.getAttribute("entire");
            }
            const json = document.getElementById("json");
            json.innerHTML = json.name;
            const bash = document.getElementById("bash");
            bash.innerHTML = bash.name;
        });
        tdView.append(filterAll);
        tools.append(tdView);

        table.append(tools);
        for (let i = 0; i < data.length; i += 64) {
            const tr = document.createElement("tr");
            tr.className = "tr";
            tr.setAttribute("name", "tr-visible");
            tr.addEventListener("mouseover", () => {
                tr.style.backgroundColor = "lightgrey";
            });
            tr.addEventListener("mouseout", () => {
                tr.style.backgroundColor = "initial";
            });

            const tdKey = document.createElement("td");
            const keyHex = data.substring(i, i + 64);
            const key = hex2a(keyHex);
            tdKey.innerHTML = key;
            tdKey.id = keyHex;
            tr.append(tdKey);

            const tdView = document.createElement("td");
            const view = document.createElement("button");
            view.innerHTML = "show";
            view.addEventListener("click", () => {
                tdView.innerHTML = "loading…";
                getAddress(keyHex, address => {
                    getChecksum(address, checksum => {
                        tdView.innerHTML = checksum;
                    });
                });
                if (showingAll()) {
                    toggleAll("filter");
                }
            });
            tdView.append(view);
            tr.append(tdView);

            const tdCopy = document.createElement("td");
            const copy = document.createElement("button");
            copy.className = "copy";
            copy.name = "copy";
            copy.innerHTML = "copy";
            copy.addEventListener("click", () => {
                copy.innerHTML = "load…";
                copy.disabled = true;
                getAddress(keyHex, address => {
                    getChecksum(address, checksum => {
                        tdView.innerHTML = checksum;
                        navigator.clipboard.writeText(checksum);
                        uncopy();
                        copy.innerHTML = "copied";
                        copy.disabled = false;
                        if (showingAll()) {
                            toggleAll("filter");
                        }
                    });
                });
            });
            tdCopy.append(copy);
            tr.append(tdCopy);

            const tdEscan = document.createElement("td");
            const escan = document.createElement("button");
            escan.innerHTML = "Etherscan";
            escan.addEventListener("click", () => {
                escan.innerHTML = "loading…";
                escan.disabled = true;
                getAddress(keyHex, address => {
                    tdView.innerHTML = address;
                    window.open("https://" + chainPrefix + "etherscan.io/address/" + address);
                    escan.innerHTML = "Etherscan";
                    escan.disabled = false;
                    if (showingAll()) {
                        toggleAll("filter");
                    }
                });
            });
            tdEscan.append(escan);
            tr.append(tdEscan);

            const tdAbiCopy = document.createElement("td");
            const abiCopy = document.createElement("button");
            abiCopy.className = "copy";
            abiCopy.name = "copy ABI";
            abiCopy.innerHTML = "copy ABI";
            abiCopy.addEventListener("click", () => {
                abiCopy.innerHTML = "loading…";
                abiCopy.disabled = true;
                getAddress(keyHex, address => {
                    fetch("https://api" + chainApiPrefix + ".etherscan.io/api?apikey=" + etherscanApiKey + "&module=contract&action=getabi"
                        + "&address=" + address)
                        .then(response => response.json()
                            .then(data => {
                                if (data.status === "1") {
                                    navigator.clipboard.writeText(data.result);
                                    uncopy();
                                    abiCopy.innerHTML = "copied";
                                } else {
                                    console.error(data.result);
                                    abiCopy.innerHTML = "error";
                                }
                                abiCopy.disabled = false;
                            }));
                });
            });
            tdAbiCopy.append(abiCopy);
            tr.append(tdAbiCopy);

            table.append(tr);
        }
        canvas.append(table);
        filter.focus();
    };

    const showingAll = () => {
        const trs = document.getElementsByName("tr-visible");
        for (let i = 0; i < trs.length; i++) {
            const tr = trs[i];
            const view = tr.children[1];
            if (view.innerHTML.includes("<")) {
                return false;
            }
        }
        return true;
    };

    const toggleAll = what => {
        const viewAll = document.getElementById("viewAll");
        const filterAll = document.getElementById("filterAll");
        if (what === "button") {
            viewAll.style.display = "block";
            filterAll.style.display = "none";
        } else if (what === "filter") {
            filterAll.style.display = "block";
            viewAll.style.display = "none";
            if (filterAll.value !== "") {
                filterAll.dispatchEvent(new Event("keyup"));
            }
        }
    };

    const uncopy = () => {
        const copies = document.getElementsByClassName("copy");
        for (let i = 0; i < copies.length; i++) {
            const copy = copies[i];
            copy.innerHTML = copy.name;
        }
    };
});
