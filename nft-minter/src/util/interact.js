// import { pinJSONToIPFS } from "./pinata.js";
import detectEthereumProvider from '@metamask/detect-provider';
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractABI = require("../contract-abi.json");
const contractAddress = "0x6CEC0668C6336E9eE5d25DF5B60b507A72bb3222";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

export const connectWallet = async () => {
  const provider = await detectEthereumProvider();
  console.log('in interact, connectWallet:', provider);

  if (provider) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`} rel="noreferrer">
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  const provider = await detectEthereumProvider();
  console.log('in interact, getCurrent:', provider);

  if (provider) {
    try {
      const addressArray = await provider.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`} rel="noreferrer">
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

// async function loadContract() {
//   return new web3.eth.Contract(contractABI, contractAddress);
// }

export const mintNFT = async (url, name, description, quantity) => {
  // if (url.trim() == "" || name.trim() == "" || description.trim() == "") {
  //   return {
  //     success: false,
  //     status: "❗Please make sure all fields are completed before minting.",
  //   };
  // }

  //make metadata
  // const metadata = new Object();
  // metadata.name = name;
  // metadata.image = url;
  // metadata.description = description;

  // const pinataResponse = await pinJSONToIPFS(metadata);
  // if (!pinataResponse.success) {
  //   return {
  //     success: false,
  //     status: "😢 Something went wrong while uploading your tokenURI.",
  //   };
  // }
  // const tokenURI = pinataResponse.pinataUrl;

  window.contract = await new web3.eth.Contract(contractABI, contractAddress);

  const nftsValue = quantity * 0.1
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: web3.utils.toHex(web3.utils.toWei(nftsValue.toString(), 'ether')),
    data: window.contract.methods
      .buyArt(quantity)
      .encodeABI(),
  };

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};
