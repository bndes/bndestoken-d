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

pragma solidity ^0.4.21;

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
        
        // Indicate which address is party on this record
        address [] parties;
        
        // Store acknowledgment of this record by the party
        mapping( address => bool ) parties_approvals;
        
        // Store the timestamp of record creation
        uint256 createdAt;
        
        // Record is valid if now < validUntil
        uint256 validUntil;
        
        // Guard against bruteforce attacks
		uint256 lastFailedTest;
        
    }
    
    event NewRecordCreated(uint256 recordId);
    
    /*
        Only parties that are associated with the record can call function
    */
    modifier onlyParty(uint256 recordId){
        
        // Iterate over parties and check if there sender of the 
        // message is a party on this record
        for(uint i = 0; i < records[recordId].parties.length; i++){
            if(records[recordId].parties[i] == msg.sender){
                _;
                return;   
            }
        }
        // If sender is not party on this record, revert
        revert();
    }
    
    /*
        Only valid records can be accesed
    */
    modifier onlyValid(uint256 recordId){
        require(records[recordId].validUntil >= now);
        _;
    }
    
    
    /*
        Constructor, initialize record counter
    */
    function Notary() public{
        currentId = 0;
    }
    
    /*
        Create new record and add parties associated with this record and set its validity time
        uint256 hash, address[] _parties, uint256 validUntil
    */
    function createRecord(uint256 hash, address[] _parties)
        external
        returns (uint256 _recordId)
    {	
		
		// Limit max number of parties to 10
		
        // Create new record
        Record newRecord = records[currentId]; // = Record(0, new address[](0), new address[](0), 0, 0, 0);
        newRecord.hash = hash;
		newRecord.validUntil = now + 1 hours;
		
        // Add parties and init values to true
        
        // indicating that address is party on this record
        for(uint8 i = 0; i < _parties.length; i++){
			newRecord.parties.push(_parties[i]);
			//newRecord.parties[_parties[i]] = true;
		}
		
        _recordId = currentId;
        // Uncomment if you want to trigger event when new record is created
        //emit NewRecordCreated(currentId);
        currentId = currentId + 1;
        
    }
    
    
    /*
        Every party associated with the record has to accept the record to make it valid.
        Accepting the record is done by calling this function (acceptRecord) from the address of the
        involved party.
    */
    function acceptRecord(uint256 recordId)
        onlyParty(recordId)
        onlyValid(recordId)
        external
    {   
        
        
        records[recordId].parties_approvals[msg.sender] = true;
        
    }
    
    
    
    // Return the record hash 
    function getRecordInfo(uint256 recordId) 
        external 
        constant
        returns (uint256, uint256)
    {
        return (records[recordId].createdAt, records[recordId].validUntil);
    }
    
    function getParties(uint256 recordId)
        onlyParty(recordId)
        external
        constant
        returns (address[])
    {
        return records[recordId].parties;   
    }
    
    
	// Checks if the given hash matches recorded hash
    function verify(uint256 recordId, uint256 test_hash)
        onlyParty(recordId)
        external
        returns (bool _res)
    {	
		/* 
			Prevent bruteforce attacks, after every failed test
			wait 30s before testing again.
		*/
		//require(records[recordId].lastFailedTest + 30 seconds < now);
		
		// Iterate over all parties associated with this record and check for
		// their approval
		for(uint i=0; i < records[recordId].parties.length; i++){
		    if (records[recordId].parties_approvals[ records[recordId].parties[i] ] == false){
		        // If one of the parties didn't approve this record, revert
		        revert();
		    }
		}
		
		
		// Compare testing hash with the recorded hash
        if(test_hash == records[recordId].hash){
            _res = true;
        }else{
			records[recordId].lastFailedTest = now;
            _res = false;
        }
        
    }
    
    
}