$(document).ready(() => {

	// Resets the table
	$('#reset').click(() => {
		$('li').remove();
		$('.playerScore p').remove();
		$('.score h1').remove();
		$('.dealersCards').css("height", "96px");
	});

	// Start a new game
	$('#start').click(() => {
		$('li').remove();
		$('.playerScore p').remove();
		$('.score h1').remove();
		playGame();
	});

	// Player hit for another card
	$('#hit').click(() => {
		playerHand.hit("p");
		result = Result();
		DisplayUserScore(result);
		if (isNumber(result)) {
			displayConsole();
		} else {
			hideConsole();
			return;
		}
	});

	// Player stand - Game ends
	$('#stand').click(() => {
		while (dealerHand.score() < 17) {
			dealerCardsCounter = 0;
			dealerHand.hit("deal");
		}
		result = FinalResult();
		$('.dealersCards li').remove();
		revealDealerHand(dealerHand);
		DisplayUserScore(result);
		hideConsole();
		return;
	});
});

// Builds cards by combining values with suits and return a deck
function deckBuilder(suit, value) {
	suits = { 1: "clubs", 2: "diamonds", 3: "hearts", 4: "spades" };
	values = { 1: "ace", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "jack", 12: "queen", 13: "king" };
	var deck = values[value] + "_of_" + suits[suit] + ".svg";
	return deck;
}

// Deck shuffler
class deck {
	constructor() {
		this.create = () => {
			var cardArray = [];
			var i = 1;
			var j = 1;
			for (i = 1; i < 14; i++) {
				for (j = 1; j < 5; j++) {
					cardArray.push(new Card(j, i));
				}
			}
			return shuffle(shuffle(cardArray));
		};
	}
}

// Deck suffler
function shuffle(a) {
	for (let i = a.length; i; i--) {
		let j = Math.floor(Math.random() * i);
		[a[i - 1], a[j]] = [a[j], a[i - 1]];
	}
	return a;
}

// Card constructor
class Card {
	constructor(suit, number) {
		var cardSuite = suit;
		var cardNumber = number;
		this.getSuit = () => cardSuite;
		this.getNumber = () => cardNumber;
		this.getValue = () => {
			if (number === 1) {
				return 11;
			} else if (number > 9) {
				return 10;
			} else {
				return number;
			}
		};
	}
}

// Flip dealers hidden card
function revealDealerHand(hand) {
	var hand = hand.displayHand();
	for (i = 0; i < hand.length; i++) {
		$('.dealersCards ul').prepend('<li><a href="#"><img src="cards/' + deckBuilder(hand[i].getSuit(), hand[i].getNumber()) + '" /></a></li>');
	}
}

// Deal function - provides players with cards
var deal = (toReciever) => {
	var newCard = gameDeck.pop();
	if (toReciever == "d") {
		dealerCardsCounter += 1;
	}
	if (toReciever == "p") {
		$('.playersCards ul').prepend('<li><a href="#"><img src="cards/' + deckBuilder(newCard.getSuit(), newCard.getNumber()) + '" /></a></li>');
	} else if (toReciever == "d" && dealerCardsCounter < 2) {
		$('.dealersCards').css("height", "");
		$('.dealersCards ul').prepend('<li><a href="#"><img src="cards/' + deckBuilder(newCard.getSuit(), newCard.getNumber()) + '" /></a></li>');
	} else if (toReciever == "d" && dealerCardsCounter == 2) {
		$('.dealersCards ul').prepend('<li><a href="#"><img src="cards/back.jpg" /></a></li>');
	}
	return newCard;
};

// Keeping score of current hand
function Hand(toReciever, cardCounter) {
	var dealCards = toReciever;
	var cardArray = [];
	for (i = 0; i < cardCounter; i++) {
		cardArray[i] = deal(dealCards);
	}
	this.displayHand = () => cardArray;

	this.score = () => {
		var handSum = 0;
		var valueOfFaces = 0;
		for (i = 0; i < cardArray.length; i++) {
			handSum += cardArray[i].getValue();
			if (cardArray[i].getNumber() === 1) {
				valueOfFaces += 1;
			}
		}
		if (handSum > 21 && valueOfFaces != 0) {
			for (i = 0; i < valueOfFaces; i++) {
				if (handSum > 21) {
					handSum -= 10;
				}
			}
		}
		return handSum;
	};
	this.hit = function (toReciever) {
		cardArray.push(deal(toReciever));
		this.displayHand();
	};
}

// Final check when the game has ended user pressing stand
var FinalResult = () => {
	var playerScore = playerHand.score();
	var dealerScore = dealerHand.score();
	if (playerScore > 21) {
		if (dealerScore > 21) {
			return "Draw";
		}
		else {
			return "Bust";
		}
	}
	else if (dealerScore > 21) {
		return "Player Win";
	}
	else if (playerScore > dealerScore) {
		return "Player Win";
	}
	else if (playerScore === dealerScore) {
		return "Draw";
	}
	else {
		return "Dealer win";
	}
};

// Displays users score
var DisplayUserScore = (input) => {
	$('.playerScore p').remove();
	$('.playerScore').prepend("<p>" + input + "</p>");
}

// Checks results of both hands
var Result = () => {
	playerScore = playerHand.score();
	dealerScore = dealerHand.score();
	if (playerScore > 21) {
		if (dealerScore > 21) {
			return "Draw";
		}
		else {
			return "Bust";
		}
	}
	else if (dealerScore > 21) {
		return "Player Win";
	}
	else if (playerScore === 21) {
		return "BlackJack";
	}
	else {
		return playerScore;
	}
};

var Deal = () => {
	dealerHand = new Hand("d", 2);
	playerHand = new Hand("p", 2);
	result = Result();

	DisplayUserScore(result);
	if (isNumber(result)) {
		displayConsole();
	} else {
		hideConsole();
		return;
	}
};

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

var displayConsole = () => {
	$('.hitOrStandButtons').css("visibility", "");
}

var hideConsole = () => {
	$('.hitOrStandButtons').css("visibility", "hidden");
}

var playGame = () => {
	var gDeck = new deck();
	dealerCardsCounter = 0;
	gameDeck = gDeck.create();
	Deal();
};