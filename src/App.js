import './App.css';
import React, { useEffect, useRef, useState, FC, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig, } from "@nfteyez/sol-rayz";
import { Col, Row, Button, Form, Card, Badge } from "react-bootstrap";
import AlertDismissible from './alert/alertDismissible';
//extras for send transaction
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Keypair, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {Token, TOKEN_PROGRAM_ID} from '@solana/spl-token';
import { toast } from 'react-hot-toast';


function App(props) {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = props;

  // input ref
  const inputRef = useRef();

  // state change
  useEffect(() => {
    setNfts([]);
    setNft("");
    setView("collection");
    setGroupedNfts([]);
    setShow(false);
     if (publicKey) {
       inputRef.current.value = publicKey;
     }
  }, [publicKey, connection]);

  const [nfts, setNfts] = useState([]);
  const [groupedNfts, setGroupedNfts] = useState([]);
  const [view, setView] = useState('collection');
  //alert props
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  //mikes
  const [nft, setNft] = useState("");

  //loading props
  const [loading, setLoading] = useState(false);

  const getNfts = async (e) => {
    e.preventDefault();

    setShow(false);

    let address = inputRef.current.value;

    if (address.length === 0) {
      address = publicKey;
    }

    if (!isValidSolanaAddress(address)) {
      setTitle("Invalid address");
      setMessage("Please enter a valid Solana address or Connect your wallet");
      setLoading(false);
      setShow(true);
      return;
    }

    const connect = createConnectionConfig(connection);

    setLoading(true);
    const nftArray = await getParsedNftAccountsByOwner({
      publicAddress: address,
      connection: connect,
      serialization: true,
    });


    if (nftArray.length === 0) {
      setTitle("No NFTs found in " + props.title);
      setMessage("No NFTs found for address: " + address);
      setLoading(false);
      setView('collection');
      setShow(true);
      return;
    }

    const metadatas = await fetchMetadata(nftArray);
    var group = {};

    for (const nft of metadatas) {
      if (group.hasOwnProperty(nft.data.symbol)) {
        group[nft.data.symbol].push(nft);
      } else {
        group[nft.data.symbol] = [nft];
      }
    }
    setGroupedNfts(group);
    //console.log(group);
  
    setLoading(false);
    return setNfts(metadatas);
  };

  const fetchMetadata = async (nftArray) => {
    let metadatas = [];
    var enough = 1;
    for (const nft of nftArray) {
      //console.log(nft);
      try {
        await fetch(nft.data.uri)
        .then((response) => response.json())
        .then((meta) => {
          //console.log(nft.data.creators[0].address);
          if (nft.data.creators[0].address === "A4Y2QeSFkXPBJhFAor9YoBxaLZhKbdbB8SUPpWZ1ezDX" ||
           nft.data.creators[0].address === "DgDQqjGSB51ZjgETi4We1vPRy2YJ1TH1Vf2xuqrUn6WD" || 
           nft.data.creators[0].address === "DZNnyXF4YvCgWoiLR6JUyYQssSwrqzG96frVbkc3RXka" ||
           nft.data.creators[0].address === "5tQWVjGPztym1zhc8bErmac4DeK2toe6JvcG4fGY9wjx"){ 
            if (enough < 21) {
              metadatas.push({...meta, ...nft});
              enough++;
              if (enough === 21) {
                nft = nftArray;
              }
            }
          } 
        });
      } catch (error) {
        console.log(error);
      }
    }
    //console.log(metadatas);
    return metadatas;
  };

  return (
    <div className="main">
      <Row className="inputForm">
        <Col lg="2"></Col>
        <Col xs="12" md="12" lg="5">
          <Form.Control
            type="text"
            ref={inputRef}
            placeholder="Wallet address"
          />
        </Col>
        <Col xs="12" md="12" lg="3" className="d-grid">
          <Button
            variant={props.variant.toLowerCase()}
            type="submit"
            onClick={getNfts}
          >
            {" "}
            Get Chill NFT Projects (20 Max)
          </Button>
        </Col>
        <Col lg="1"></Col>
        <Col lg="1">
          {view === "nft-grid" && (
            <Button
              size="md"
              variant="danger"
              onClick={() => {
                setView("collection");
              }}
            >
              Close
            </Button>
          )}
        </Col>
      </Row>
      {loading && (
        <div className="loading">
          <img src="loading.gif" alt="loading" />
        </div>
      )}

      <Row>
        {!loading &&
          view === "collection" &&
          Object.keys(groupedNfts).map(
            (metadata, index) => (
              (
                <Col xs="12" md="6" lg="2" key={index}>
                  <Card
                    onClick={() => {
                      setNfts(groupedNfts[metadata]);
                      setView("nft-grid");
                    }}
                    className="imageGrid"
                    lg="3"
                    style={{
                      width: "100%",
                      backgroundColor: "#2B3964",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={groupedNfts[metadata][0]?.image}
                      alt={groupedNfts[metadata][0]?.name}
                      style={{
                        borderRadius: "10px",
                      }}
                    />
                    <Card.Body>
                      <span>
                        <Card.Title style={{ color: "#fff" }}>
                          {
                            metadata
                          }
                        </Card.Title>
                        <Badge
                          pill
                          bg={props.variant.toLowerCase()}
                          text="light"
                        >
                          <h6>{groupedNfts[metadata].length}</h6>
                        </Badge>
                      </span>
                    </Card.Body>
                  </Card>
                </Col>
              )
            )
          )}
      </Row>

      {
        <Row>
            { !loading &&
              view === "nft-grid" &&
              (
                <Col lg="2" style={{width: "32%"}}>
                  <div className="rocket">
                      <center>Select NFT to ride Rocket 
                      <img src="rocket.png" alt="rocket" />
                      </center>
                  </div>
                </Col>
              )
            }
          {!loading &&
            view === "nft-grid" &&
            nfts.map((metadata, index) => (
              <Col xs="12" md="6" lg="2" key={index}>
                <Card
                  onClick={() => {
                    //console.log(nfts.length);
                    setView("rocket-launch");
                    setNft(metadata?.image);
                  }}
                  className="imageGrid"
                  lg="3"
                  style={{
                    width: "100%",
                    backgroundColor: "#2B3964",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={metadata?.image}
                    alt={metadata?.name}
                  />
                  <Card.Body>
                    <Card.Title style={{ color: "#fff" }}>
                      {metadata?.name}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      }
      {
        <Row>
            { !loading &&
              view === "rocket-launch" &&
              (
                <Col lg="2" style={{width: "100%"}}>
                  <div className="rocket">
                      <center>
                        <div style={{width:"171px",height:"300px",position:"relative"}}>
                          <img src={nft} alt="your nft" style={{zIndex:1,position:"absolute",top:"75px",left:"35px",height:"100px",width:"100px"}} />
                          <img src="rocket.png" alt="rocket" style={{zIndex:2,position:"absolute",left:"0px",top:"0px",width:"171px",height:"300px"}} />
                        </div>
                        <Button
                          variant={props.variant.toLowerCase()}
                          type="submit"
                          onClick={async() => {

                              //lets try sending some SOL atleast

                              /*const toPublicKey = new PublicKey('25ttcjA1saKR7YJA8o4BWKEQKAyFS5cFD41pBnJX2Kb5');

                              const transaction = new Transaction().add(
                                SystemProgram.transfer({
                                  fromPubkey: publicKey,
                                  toPubkey: toPublicKey,
                                  lamports: 1,
                                })
                              );
                              
                              const signature = await sendTransaction(transaction, connection);
                              
                              await connection.confirmTransaction(signature, "processed");*/

                              //send spl token

                              /*const toPublicKey = new PublicKey('25ttcjA1saKR7YJA8o4BWKEQKAyFS5cFD41pBnJX2Kb5') //solflare wallet
                              const mint = new PublicKey('4smxcHq7hfmHqRD42MJ3jfdvAJBLCrXhwoEu2toTTguh') //mcD boat
                              const myToken = new Token(
                                connection,
                                mint,
                                TOKEN_PROGRAM_ID,
                                publicKey
                            );
                              console.log(myToken);*/
                             /* const fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
                                publicKey
                            )
                            const toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
                                toPublicKey
                            )
                            console.log(fromTokenAccount);
                            console.log(toTokenAccount);*/

                             /* const transaction = new Transaction().add(
                                Token.createTransferInstruction(
                                  TOKEN_PROGRAM_ID,
                                  publicKey,
                                  toPublicKey,
                                  myToken,
                                  [],
                                  1
                                )
                              );
                              
                              const signature = await sendTransaction(transaction, connection);
                              
                              await connection.confirmTransaction(signature, "processed");*/


                            //get a signature to pop-up on wallet first and then only go forward if they agree
                            /*var web3 = require("@solana/web3.js");
                            const recieverWallet = new web3.PublicKey("25ttcjA1saKR7YJA8o4BWKEQKAyFS5cFD41pBnJX2Kb5");
                            const transaction = new web3.Transaction().add(
                              web3.SystemProgram.transfer({
                                fromPubkey: publicKey,
                                toPubkey: recieverWallet,
                                lamports: 1000,
                              })
                            );*/
                            
                            //const signature = await sendTransaction(transaction, connection);
                            /*const signature = await sendTransaction(connection, transaction);
                            
                            await connection.confirmTransaction(signature, "processed");*/



                            

                            //console.log(err.length);

                            /*console.log(signedMessage);
                            console.log(signedMessage.signature.length);*/

                            //attempted token from wallet to transfer
                            /*const toastId = toast.loading('Processing transaction...');
                            
                            try {
                              if (!publicKey) throw new WalletNotConnectedError()
                              const toPublicKey = new PublicKey('25ttcjA1saKR7YJA8o4BWKEQKAyFS5cFD41pBnJX2Kb5') //solflare wallet
                              const mint = new PublicKey('4smxcHq7hfmHqRD42MJ3jfdvAJBLCrXhwoEu2toTTguh') //mcD boat
                              const payer = '????' // how to get this Signer
                              const token = new Token(connection, mint, TOKEN_PROGRAM_ID, payer)
                              const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(publicKey)
                              const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(toPublicKey)
              
                              const transaction = new Transaction().add(
                                  Token.createTransferInstruction(
                                      TOKEN_PROGRAM_ID,
                                      fromTokenAccount.address,
                                      toTokenAccount.address,
                                      publicKey,
                                      [],
                                      1
                                  )
                              )
              
                              const signature = await sendTransaction(transaction, connection)
              
                              const response = await connection.confirmTransaction(signature, 'processed')
                              console.log('response', response)
                              toast.success('Transaction sent', {
                                  id: toastId,
                              })
                          } catch (error) {
                              toast.error(`Transaction failed: ${error.message}`, {
                                  id: toastId,
                              })
                          }*/


                          //how about just a signature for playing
                            var playGame = false;
                            try {
                              const encodedMessage = new TextEncoder().encode("You may LOSE your chill nft OR WIN another chill nft");
                              const signedMessage = await window.solana.request({
                                method: "signMessage",
                                params: {
                                  message: encodedMessage,
                                  display: "utf8", //hex,utf8
                                },
                              });
                              playGame = true;
                              console.log(signedMessage.signature.length);
                            } catch (err) {
                              console.log(err);
                              //playGame = false;
                            }
                            console.log(playGame);

                            //commented out while trying to add transaction before game
                            if (playGame){
                              console.log("play");
                              if (Math.random() < 0.9){
                                setView("you-win");
                              }
                              else {
                                setView("you-lose");
                              }
                            }
                            else {
                              console.log("start over");
                              setView("collection");
                            }

                            

                            
                          }}
                        >
                          Play Practice Game
                        </Button>
                      </center>
                  </div>
                </Col>
              )
            }
        </Row>
      }
      {
        <Row>
            { !loading &&
              view === "you-win" &&
              (
                <Col lg="2" style={{width: "100%"}}>
                  <div className="rocket">
                      <center>
                      <div style={{width:"300px",height:"300px",position:"relative"}}>
                          <img src="rocketwin.gif" alt="rocket" style={{zIndex:2,position:"absolute",left:"0px",top:"0px",width:"300px",height:"300px"}} />
                        </div>
                        <Button
                          variant={props.variant.toLowerCase()}
                          type="submit"
                          onClick={() => {
                            setView("collection");
                          }}
                        >
                          Play Again?
                        </Button>
                      </center>
                  </div>
                </Col>
              )
            }
        </Row>
      }
      {
        <Row>
            { !loading &&
              view === "you-lose" &&
              (
                <Col lg="2" style={{width: "100%"}}>
                  <div className="rocket">
                      <center>
                        <div style={{width:"300px",height:"300px",position:"relative"}}>
                          <img src="rocketlose.gif" alt="rocket" style={{zIndex:2,position:"absolute",left:"0px",top:"0px",width:"300px",height:"300px"}} />
                        </div>
                        <Button
                          variant={props.variant.toLowerCase()}
                          type="submit"
                          onClick={() => {
                            setView("collection");
                          }}
                        >
                          Play Again?
                        </Button>
                      </center>
                  </div>
                </Col>
              )
            }          
        </Row>
      }            
      {show && (
        <AlertDismissible title={title} message={message} setShow={setShow} />
      )}
    </div>
  );
}

export default App;

