import { Container, Dropdown, DropdownButton, Nav, Navbar } from "react-bootstrap";
import { WalletMultiButton, } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";


const Navigationbar = (props) => {


  function onChange(val){

    if(val==="devnet"){
        props.setNetwork(WalletAdapterNetwork.Devnet);
        props.setTitle("Devnet");
        props.setVariant("primary");
    } else if(val==="testnet"){
        props.setNetwork(WalletAdapterNetwork.Testnet);
        props.setTitle("Testnet");
        props.setVariant("warning");
    } else if(val==="mainnet"){
        props.setNetwork(WalletAdapterNetwork.Mainnet);
        props.setTitle("Mainnet");
        props.setVariant("success");
    }
    
  }

  return (
    <Navbar collapseOnSelect expand="lg" style={{ backgroundColor: "#111827" }}>
      <Container>
        <Navbar.Brand href="#home" style={{ color: "#fff" }}>
          NFT Rocket
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" style={{ backgroundColor: "#fff" }} variant="dark" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto"></Nav>
          <Nav>
            <Nav.Link></Nav.Link>
            <WalletMultiButton className="wallet-btn"/>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Navigationbar;
