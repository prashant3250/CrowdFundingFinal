import React, { Component } from "react";
import axios from "axios";
import { Card, Button, Icon, Modal, Input, Dropdown, Form, Message } from "semantic-ui-react";
import factory from "../ethereum/factory";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
import Campaign from '../ethereum/campaign'; // Ensure this path is correct

class CampaignIndex extends Component {
  state = {
    modalOpen: false,
    searchQuery: "",
    filterCriteria: "",
    filteredCampaigns: [],
    email: "",
    newsletterMessage: "",
    newsletterError: "",
    loading: false,
    user: null // Add user state to check if logged in
  };

  static async getInitialProps() {
    const campaigns = await factory.methods.getDeployedCampaigns().call();
    const campaignDetails = await Promise.all(
      campaigns.map(async (address) => {
        const campaign = Campaign(address);
        const summary = await campaign.methods.getSummary().call();
        return {
          address,
          name: summary[5],
          description: summary[6]
        };
      })
    );
    return { campaignDetails };
  }

  async componentDidMount() {
    this.setState({ filteredCampaigns: this.props.campaignDetails });
    await this.fetchUser(); // Fetch user details on mount
  }

  fetchUser = async () => {
    try {
      const response = await axios.get('/api/profile');
      this.setState({ user: response.data.user });
    } catch (error) {
      this.setState({ user: null }); // Set user to null if not logged in
    }
  };

  handleOpen = () => this.setState({ modalOpen: true });
  handleClose = () => this.setState({ modalOpen: false });

  handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    this.setState({ searchQuery }, this.filterCampaigns);
  };

  handleFilterChange = (e, { value }) => {
    this.setState({ filterCriteria: value }, this.filterCampaigns);
  };

  filterCampaigns = () => {
    const { campaignDetails } = this.props;
    const { searchQuery, filterCriteria } = this.state;

    let filteredCampaigns = campaignDetails.filter(campaign =>
      campaign.name.toLowerCase().includes(searchQuery)
    );

    // Apply additional filters based on criteria if needed
    if (filterCriteria) {
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(filterCriteria) ||
        campaign.description.toLowerCase().includes(filterCriteria)
      );
    }

    this.setState({ filteredCampaigns });
  };

  validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  handleNewsletterSignup = async () => {
    const { email } = this.state;
    if (!this.validateEmail(email)) {
      this.setState({ newsletterError: "Please enter a valid email address." });
      return;
    }

    this.setState({ loading: true, newsletterMessage: "", newsletterError: "" });

    try {
      await axios.post('/api/newsletter', { email });
      this.setState({ newsletterMessage: "Thank you for signing up!" });
    } catch (error) {
      this.setState({ newsletterError: error.response.data.error || "Something went wrong. Please try again." });
    }

    this.setState({ loading: false, email: "" });
  };

  handleViewCampaignClick = (address) => {
    if (!this.state.user) {
      Router.pushRoute('/login'); // Redirect to login page if not logged in
    } else {
      Router.pushRoute(`/campaigns/${address}`); // Redirect to the campaign page if logged in
    }
  };

  renderCampaigns() {
    const items = this.state.filteredCampaigns.map(({ address, name }) => {
      return {
        key: address, // Add the unique key here
        header: (
          <div style={{ fontWeight: 'bold', fontSize: '22px' }}>{name}</div> // Increase font size
        ),
        description: (
          <a onClick={() => this.handleViewCampaignClick(address)} style={{ cursor: 'pointer', color: 'blue' }}>
            View Campaign
          </a>
        ),
        fluid: true,
      };
    });
    return <Card.Group items={items} />;
  }

  render() {
    const filterOptions = [
      { key: 'all', text: 'All', value: '' },
      { key: 'name', text: 'Name', value: 'name' },
      // Add more filter criteria as needed
    ];

    return (
      <Layout>
        <div>
          <h3>Open Campaigns</h3>
          <Input 
            icon="search" 
            placeholder="Search campaigns..." 
            value={this.state.searchQuery}
            onChange={this.handleSearch}
            style={{ marginBottom: '20px' }}
          />
          <Dropdown
            placeholder="Filter by"
            selection
            options={filterOptions}
            onChange={this.handleFilterChange}
            style={{ marginBottom: '20px', marginLeft: '10px' }}
          />
          <Link route="/campaigns/new" legacyBehavior>
            <a>
              <Button
                floated="right"
                content="Create Campaign"
                icon="add circle"
                primary
              />
            </a>
          </Link>
          {this.renderCampaigns()}

          <Button
            circular
            icon="info"
            size="huge"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              backgroundColor: '#007bff',
              color: '#fff'
            }}
            onClick={this.handleOpen}
          />

          <Modal
            open={this.state.modalOpen}
            onClose={this.handleClose}
            size="small"
          >
            <Modal.Header>How to Use This Website</Modal.Header>
            <Modal.Content>
              <p>
                This website allows you to create and contribute to crowdfunding campaigns. 
                Here's how you can get started:
              </p>
              <ol>
                <li><b>Create a Campaign:</b> Click on the "Create Campaign" button to start a new campaign. Fill in the required details such as the minimum contribution, campaign name, and description.</li>
                <li><b>View Campaigns:</b> Browse through the list of active campaigns on the homepage. Click on "View Campaign" to see more details about a specific campaign.</li>
                <li><b>Contribute to a Campaign:</b> On a campaign's detail page, you can contribute funds by entering the amount and submitting the form.</li>
                <li><b>Approve Requests:</b> Campaign managers can create requests to withdraw funds. Contributors can approve these requests if they agree with them.</li>
                <li><b>Finalize Requests:</b> Once enough approvals are received, the campaign manager can finalize the request to transfer the funds.</li>
              </ol>
              <p>
                If you have any questions or need further assistance, feel free to reach out to us.
              </p>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={this.handleClose} primary>Close</Button>
            </Modal.Actions>
          </Modal>

          <div style={{ marginTop: '40px' }}>
            <h4>Subscribe to our Newsletter</h4>
            <Form onSubmit={this.handleNewsletterSignup} error={!!this.state.newsletterError} success={!!this.state.newsletterMessage}>
              <Form.Field>
                <Input
                  placeholder="Enter your email"
                  value={this.state.email}
                  onChange={(event) => this.setState({ email: event.target.value })}
                />
              </Form.Field>
              <Message error header="Oops!" content={this.state.newsletterError} />
              <Message success header="Success!" content={this.state.newsletterMessage} />
              <Button loading={this.state.loading} primary>Subscribe</Button>
            </Form>
          </div>
        </div>
      </Layout>
    );
  }
}

export default CampaignIndex;
