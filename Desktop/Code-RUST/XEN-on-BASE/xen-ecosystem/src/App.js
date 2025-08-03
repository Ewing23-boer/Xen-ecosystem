import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "./contractABI.json";
import "./App.css";

const contractAddress = "0xa4a286158c29dE7419598c79986124D085dC8D8e";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [totalPosts, setTotalPosts] = useState(0);
  const [contract, setContract] = useState(null);
  const [language, setLanguage] = useState("fr");

  // Initialise le contrat quand walletAddress change
  useEffect(() => {
    const initContract = async () => {
      if (!walletAddress) {
        setContract(null);
        setTotalPosts(0);
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        // ✅ Utiliser directement contractABI car c’est déjà un tableau
        const socialContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(socialContract);

        const postsCount = await socialContract.totalPosts();
        setTotalPosts(Number(postsCount));
      } catch (err) {
        console.error("Erreur init contract:", err);
      }
    };
    initContract();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert(
        language === "fr"
          ? "Veuillez installer MetaMask ou Coinbase Wallet"
          : "Please install MetaMask or Coinbase Wallet"
      );
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setContract(null);
    setPostContent("");
    setTotalPosts(0);
  };

  const createPost = async () => {
    if (!contract) {
      alert(
        language === "fr"
          ? "Connectez votre wallet d'abord."
          : "Please connect your wallet first."
      );
      return;
    }
    if (!postContent.trim()) {
      alert(
        language === "fr"
          ? "Le contenu du post ne peut pas être vide."
          : "Post content cannot be empty."
      );
      return;
    }
    try {
      console.log("📤 Création du post avec contenu:", postContent);
      const tx = await contract.createPost(postContent);
      console.log("✅ Transaction envoyée. Hash :", tx.hash);

      await tx.wait(); // attendre confirmation
      console.log("📦 Transaction confirmée");

      alert(
        language === "fr"
          ? "Post créé avec succès !"
          : "Post created successfully!"
      );
      setPostContent("");

      const postsCount = await contract.totalPosts();
      console.log(
        "📊 Nombre total de posts récupéré :",
        postsCount.toString()
      );
      setTotalPosts(Number(postsCount));
    } catch (err) {
      console.error("❌ Erreur création post :", err);
      alert(
        language === "fr"
          ? "Erreur lors de la création du post."
          : "Error creating the post."
      );
    }
  };

  return (
    <div className="app-container">
      <div className="top-bar">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>

        <div className="wallet-section">
          {!walletAddress ? (
            <button onClick={connectWallet}>
              {language === "fr" ? "Connecter Wallet" : "Connect Wallet"}
            </button>
          ) : (
            <div>
              <p>
                {language === "fr"
                  ? "Wallet connecté :"
                  : "Wallet connected:"}{" "}
                {walletAddress}
              </p>
              <button
                onClick={disconnectWallet}
                className="disconnect-button"
              >
                {language === "fr" ? "Déconnecter" : "Disconnect"}
              </button>
            </div>
          )}
        </div>
      </div>

      <h1>
        {language === "fr"
          ? "Xen Ecosystem - Réseau Social"
          : "Xen Ecosystem - Social Network"}
      </h1>

      <img
        src="/logo.jpg"
        alt="Logo Xen Ecosystem"
        style={{ maxWidth: "200px", margin: "20px 0" }}
      />

      {walletAddress && (
        <>
          <div>
            <textarea
              rows={4}
              placeholder={
                language === "fr"
                  ? "Écris ton post ici..."
                  : "Write your post here..."
              }
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <button onClick={createPost} disabled={!contract}>
              {language === "fr" ? "Créer un Post" : "Create Post"}
            </button>
          </div>
          <p>
            {language === "fr" ? "Total posts :" : "Total posts:"}{" "}
            {totalPosts}
          </p>
        </>
      )}
    </div>
  );
}

export default App;
