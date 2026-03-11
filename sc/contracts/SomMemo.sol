// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ISomniaReactivityPrecompile {
    struct SubscriptionData {
        bytes32[4] eventTopics;
        address emitter;
        address handlerContractAddress;
        bytes4 handlerFunctionSelector;
        uint256 priorityFeePerGas;
        uint256 maxFeePerGas;
        uint256 gasLimit;
        bool isGuaranteed;
        bool isCoalesced;
    }

    function subscribe(SubscriptionData memory data) external returns (uint256);
    function unsubscribe(uint256 subscriptionId) external;

}

interface ISomniaEventHandler {
    function onEvent(bytes32[] calldata eventTopics, bytes calldata eventData) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

library SomniaExtensions {
    address internal constant SOMNIA_REACTIVITY_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000100;
    bytes32 internal constant SCHEDULE_SELECTOR = keccak256("Schedule(uint256)");
}

contract SomMemo is ISomniaEventHandler {
    ISomniaReactivityPrecompile public immutable reactivityPrecompile;
    address public immutable precompileAddress;

    struct TokenAsset {
        address tokenAddress;
        uint256 amount;
    }

    struct NFTAsset {
        address nftContract;
        uint256 tokenId;
    }

    struct Will {
        address owner;
        address beneficiary;
        uint256 lastCheckIn;
        uint256 inactivePeriod;
        uint256 deadlineTimestamp;
        bool executed;
        bool active;
        uint256 subscriptionId;
    }

    mapping(address => Will) public wills;
    mapping(address => uint256) public vaultSTT;
    mapping(address => TokenAsset[]) public vaultTokens;
    mapping(address => NFTAsset[]) public vaultNFTs;
    mapping(uint256 => address) public subscriptionIdToOwner;

    event WillRegistered(address indexed owner, address indexed beneficiary, uint256 deadlineMs);
    event CheckedIn(address indexed owner, uint256 newDeadlineMs);
    event WillExecuted(address indexed owner, address indexed beneficiary, uint256 executedAt);
    event WillDeactivates(address indexed owner);
    event BeneficiaryUpdated(address indexed owner, address indexed newBeneficiary);
    event DepositSTT(address indexed owner, uint256 amount);
    event DepositToken(address indexed owner, address indexed token, uint256 amount);
    event DepositNFT(address indexed owner, address indexed nftContract, uint256 tokenId);
    event Withdrawn(address indexed owner, uint256 sttAmount);

    modifier onlyActiveWill() {
        require(wills[msg.sender].owner != address(0), "SoMemo: No will found");
        require(wills[msg.sender].active, "SomMemo: Will is not active");
        require(!wills[msg.sender].executed, "SomMemo: Will already executed");
        _;
    }

    constructor(address _precompileAddress) {
    reactivityPrecompile = ISomniaReactivityPrecompile(_precompileAddress);
    precompileAddress = _precompileAddress;
    // ↑ Simpan alamat untuk dipakai di security check
    }

    function registerWill(
        address _beneficiary,
        uint256 _inactiveDays
    ) external {
        require(_beneficiary != address(0), "SomMemo: Beneficiary cannot be zero address/Beneficiary is not valid");
        require(_beneficiary != msg.sender, "SomMemo: Beneficiary cannot be the same as owner");
        require(_inactiveDays == 30 || _inactiveDays == 90 || _inactiveDays == 180 || _inactiveDays == 365, "SomMemo: Period is not valid");
        require(!wills[msg.sender].active, "SomMemo: Will already registered");
        uint256 inactivePeriodSec = _inactiveDays * 1 days;
        uint256 deadLineMs = (block.timestamp + inactivePeriodSec) * 1000;
        uint256 subId = _createScheduleSubscription(deadLineMs);
        wills[msg.sender] = Will({
            owner: msg.sender,
            beneficiary: _beneficiary,
            lastCheckIn: block.timestamp,
            inactivePeriod: inactivePeriodSec,
            deadlineTimestamp: deadLineMs,
            executed: false,
            active: true,
            subscriptionId: subId
        });

        subscriptionIdToOwner[subId] = msg.sender;
        emit WillRegistered(msg.sender, _beneficiary, deadLineMs);

    }

    function checkIn() external onlyActiveWill {
        Will storage will = wills[msg.sender];
        reactivityPrecompile.unsubscribe(will.subscriptionId);
        delete subscriptionIdToOwner[will.subscriptionId];
        uint256  newDeadlineMs = (block.timestamp + will.inactivePeriod) * 1000;
        uint256 newSubId = _createScheduleSubscription(newDeadlineMs);
        will.lastCheckIn = block.timestamp;
        will.deadlineTimestamp = newDeadlineMs;
        will.subscriptionId = newSubId;
        subscriptionIdToOwner[newSubId] = msg.sender;
        emit CheckedIn(msg.sender, newDeadlineMs);
        
    }

    function depositSTT() external payable onlyActiveWill {
        require(msg.value > 0, "SomMemo: Amount must be greater than 0");
        vaultSTT[msg.sender] += msg.value;
        emit DepositSTT(msg.sender, msg.value); 
    }

    function depositToken(address _tokenAddress, uint256 _amount) external onlyActiveWill{
        require(_amount > 0, "SomMemo: Amount must be greater than 0");
        bool success = IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        require(success, "SomMemo: Token transfer failed");

        bool found = false;
        for (uint256 i = 0; i < vaultTokens[msg.sender].length; i++) {
            if (vaultTokens[msg.sender][i].tokenAddress == _tokenAddress) {
                vaultTokens[msg.sender][i].amount += _amount;
                found = true;
                break;
            }
        }

        if (!found) {
            vaultTokens[msg.sender].push(TokenAsset({
                tokenAddress: _tokenAddress,
                amount: _amount
            }));
        }

        emit DepositToken(msg.sender, _tokenAddress, _amount);
    }

    function depositNFT(address _nftContract, uint256 _tokenId) external onlyActiveWill {
        require(IERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "SomMemo: Not the owner of the NFT");
        IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        vaultNFTs[msg.sender].push(NFTAsset({
            nftContract: _nftContract,
            tokenId: _tokenId
        }));

        emit DepositNFT(msg.sender, _nftContract, _tokenId);
    }

    function withdraw() external onlyActiveWill {
        uint256 sttAmount = vaultSTT[msg.sender];
        vaultSTT[msg.sender] = 0;
        
        uint256 tokenCount = vaultTokens[msg.sender].length;
        for (uint256 i = 0; i < tokenCount; i++) {
            TokenAsset memory asset = vaultTokens[msg.sender][i];
            if (asset.amount > 0) {
                IERC20(asset.tokenAddress).transfer(msg.sender, asset.amount);
            }
        }
        delete vaultTokens[msg.sender];

        uint256 nftCount = vaultNFTs[msg.sender].length;
        for (uint256 i = 0; i < nftCount; i++) {
            NFTAsset memory nft = vaultNFTs[msg.sender][i];
            IERC721(nft.nftContract).safeTransferFrom(address(this), msg.sender, nft.tokenId);
        }
        delete vaultNFTs[msg.sender];

        if (sttAmount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: sttAmount}("");
            require(sent, "SomMemo: Failed to send STT");
        }

        emit Withdrawn(msg.sender, sttAmount);
    }

    function updateBeneficiary(address _newBeneficiary) external onlyActiveWill {
        require(_newBeneficiary != address(0), "SomMemo: Invalid beneficiary address");
        require(_newBeneficiary != msg.sender, "SomMemo: Cannot be yourself");

        wills[msg.sender].beneficiary = _newBeneficiary;
        emit BeneficiaryUpdated(msg.sender, _newBeneficiary);
    }

    function updateInactiveperiod(uint256 _newDays) external onlyActiveWill {
        require(
            _newDays == 30 || _newDays == 90 || _newDays == 180 || _newDays == 365, 
            "SomMemo: Period is not valid"
        );

        Will storage will = wills[msg.sender];

        reactivityPrecompile.unsubscribe(will.subscriptionId);
        delete subscriptionIdToOwner[will.subscriptionId];

        uint256 newPeriodSec = _newDays * 1 days;
        uint256 newDeadlineMs = (block.timestamp + newPeriodSec) * 1000;
        uint256 newSubId = _createScheduleSubscription(newDeadlineMs);

        will.inactivePeriod = newPeriodSec;
        will.deadlineTimestamp = newDeadlineMs;
        will.subscriptionId = newSubId;
        will.lastCheckIn = block.timestamp;

        subscriptionIdToOwner[newSubId] = msg.sender;
    }

    function deactive() external onlyActiveWill {
        Will storage will = wills[msg.sender];

        reactivityPrecompile.unsubscribe(will.subscriptionId);
        delete subscriptionIdToOwner[will.subscriptionId];
        will.active = false;

        emit WillDeactivates(msg.sender);

        uint256 sttAmount = vaultSTT[msg.sender];
        vaultSTT[msg.sender] = 0;

        uint256 tokenCount = vaultTokens[msg.sender].length;
        for (uint256 i = 0; i < tokenCount; i++) {
            TokenAsset memory asset = vaultTokens[msg.sender][i];
            if (asset.amount > 0) {
                IERC20(asset.tokenAddress).transfer(msg.sender, asset.amount);
            }
        }
        delete vaultTokens[msg.sender];

        uint256 nftCount = vaultNFTs[msg.sender].length;
        for (uint256 i = 0; i < nftCount; i++) {
            NFTAsset memory nft = vaultNFTs[msg.sender][i];
            IERC721(nft.nftContract).safeTransferFrom(address(this), msg.sender, nft.tokenId);
        }
        delete vaultNFTs[msg.sender];

        if (sttAmount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: sttAmount}("");
            require(sent, "SomMemo: Failed to send STT");
        }
    }

    function getWillInfo(address _owner) external view returns (
        address beneficiary,
        uint256 lastCheckIn,
        uint256 inactivePeriod,
        uint256 deadlineTimestamp,
        bool executed,
        bool active
    ) {
        Will storage will = wills[_owner];
        return (
            will.beneficiary,
            will.lastCheckIn,
            will.inactivePeriod,
            will.deadlineTimestamp,
            will.executed,
            will.active
        );
    }

    function getStatus(address _owner) external view returns (string memory) {
        Will storage will = wills[_owner];

        if (!will.active || will.executed) return "Inactive";
        uint256 deadlineSec = will.deadlineTimestamp / 1000;
        
        if (block.timestamp >= deadlineSec) return "Inactive";
        uint256 warningThreshold = deadlineSec - (7 * 1 days);

        if (block.timestamp >= warningThreshold) return "Warning";
        return "Active";
    }

    receive() external payable {
        if (wills[msg.sender].active) {
            vaultSTT[msg.sender] += msg.value;
            emit DepositSTT(msg.sender, msg.value);
        }
    }

    function _createScheduleSubscription(uint256 _deadlineMs) internal returns (uint256) {
        ISomniaReactivityPrecompile.SubscriptionData memory data = ISomniaReactivityPrecompile.SubscriptionData({
            eventTopics: [SomniaExtensions.SCHEDULE_SELECTOR, bytes32(_deadlineMs), bytes32(0), bytes32(0)],
            emitter: SomniaExtensions.SOMNIA_REACTIVITY_PRECOMPILE_ADDRESS,
            handlerContractAddress: address(this),
            handlerFunctionSelector: ISomniaEventHandler.onEvent.selector,
            priorityFeePerGas: 1000000000,
            maxFeePerGas: 20000000000,
            gasLimit: 500000,
            isGuaranteed: true,
            isCoalesced: false
        });
        return reactivityPrecompile.subscribe(data);
    }

    function onEvent(
        bytes32[] calldata eventTopics, 
        bytes calldata /*eventData*/) 
        external override {

            require(
                msg.sender == precompileAddress,
                // ↑ Pakai alamat yang disimpan, bukan hardcoded
                "SomMemo: Only Somnia can call this"
            );

            uint256 subId = uint256(eventTopics[0]);
            address owner = subscriptionIdToOwner[subId];
            if (owner == address(0)) return;

            Will storage will = wills[owner];
            if (!will.active || will.executed) return;

            uint256 deadlineSec = will.deadlineTimestamp / 1000;
            if (block.timestamp < deadlineSec) return;

            will.executed = true;
            will.active = false;

            address beneficiary = will.beneficiary;

            uint256 sttAmount = vaultSTT[owner];
            if (sttAmount > 0) {
                vaultSTT[owner] = 0;
                (bool sent, ) = payable(beneficiary).call{value: sttAmount}("");
                require(sent, "SomMemo: Failed to send STT");
            }

            uint256 tokenCount = vaultTokens[owner].length;
            for (uint256 i = 0; i < tokenCount; i++) {
                TokenAsset memory asset = vaultTokens[owner][i];
            if (asset.amount > 0) {
                IERC20(asset.tokenAddress).transfer(beneficiary, asset.amount);
                }
            }
            delete vaultTokens[owner];

            uint256 nftCount = vaultNFTs[owner].length;
            for(uint256 i = 0; i < nftCount; i++) {
                NFTAsset memory nft = vaultNFTs[owner][i];
                IERC721(nft.nftContract).safeTransferFrom(address(this), beneficiary, nft.tokenId);
            }
            delete vaultNFTs[owner];

            emit WillExecuted(owner, beneficiary, block.timestamp);
    }

}