import ethers from "ethers";

const main = async () => {
  const address = "0xda0ab1e0017debcd72be8599041a2aa3ba7e740f";
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

main();
