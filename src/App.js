import './App.css';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig, } from "@nfteyez/sol-rayz";
import { Col, Row, Button, Form, Card, Badge } from "react-bootstrap";
import AlertDismissible from './alert/alertDismissible';

function App(props) {
  const { publicKey } = useWallet();
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
           nft.data.creators[0].address === "DZNnyXF4YvCgWoiLR6JUyYQssSwrqzG96frVbkc3RXka"){ 
            if (enough < 21) {
              metadatas.push({...meta, ...nft});
              enough++;
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
                        <div style={{width:"244px",height:"428px",position:"relative"}}>
                          <img src={nft} alt="your nft" style={{zIndex:1,position:"absolute",top:"155px",left:"100px",height:"50px",width:"50px"}} />
                          <img src="rocket.png" alt="rocket" style={{zIndex:2,position:"absolute",left:"0px",top:"0px",width:"244px",height:"428px"}} />
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
