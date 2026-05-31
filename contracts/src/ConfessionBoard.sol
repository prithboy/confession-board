// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ConfessionBoard
/// @notice Anonymous on-chain confession board with weekly USDC prize pool
/// @dev Deployed on Arc Testnet. Uses USDC (6 decimals) as payment token.
contract ConfessionBoard is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Constants ───────────────────────────────────────────────────────────
    uint256 public constant POST_FEE    = 0.10e6;  // 0.10 USDC (6 decimals)
    uint256 public constant UPVOTE_FEE  = 0.05e6;  // 0.05 USDC
    uint256 public constant WEEK        = 7 days;

    // ─── State ───────────────────────────────────────────────────────────────
    IERC20  public immutable usdc;

    uint256 public currentWeek;        // week index (0-based)
    uint256 public weekStart;          // timestamp when current week started
    uint256 public pool;               // current USDC pool (raw units)
    uint256 public postCount;          // total posts ever

    struct Confession {
        uint256 id;
        address author;
        string  text;
        uint256 week;
        uint256 upvotes;
        uint256 timestamp;
        bool    claimed;
    }

    // postId => Confession
    mapping(uint256 => Confession) public confessions;

    // week => top post id
    mapping(uint256 => uint256) public weekWinner;

    // week => highest upvote count (for tracking winner)
    mapping(uint256 => uint256) public weekTopVotes;

    // postId => voter => voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // ─── Events ──────────────────────────────────────────────────────────────
    event ConfessionPosted(uint256 indexed id, address indexed author, string text, uint256 week, uint256 timestamp);
    event Upvoted(uint256 indexed postId, address indexed voter, uint256 newTotal);
    event WeekSettled(uint256 indexed week, uint256 indexed winnerPostId, address indexed winner, uint256 prize);
    event PoolIncreased(uint256 newTotal);

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(address _usdc) {
        usdc      = IERC20(_usdc);
        weekStart = block.timestamp;
        currentWeek = 0;
    }

    // ─── Core Actions ────────────────────────────────────────────────────────

    /// @notice Post an anonymous confession. Costs POST_FEE USDC.
    /// @param text The confession text (max 280 chars enforced off-chain)
    function post(string calldata text) external nonReentrant {
        require(bytes(text).length > 0,   "Empty confession");
        require(bytes(text).length <= 560, "Too long"); // 280 utf8 chars ~= 560 bytes

        usdc.safeTransferFrom(msg.sender, address(this), POST_FEE);
        pool += POST_FEE;

        uint256 id = postCount++;
        confessions[id] = Confession({
            id:        id,
            author:    msg.sender,
            text:      text,
            week:      currentWeek,
            upvotes:   0,
            timestamp: block.timestamp,
            claimed:   false
        });

        emit ConfessionPosted(id, msg.sender, text, currentWeek, block.timestamp);
        emit PoolIncreased(pool);
    }

    /// @notice Upvote a confession from the current week. Costs UPVOTE_FEE USDC.
    /// @param postId The id of the confession to upvote
    function upvote(uint256 postId) external nonReentrant {
        Confession storage c = confessions[postId];
        require(c.timestamp != 0,           "Post does not exist");
        require(c.week == currentWeek,      "Can only upvote current week posts");
        require(!hasVoted[postId][msg.sender], "Already voted");
        require(c.author != msg.sender,     "Cannot upvote own post");

        usdc.safeTransferFrom(msg.sender, address(this), UPVOTE_FEE);
        pool += UPVOTE_FEE;
        hasVoted[postId][msg.sender] = true;
        c.upvotes += 1;

        // Track weekly leader
        if (c.upvotes > weekTopVotes[currentWeek]) {
            weekTopVotes[currentWeek] = c.upvotes;
            weekWinner[currentWeek]   = postId;
        }

        emit Upvoted(postId, msg.sender, c.upvotes);
        emit PoolIncreased(pool);
    }

    /// @notice Settle the current week and pay out the winner.
    ///         Anyone can call this once the week has elapsed.
    function settle() external nonReentrant {
        require(block.timestamp >= weekStart + WEEK, "Week not over yet");

        uint256 settledWeek = currentWeek;
        uint256 prize       = pool;
        uint256 winnerId    = weekWinner[settledWeek];

        // Advance to next week
        currentWeek += 1;
        weekStart    = block.timestamp;
        pool         = 0;

        if (prize == 0) {
            emit WeekSettled(settledWeek, winnerId, address(0), 0);
            return;
        }

        Confession storage winner = confessions[winnerId];

        // Edge case: if no posts this week, carry pool forward
        if (winner.timestamp == 0 || winner.week != settledWeek) {
            pool = prize; // carry over
            emit WeekSettled(settledWeek, 0, address(0), 0);
            return;
        }

        winner.claimed = true;
        usdc.safeTransfer(winner.author, prize);

        emit WeekSettled(settledWeek, winnerId, winner.author, prize);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    /// @notice Returns seconds remaining in the current week
    function timeLeft() external view returns (uint256) {
        uint256 elapsed = block.timestamp - weekStart;
        if (elapsed >= WEEK) return 0;
        return WEEK - elapsed;
    }

    /// @notice Returns a batch of confessions by ids
    function getConfessions(uint256[] calldata ids) external view returns (Confession[] memory) {
        Confession[] memory result = new Confession[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = confessions[ids[i]];
        }
        return result;
    }

    /// @notice Returns total pool in human-readable USDC (6 decimals)
    function poolUSDC() external view returns (uint256) {
        return pool;
    }
}
