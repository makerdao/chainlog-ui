import fetch from "node-fetch";

const main = async () => {
  const url = "https://chainlog.makerdao.com/api/mainnet/active.json";
  const response = await fetch(url);
  const chainlog = await response.json();
  console.log(chainlog);
}

main();
