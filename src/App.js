import React, { Component } from 'react';
import './App.css';
import faker from 'faker';
import { getRandomArbitrary } from './utils';
import ReactPaginate from 'react-paginate';

class EmailList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      offset: 0
    }
  }

  handlePageChange = (data) => {
    let selected = data.selected;
    let offset = Math.ceil(selected * this.props.perPage);

    console.log('page change', selected,offset);
    this.setState({offset});
  }

  render() {
    if (!this.props.list) {
      return <div>Not generated</div>
    }

    console.log('list slice', this.props.list, this.props.list.slice(this.state.offset, this.props.perPage));
    return <div>
      <ReactPaginate
        pageCount={this.props.list.length / this.props.perPage}
        onPageChange={this.handlePageChange}
        containerClassName={"pagination"}
        breakClassName={"break-me"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}
      />
      {this.props.list.slice(this.state.offset, this.props.perPage).map((email) => <p>{email}</p>) }
    </div>
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      input: ['guy1@gmail.com', 'guy2@gmail.com', 'guy3@gmail.com', 'guy1@gmail.com', 'guy2@gmail.com', 'guy3@gmail.com'],
      output: null,
      loading: false
    };
  }

  dedupe(emailList) {
    const lookup = {};
    const output = [];
    for (let email of emailList) {
      if (!lookup[email]) {
        lookup[email] = true;
        output.push(email);
      }
    }
    return output;
  }

  generateInput() {
    let input = [];
    for (let i = 0; i < 50000; i++) {
      // generate 50k unique emails
      let newEmail = faker.internet.email()
      if (input.indexOf(newEmail) === -1) {
        input.push(newEmail);
      } else {
        input.push(`${faker.name.firstName()}${newEmail}`)
      }
    }
    for (let i = 0; i < 50000; i++) {
      // splice a random existing email from the input into another location in the input.
      let randomEmail = input[getRandomArbitrary(0, input.length)];
      let randomIndex = getRandomArbitrary(0, input.length);
      console.log('splicing', randomIndex, randomEmail);
      input.splice(randomIndex, 0, randomEmail);
    }
    return input;
  }

  handleGenerateInput() {
    this.setState({loading: true});
    let input = this.generateInput();
    this.setState({input, loading: false});
  }

  handleDedupeInput() {
    this.setState({loading: true});
    let output = this.dedupe(this.state.input);
    this.setState({output, loading: false});
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Email deduper</h2>
          { this.state.loading &&
            <p className="App-intro">Loading, please wait... (up to 30 seconds)</p>
          }
        </div>
        <div style={{float: 'left', width: '100%'}}>
          <div style={{float: 'left', width: "50%", backgroundColor: '#888888'}}>
            <h2>Input</h2>
            <button onClick={() => this.handleGenerateInput()}>
              Generate an input (Warning: Takes a long time)
            </button>
            <EmailList list={this.state.input} perPage={10} />
          </div>
          <div style={{width: "50%", float: 'left', backgroundColor: '#999999'}}>
            <h2>Output</h2>
            <button
              disabled={!this.state.input}
              onClick={() => this.handleDedupeInput()}
            >
              Dedupe the input
            </button>
            <EmailList list={this.state.output} perPage={10} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
