import React, { Component, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from "react-router-dom";

import axios from "axios";

function AuthExample() {
  return (
    <Router>
      <div>
        <AuthButton />
        <ul>
          <li>
            <Link to="/public">Public Page</Link>
          </li>
          <li>
            <Link to="/protected">Protected Page</Link>
          </li>
        </ul>
        <Route path="/public" component={Public} />
        <Route path="/login" component={Login} />
        <PrivateRoute path="/protected" component={Protected} />
      </div>
    </Router>
  );
}

function getCookieValue(a) {
  var b = document.cookie.match("(^|[^;]+)\\s*" + a + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

const fakeAuth = {
  checkAuth: function() {
    return getCookieValue("token_expires").length > 0;
  },
  authenticate(cb) {
    axios.get("api/login").then(function(res) {
      cb();
    });
  },
  signout(cb) {
    axios.get("api/logout").then(function(res) {
      cb();
    });
  }
};

const AuthButton = withRouter(({ history }) => {
  return fakeAuth.checkAuth() ? (
    <p>
      Welcome!{" "}
      <button
        onClick={() => {
          fakeAuth.signout(() => history.push("/"));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  );
});

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        fakeAuth.checkAuth() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}

function Public() {
  return <h3>Public</h3>;
}

function Protected() {
  const [data, setData] = useState({});

  useEffect(() => {
    async function fetchData() {
      // You can await here
      const response = await await axios.get("api/me");
      setData(response.data);
    }
    fetchData();
  }, []); // Or [] if effect doesn't need props or state

  return <pre>{JSON.stringify(data, null, 4)}</pre>;
}

class Login extends Component {
  state = { redirectToReferrer: false };

  login = () => {
    fakeAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={from} />;

    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <a href="api/login">Log in via Spotify Account</a>
      </div>
    );
  }
}

export default AuthExample;
