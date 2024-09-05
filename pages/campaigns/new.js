// pages/campaigns/new.js 

import React, { Component } from "react";
import { Form, Button, Input, Message } from "semantic-ui-react";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";
import { Router } from "../../routes";
import Layout from "../../components/Layout";
import axios from 'axios';

class CampaignNew extends Component {
  state = {
    minimumContribution: "",
    name: "",
    description: "",
    errorMessage: "",
    loading: false,
  };

  // Check user authentication on component mount
  async componentDidMount() {
    try {
      const response = await axios.get('/api/profile');
      if (!response.data.user) {
        Router.pushRoute('/login');  // Redirect to login if not authenticated
      }
    } catch (err) {
      Router.pushRoute('/login');  // Redirect to login on error or unauthorized access
    }
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();

      // Create the campaign on the blockchain
      const result = await factory.methods
        .createCampaign(this.state.minimumContribution, this.state.name, this.state.description)
        .send({
          from: accounts[0],
        });

      // Save the campaign in the database
      await axios.post('/api/campaigns', {
        name: this.state.name,
        description: this.state.description,
        minimumContribution: this.state.minimumContribution,
        creator: accounts[0],
      });

      Router.pushRoute("/");
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <h3>Create a Campaign</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Minimum Contribution</label>
            <Input
              label="wei"
              labelPosition="right"
              value={this.state.minimumContribution}
              onChange={(event) =>
                this.setState({ minimumContribution: event.target.value })
              }
            />
          </Form.Field>

          <Form.Field>
            <label>Campaign Name</label>
            <Input
              value={this.state.name}
              onChange={(event) => this.setState({ name: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label>Campaign Description</label>
            <Input
              value={this.state.description}
              onChange={(event) =>
                this.setState({ description: event.target.value })
              }
            />
          </Form.Field>

          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button primary loading={this.state.loading}>
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default CampaignNew;
