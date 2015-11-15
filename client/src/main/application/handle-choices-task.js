(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'HandleChoicesTask requires a PlayGameTask');
		
		var humanChoices = new Rx.ReplaySubject(1);
		choicesForPlayerType(playGameTask, 'human')
			.subscribe(humanChoices);
		
		var task = new HandleChoicesTask(humanChoices, playGameTask);
		
		choicesForPlayerType(playGameTask, 'computer')
			.filter(function (choices) {
				return choices.length > 0;
			})
			.map(computerPlayer)
			.subscribe(applyChoice(task));
			
		return task;
	};
	
	function HandleChoicesTask(humanChoices, playGameTask) {
		this._humanChoices = humanChoices;
		this._choiceMade = new Rx.Subject();
		this._playGameTask = playGameTask;
	}
	
	HandleChoicesTask.prototype.choices = function () {
		return this._humanChoices.takeUntil(this._playGameTask.completed());
	};
	
	HandleChoicesTask.prototype.choiceMade = function () {
		return this._choiceMade.takeUntil(this._playGameTask.completed());
	};
	
	HandleChoicesTask.prototype.makeChoice = function (choice, arg) {
		this._humanChoices.onNext([]);
		this._choiceMade.onNext({choice: choice, arg: arg});
	};
	
	function choicesForPlayerType(playGameTask, type) {
		return playGameTask.gameState()
			.takeUntil(playGameTask.completed())
			.filter(function (state) {
				return state.currentPlayer().type() === type;
			})
			.map(function (state) {
				return state.choices();
			});
	}
	
	function computerPlayer(choices) {
		return choices[0];
	}
	
	function applyChoice(task) {
		return function (choice) {
			Rx.Observable.timer(0).subscribe(function () {
				task._choiceMade.onNext({choice: choice});
			});
		};
	}
}());