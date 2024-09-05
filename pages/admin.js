// pages/admin.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Message } from 'semantic-ui-react';
import Layout from '../components/Layout';
import { Router } from '../routes';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Redirect to login if unauthorized
          Router.pushRoute('/login');
        } else {
          setError('Failed to load users');
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <Layout><Container>Loading...</Container></Layout>;

  return (
    <Layout>
      <Container>
        <h3>Admin - User Campaigns</h3>
        {error && <Message error content={error} />}
        {!error && users.length === 0 && <Message info content="No users or campaigns found." />}
        {users.length > 0 && (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>User</Table.HeaderCell>
                <Table.HeaderCell>Campaigns</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {users.map(user => (
                <Table.Row key={user._id}>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    {user.campaigns.length > 0 ? (
                      <ul>
                        {user.campaigns.map(campaign => (
                          <li key={campaign._id}>{campaign.name} - {campaign.description}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No campaigns created by this user.</p>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </Layout>
  );
};

export default Admin;
