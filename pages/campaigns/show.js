import React, { Component } from 'react';
import { Card, Grid, Button, Form, Message, TextArea } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import Campaign from '../../ethereum/campaign';
import web3 from '../../ethereum/web3';
import ContributeForm from '../../components/ContributeForm';
import { Link } from '../../routes'; // Importing Next.js Link component
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from 'react-share';
import axios from 'axios'; // Make sure to import axios

class CampaignShow extends Component {
  state = {
    comment: '',
    comments: [],
    commentError: '',
    loadingComment: false,
  };

  static async getInitialProps(props) {
    const campaign = Campaign(props.query.address);
    const summary = await campaign.methods.getSummary().call();

    return {
      address: props.query.address,
      minimumContribution: summary[0],
      balance: summary[1],
      requestsCount: summary[2],
      approversCount: summary[3],
      manager: summary[4],
      name: summary[5],
      description: summary[6]
    };
  }

  async componentDidMount() {
    await this.fetchComments();
  }

  fetchComments = async () => {
    const { address } = this.props;
    try {
      const commentsResponse = await axios.get(`/api/comments?address=${address}`);
      this.setState({
        comments: commentsResponse.data,
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  handleCommentSubmit = async () => {
    const { comment } = this.state;
    const { address } = this.props;

    if (!comment.trim()) {
      this.setState({ commentError: 'Comment cannot be empty.' });
      return;
    }

    this.setState({ loadingComment: true, commentError: '' });

    try {
      await axios.post(`/api/comments?address=${address}`, { comment });
      this.setState({ comment: '' });
      await this.fetchComments();
    } catch (err) {
      this.setState({ commentError: 'Error posting comment.' });
    } finally {
      this.setState({ loadingComment: false });
    }
  };

  renderCards() {
    const {
      balance,
      manager,
      minimumContribution,
      requestsCount,
      approversCount,
      name,
      description
    } = this.props;

    const items = [
      {
        header: name,
        meta: 'Campaign Name',
        description: description,
        style: { overflowWrap: 'break-word' }
      },
      {
        header: manager,
        meta: 'Address of Manager',
        description: 'The manager created this campaign and can create requests to withdraw money',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: minimumContribution,
        meta: 'Minimum Contribution (wei)',
        description: 'You must contribute at least this much wei to become an approver'
      },
      {
        header: requestsCount,
        meta: 'Number of Requests',
        description: 'A request tries to withdraw money from the contract. Requests must be approved by approvers'
      },
      {
        header: approversCount,
        meta: 'Number of Approvers',
        description: 'Number of people who have already donated to this campaign'
      },
      {
        header: web3.utils.fromWei(balance, 'ether'),
        meta: 'Campaign Balance (ether)',
        description: 'The balance is how much money this campaign has left to spend.'
      }
    ];

    return <Card.Group items={items} />;
  }

  render() {
    const { address, name, description } = this.props;
    const { comment, comments, commentError, loadingComment } = this.state;
    const shareUrl = `http://localhost:3000/campaigns/${address}`;

    return (
      <Layout>
        <h3>Campaign Details</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              {this.renderCards()}
              <div style={{ marginTop: '30px' }}>
                <h4>Comments</h4>
                {comments.map((comment, index) => (
                  <p key={index} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                    {comment}
                  </p>
                ))}
                <Form onSubmit={this.handleCommentSubmit} error={!!commentError}>
                  <Form.Field>
                    <TextArea
                      placeholder="Leave a comment..."
                      value={comment}
                      onChange={(e) => this.setState({ comment: e.target.value })}
                    />
                  </Form.Field>
                  <Message error content={commentError} />
                  <Button
                    primary
                    loading={loadingComment}
                    disabled={loadingComment}
                    content="Post Comment"
                  />
                </Form>
              </div>
            </Grid.Column>

            <Grid.Column width={6}>
              <ContributeForm address={this.props.address} />
              <div style={{ marginTop: '20px' }}>
                <h4>Share this Campaign</h4>
                <FacebookShareButton url={shareUrl} quote={description}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={name}>
                  <TwitterIcon size={40} round style={{ marginLeft: '10px' }} />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl} title={name} summary={description}>
                  <LinkedinIcon size={40} round style={{ marginLeft: '10px' }} />
                </LinkedinShareButton>
              </div>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              {/* Remove <a> tag inside the <Link> component */}
              <Link route={`/campaigns/${this.props.address}/requests`}>
                <Button primary>View Requests</Button>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default CampaignShow;
