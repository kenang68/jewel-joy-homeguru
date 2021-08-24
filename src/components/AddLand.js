import React, { Component } from 'react'

const IPFS = require('ipfs-api')
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' }) 

class AddLand extends Component {

  state = {
    location: null,
    value: null,
    buffer: null,
    image: '',
  }

  captureFile = (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    const reader = new window.FileReader() 
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }
  
  
  render() {
    return (
      <div>
        <h1 className='title2'>Add Property</h1>
        <div className='add-container'>
          <form className='add-form' onSubmit={(event) => {
            event.preventDefault()
            const location = this.state.location
            const value = window.web3.utils.toWei(this.state.value.toString(), 'Ether')
            if(this.state.buffer === null) {
              alert("Please choose an image file")
              return
            }
            ipfs.add(this.state.buffer, async (error, result) => {
              //console.log('Ipfs result', result)
              const image = result[0].hash
              if(error) {
                console.log(error)
                return
              }
              await this.props.addLand(location, image, value)
            })
          }}>
            <div className="form-group mr-sm-2">
              <input
                id="location"
                type="text"
                onChange={this.handleChange}
                className="form-control"
                placeholder="Location.."
                required 
              />
              <input
                id="value"
                type="text"
                onChange={this.handleChange}
                className="form-control"
                placeholder="Property value.."
                required 
              />
              <div className='add-submit'>
                <input 
                  type='file' 
                  onChange={this.captureFile} 
                />
                <button 
                  type="submit" 
                  className="btn btn-primary">
                  Add Property
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default AddLand