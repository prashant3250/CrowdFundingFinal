import React, { Component } from "react";
import { Form, Input, Message, Button } from "semantic-ui-react";
import Campaign from "../ethereum/campaign";
import web3 from "../ethereum/web3";
import { Router } from "../routes";
import axios from 'axios';

class ContributeForm extends Component {
  state = {
    value: "",
    errorMessage: "",
    loading: false,
    user: null, // Track if the user is logged in
  };

  async componentDidMount() {
    await this.checkUserLoggedIn();
  }

  checkUserLoggedIn = async () => {
    try {
      const response = await axios.get('/api/profile');
      this.setState({ user: response.data.user });
    } catch (err) {
      this.setState({ user: null }); // User is not logged in
    }
  };

  onSubmit = async (event) => {
    event.preventDefault();

    if (!this.state.user) {
      Router.pushRoute('/login'); // Redirect to login if not logged in
      return;
    }

    const campaign = Campaign(this.props.address);

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      
      // Estimate gas
      const gas = await campaign.methods.contribute().estimateGas({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, "ether")
      });

      // Send transaction with the estimated gas
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, "ether"),
        gas: gas,  // Set the gas limit dynamically
      });
      
      Router.replaceRoute(`/campaigns/${this.props.address}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false, value: "" });
  };

  render() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Amount to Contribute</label>
          <Input
            value={this.state.value}
            onChange={(event) => this.setState({ value: event.target.value })}
            label="ether"
            labelPosition="right"
          />
        </Form.Field>
        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button primary loading={this.state.loading}>
          Contribute!
        </Button>
      </Form>
    );
  }
}

export default ContributeForm;
