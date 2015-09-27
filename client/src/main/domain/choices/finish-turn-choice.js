(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	exports.newChoice = function() {
		return new FinishTurnChoice();
	};
	
	function FinishTurnChoice() {
		this.id = 'finish-turn';
		this.name = i18n.CHOICE_FINISH_TURN;
	}
	
	FinishTurnChoice.prototype.equals = function (other) {
		return (other instanceof FinishTurnChoice);
	};
	
	FinishTurnChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
	
	FinishTurnChoice.prototype.requiresDice = function () {
		return false;
	};
	
	FinishTurnChoice.prototype.computeNextState = function (state) {
		return GameState.turnStartState({
			squares: state.squares(),
			players: state.players(),
			currentPlayerIndex: (state.currentPlayerIndex() + 1) % state.players().length
		});
	};
}());