const ethers = require('ethers');
const dataFromJsonFile = require('./xxx_UTC--2018-03-01T21-53-25.083436331Z--d636349f5d7e03037e0f224c9b1ac3ccf104f4a5');

//TODO: passar para Type
main();

    async function main() {

        console.log("inicio serverblockchain.js");

        // The Contract interface
        let abi = [
            "event ValueChanged(address indexed author, string oldValue, string newValue)",
            "constructor(string value)",
            "function getValue() view returns (string value)",
            "function setValue(string value)"
        ];
        
        // Connect to the network
        //let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:9545/");
        
        let provider = ethers.getDefaultProvider('rinkeby');
        
        provider.getBlockNumber().then((blockNumber) => {
            console.log("Current block number: " + blockNumber);
        });
        
        // The address from the above deployment example
        let contractAddress = "0x249AA32be34C862B921776B11e44788DECC09285";
        
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        let contract = new ethers.Contract(contractAddress, abi, provider);
        
        // A Signer from a private key
        let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
        //Public key is 0x14791697260e4c9a71f18484c9f997b308e59325

        
        console.log(dataFromJsonFile); 

/*
        let wallet = new ethers.Wallet(privateKey, provider);
        
        // Create a new instance of the Contract with a Signer, which allows
        // update methods
        let contractWithSigner = contract.connect(wallet);
            
        await getValue(contract);
        
        contract.on("ValueChanged", 
            (author, oldValue, newValue, event) => processaValueChanged(author, oldValue, newValue, event));

        await setValue(contractWithSigner, "olha que lindo 4");
            
        await sendETH(wallet);
*/
    };


    async function getValue(contract) {
 
        let value = await contract.getValue();
        console.log(value);
    }
    

    async function setValue(contractWithSigner, value) {

        let tx = await contractWithSigner.setValue(value);
                
        // The operation is NOT complete yet; we must wait until it is mined
        await tx.wait()

        console.log("transacao de escrita completou. Hash a seguir");
        console.log(tx.hash);                        
    }
    

    async function sendETH(wallet) {
        let amount = ethers.utils.parseEther('0.0001');

        let tx = {
            to: "0x0D39D8C023FE3891d8B2065CB550A7ec1489343d",
            // ... or supports ENS names
            // to: "ricmoo.firefly.eth",

            // We must pass in the amount as wei (1 ether = 1e18 wei), so we
            // use this convenience function to convert ether to wei.
            //value: ethers.utils.parseEther(amount);
            value: amount
        };

        tx = await wallet.sendTransaction(tx);

        console.log("vai enviar promisse");

        // The operation is NOT complete yet; we must wait until it is mined
        await tx.wait()
        
        /*
        let sendPromise = wallet.sendTransaction(tx);

        console.log("vai enviar promisse");

        sendPromise.then((tx) => {
            console.log(tx);
            // {
            //    // All transaction fields will be present
            //    "nonce", "gasLimit", "pasPrice", "to", "value", "data",
            //    "from", "hash", "r", "s", "v"
            // }
        });

        // The operation is NOT complete yet; we must wait until it is mined
        await tx.wait()
*/
    } 


    function processaValueChanged (author, oldValue, newValue, event) {

        console.log("Detectou evento ValueChanged jah em funcao separada");
    
        console.log("autor=" + author);
        // "0x14791697260E4c9A71f18484C9f997B308e59325"
    
        console.log("valor antigo=" + oldValue);
    
        console.log("valor novo=" + newValue);
    
        // See Event Emitter below for all properties on Event
        console.log("numero do bloco do evento=" + event.blockNumber);
    }
