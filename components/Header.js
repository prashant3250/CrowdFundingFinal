import React, { useEffect, useState } from "react";
import { Menu, Loader } from "semantic-ui-react";
import { Link } from "../routes";
import axios from "axios";
import web3 from "../ethereum/web3";

const Header = () => {
  const [account, setAccount] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getAccount = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("Error fetching Ethereum account:", err);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/profile");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false); // Set loading to false after fetching user data
      }
    };

    getAccount();
    fetchUser();
  }, []);

  if (loading) {
    return <Loader active inline="centered" />;
  }

  return (
    <Menu style={{ marginTop: "5px", padding: "5px 0", borderRadius: 0 }}>
      <Link route="/" legacyBehavior>
        <a className="item" style={{ padding: "5px 10px", fontSize: "18px" }}>
          CrowdFunding
        </a>
      </Link>
      <Menu.Menu position="right">
        {account ? (
          <Menu.Item style={{ padding: "5px 10px", fontSize: "16px" }}>
            {account}
          </Menu.Item>
        ) : (
          <Menu.Item style={{ padding: "5px 10px", fontSize: "16px" }}>
            No Account Connected
          </Menu.Item>
        )}
        <Link route="/campaigns/new" legacyBehavior>
          <a className="item" style={{ padding: "5px 10px", fontSize: "16px" }}>
            +
          </a>
        </Link>
        {user ? (
          <Menu.Item style={{ padding: "5px 10px" }}>
            <Link route="/profile" legacyBehavior>
              <a className="item" style={{ padding: "5px 10px", fontSize: "16px" }}>
                {user.name || user.email}
              </a>
            </Link>
          </Menu.Item>
        ) : (
          <>
            <Link route="/login" legacyBehavior>
              <a className="item" style={{ padding: "5px 10px", fontSize: "16px" }}>
                Login
              </a>
            </Link>
            <Link route="/register" legacyBehavior>
              <a className="item" style={{ padding: "5px 10px", fontSize: "16px" }}>
                Register
              </a>
            </Link>
          </>
        )}
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
