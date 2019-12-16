const ethers = require('ethers');
const express = require('express');


var contract;
var contractWithSigner;
setup();

const app = express();
const port = 8080; //FIXME
app.listen(port, () => console.log('App listening on port ' + port + '!'))

    async function setup() {

        console.log("Notary setup");

        // The Contract interface
        let abi = [
            "event NewRecordCreated(uint256 recordId)",
            "constructor()",
            "function createRecord(uint256 hash) external returns (uint256 value)",
            "function getRecordInfo(uint256 recordId) external view returns (uint256 v1, uint256 v2)"
            ];        
        

        // Connect to the network
        //let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        
        let provider = ethers.getDefaultProvider('rinkeby');
        
        provider.getBlockNumber().then((blockNumber) => {
            console.log("Current block number: " + blockNumber);
        });
        
        // The address of Notary Contract
        let contractAddress = "0x65A3742D4C58308a702688b85512dA659dfB6D5c";

        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        contract = new ethers.Contract(contractAddress, abi, provider);
        
        // A Signer from a private key
        let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
        //Public key is 0x14791697260e4c9a71f18484c9f997b308e59325

        
        //console.log(dataFromJsonFile); 


        let wallet = new ethers.Wallet(privateKey, provider);
        
        // Create a new instance of the Contract with a Signer, which allows
        // update methods
        contractWithSigner = contract.connect(wallet);
            
        //var recordId = 0;
        //await getRecordInfo(recordId);        
        //await createRecord(12345);            

    };


    async function getRecordInfo(recordId) {
 
        let value = await contract.getRecordInfo(recordId);
        console.log(value);
        return value;
    }
    

    async function createRecord(hash) {

        let tx = await contractWithSigner.createRecord(hash);
                
        // The operation is NOT complete yet; we must wait until it is mined
        await tx.wait()

        console.log("transacao de escrita completou. Hash a seguir");
        console.log(tx.hash);                        
    }

    app.get('/createrecord/:hash',function( _req , _res ){
        const hash = _req.params.hash;
        console.log('/createrecord/' + hash )
                      
        createRecord(hash).then((tx) => {
            console.log("Created record!");
        });

        _res.send("The hash: " + hash + " was called. ");    
        _res.end();    
    });

    app.get('/getrecord/:recordId',function( _req , _res ){
        const recordId = _req.params.recordId;
        console.log('/getrecord/' + recordId )
                      
        getRecordInfo(recordId).then((result) => {
            console.log("Got record: " + result);
            _res.send(result);    
            _res.end();    
        });
        
    });


    /*
    

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
* /
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
*/
