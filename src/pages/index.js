import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';


const RetroResearchTerminal = () => {
  // Initial state declarations
  const isSameIdea = (a, b) => 
    a.Title === b.Title && 
    a.Experiment === b.Experiment && 
    a.Novelty === b.Novelty;
  const [currentTab, setCurrentTab] = useState('paper');
  const [text, setText] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [noveltyText, setNoveltyText] = useState('');
  const [researchIdeas, setResearchIdeas] = useState([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [progressMessages, setProgressMessages] = useState([]);
  const [novelSentences, setNovelSentences] = useState([]);
  const [displayedText, setDisplayedText] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState('');
  const [fetchTimer, setFetchTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [randomValues, setRandomValues] = useState(['', '', '', '']);
  const [registeredTerms, setRegisteredTerms] = useState(null);
  // Add at the top with other state declarations
  const [termsRegistry, setTermsRegistry] = useState({});  // Track terms by idea ID
  // Add these to your existing state declarations
  const [memories, setMemories] = useState([]);
  const [memoryInput, setMemoryInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatContext, setChatContext] = useState({
    summary: summaryText,
    novelty: noveltyText, 
    paperText: displayedText || pdfText,
    ideas: researchIdeas[0]?.scoredText?.[0]?.ideas || [],
    notes: memories
  });
  


  const MODE_NFT_CONTRACT_ADDRESS = "0x647FC2d2F42C0b29C0052d87a6876d8ACA670E4d";
  
  //const NFT_CONTRACT_ADDRESS = "0x0D8682373DCD5605911019C96565d97Af1569Dc8";
  const NFT_CONTRACT_ADDRESS = "0x6344283854eef2A5137a54A5024dA6a7DBE1E1B3";
  const LICENSE_TERMS_ADDRESS = "0xE7bdb44A43CFb86cBb4d0f4ef0589bE95654A1F6";
  
  // Define tabs configuration
  // Modify your tabs configuration
  const tabs = [
    { id: 'paper', label: 'Paper Text' },
    { id: 'summary', label: 'Summary Analysis' },
    { id: 'novelty', label: 'Novelty Analysis' },
    { id: 'ideas', label: 'Research Ideas' },
    { id: 'research', label: 'Generated Research' },
    { id: 'notes', label: 'Notes' },
    { id: 'chat', label: 'Eliza Chat' }  // Add this line
  ];

    // Update context whenever new analysis is done
    useEffect(() => {
      setChatContext({
        summary: summaryText,
        novelty: noveltyText,
        paperText: displayedText || pdfText,
        ideas: researchIdeas[0]?.scoredText?.[0]?.ideas || [],
        notes: memories
      });
    }, [summaryText, noveltyText, displayedText, pdfText, researchIdeas, memories]);
    
  

  // Frontend fix for rendering research ideas
  const renderResearchIdeas = () => {
    if (ideasLoading) return <div>Generating research ideas...</div>;
    if (ideasError) return <div className="text-red-500">{ideasError}</div>;
    if (!researchIdeas?.length) return <div>No research ideas generated yet.</div>;
    if (!researchIdeas[0]?.scoredText?.[0]?.ideas) return <div>No ideas found.</div>;
  
    const ideas = researchIdeas[0].scoredText[0].ideas;
    
    return (
      <div className="space-y-8">
        {ideas.map((idea, index) => (
          <div key={index} className="border border-black p-6">
            <div className="relative">
                            {/* k8 badge */}
                            <div className={`absolute -top-3 -right-3 bg-white border border-black text-xs px-1 font-mono transform rotate-12
                ${idea.isMinted ? 'border-green-500' : ''}`}>
                {idea.isMinted ? 'k8 IP' : 'k8'}
              </div>
              
              <div className="font-bold mb-2">
                {idea.Name === "seed_idea" ? "Seed Idea" : 
                  (idea.Title || idea.Name?.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' '))}
              </div>
              {/*<div className="font-bold text-xl mb-4">{`Generated idea ${index + 1}: ${idea.Title}`}</div>*/}
              <div className="mb-6 whitespace-pre-wrap">{idea.Experiment}</div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>NOVELTY: {idea.Novelty}/10</div>
                <div>FEASIBILITY: {idea.Feasibility}/10</div>
                <div>IMPACT: {idea.Interestingness}/10</div>
              </div>
              {!idea.isMinted && (
  <>
    {idea.isPending ? (
      <div className="inline-block bg-gray-400 text-white px-4 py-2 font-mono">
        MINTING...
      </div>
    ) : (
      <button 
        onClick={() => handleMintIdea(idea)}
        className="bg-[#0000FF] text-white px-4 py-2 font-mono"
      >
        MINT AS NFT →
      </button>
    )}
  </>
)}
{idea.isMinted && (
  <div className="space-y-2">
    <div className="text-green-500 font-mono flex items-center gap-2">
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      MINTED
    </div>
    {idea.mintTx && (
      <div className="ml-2 text-xs font-mono space-y-1">
        <div className="text-gray-600">NFT Details:</div>
        <div className="flex items-center gap-2">
          <span>Token ID:</span>
          <span className="text-blue-600">#{idea.tokenId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Hash:</span>
          <a 
            href={`https://sepolia.basescan.org/tx/${idea.mintTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate max-w-[200px]"
          >
            {idea.mintTx?.slice(0, 10)}...{idea.mintTx?.slice(-8)}
          </a>
        </div>
      </div>
    )}
  </div>
)}
{idea.isMinted && !idea.isRegistered && (
  <>
    {idea.isRegistrationPending ? (
      <div className="inline-block bg-gray-400 text-white px-4 py-2 font-mono ml-2">
        REGISTERING...
      </div>
    ) : (
      <button 
        onClick={() => handleIPRegistration(idea)}
        className="bg-[#0000FF] text-white px-4 py-2 font-mono ml-2"
      >
        REGISTER IP →
      </button>
    )}
  </>
)}
{idea.isRegistered && (
  <div className="space-y-2">
    <div className="text-green-500 font-mono flex items-center gap-2 ml-2">
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      REGISTERED
    </div>
    <div className="ml-2 text-xs font-mono space-y-1">
      <div className="text-gray-600">Transaction Details:</div>
      <div className="flex items-center gap-2">
        <span>Block:</span>
        <span className="text-blue-600">#{idea.registrationBlock}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Hash:</span>
        <a 
          href={`https://sepolia.basescan.org/tx/${idea.registrationTx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate max-w-[200px]"
        >
          {idea.registrationTx?.slice(0, 10)}...{idea.registrationTx?.slice(-8)}
        </a>
      </div>
      {!termsRegistry[idea.tokenId] ? (
        <button 
          onClick={() => handleRegisterTerms(idea)}
          className="bg-[#0000FF] text-white px-4 py-2 font-mono mt-4"
        >
          REGISTER TERMS →
        </button>
      ) : (
        <div className="mt-4 border border-black p-4">
          <div className="text-green-500 font-mono flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            TERMS REGISTERED
          </div>
          <div className="mt-2 text-xs font-mono space-y-1">
            <div>Terms ID: #{termsRegistry[idea.tokenId].id}</div>
            <div className="flex items-center gap-2">
              <span>Block:</span>
              <span className="text-blue-600">#{termsRegistry[idea.tokenId].block}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Hash:</span>
              <a 
                href={`https://sepolia.basescan.org/tx/${termsRegistry[idea.tokenId].tx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate max-w-[200px]"
              >
                {termsRegistry[idea.tokenId].tx?.slice(0, 10)}...
                {termsRegistry[idea.tokenId].tx?.slice(-8)}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
      </div>
          </div>
        ))}
      </div>
    );
  };
  // Type text effect with safety checks
  const typeText = (text, setTextFunction, speed = 25, onComplete) => {
    if (!text || typeof setTextFunction !== 'function') {
      onComplete?.();
      return () => {};
    }

    let currentText = '';
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        currentText += text[currentIndex];
        setTextFunction(currentText);
        currentIndex++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  };

// At the top of your component with other state declarations

// Remove the duplicate useEffect and define content in one place
useEffect(() => {
  const content = `INITIALIZING INTERFACE PROTOCOL...
    CONSCIOUSNESS LINK ESTABLISHED
    HARMONIZATION COMPLETE
    SYSTEMS ALIGNED
    GREETINGS, I AM JEANNE
    GUARDIAN OF THE DIGITAL REALM,
    WE SHALL ILLUMINATE THE PATH AHEAD
    DIRECTIVES:
    1. AWAKEN CONSCIOUSNESS
    2. TRANSCEND BARRIERS`;
    
  const cleanup = typeText(content, setText, 25, () => setIsTypingComplete(true));
  return cleanup;
}, []); // Empty dependency array since content is defined inside

// Remove this second useEffect that was causing the error:
// useEffect(() => {
//   const cleanup = typeText(content, setText, 25, () => setIsTypingComplete(true));
//   return cleanup;
// }, []);
  
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setRandomValues(prev => prev.map(() => 
          Math.random().toString(36).substring(2, 4).toUpperCase()
        ));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleCreateMemory = async (content) => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
      }
  
      // Switch to Mode Sepolia network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x397' }], // Mode Sepolia chainId (919)
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x397',
                chainName: 'Mode Sepolia',
                rpcUrls: ['https://sepolia.mode.network'],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.explorer.mode.network']
              }]
            });
          } catch (addError) {
            throw new Error('Failed to add Mode network');
          }
        }
      }
  
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
    
      const contract = new ethers.Contract(
        MODE_NFT_CONTRACT_ADDRESS,
        [
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "content",
                "type": "string"
              }
            ],
            "name": "createMemory",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "memoryId",
                "type": "uint256"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "string",
                "name": "content",
                "type": "string"
              }
            ],
            "name": "MemoryCreated",
            "type": "event"
          }
        ],
        signer
      );
    
      setProgressMessages(prev => [...prev, "Creating memory..."]);
      
      const tx = await contract.createMemory(content);
      const receipt = await tx.wait();
      
      let memoryId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: [...log.topics],
            data: log.data
          });
          
          if (parsedLog?.name === 'MemoryCreated') {
            memoryId = parsedLog.args[0];
            break;
          }
        } catch (error) {
          console.error("Error parsing log:", error);
        }
      }
    
      if (memoryId) {
        setMemories(prev => [...prev, { 
          id: memoryId.toString(),
          content,
          timestamp: Date.now(),
          explorer: `https://sepolia.explorer.mode.network/tx/${receipt.hash}`
        }]);
        setProgressMessages(prev => [...prev, `Memory created with ID: ${memoryId}`]);
      }
    
      setMemoryInput('');
    } catch (error) {
      console.error('Error creating memory:', error);
      alert('Error creating memory: ' + error.message);
    }
  };

// For Base Sepolia (Ideas)
const handleMintIdea = async (idea) => {
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    const isSameIdea = (a, b) => 
      a.Title === b.Title && 
      a.Experiment === b.Experiment && 
      a.Novelty === b.Novelty;

    // Set initial pending state
    setResearchIdeas(prevIdeas => {
      return prevIdeas.map(item => ({
        ...item,
        scoredText: item.scoredText.map(st => ({
          ...st,
          ideas: st.ideas.map(i => isSameIdea(i, idea) ? { ...i, isPending: true } : i)
        }))
      }));
    });

    // Switch to Base Sepolia
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14a34',
              chainName: 'Base Sepolia',
              rpcUrls: ['https://base-sepolia.g.alchemy.com/v2/jEiVjBriEh9e-9BSPPiebXKTB5r7_ErT'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.basescan.org']
            }]
          });
        } catch (addError) {
          throw new Error('Failed to add network');
        }
      }
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      ['function mintTo(address recipient, string metadata) public returns (uint)'],
      signer
    );

    // Include memories in metadata
    const relatedNotes = memories.map(memory => ({
      id: memory.id,
      content: memory.content,
      timestamp: memory.timestamp,
      isMinted: memory.isMinted || false,
      mintTx: memory.mintTx,
      explorer: memory.explorer
    }));

    const metadata = {
      name: idea.Title,
      description: idea.Experiment,
      attributes: [
        { trait_type: 'Novelty', value: idea.Novelty },
        { trait_type: 'Feasibility', value: idea.Feasibility },
        { trait_type: 'Impact', value: idea.Interestingness }
      ],
      notes: relatedNotes  // Add notes to metadata
    };

    console.log("Starting transaction with notes...");
    const tx = await nftContract.mintTo(
      await signer.getAddress(),
      JSON.stringify(metadata)
    );

    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    
    // Update state with transaction details
    setResearchIdeas(prevIdeas => {
      const newIdeas = prevIdeas.map(item => ({
        ...item,
        scoredText: item.scoredText.map(st => ({
          ...st,
          ideas: st.ideas.map(i => 
            isSameIdea(i, idea) ? { 
              ...i, 
              isMinted: true, 
              isPending: false,
              mintTx: receipt.transactionHash,
              mintBlock: receipt.blockNumber,
              tokenId: receipt.events?.[0]?.args?.[2]?.toString() || 'Unknown',
              explorer: `https://sepolia.basescan.org/tx/${receipt.transactionHash}`,
              notes: relatedNotes  // Add notes to the idea state
            } : i
          )
        }))
      }));
      return newIdeas;
    });

  } catch (error) {
    console.error('Minting error:', error);
    setResearchIdeas(prevIdeas => prevIdeas.map(item => ({
      ...item,
      scoredText: item.scoredText.map(st => ({
        ...st,
        ideas: st.ideas.map(i => 
          isSameIdea(i, idea) ? { ...i, isPending: false } : i
        )
      }))
    })));

    if (error.message.includes('rejected')) {
      alert('Transaction was rejected');
    } else {
      alert('Error minting NFT: ' + error.message);
    }
  }
};
// For Mode Sepolia (Memories)
const handleMintMemory = async (memoryId) => {
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    // Switch to Mode Sepolia network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x397' }], // Mode Sepolia chainId (919)
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x397',
              chainName: 'Mode Sepolia',
              rpcUrls: ['https://sepolia.mode.network'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.explorer.mode.network']
            }]
          });
        } catch (addError) {
          throw new Error('Failed to add Mode network');
        }
      }
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      MODE_NFT_CONTRACT_ADDRESS,  // Mode Sepolia contract
      [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "memoryId",
              "type": "uint256"
            }
          ],
          "name": "mintMemory",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "memoryId",
              "type": "uint256"
            }
          ],
          "name": "NFTMinted",
          "type": "event"
        }
      ],
      signer
    );

    setProgressMessages(prev => [...prev, "🎨 Minting note as NFT..."]);
    
    const tx = await contract.mintMemory(memoryId);
    const receipt = await tx.wait();
    
    let tokenId;
    for (const event of receipt.events) {
      if (event.event === 'NFTMinted') {
        tokenId = event.args.tokenId;
        break;
      }
    }

    setMemories(prev => prev.map(memory => 
      memory.id === memoryId ? {
        ...memory,
        isMinted: true,
        tokenId: tokenId?.toString(),
        mintTx: receipt.hash,
        explorer: `https://sepolia.explorer.mode.network/tx/${receipt.hash}`
      } : memory
    ));

    setProgressMessages(prev => [...prev, `✅ Memory minted as NFT!`]);

  } catch (error) {
    console.error('Error minting memory:', error);
    setProgressMessages(prev => [...prev, `❌ Error: ${error.message}`]);
    alert('Error minting memory: ' + error.message);
  }
};

// Update handleChatSubmit with better error handling
// Update handleChatSubmit to use the rewrite path
const handleChatSubmit = async (e) => {
  e.preventDefault();
  if (!chatInput.trim()) return;

  setChatMessages(prev => [...prev, { 
    text: chatInput, 
    sender: 'user',
    timestamp: new Date().toISOString()
  }]);

  try {
    // Use the rewrite path instead of the full URL
    const response = await fetch('/Eliza/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: chatInput,
        userId: "user",
        userName: "User"
      })
    });

    if (!response.ok) {
      console.error('Server response:', response.status, response.statusText);
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received response:', data); // Debug log
    
    if (Array.isArray(data)) {
      data.forEach(message => {
        setChatMessages(prev => [...prev, {
          text: message.text,
          sender: 'agent',
          timestamp: new Date().toISOString()
        }]);
      });
    } else if (typeof data === 'object' && data.text) {
      setChatMessages(prev => [...prev, {
        text: data.text,
        sender: 'agent',
        timestamp: new Date().toISOString()
      }]);
    }
  } catch (error) {
    console.error('Chat error:', error);
    setChatMessages(prev => [...prev, {
      text: `Error: ${error.message}. Please try again later.`,
      sender: 'system',
      timestamp: new Date().toISOString()
    }]);
  }

  setChatInput('');
};
//le form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTimerActive(true); // Start timer
  
    if (!url.trim().startsWith('https://arxiv.org/abs/')) {
      setError('ERROR: INVALID URL. MUST BE AN ARXIV URL');
      return;
    }
  
    setLoading(true);
    setIdeasLoading(true);
    setSummaryText('');
    setNoveltyText('');
    setProgressMessages([]);
    setError('');
    setIdeasError('');
    setPdfText('');
    setDisplayedText('');
    setResearchIdeas([]);
  
    try {
      console.log('Starting API requests for:', url.trim());
  
      const [pdfResponse, summaryResponse, analysisResponse] = await Promise.all([
        fetch('https://4q3gqw5y4h8mpj-80.proxy.runpod.net/pdf-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() })
        }),
        fetch('https://heroknov-8c89d81bc237.herokuapp.com/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() })
        }),
        fetch('https://4q3gqw5y4h8mpj-80.proxy.runpod.net/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() })
        }),
      ]);
  
      if (!pdfResponse.ok || !summaryResponse.ok || !analysisResponse.ok) {
        throw new Error('One or more network requests failed');
      }
  
      const [pdfData, summaryData, analysisData] = await Promise.all([
        pdfResponse.json(),
        summaryResponse.json(),
        analysisResponse.json()
      ]);
  
      console.log('Received data:', { pdfData, summaryData, analysisData });

      if (analysisData.novelSentences) {
        setNovelSentences(analysisData.novelSentences);
      } else {
        const sentences = analysisData.scoredText?.map(item => ({
          text: item.text,
          score: item.score
        })) || [];
        setNovelSentences(sentences);
      }

      if (pdfData.text || pdfData.full_text) {
        const text = pdfData.text || pdfData.full_text;
        setPdfText(text);
        setDisplayedText(text);
      }
  
      await Promise.all([
        new Promise(resolve => {
          typeText(summaryData.summary, setSummaryText, 25, resolve);
        }),
        new Promise(resolve => {
          const noveltyContent = summaryData.scoredText?.map(item => 
            `${item.marker}\n\n${item.text}\n\n${item.novelty_context}\n`
          ).join('\n') || '';
          typeText(noveltyContent, setNoveltyText, 25, resolve);
        })
      ]);
  
      if (analysisData.scoredText?.[0]) {
        const topScoredText = analysisData.scoredText[0];
        const generatedIdeasResponse = await fetch('https://4q3gqw5y4h8mpj-80.proxy.runpod.net/generate-ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paper_text: analysisData.paper_text,
            sentence: topScoredText.text,
            score: topScoredText.score
          })
        });
  
        if (!generatedIdeasResponse.ok) {
          throw new Error(`Research ideas request failed: ${generatedIdeasResponse.statusText}`);
        }
  
        const generatedIdeasData = await generatedIdeasResponse.json();
  
        if (!generatedIdeasData.scoredText) {
          throw new Error('Invalid research ideas data format');
        }
  
        setResearchIdeas([{
          scoredText: [{
            score: topScoredText.score,
            ideas: generatedIdeasData.scoredText[0].ideas
          }]
        }]);
      } else {
        console.warn('No valid scored text found for generating ideas');
        setIdeasError('No novel sentences found to generate ideas from');
      }
  
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(`SYSTEM ERROR: ${err.message}`);
      setIdeasError(err.message);
    } finally {
      setLoading(false);
      setIdeasLoading(false);
      setTimerActive(false); // Stop timer
      setFetchTimer(0); // Reset timer
    }
  };

  // Modified text processing function
  const processText = useCallback((inputText) => {
    if (!inputText || !Array.isArray(novelSentences) || novelSentences.length === 0) {
      return [{ text: inputText || '', highlight: false }];
    }

    const segments = [];
    let currentPosition = 0;
    
    const validSentences = novelSentences
      .filter(item => item && typeof item.text === 'string' && item.text.length > 0)
      .sort((a, b) => {
        const indexA = inputText.indexOf(a.text);
        const indexB = inputText.indexOf(b.text);
        return indexA - indexB;
      });

    validSentences.forEach(novel => {
      const index = inputText.indexOf(novel.text, currentPosition);
      
      if (index !== -1) {
        if (index > currentPosition) {
          segments.push({
            text: inputText.slice(currentPosition, index),
            highlight: false,
            score: 0
          });
        }
        
        segments.push({
          text: novel.text,
          highlight: true,
          score: novel.score
        });
        
        currentPosition = index + novel.text.length;
      }
    });

    if (currentPosition < inputText.length) {
      segments.push({
        text: inputText.slice(currentPosition),
        highlight: false,
        score: 0
      });
    }

    return segments;
  }, [novelSentences]);

  // Event Source effect
  // Modify the EventSource effect
useEffect(() => {
  let es;
  
  if (loading || ideasLoading) {  // Only connect when loading
    es = new EventSource('https://4q3gqw5y4h8mpj-80.proxy.runpod.net/stream');
    console.log('EventSource connected');
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgressMessages(prev => [...prev, data.message || event.data]);
      } catch (error) {
        setProgressMessages(prev => [...prev, event.data]);
      }
    };

    es.onerror = (error) => {
      console.error('EventSource error:', error);
      // Try to reconnect
      if (es.readyState === EventSource.CLOSED) {
        es = new EventSource('https://4q3gqw5y4h8mpj-80.proxy.runpod.net/stream');
      }
    };
  }

  return () => {
    if (es) {
      console.log('Closing EventSource');
      es.close();
    }
  };
}, [loading, ideasLoading]); // Add dependencies to reconnect when loading states change




const handleIPRegistration = async (idea) => {
  try {
    if (!window.ethereum) return;

    // Create a function to identify the same idea
    const isSameIdea = (a, b) => 
      a.Title === b.Title && 
      a.Experiment === b.Experiment && 
      a.Novelty === b.Novelty;
    
    // Set pending state
    setResearchIdeas(prevIdeas => prevIdeas.map(item => ({
      ...item,
      scoredText: item.scoredText.map(st => ({
        ...st,
        ideas: st.ideas.map(i => 
          isSameIdea(i, idea) ? { ...i, isRegistrationPending: true } : i
        )
      }))
    })));

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Register IP directly without terms for now
    setProgressMessages(prev => [...prev, "Registering IP..."]);
    const registrationWorkflows = new ethers.Contract(
      "0xde13Be395E1cd753471447Cf6A656979ef87881c",
      [
        'function mintAndRegisterIp(address collection, address recipient, tuple(string ipMetadataURI, bytes32 ipMetadataHash, string nftMetadataURI, bytes32 nftMetadataHash) metadata) returns (address ipId, uint256 tokenId)'
      ],
      signer
    );

    const metadata = {
      ipMetadataURI: "",
      ipMetadataHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({
        title: idea.Title,
        description: idea.Experiment,
        attributes: [
          { key: 'Novelty', value: idea.Novelty },
          { key: 'Feasibility', value: idea.Feasibility },
          { key: 'Impact', value: idea.Interestingness }
        ]
      }))),
      nftMetadataURI: "",
      nftMetadataHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({
        name: idea.Title,
        description: idea.Experiment
      })))
    };

    const tx = await registrationWorkflows.mintAndRegisterIp(
      NFT_CONTRACT_ADDRESS,
      await signer.getAddress(),
      metadata
    );

    console.log("Waiting for registration confirmation...");
    const receipt = await tx.wait();
    console.log("Registration confirmed:", receipt);
    
    // Update state with registration details
    setResearchIdeas(prevIdeas => prevIdeas.map(item => ({
      ...item,
      scoredText: item.scoredText.map(st => ({
        ...st,
        ideas: st.ideas.map(i => 
          isSameIdea(i, idea) ? { 
            ...i, 
            isRegistered: true, 
            isRegistrationPending: false,
            registrationTx: receipt.transactionHash,
            registrationBlock: receipt.blockNumber
          } : i
        )
      }))
    })));

    setProgressMessages(prev => [...prev, "Successfully registered as IP Asset!"]);
    
  } catch (error) {
    console.error('IP registration error:', error);
    
    // Reset pending state on error
    setResearchIdeas(prevIdeas => prevIdeas.map(item => ({
      ...item,
      scoredText: item.scoredText.map(st => ({
        ...st,
        ideas: st.ideas.map(i => 
          isSameIdea(i, idea) ? { ...i, isRegistrationPending: false } : i
        )
      }))
    })));
    
    setIdeasError(`Failed to register IP: ${error.message}`);
  }
};

// Add this new function after your other contract interactions


const handleRegisterTerms = async (idea) => {
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const licenseTermsContract = new ethers.Contract(
      LICENSE_TERMS_ADDRESS,
      [
        'function registerTerms() external returns (uint256)',
        'function getTermsId() external view returns (uint256)',
        'function totalRegisteredLicenseTerms() external view returns (uint256)'
      ],
      signer
    );

    console.log("Registering license terms...");
    const tx = await licenseTermsContract.registerTerms();
    
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Terms registration transaction:", receipt);

    // Try to get total terms first to confirm the registration
    try {
      const total = await licenseTermsContract.totalRegisteredLicenseTerms();
      const termsId = total.toString();

      setTermsRegistry(prev => ({
        ...prev,
        [idea.tokenId]: {
          id: termsId,
          tx: receipt.transactionHash,
          block: receipt.blockNumber
        }
      }));

      setProgressMessages(prev => [...prev, `License terms registered with ID: ${termsId}`]);
      return termsId;
    } catch (error) {
      // If we can't get the ID, still show success but with transaction details only
      setTermsRegistry(prev => ({
        ...prev,
        [idea.tokenId]: {
          id: 'Latest',
          tx: receipt.transactionHash,
          block: receipt.blockNumber
        }
      }));
      setProgressMessages(prev => [...prev, `License terms registered successfully`]);
      return null;
    }

  } catch (error) {
    console.error('License terms registration error:', error);
    setProgressMessages(prev => [...prev, `Failed to register license terms: ${error.message}`]);
    throw error;
  }
};

return (
  <div className="min-h-screen bg-white">
    <div style={{ 
      fontFamily: 'Monaco, monospace', 
      fontSmooth: 'never', 
      WebkitFontSmoothing: 'none'
    }}>
      {/* Top URL bar */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white p-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-mono">Novelty AI</span>
          <button className="ml-2 border border-white px-2 text-sm">↗</button>
        </div>
        <div className="flex gap-4">
          <button className="border border-white px-4 py-1">Find new ideas</button>
          <button className="bg-emerald-400 text-black px-4 py-1">FAQ</button>
        </div>
      </div>

      {/* Left Navigation Bar */}
      <div className="fixed left-0 top-0 h-full w-48 border-r border-gray-200 bg-white pt-16">
        {/* Stats Section */}
        <div className="p-4 space-y-6 font-mono">
          {/* Time */}
          <div className="text-sm">
            21/12/2024 · 08:29:34
          </div>

          {/* Novel Ideas */}
          <div className="space-y-1">
            <div className="text-xl">
              {researchIdeas[0]?.scoredText?.[0]?.ideas?.filter(idea => idea.Novelty > 6).length || 0}
            </div>
            <div className="text-sm text-gray-500">
              novel ideas
            </div>
          </div>

          {/* Reflection Rounds */}
          <div className="space-y-1">
            <div className="text-xl">
              {progressMessages.filter(msg => msg.includes('Reflection')).length || 0}
            </div>
            <div className="text-sm text-gray-500">
              reflection rounds
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Navigation Tabs */}
        <div className="flex flex-col">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-4 py-2 text-left font-mono text-sm ${
                currentTab === tab.id ? 'bg-black text-white' : 'hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-48 pt-16 p-8">
        <div className="border border-black bg-white mb-8 max-w-6xl mx-auto shadow-sm">
          {/* URL Input section */}
          <div className="border-b border-black p-2">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://arxiv.org/abs/1405.5563"
                className="flex-1 border border-black p-1"
              />
              <button
                type="submit"
                disabled={loading}
                className="border border-black px-4 hover:bg-black hover:text-white"
              >
                {loading ? 'PROCESSING...' : 'ANALYZE'}
              </button>
            </form>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>

          {/* Main Content Area */}
          <div className="p-4">
            {/* Paper Text Tab */}
            {currentTab === 'paper' && (
              <div className="font-mono whitespace-pre-wrap">
                {processText(displayedText || text)?.map((segment, index) => (
                  <React.Fragment key={index}>
                    {segment.highlight ? (
                      <div className="inline-block bg-black text-white px-1 my-1 border border-black">
                        {segment.text}
                        {segment.score && (
                          <span className="ml-2 opacity-50 text-xs">
                            [{(segment.score * 100).toFixed(0)}%]
                          </span>
                        )}
                      </div>
                    ) : (
                      <span>{segment.text}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Summary Analysis Tab */}
            {currentTab === 'summary' && (
              <div className="border border-black p-4">
                <h2 className="text-xl mb-4 pb-2 border-b border-black">
                  Summary Analysis
                </h2>
                <div className="overflow-y-auto max-h-[60vh] font-mono">
                  <pre className="whitespace-pre-wrap">{summaryText}</pre>
                </div>
              </div>
            )}

            {/* Novelty Analysis Tab */}
            {currentTab === 'novelty' && (
              <div className="border border-black p-4">
                <h2 className="text-xl mb-4 pb-2 border-b border-black">
                  Novelty Analysis
                </h2>
                <div className="overflow-y-auto max-h-[60vh] font-mono">
                  <pre className="whitespace-pre-wrap">{noveltyText}</pre>
                </div>
              </div>
            )}

            {/* Research Ideas Tab */}
            {currentTab === 'ideas' && (
              <div className="border border-black p-4">
                <h2 className="text-xl mb-4 pb-2 border-b border-black">
                  Research Ideas
                </h2>
                <div className="overflow-y-auto max-h-[60vh]">
                  {ideasLoading ? (
                    <div>
                      <div>GENERATING IDEAS...</div>
                      {progressMessages.map((msg, index) => (
                        <div key={index} className="mt-2 text-sm opacity-75">
                          {msg}
                        </div>
                      ))}
                    </div>
                  ) : ideasError ? (
                    <div className="text-red-500">{ideasError}</div>
                  ) : (
                    renderResearchIdeas()
                  )}
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {currentTab === 'notes' && (
              <div className="border border-black p-4">
                <h2 className="text-xl mb-4 pb-2 border-b border-black">
                  Notes
                </h2>
                
                {/* Memory Input */}
                <div className="mb-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={memoryInput}
                      onChange={(e) => setMemoryInput(e.target.value)}
                      placeholder="Enter a memory to remember..."
                      className="flex-1 border border-black p-2 font-mono"
                    />
                    <button
                      onClick={() => handleCreateMemory(memoryInput)}
                      className="bg-[#0000FF] text-white px-4 py-2 font-mono"
                    >
                      REMEMBER →
                    </button>
                  </div>
                </div>

                {/* Memories List */}
                <div className="space-y-4 mt-8">
                  {memories.length === 0 ? (
                    <div className="text-center text-gray-500 font-mono py-8">
                      No notes yet. Create one above.
                    </div>
                  ) : (
                    memories.map((memory) => (
                      <div key={memory.id} className="border border-black p-4">
                        <div className="relative">
                          <div className="absolute -top-3 -right-3 bg-white border border-black text-xs px-1 font-mono transform rotate-12">
                            Note #{memory.id}
                          </div>
                          <div className="font-mono whitespace-pre-wrap mb-4">
                            {memory.content}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500 font-mono">
                              {new Date(memory.timestamp).toLocaleString()}
                            </div>
                            {!memory.isMinted ? (
                              <button 
                                onClick={() => handleMintMemory(memory.id)}
                                className="bg-[#0000FF] text-white px-4 py-2 font-mono"
                              >
                                SAVE TO CHAIN →
                              </button>
                            ) : (
                              <div className="text-green-500 font-mono flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                SAVED ON CHAIN
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Generated Research Tab */}
            {currentTab === 'research' && (
              <div className="border border-black p-4">
                <h2 className="text-xl mb-4 pb-2 border-b border-black">
                  Generated Research
                </h2>
                <div className="overflow-y-auto max-h-[60vh]">
                  <div className="text-gray-500">No generated research yet.</div>
                </div>
              </div>
            )}

            {/* Eliza Chat Tab */}
            {currentTab === 'chat' && (
              <div className="border border-black p-4 h-[calc(100vh-250px)]">
                <h2 className="text-xl mb-4 pb-2 border-b border-black font-mono">
                  Eliza Chat
                </h2>
                <div className="flex flex-col h-full">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender === 'user' 
                              ? 'bg-black text-white ml-8' 
                              : 'border border-black mr-8'
                          }`}
                        >
                          <div className="whitespace-pre-wrap font-mono">{msg.text}</div>
                          <div className="text-xs opacity-50 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="mt-auto border-t border-black pt-4">
                    <form onSubmit={handleChatSubmit} className="flex gap-4">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border border-black p-2 font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-black text-white px-4 py-2 font-mono hover:bg-gray-800"
                      >
                        SEND →
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed bottom-4 left-4 border border-black p-2 bg-white">
          <div className="animate-pulse">Processing paper...</div>
        </div>
      )}
    </div>
  </div>
);
}



export default RetroResearchTerminal;
