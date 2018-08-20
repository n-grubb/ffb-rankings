import React, { Component } from 'react';
import PlayerTable from './components/PlayerTable';

class App extends Component {

  state = {

  }

  render() {
    return (

      <section className="section">
        <div className="container">
          <h1 className="title">My Rankings</h1>
          <p className="subtitle">My custom rankings utilizing steamer projections, baseballhq reliability scores, & fantasypros adp.</p>
        
          <PlayerTable />
        </div>
      </section>
    );
  }
}

export default App;
