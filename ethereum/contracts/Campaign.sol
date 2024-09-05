// SPDX-License-Identifier: MIT
pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum, string name, string description) public {
        address newCampaign = new Campaign(minimum, name, description, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    string public name;
    string public description;

    modifier restricted() {
        require(msg.sender == manager, "Only the campaign manager can call this function");
        _;
    }

    function Campaign(uint minimum, string campaignName, string campaignDescription, address creator) public {
        manager = creator;
        minimumContribution = minimum;
        name = campaignName;
        description = campaignDescription;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution, "Contribution must be at least the minimum amount");

        if (!approvers[msg.sender]) { // Check if the sender has already contributed
            approvers[msg.sender] = true;
            approversCount++;
        }
    }

    function createRequest(string requestDescription, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
           description: requestDescription,
           value: value,
           recipient: recipient,
           complete: false,
           approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender], "Only approvers can approve a request");
        require(!request.approvals[msg.sender], "You have already approved this request");

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2), "Not enough approvals");
        require(!request.complete, "Request is already completed");

        request.recipient.transfer(request.value);
        request.complete = true;
    }
    
    function getSummary() public view returns (
      uint, uint, uint, uint, address, string, string
      ) {
        return (
          minimumContribution,
          this.balance,
          requests.length,
          approversCount,
          manager,
          name,
          description
        );
    }
    
    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}
