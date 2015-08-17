
Dual.Preloader = function (game)
{
	this.background = null;
	this.preloadBar = null;

	this.ready = false;
};

Dual.Preloader.prototype = {

	preload: function () {
		
		this.stage.backgroundColor = '#2d2d2d';

	    this.preloadBar = this.add.sprite(
	    	this.game.width / 2 - 100, 
	    	this.game.height / 2, 
	    	'preloaderBar');

	    this.add.text(
	    	this.game.width / 2, 
	    	this.game.height / 2 - 30, 
	    	"Loading...", 
	    	{ 
	    		font: "32px monospace", fill: "#fff" 
	    	}).anchor.setTo(0.5, 0.5);

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);		

		this.PreloadSounds();
		this.PreloadGraphics();
	},

	PreloadGraphics: function ()
	{
		// Menu stuff
		this.load.image('titlepage', 'resources/menu/titlepage.png');
		this.load.image('plus', 'resources/menu/plus.png');
		this.load.image('minus', 'resources/menu/minus.png');

		// Game stuff
		this.load.image('background', 'resources/desert_BG_Scale1088_576.png');
	 	this.load.tilemap('platform', 'resources/desertTilesMapSmaller.json', null, Phaser.Tilemap.TILED_JSON);
	  	this.load.image('tiles','resources/desert_spritesheetSmaller2.png');
	  	this.load.image('capArea', 'resources/caparea/caparea.png');

	  	// Load player resources
	  	for(var i = 0; i < 2; ++i)
	  	{
	  		// Players
		   	this.load.spritesheet('player' + (i+1), 'resources/players/player' + (i+1) + 'Spritesheet.png',32,32);

		   	// Projectiles
		  	this.load.spritesheet('p' + (i+1) + 'Proj', 'resources/players/misc/player' + (i+1) + 'Projectile1.png', 16, 8);

		  	// Flags
		  	this.load.image('p' + (i+1) + 'flag', 'resources/flags/p' + (i+1) + 'flag.png');
	  	}

	  	// // Traps
	  	for (var i = 0; i < 2; i++)
	  	{
	  		this.load.image('trap' + (i+1), 'resources/traps/trap' + (i+1) + '.png');
	  	}
	},

	PreloadSounds: function ()
	{
		// Admittedly, this loop is hardcoded and is not very flexible, but if you change the sound resources, you'd have to do just about as much work without this loop anyway.
		var tempStr;

		for (var i = 0; i < 2; i++)
		{
			tempStr = 'death';
			this.load.audio(tempStr + (i+1), ['resources/sounds/' + tempStr + (i+1) +'.wav']);

			tempStr = 'spiketrap';
			this.load.audio(tempStr + (i+1), ['resources/sounds/' + tempStr + (i+1) +'.wav']);
		}
		
		tempStr = 'flagcap';
		this.load.audio(tempStr, ['resources/sounds/'+ tempStr +'.wav']);

		tempStr = 'gameover';
		this.load.audio(tempStr, ['resources/sounds/'+ tempStr +'.wav']);

		tempStr = 'gastrap';
		this.load.audio(tempStr, ['resources/sounds/'+ tempStr +'.wav']);

		tempStr = 'projshoot';
		this.load.audio(tempStr, ['resources/sounds/'+ tempStr +'.wav']);

		tempStr = 'projhit';
		this.load.audio(tempStr, ['resources/sounds/'+ tempStr +'.wav']);
	},


	create: function ()
	{

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
		

	},

	update: function ()
	{

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.cache.isSoundDecoded('death1') && 
			this.cache.isSoundDecoded('death2') && 
			this.cache.isSoundDecoded('flagcap') && 
			this.cache.isSoundDecoded('gameover') && 
			this.cache.isSoundDecoded('gastrap') && 
			this.cache.isSoundDecoded('projhit') && 
			this.cache.isSoundDecoded('projshoot') && 
			this.cache.isSoundDecoded('spiketrap1') && 
			this.cache.isSoundDecoded('spiketrap2') &&
			this.ready == false)
		{
			this.ready = true;
			var a = [];
			for (var i = 0; i < 10; i++)
			{
				a.push(5*i);
			}

			this.state.start('Menu', true, false, 1);
		}

	}

};