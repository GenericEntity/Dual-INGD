Dual.Menu = function (game)
{
	this.capGoal = 1;
	this.capGoalTextLbl = null;
	this.capGoalText = null;

	this.myButtons = null;
};

Dual.Menu.prototype =
{
	init: function(capGoalPara)
	{
		this.capGoal = capGoalPara;
	},

	create: function ()
	{		
		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		this.titleBG = this.add.sprite(0, 0, 'background');
		this.titlePageImg = this.add.sprite(0, 0, 'titlepage');
		this.titleBG.alpha = 0.30;

	    this.loadingText = this.add.text(
	    	this.game.width / 2, 
	    	this.game.height / 2 + 40, 
	    	"Dual is a capture-the-flag type game.\nPick a capture limit.\nThen, press SPACEBAR to start the game.", 
	    	{ font: "20px monospace", fill: "#fff", align: 'center' });
	    this.loadingText.anchor.setTo(0.5, 0.5);


		this.capGoalTextLbl = this.add.text(
			 this.loadingText.position.x,
			 this.loadingText.position.y + this.loadingText.height + 30,
			'Capture limit',
			{font: '20px monospace', fill: '#fff', align: 'center'}
			);
		this.capGoalTextLbl.anchor.setTo(0.5);

		this.capGoalText = this.add.text(
			this.capGoalTextLbl.position.x,
			this.capGoalTextLbl.position.y + this.capGoalTextLbl.height + 15,
			'' + this.capGoal,
			{font: '50px tribal_dragonregular', fill: '#fff', align: 'center'}
			);
		this.capGoalText.anchor.setTo(0.5);

		this.MakeButton('plus', this.Increment, 
			this.capGoalText.position.x + this.capGoalText.width + 50, 
			this.capGoalText.position.y);
		this.MakeButton('minus', this.Decrement,
			this.capGoalText.position.x - this.capGoalText.width - 50, 
			this.capGoalText.position.y);


		// Controls
	    this.add.text(
	    	15, 
	    	this.game.height - 200,
	    	"Player 1",
	    	{ font: "20px monospace", fill: "#00c0ff", align: "right"});
	    this.add.text(
	    	15, 
	    	this.game.height - 175, 
	    	"Move: A, D; Jump: W\n" +
	    	"Pick up/drop flag: S\n" +
	    	"Attack: SPACEBAR\n" +
	    	"Place trap: T (stun), Y (spike)", 
	    	{ font: "16px monospace", fill: "#fff"});

	    this.add.text(
	    	this.game.width - 15, 
	    	this.game.height - 200,
	    	"Player 2",
	    	{ font: "20px monospace", fill: "#ff0000", align: "right"}).anchor.setTo(1, 0);
	    
	    this.add.text(
	    	this.game.width - 15, 
	    	this.game.height - 175,
	    	"Move: Left, Right; Jump: Up\n" +
	    	"Pick up/drop flag: Down\n" +
	    	"Attack: Numpad 7\n" +
	    	"Place trap: Numpad 8 (stun)\nNumpad 9 (spike)", 
	    	{ font: "16px monospace", fill: "#fff", align: "right"}).anchor.setTo(1, 0);

		// Credits
	    this.add.text(
	    	15, 
	    	this.game.height - 46, 
	    	"Tribal Dragon font (by Jonathan S. Harris) is free for non-commercial usage", 
	    	{ font: "11px monospace", fill: "#fff", align: "center"});
	    this.add.text(
	    	15, 
	    	this.game.height - 33, 
	    	"Buttons were generated by dabuttonfactory.com",
	    	{ font: "11px monospace", fill: "#fff", align: "center"});
	    this.add.text(
	    	15, 
	    	this.game.height - 20, 
	    	"Sound assets from Epic Sounds and FX, licensed for commercial and non-commercial usage",
	    	{ font: "11px monospace", fill: "#fff", align: "center"});
	    this.add.text(
	    	this.game.width - 15, 
	    	this.game.height - 45, 
	    	"Most art assets from GameArt2D (Public Domain)",
	    	{ font: "11px monospace", fill: "#fff", align: "center"}).anchor.setTo(1, 0);
	    this.add.text(
	    	this.game.width - 15, 
	    	this.game.height - 30, 
	    	"Other art assets from OpenGameArt (Creative Commons)",
	    	{ font: "11px monospace", fill: "#fff", align: "center"}).anchor.setTo(1, 0);
	},

	update: function ()
	{
		//	Do some nice funky main menu effect here
		if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
		{
			this.startGame();
		}
	},

	startGame: function (pointer)
	{
		// start the actual game
		this.state.start('Game', true, false, this.capGoal);
	},

	MakeButton: function (imgKey, callback, x, y)
	{
		if(this.myButtons == null)
		{
			this.myButtons = [];
		}

	    var button = this.add.button(x, y, imgKey, callback, this, 0, 1, 2);
	    button.anchor.set(0.5, 0.5);
	    button.smoothed = false;

	    this.myButtons.push(button);
	},

	Increment: function()
	{
		if(this.capGoal < 20)
		{
			this.capGoal++;
		}
		this.UpdateCapGoalDisplay();
	},

	Decrement: function()
	{
		if(this.capGoal > 1)
		{
			this.capGoal--;
		}
		this.UpdateCapGoalDisplay();
	},

	UpdateCapGoalDisplay: function()
	{
		this.capGoalText.text = this.capGoal;
	}
};