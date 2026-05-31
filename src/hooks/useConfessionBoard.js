import { useState, useEffect, useCallback } from 'react'
import { usePublicClient, useWalletClient, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, CONFESSION_ABI } from '../lib/contract'

export function useConfessionBoard() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [posts, setPosts] = useState([])
  const [pool, setPool] = useState(0n)
  const [timeLeft, setTimeLeft] = useState(0n)
  const [currentWeek, setCurrentWeek] = useState(0n)
  const [loading, setLoading] = useState(true)
  const [txStatus, setTxStatus] = useState(null)
  const [txError, setTxError] = useState(null)
  const [votedPosts, setVotedPosts] = useState(new Set())

  const isDeployed = CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'

  const fetchState = useCallback(async () => {
    if (!publicClient || !isDeployed) {
      setPool(parseUnits('12.45', 6))
      setTimeLeft(432000n)
      setCurrentWeek(0n)
      setPosts(MOCK_POSTS)
      setLoading(false)
      return
    }

    try {
      const [poolRaw, countRaw, weekRaw, timeRaw] = await Promise.all([
        publicClient.readContract({ address: CONTRACT_ADDRESS, abi: CONFESSION_ABI, functionName: 'pool' }),
        publicClient.readContract({ address: CONTRACT_ADDRESS, abi: CONFESSION_ABI, functionName: 'postCount' }),
        publicClient.readContract({ address: CONTRACT_ADDRESS, abi: CONFESSION_ABI, functionName: 'currentWeek' }),
        publicClient.readContract({ address: CONTRACT_ADDRESS, abi: CONFESSION_ABI, functionName: 'timeLeft' }),
      ])

      setPool(poolRaw)
      setCurrentWeek(weekRaw)
      setTimeLeft(timeRaw)

      const count = Number(countRaw)
      if (count > 0) {
        const ids = Array.from({ length: Math.min(count, 50) }, (_, i) => BigInt(i))
        const fetched = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONFESSION_ABI,
          functionName: 'getConfessions',
          args: [ids],
        })
        setPosts(fetched.map(p => ({
          id: Number(p.id),
          author: p.author,
          text: p.text,
          week: Number(p.week),
          upvotes: Number(p.upvotes),
          timestamp: Number(p.timestamp),
          claimed: p.claimed,
        })))
      } else {
        setPosts([])
      }
    } catch (e) {
      console.error('Fetch error:', e)
      setPosts(MOCK_POSTS)
      setPool(parseUnits('12.45', 6))
      setTimeLeft(432000n)
    }
    setLoading(false)
  }, [publicClient, isDeployed])

  const fetchVotedPosts = useCallback(async () => {
    if (!publicClient || !address || !isDeployed || posts.length === 0) return
    try {
      const checks = await Promise.all(
        posts.map(p =>
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONFESSION_ABI,
            functionName: 'hasVoted',
            args: [BigInt(p.id), address],
          })
        )
      )
      const voted = new Set(posts.filter((_, i) => checks[i]).map(p => p.id))
      setVotedPosts(voted)
    } catch (e) {
      console.error(e)
    }
  }, [publicClient, address, posts, isDeployed])

  useEffect(() => { fetchState() }, [fetchState])
  useEffect(() => { fetchVotedPosts() }, [fetchVotedPosts])

  // ─── Post confession (native USDC via msg.value) ──────────────────────────
  const postConfession = useCallback(async (text) => {
    if (!walletClient || !publicClient) throw new Error('Wallet not connected')
    if (!isDeployed) {
      const fake = {
        id: posts.length,
        author: address || '0x0000000000000000000000000000000000000001',
        text,
        week: Number(currentWeek),
        upvotes: 0,
        timestamp: Math.floor(Date.now() / 1000),
        claimed: false,
      }
      setPosts(prev => [fake, ...prev])
      setPool(p => p + parseUnits('0.1', 6))
      return
    }

    try {
      setTxStatus('posting')
      setTxError(null)

      const postTx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONFESSION_ABI,
        functionName: 'post',
        args: [text],
        value: parseUnits('0.1', 6),
      })
      await publicClient.waitForTransactionReceipt({ hash: postTx })

      setTxStatus('success')
      await fetchState()
    } catch (e) {
      setTxStatus('error')
      setTxError(e.shortMessage || e.message || 'Transaction failed')
      throw e
    }
  }, [walletClient, publicClient, address, posts, currentWeek, isDeployed, fetchState])

  // ─── Upvote (native USDC via msg.value) ──────────────────────────────────
  const upvotePost = useCallback(async (postId) => {
    if (votedPosts.has(postId)) return
    if (!isDeployed) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
      setVotedPosts(prev => new Set([...prev, postId]))
      setPool(p => p + parseUnits('0.05', 6))
      return
    }
    if (!walletClient || !publicClient) throw new Error('Wallet not connected')

    try {
      setTxStatus('upvoting')
      setTxError(null)

      const upvoteTx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONFESSION_ABI,
        functionName: 'upvote',
        args: [BigInt(postId)],
        value: parseUnits('0.05', 6),
      })
      await publicClient.waitForTransactionReceipt({ hash: upvoteTx })

      setTxStatus('success')
      setVotedPosts(prev => new Set([...prev, postId]))
      await fetchState()
    } catch (e) {
      setTxStatus('error')
      setTxError(e.shortMessage || e.message || 'Transaction failed')
      throw e
    }
  }, [walletClient, publicClient, votedPosts, isDeployed, fetchState])

  return {
    posts,
    pool,
    timeLeft,
    currentWeek,
    loading,
    txStatus,
    txError,
    votedPosts,
    postConfession,
    upvotePost,
    refresh: fetchState,
    setTxStatus,
    isDeployed,
  }
}

const MOCK_POSTS = [
  { id: 0, author: '0xabc1234567890abc1234567890abc1234567890ab', text: 'I deployed my first smart contract drunk at 3am and it still holds $4k. I check on it like a plant.', week: 0, upvotes: 47, timestamp: Math.floor(Date.now()/1000) - 7200, claimed: false },
  { id: 1, author: '0xdef9876543210def9876543210def9876543210de', text: 'I told my team that feature took 2 weeks of research. I used Claude and it took 40 minutes.', week: 0, upvotes: 38, timestamp: Math.floor(Date.now()/1000) - 18000, claimed: false },
  { id: 2, author: '0x111aaabbbccc222aaabbbccc333aaabbbccc444a', text: 'My entire startup pitch deck is built on a market size number I completely made up. We got funded.', week: 0, upvotes: 31, timestamp: Math.floor(Date.now()/1000) - 28800, claimed: false },
  { id: 3, author: '0x555dddeeeffe666dddeeeffe777dddeeeffe888d', text: 'I have a senior engineer title but I have been copy-pasting from Stack Overflow for 3 years straight. Nobody noticed.', week: 0, upvotes: 22, timestamp: Math.floor(Date.now()/1000) - 50400, claimed: false },
  { id: 4, author: '0x999fffaaabbb000fffaaabbb111fffaaabbb222f', text: 'I ghosted a VC after they said yes. I just got too scared to actually build the thing.', week: 0, upvotes: 19, timestamp: Math.floor(Date.now()/1000) - 72000, claimed: false },
  { id: 5, author: '0xccc333444555ddd333444555eee333444555fff3', text: 'I hate crypto but this is the first dapp that made me feel something. Upvoting anonymously feels weirdly therapeutic.', week: 0, upvotes: 15, timestamp: Math.floor(Date.now()/1000) - 86400, claimed: false },
]