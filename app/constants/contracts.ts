export const FEE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_FEE_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000";

export const FEE_MANAGER_ABI = [
    "function setFee(string memory contractId, uint256 fee) external",
    "function payFee(string memory contractId) external payable",
    "function getFee(string memory contractId) external view returns (uint256)",
    "function checkHasPaid(string memory contractId, address user) external view returns (bool)"
];
