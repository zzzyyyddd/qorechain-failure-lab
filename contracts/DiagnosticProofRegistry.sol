// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Records caller-supplied commitments, not diagnostic contents.
contract DiagnosticProofRegistry {
    mapping(address => mapping(bytes32 => bool)) public recorded;

    event DiagnosticRecorded(address indexed recorder, bytes32 indexed reportHash);

    error EmptyReportHash();
    error AlreadyRecorded();

    function record(bytes32 reportHash) external {
        if (reportHash == bytes32(0)) revert EmptyReportHash();
        if (recorded[msg.sender][reportHash]) revert AlreadyRecorded();
        recorded[msg.sender][reportHash] = true;
        emit DiagnosticRecorded(msg.sender, reportHash);
    }
}
