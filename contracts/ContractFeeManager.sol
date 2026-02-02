// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContractFeeManager {
    address public owner;
    
    // Mapping from Contract ID (string) to Fee Amount (wei)
    mapping(string => uint256) public contractFees;
    
    // Mapping to track if a fee has been paid for a contract by a specific user or generally
    // For simplicity in this system: contractId -> hasBeenPaid (boolean)
    // Or if per-user payment is needed: contractId -> user -> bool
    // Based on user request "users pay fee when approving", it implies each user pays.
    mapping(string => mapping(address => bool)) public hasPaidFee;

    event FeeSet(string indexed contractId, uint256 fee);
    event FeePaid(string indexed contractId, address indexed payer, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // Admin sets the fee for a specific contract
    function setFee(string memory contractId, uint256 fee) external {
        // In a real decentralized app, you might want to restrict who can set the fee for a specific contract ID.
        // For this system, we assume the deployer (Admin) manages all fees.
        contractFees[contractId] = fee;
        emit FeeSet(contractId, fee);
    }

    // User pays the fee associated with the contract
    function payFee(string memory contractId) external payable {
        uint256 requiredFee = contractFees[contractId];
        require(msg.value >= requiredFee, "Insufficient fee sent");
        require(!hasPaidFee[contractId][msg.sender], "Fee already paid by this address");

        hasPaidFee[contractId][msg.sender] = true;
        emit FeePaid(contractId, msg.sender, msg.value);
    }

    function getFee(string memory contractId) external view returns (uint256) {
        return contractFees[contractId];
    }

    function checkHasPaid(string memory contractId, address user) external view returns (bool) {
        return hasPaidFee[contractId][user];
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
        emit FundsWithdrawn(owner, address(this).balance);
    }
}
