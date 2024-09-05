import React, { Component } from "react";
import { Button, Table, Message } from "semantic-ui-react";
import { Link } from "../../../routes";
import Layout from "../../../components/Layout";
import Campaign from "../../../ethereum/campaign";
import RequestRow from "../../../components/RequestRow";
import web3 from "../../../ethereum/web3";

class RequestIndex extends Component {
  state = {
    loading: false,
    errorMessage: '',
    requests: [],
    approversCount: 0,
  };

  static async getInitialProps(props) {
    const { address } = props.query;
    const campaign = Campaign(address);
    const requestCount = await campaign.methods.getRequestsCount().call();
    const approversCount = await campaign.methods.approversCount().call();

    const requests = await Promise.all(
      Array(parseInt(requestCount))
        .fill()
        .map((element, index) => {
          return campaign.methods.requests(index).call();
        })
    );

    return { address, requests, requestCount, approversCount };
  }

  async componentDidMount() {
    await this.loadRequests();
  }

  // Function to load requests from the smart contract
  loadRequests = async () => {
    try {
      const campaign = Campaign(this.props.address);
      const requestCount = await campaign.methods.getRequestsCount().call();
      const approversCount = await campaign.methods.approversCount().call();

      const requests = await Promise.all(
        Array(parseInt(requestCount))
          .fill()
          .map((element, index) => {
            return campaign.methods.requests(index).call();
          })
      );

      this.setState({ requests, approversCount, errorMessage: '' });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  };

  // Callback function when a request is approved or finalized
  onTransactionComplete = async () => {
    this.setState({ loading: true, errorMessage: '' });

    try {
      await this.loadRequests(); // Reload the requests data
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }

    this.setState({ loading: false });
  };

  renderRows() {
    return this.state.requests.map((request, index) => {
      return (
        <RequestRow
          key={index}
          id={index}
          request={request}
          address={this.props.address}
          approversCount={this.state.approversCount}
          onTransactionComplete={this.onTransactionComplete} // Pass the callback to RequestRow
        />
      );
    });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;

    return (
      <Layout>
        <h3>Request List</h3>
        <Link route={`/campaigns/${this.props.address}/requests/new`} legacyBehavior>
          <a>
            <Button primary floated="right" style={{ marginBottom: 10 }}>
              Add Request
            </Button>
          </a>
        </Link>

        <Table>
          <Header>
            <Row>
              <HeaderCell>ID</HeaderCell>
              <HeaderCell>Description</HeaderCell>
              <HeaderCell>Amount</HeaderCell>
              <HeaderCell>Recipient</HeaderCell>
              <HeaderCell>Approval Count</HeaderCell>
              <HeaderCell>Approve</HeaderCell>
              <HeaderCell>Finalize</HeaderCell>
            </Row>
          </Header>
          <Body>
            {this.renderRows()}
          </Body>
        </Table>

        <div>Found {this.props.requestCount} requests.</div>
        
        {this.state.errorMessage && (
          <Message error header="Oops!" content={this.state.errorMessage} />
        )}
        {this.state.loading && <Message loading>Loading...</Message>}
      </Layout>
    );
  }
}

export default RequestIndex;
