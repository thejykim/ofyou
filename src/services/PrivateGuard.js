import { Component } from 'react'
import ShellNav from "../components/ShellNav";
import { useRouter } from 'next/router';
import { auth } from '../services/firebase';
import { getUsername } from './AccountFunctions';

export default class PrivateGuard extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      username: null,
      uid: null
    }
  }

  componentDidMount() {
    auth().onAuthStateChanged((user) => {
      if (!!user) {
        getUsername(user.uid).then((result) => {
          this.setState({
            loading: false,
            username: result,
            uid: user.uid
          });
        })
      } else {
        this.setState({
          loading: false
        });
      }
    });
  }

  render() {
    const children = this.props.children;
    
    if (this.state.loading) {
      return (
        <div></div>
      );
    } else if (!this.state.username) {
      window.location.replace('/login');
    } else {
      return (
        <div>
          <ShellNav username={this.state.username}></ShellNav>
  
          {
            React.Children.map(children, child => {
              return React.cloneElement(child, {
                username: this.state.username,
                uid: this.state.uid
              });
            })
          }
        </div>
      );
    }
  }
}