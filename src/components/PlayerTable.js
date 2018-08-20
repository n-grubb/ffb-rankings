import React, { Component } from 'react';
import playerData from '../utils/players.json';

class PlayerTable extends Component {

    state = {
        headers: [
            'Rnk', 
            'Name', 
            'Pos', 
            ' ',
            'ADP',
            'FPRO',
            /*
            'AVG',
            'DIFF'
            */
        ],
        players: null,
        draggable: true
    }   

    componentDidMount() {
        this.setState({players: playerData});
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
    }

    displayPlayers = () => {
        if ( this.state.players ) {
            return this.state.players.map( (player, i) => {
                return (
                    <tr data-player={player.id} key={player.id} draggable="true" onDragStart={(e) => { this.onDragStart(e, player.id) } } onDragOver={this.onDragOver} >
                        <td className="rank" data-playerid={player.id} >{ i+1 }</td>
                        <td className="name" data-playerid={player.id}>
                            <img className="player-headshot" src={ "http://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/" + player.id + ".png&w=200&h=145" } />
                            {player.name}
                        </td>
                        <td className="pos" data-playerid={player.id}>{player.pos}</td>
                        <td className="seperator" data-playerid={player.id}>&nbsp;</td>
                        <td className="adp" data-playerid={player.id}>{player.adp}</td>
                        <td className="fpro" data-playerid={player.id}>{player.fpro}</td>
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

    sort = (column, direction) => {
        console.log( 'sort players by ' + column );
    }

    render() {
        return (

            <table className="table" id="rankings" onDrop={this.onDrop}>
                <thead>
                    <tr>
                        { this.generateColHeaders() }
                    </tr>
                </thead>

                <tbody>
                    { this.displayPlayers() }
                </tbody>

                <tfoot>
                    <tr>
                        { this.generateColHeaders() }
                    </tr>
                </tfoot>
            </table>
        );
    }
}

export default PlayerTable;
