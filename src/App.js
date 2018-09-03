import React, { Component } from 'react';
import PlayerTable from './components/PlayerTable';
import Roster from './components/Roster';
import firebase, { auth, provider } from './firebase.js';

class App extends Component {

  state = {
    user: null,
    mode: 'Edit',
    drafted_players: null,
  }

  componentDidMount() {
    auth.onAuthStateChanged( user => {
      if (user) {
        this.setState({ user });
        /*
        const rankings_ref = firebase.database().ref(`/users/${user.uid}`).on('value', snapshot => {
          let user = snapshot.val();
          this.setState({ user });
        });
        */
      }
    });
  }

  login = () => {
    auth.signInWithPopup(provider)
      .then( (result) => {
        const user = result.user;

        // check if user already exists
        const existing_user = firebase.database().ref('users/' + user.uid);
        if ( existing_user ) {
          const users_ref = firebase.database().ref('users/' + user.uid).set( {
            id: user.uid, 
            email: user.email,
            displayName: user.displayName,
            type: 'user',
          } );
        }

        this.setState({user});
      });
  }

  logout = () => {
    auth.signOut()
      .then( (result) => {
        this.setState({user:null});
      });
  }

  toggleMode = (e) => {
    this.setState( { mode: (this.state.mode === 'Edit') ? 'Draft' : 'Edit' } );
  }

  handleDrafted = drafted_players => {
    this.setState( { drafted_players: drafted_players } ); 
  } 

  render() {
    return (

      <section className="section">
        <div className="container">
          <h1 className="title">My Rankings</h1>
          <p className="subtitle">My custom rankings and draft tool using ESPN rankings and FantasyPros ADP. 
          { this.state.user ?               
            <button className="button logout is-small logout-btn" onClick={() => { this.logout() }}>Sign Out</button>
          : '' } 
          </p>

          { 
            !this.state.user ?
            <button className="button primary" onClick={() => { this.login() }}>Log In</button>
            : 
            <div>
              <div className="app-tray">
                <p>Active Mode: <button className="button is-small modeToggle" onClick={this.toggleMode} >{ this.state.mode }</button></p>
              </div>
              <PlayerTable user={ this.state.user } mode={this.state.mode} handleDrafted={ this.handleDrafted } />
              <Roster mode={this.state.mode} drafted={this.state.drafted_players} />
            </div>
          }

        </div>
      </section>
    );
  }
}

export default App;
