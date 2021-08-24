import React, { Component } from 'react';
import './App.css';
import LandContract from '../abis/LandContract.json';
import Asset from '../abis/Asset.json';
import Navbar from './Navbar';
import Content from './Content';

var lcaddress;

class App extends Component {

  async componentDidMount() {    
    
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    const Web3 = require ("web3");
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        if (error.code === 4001) {
          // User rejected request
          console.log("User rejected request");
        }
        console.log("Error: ", error);
      }
    }
  }

  // .call() to get blockchain data
  // .send() to set transaction
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    this.setState({ account })
    // Load LandContract contract
    const networkId = await web3.eth.net.getId()
    const networkData = LandContract.networks[networkId]
    
    if(networkData) {
      const landContract = new web3.eth.Contract(LandContract.abi, networkData.address)
      lcaddress = networkData.address
      this.setState({ landContract })
      const owner = await landContract.methods.owner().call()
      this.setState({ owner })
      const landCount = await landContract.methods.landCount().call()
      this.setState({ landCount })
      // Load Products
      for(var i = 1; i <= landCount; i++) {
        const land = await landContract.methods.lands(i).call()
        this.setState({
          lands: [...this.state.lands, land]
        })
      }
      this.setState({ loading: false })
    } else {
      window.alert('LandContract not deployed to connected network');
      
    }
    
  }

  constructor(props) {
    super(props)
    this.state = {
      owner: '',
      account: '',
      landCount: '',
      idnum: '',
      lands: [],
      loading: true,
      toxfer: false,
      tolist: false
    }

    this.addLand = this.addLand.bind(this)
    this.buyLand = this.buyLand.bind(this)
    this.listLand = this.listLand.bind(this)
    this.nftapproval = this.nftapproval.bind(this)
  }

  addLand = (location, image, value) => {
    let idnum
    this.setState({ loading: true })
    idnum = this.state.landCount
    idnum++
    this.setState({ idnum })
    this.state.landContract.methods.addLand(location, image, value).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.nftapproval() 
        this.setState({ loading: false })
      })

  }

  buyLand = (id, value) => {
    this.setState({ loading: true })
    const idnum = id
    this.setState({ idnum })
    this.setState({ toxfer: true })
    this.state.landContract.methods.buyLand(id).send({ from: this.state.account, value: value })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
     
  }

  listLand = (id, value) => {
    this.setState({ loading: true })
    const idnum = id
    this.setState({ idnum })
    this.setState({ tolist: true })
    this.state.landContract.methods.listLand(id, value).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.nftapproval()
        this.setState({ loading: false })
      })
  }

  async nftapproval () {    

    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    this.setState({ account })
    const networkId = await web3.eth.net.getId()
    const networkData = Asset.networks[networkId]
    
    if(networkData) {
      const assetContract = new web3.eth.Contract(Asset.abi, networkData.address)
      this.setState({ loading: false })
      var tokenid = this.state.idnum
      assetContract.methods.approve(lcaddress, tokenid).send({ from: this.state.account })
      .once('receipt', (receipt) => {

      })
    } else {
      window.alert('Asset not deployed to connected network')
      
    }
  }

  render() {
    if (!this.state.loading) {
      this.updateland();
    }
    return (
      <div className='app-container'>
        <Navbar account={this.state.account} />
        <div className='container-fluid mt-5'>
          <div class1='row'>
            <main role='main' className='col-lg-12 flex'>
            { 
              this.state.loading ? 
                <p>Loading...</p> :
                <Content 
                  lands={this.state.lands} 
                  addLand={this.addLand} 
                  buyLand={this.buyLand}
                  listLand={this.listLand}
                  owner={this.state.owner}
                  account={this.state.account}
                /> 
            }
            </main>
          </div>
        </div>
      </div>
    );
  }

  async updateland() {
    const web3 = window.web3
    // Load LandContract contract
    const networkId = await web3.eth.net.getId()
    const networkData = LandContract.networks[networkId]
    
    if(networkData) {
      const landContract = new web3.eth.Contract(LandContract.abi, networkData.address)
      const landCount = await landContract.methods.landCount().call()
      if (landCount > this.state.landCount) {
        this.setState({ landCount })
        // Load Products
        const land = await landContract.methods.lands(landCount).call()
        this.setState({
          lands: [...this.state.lands, land]
        })
      }
      if (this.state.toxfer) {
        // Load Products
        const land = await landContract.methods.lands(this.state.idnum).call()
        let lands = [...this.state.lands]
        lands[this.state.idnum-1] = land
        this.setState({lands})
        this.setState({ toxfer: false });
      }

      if (this.state.tolist) {
        // Load Products
        const land = await landContract.methods.lands(this.state.idnum).call()
        let lands = [...this.state.lands]
        lands[this.state.idnum-1] = land
        this.setState({lands})

        this.setState({ tolist: false });
      }
    } else {
      window.alert('LandContract not deployed to connected network');
      
    }
    
  }

}

export default App;
