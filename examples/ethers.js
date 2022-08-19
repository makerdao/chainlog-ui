import ethers from "ethers";

const main = async () => {
  const address = "0x3E62E50C4FAFCb5589e1682683ce38e8645541e8";
  const abi = [
    "function list() external view returns (bytes32[])",
    "function getAddress(bytes32) external view returns (address)"
  ];
  const provider = ethers.getDefaultProvider();
  const chainlog = new ethers.Contract(address, abi, provider);
  const list = await chainlog.list();
  const result = {};
  for (let keyHex of list) {
    const key = ethers.utils.parseBytes32String(keyHex);
    const address = await chainlog.getAddress(keyHex);
    result[key] = address;
  }
  console.log(result);
}

main();0x3E62E50C4FAFCb5589e1682683ce38e8645541e8
