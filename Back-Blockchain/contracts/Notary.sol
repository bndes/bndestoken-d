/*
    ----------------------------------------------------------------------------
        Author: Andrijan Ostrun
                April, 2018.
                github.com/aostrun
                
        
    ----------------------------------------------------------------------------         
    
    
    Smart Contract serving as Notary Public where you can protect an document 
    or a file in general by storing it's hash value on the Ethereum blockchain.
    
    Every record besides file hash has parties associated with the record (can be 
    any number of parties) which can come handy if you are using this as a medium 
    to store real contracts.
    
    Every party associated with the record has to accept it before the record becomes
    valid. This stands as a protection for all parties involved.
    
    Creation of new record starts with providing:
        - Hash value of the file that is being protected (uint256)
        - Parties associated with the record (address[])
        - Unix Timestamp for record expiration (uint256) 
            -> current timestamp can be found at: https://www.unixtimestamp.com/
        
        -> Creation of the record returns unique record ID that has to be remembered by parties
            if they want to access that record ever again.
        
    Example of record creation:
        createRecord(2142131241, ["address#1", "address#2", "address#3"], 2523910141)
    
    Parties accept record by calling function acceptRecord from their address. 
    Function takes record ID as an argument.
        
    File can be verified by calling verify function. Function can be called only from
    address that is party on particulat record. Function takes record ID and hash value that
    we want to verify as arguments and returns boolean value, true if provided hash value
    matches one on the record.

*/

pragma solidity ^0.5.0;

contract Notary{
    
    /*
        Mapping holding the records
    */
    mapping( uint256 => Record ) private records;
    
    /*
        Records counter, unique ID for every record
    */
    uint256 private currentId;
    
    struct Record{
        
        // Hash of the file that this record is protecting
        uint256 hash;
        
        // Store the timestamp of record creation
        uint256 createdAt;
               
    }
    
    event NewRecordCreated(uint256 recordId);
        
    
    /*
        Constructor, initialize record counter
    */
    constructor() public{
        currentId = 0;
    }
    
    /*
        Create new record and add parties associated with this record and set its validity time
        uint256 hash, address[] _parties, uint256 validUntil
    */
    function createRecord(uint256 hash)
        external
        returns (uint256)
    {	
		
		// Limit max number of parties to 10
		
        // Create new record
        Record storage newRecord = records[currentId]; // = Record(0, new address[](0), new address[](0), 0, 0, 0);
        newRecord.hash = hash;		
   
        uint256 returnId = currentId;
        // Uncomment if you want to trigger event when new record is created
        //emit NewRecordCreated(currentId);
        currentId = currentId + 1;
        
        return returnId;
        
    }
    

    // Return the record hash 
    function getRecordInfo(uint256 recordId) 
        external 
        view
        returns (uint256, uint256)
    {
        return (records[recordId].createdAt, records[recordId].hash);
    }
   
    
}