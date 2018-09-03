import React, { Component } from 'react';
import rosterData from '../utils/roster.json';
import firebase from '../firebase.js';

class Roster extends Component {

    state = {
        roster: {
            'qb': null,
            'rb1': null,
            'rb2': null,
            'wr1': null,
            'wr2': null,
            'te': null,
            'flx': null,
            'dst': null,
            'k': null,
            'bench': []
        },
        open: false,
        teams: null,
    }   

    componentDidMount() {
        // this.setState({ roster: rosterData });
        const teams_ref = firebase.database().ref('teams');
        teams_ref.once('value', snapshot => {
            let teams = snapshot.val();
            this.setState( { teams: teams } );
        })
    }

    componentWillReceiveProps(nextProps) {
        console.log( 'next props: ', nextProps );
        if ( nextProps.mode === "Draft" ) {
            this.setState( {open: true} );
        }
        else if ( nextProps.mode === "Edit" ) {
            this.setState( {open: false} );
        }
        this.updateMyRoster( nextProps.drafted );
    }

    toggleRoster = (e) => {
        if ( this.state.open ) {
            this.setState( {open: false} );
        }
        else {
            this.setState( {open: true} );
        }
    }

    updateMyRoster = drafted_players => {

        if ( drafted_players === null ) {
            return;
        }

        // assign drafted players to roster spots
        let myroster = {
            'qb': null,
            'rb1': null,
            'rb2': null,
            'wr1': null,
            'wr2': null,
            'te': null,
            'flx': null,
            'dst': null,
            'k': null,
            'bench': []
        };
        console.log( drafted_players );
        console.log( myroster );

        drafted_players.map( player => {

            if ( player.pos === 'QB' && myroster.qb === null ) {
                myroster.qb = player;
            }
            else if ( player.pos === 'RB' && myroster.rb1 === null ) {
                myroster.rb1 = player;
            }
            else if ( player.pos === 'RB' && myroster.rb2 === null ) {
                myroster.rb2 = player;
            }
            else if ( player.pos === 'RB' && myroster.flx === null ) {
                myroster.flx = player;
            }
            else if ( player.pos === 'WR' && myroster.wr1 === null ) {
                myroster.wr1 = player;
            }
            else if ( player.pos === 'WR' && myroster.wr2 === null ) {
                myroster.wr2 = player;
            }
            else if ( player.pos === 'WR' && myroster.flx === null ) {
                myroster.flx = player;
            }
            else if ( player.pos === 'TE' && myroster.te === null ) {
                myroster.te = player;
            }
            else if ( player.pos === 'TE' && myroster.flx === null ) {
                myroster.flx = player;
            }
            else if ( player.pos === 'DST' && myroster.dst === null ) {
                myroster.dst = player;
            }
            else if ( player.pos === 'K' && myroster.k === null ) {
                myroster.k = player;
            }
            else {
                if ( myroster.bench ) {
                    myroster.bench.push(player);
                }
                else {
                    myroster.bench = [];
                    myroster.bench.push(player);
                } 
            }
            
        });
        this.setState( {roster: myroster} );

    }

    buildRosterRows = ( players ) => {
        if ( players ) {
            return Object.keys(players).map( (pos, i) => {
                if ( pos === "bench" ) { return; }
                let pos_player = players[pos];
                if ( pos_player ) {

                    let bye = '';
                    if ( this.state.teams[ pos_player.team ] ) {
                        bye = this.state.teams[ pos_player.team ].bye;
                    }

                    return( 
                        <tr className={pos} key={i}>
                            <td className="pos">{pos}</td>
                            <td className="seperator">&nbsp;</td>
                            <td className="player-img">
                                <img className="player-headshot" src={ "http://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/" + pos_player.id + ".png&w=200&h=145" } />
                            </td>
                            <td className="name">
                                {pos_player.name}
                            </td>
                            <td className="team">
                                <img className="team-logo" src={ "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/" + pos_player.team + ".png&h=40&w=40" } />
                                <span className="bye">({ bye })</span>
                            </td>
                        </tr> 
                    );
                }
                else {
                    return( 
                        <tr className={pos} key={i} >
                            <td className="pos">{pos}</td>
                            <td className="seperator">&nbsp;</td>
                            <td className="player-img">&nbsp;</td>
                            <td className="name">&nbsp;</td>
                            <td className="team">&nbsp;</td>
                        </tr> 
                    );
                }
                
            });
        }
        else {
            return <tr><td colSpan="5">Loading roster data....</td></tr>;
        }
    }

    render() {
        return (
            <div className={ (this.state.open) ? "flyout-container open" : "flyout-container" } >
                <div className="handle" onClick={ this.toggleRoster }>
                    &nbsp;
                </div>
                <div className="roster">
                    <h3 className="title is-4">My Roster</h3>
                    <table className="table" id="roster">
                        <thead>
                            <tr>
                                <th>POS</th>
                                <th className="seperator">&nbsp;</th>
                                <th>&nbsp;</th>
                                <th>Name</th>
                                <th>Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.buildRosterRows( this.state.roster ) }
                            <tr><td className="seperator" colSpan="5">Bench</td></tr>
                            { this.buildRosterRows( this.state.roster.bench ) }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}
export default Roster;