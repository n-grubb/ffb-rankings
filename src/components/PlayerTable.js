import React, { Component } from 'react';
import playerData from '../utils/players.json';
import firebase from '../firebase.js';

class PlayerTable extends Component {

    state = {
        headers: [
            'RNK', 
            '',
            'NAME', 
            'POS', 
            'TEAM',
            ' ',
            'ADP',
            'ESPN',
        ],
        players: null,
        taken: [],
        drafted: [],
        teams: [],
        madeChanges: false
    }   

    componentDidMount() {

        // gets teams, attempts player rankings, and then default rankings - in that order.
        const teams_ref = firebase.database().ref('teams');
        teams_ref.once('value', snapshot => {
            let teams = snapshot.val();
            this.setState( { teams: teams } );

            if ( this.props.user ) {   

                const uid = this.props.user.uid;
                console.log( this.props.user );
                const rankings_ref = firebase.database().ref('user-rankings/'+uid).on('value', snapshot => {

                    let player_rankings = snapshot.val();
                    if ( player_rankings === null ) {

                        const players_ref = firebase.database().ref('players').orderByChild('adp');
                        console.log( 'getting players...', players_ref );
                        
                        players_ref.once('value', snapshot => {
                            let player_rankings = snapshot.val();
                            console.log('using default rankings.' );
                            this.setState({ players: player_rankings });
                        });
                        
                    }
                    else {
                        console.log('loaded user rankings.' );
                        this.setState({ players: player_rankings });
                    }

                });
                
            }

        });
        
        
    }

    saveRankings = () => {

    }

    onDragStart = (e, player_id ) => {
        e.dataTransfer.setData('id', player_id);
    } 

    onDragOver = (e) => {
        e.preventDefault();
        // this event is a "can drop" event
    }

    onDrop = (e) => {
        const player_id = e.dataTransfer.getData('id');
        const insert_before = e.target.getAttribute('data-playerid');
        
        // get the index for each player.
        let players = this.state.players;
        const movedPlayerIndex = players.findIndex( (player, index) => {
            if (player.id === parseInt(player_id) ) {
                return true;
            }
        });
        let targetPlayerIndex = players.findIndex((player, index, array) => {
            if (player.id === parseInt(insert_before) )
                return index;
        });

        // fix for dragging to top
        if (targetPlayerIndex === -1) {
            targetPlayerIndex = 0;
        }

        // splice the array to update changes.
        let moveData = players.splice(movedPlayerIndex, 1);
        players.splice(targetPlayerIndex, 0, moveData[0]);
        
        // update state
        this.setState( { players: players } );
        if ( this.state.madeChanges === false ) {
            this.setState( { madeChanges: true } ); 
        }
        
    }

    toggleTaken = (id) => {
        let updated_taken = this.state.taken;
        if ( updated_taken.indexOf(id) === -1 ) {
            updated_taken.push(id);
            this.setState( { taken: updated_taken } );
        } else {
            updated_taken = updated_taken.splice(id, 1);
            this.setState( { taken: updated_taken });
        }  
    }

    draftPlayer = player => {
        if ( this.state.drafted.indexOf(player) === -1 ) {
            let updated_drafted = this.state.drafted;
            updated_drafted.push(player);
            this.setState( { drafted: updated_drafted });
            this.props.handleDrafted( updated_drafted );
        }
        else {
            let updated_drafted = this.state.drafted.filter( obj => {
                return obj.id !== player.id;
            });
            this.setState( { drafted: updated_drafted });
            this.props.handleDrafted( updated_drafted );
        }  
    }

    displayPlayers = () => {
        if ( this.state.players ) {
            return this.state.players.map( (player, i) => {

                let ediff = (i+1) - player.espn;
                let ediffclass = "";
                if ( ediff > 0 ) {
                    ediffclass = "below";
                    ediff = "↓" + Math.abs(ediff);
                }
                else if ( ediff < 0 ) {
                    ediffclass = "above";
                    ediff = "↑" + Math.abs(ediff);
                }
                else {
                    ediff = "---";
                }

                let adiff = (i+1) - player.adp;
                let adiffclass = "";
                if ( adiff > 0 ) {
                    adiffclass = "below";
                    adiff = "↓" + Math.abs(adiff);
                }
                else if ( adiff < 0 ) {
                    adiffclass = "above";
                    adiff = "↑" + Math.abs(adiff);
                }
                else {
                    adiff = "---";
                }

                let row_class = '';
                if ( this.state.drafted.indexOf(player) !== -1  ) {
                    row_class = 'drafted';
                }
                else if ( this.state.taken.indexOf(player.id) !== -1 ) {
                    row_class = 'faded';
                }
                                
                let bye = '';
                if ( this.state.teams[ player.team ] ) {
                    bye = this.state.teams[ player.team ].bye;
                }

                return (
                    <tr data-player={player.id} key={player.id} draggable={ ( this.props.mode === "Edit" ) ? "true" : "false" } onDragStart={(e) => { this.onDragStart(e, player.id) } } onDragOver={this.onDragOver} className={ row_class } >
                        <td className="rank" data-playerid={player.id} >{ i+1 } <span className={ "diff " + adiffclass }>({ adiff })</span></td>
                        <td className="player-img" data-playerid={player.id}>
                            { ( player.pos === 'DST' ) ? '' :
                            <img className="player-headshot" src={ "http://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/" + player.id + ".png&w=200&h=145" } />
                            }
                        </td>
                        <td className="name" data-playerid={player.id}>
                            {player.name}
                        </td>
                        <td className="pos" data-playerid={player.id}>{player.pos}</td>
                        <td className="team" data-playerid={player.id}>
                            <img className="team-logo" src={ "http://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/scoreboard/" + player.team + ".png&h=40&w=40" } />
                            <span className="bye">({bye})</span>
                        </td>
                        <td className="seperator" data-playerid={player.id}>&nbsp;</td>
                        <td className="adp" data-playerid={player.id}>{player.adp}</td>
                        <td className="espn" data-playerid={player.id}>{player.espn} <span className={ "diff " + ediffclass }>({ ediff })</span></td>
                        { ( this.props.mode === 'Draft' ) ? 
                        <td className="actions" data-playerid={player.id}>
                            { ( this.state.drafted.indexOf(player) === -1 ) ? 
                            <button className="button is-small is-dark"  onClick={ () => { this.toggleTaken(player.id) } }>{ ( this.state.taken.indexOf(player.id) === -1 ) ? "Taken" : "Undo" }</button>
                            : "" }
                            { ( this.state.taken.indexOf(player.id) === -1 ) ? 
                            <button className="button is-small is-info" onClick={ () => { this.draftPlayer(player) } }>{ ( this.state.drafted.indexOf(player) === -1 ) ? "Draft" : "Undraft" }</button>
                            : "" }
                        </td>
                        : '' }
                    </tr>
                );
            });
        }
        else {
            return <tr><td colSpan="6">Loading player data....</td></tr>;
        }
    }

    generateColHeaders = () => {
        return this.state.headers.map( (col,i) => {
            if (col === ' ') {
                return <th key={i} className="seperator">&nbsp;</th>;
            }
            else {
                return <th key={i} onClick={ () => { this.sort(col,'asc') } }>{col}</th>;
            }
        });
    }

    displayActionsHeader = () => {
        if ( this.props.mode === 'Draft' ) {
            return <th >Actions</th>;
        } 
    }

    sort = (column, direction) => {
        console.log( 'sort players by ' + column );
    }

    saveChanges = () => {
        // check if record exists, replace it if so. 
        const uid = this.props.user.uid;
        const rankings_ref = firebase.database().ref('user-rankings/'+uid).set( this.state.players );
        this.setState( { madeChanges: false } ); 
    }

    render() {
        return (
            <div>
                { ( this.state.madeChanges ) ? 
                <div className="notification ">
                    <strong>You have unsaved changes.</strong> <button className="button is-primary is-small" onClick={this.saveChanges} >Save</button>
                </div>
                : '' }

                <table className="table" id="rankings" onDrop={this.onDrop}>
                    <thead>
                        <tr>
                            { this.generateColHeaders() }
                            { this.displayActionsHeader() }
                        </tr>
                    </thead>

                    <tbody>
                        { this.displayPlayers() }
                    </tbody>

                    <tfoot>
                        <tr>
                            { this.generateColHeaders() }
                            { this.displayActionsHeader() }
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
}

export default PlayerTable;
