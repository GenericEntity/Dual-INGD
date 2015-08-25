Dual.Game = function (game)
{

this.nPlayers = 2;
this.nTrapTypes = 2;

this.playerImageKeys = [];
this.playerProjImageKeys = [];
this.playerFlagImageKeys = [];
this.trapImageKeys = [];

this.deathAudio = [];
this.spikeTrapAudio =[];

this.flagCapAudio = null;
this.gameOverAudio = null;
this.gasTrapAudio = null;
this.projHitAudio = null;

this.playerProjShootAudioArr = [];

this.bgImg = null;
this.map = null;
this.layer = null;
this.collisionLayer = null;

this.nFramesPerAttack = null; // (set automatically) number of frames in each player's attack cycle.
this.nFramesPerWalkCycle = null; // (set automatically) number of frames in each player's walk cycle.

// Adjust this based on how fast you want the walk animation in this. 
// Note: This coefficient is used with the this.nFramesPerWalkCycle and the player's walk speed at any given moment to throttle the walk animation speed. However, things go wrong if the frame rate of the animation dips below 1FPS. Hence, if the calculated FPS drops below 1, it will be set to 1 when animating, which may essentially ignore this value.
this.walkAnimSpeedCoeff = 30;


this.captureGoal = 1;
this.gameOver = false;

this.players = [];
this.playersStartPos = [[32,0], [1056,0]];
this.playersStartFacingLeft = [false, true];
this.playerAttackYOffset = 12; // The y offset from the player's position that his projectile will spawn at.

this.hpBars = [];
this.hpBarsFillColors = ['#1000ff','#f90010'];
this.hpBarsRespawnFillColors = ['#444444','#444444'];
this.hpBarsBgColors = ['#ababab','#ababab'];
this.hpBarLen = 48; // Length of hp bar in pixels
this.hpBarHeight = 6; // Height of hp bar in pixels

this.flags = [];
this.flagsStartPos = [[48,0], [1040,0]]; //[1040,70]
this.flagAutoResetTime = 20000; // In milliseconds
this.flagCarryOffset = [0,8];

this.flagResetBars = [];
this.flagResetFillColors = ['#444444','#444444'];
this.flagResetBgColors = ['#ababab','#ababab'];
this.flagResetBarLen = 48; // Length of hp bar in pixels
this.flagResetBarHeight = 6; // Height of hp bar in pixels

this.flagCapAreas = []; // Flag capture areas
this.flagCapAreasPosScale = [[0,0,80,35], [1008,0,80,35]]; // [x position, y position, x scale, y scale]

this.traps = [];
this.nTrapAmts = [[2, 2], [2, 2]];
this.trapEffects = [this.StunTrapEffect, this.SpikeTrapEffect];
this.normalTrapTypeCooldowns = [3000, 2500]; // In milliseconds
this.normalTrapTypeLifetimes = [60000, 50000];
this.trapResetWarningDurations = [2000, 2000];
this.trapFlickerInterval = 300; // In milliseconds
this.trapFlickerTints = [0xffffff, 0x000000]; // [Normal tint color, flicker tint color]
this.disabledTrapOpacity = 0.3;

this.noTrapAreas = [];
this.noTrapAreasPosScale = [[0,0,380,150], [708,0,380,150]]; // [x position, y position, x scale, y scale]

this.lMoveKeys = [];
this.rMoveKeys = [];
this.jumpKeys = [];
this.attackKeys = [];
this.useFlagKeys = [];
this.placeTrap1Keys = [];
this.placeTrap2Keys = [];

this.playerProjPools = [];
this.projPoolSize = 40;

this.startingHealth = 100;
this.normalWalkSpeed = 150; //150

/* 
Determines the percentage of the player's walk speed that he should travel at when attacking.
So, 0.6 means that this.players will always at 60% of their walk speeds when attacking.
Setting this to 1 will make it have no effect. 
Setting this to 0 will make the player stationary when attacking.
Setting this to a negative value will be interesting, and will be at your own risk.
*/ 
this.attackingWalkSpeedPerc = 0.6;
this.carryFlagWalkSpeedPerc = 0.65;

this.normalJumpPower = 400;
this.normalJumpCooldown = 400; // In milliseconds
this.normalAttacksPerSec = 2;
this.normalWeapDmg = 20; // adjust
this.normalPlayerRespawnTime = 2200; // In milliseconds

this.normalProjSpeed = 350; // adjust

};

Dual.Game.prototype = {

	init: function(capGoalPara)
	{
		this.captureGoal = capGoalPara;
	},


	preload: function ()
	{
	  	this.PrepareGraphicsKeys();
	},

	PrepareGraphicsKeys: function ()
	{
	  	for(var i = 0; i < 2; ++i)
	  	{
	  		this.playerImageKeys.push('player' + (i+1));
		   	this.playerProjImageKeys.push('p' + (i+1) + 'Proj');
		  	this.playerFlagImageKeys.push('p' + (i+1) + 'flag');
	  	}

	  	for (var i = 0; i < 2; i++)
	  	{
	  		this.trapImageKeys.push('trap' + (i+1));
	  	}
	},


	SpikeTrapEffect: function (player)
	{
		player.health -= 25;
		this.spikeTrapAudio[Math.floor(Math.random() * this.spikeTrapAudio.length)].play();
	},

	StunTrapEffect: function (player)
	{
		player.stunnedUntil = this.time.now + 1500;
		this.gasTrapAudio.play();
	},

	/**** REGION: CREATE ****/
	create: function ()
	{
		this.physics.startSystem(Phaser.Physics.ARCADE);

		// Create GameWorld elements
		this.CreateGameWorld();

		this.CreateFlagCaptureAreas();
		this.CreateNoTrapAreas();

		// Create Flags
		// Flags first so that they will be on the back-most this.layer.
		this.CreateFlags();

		this.CreateTraps();

		// // Put this anywhere in create AFTER this.CreateFlags(), depending on what you want the rendering order to be
		this.CreateFlagResetBars();

		// // Create Players, and related bits
		this.CreatePlayers(); // Must be before the other player-related stuff
		this.CreateControls();
		this.CreateHealthBars();
		this.CreateProjectiles();
		this.CreateSounds();
	},

	CreateSounds: function ()
	{
		var tempStr;
		for (var i = 0; i < 2; i++)
		{
			tempStr = 'death';
			this.deathAudio.push(this.add.audio(tempStr + (i+1)));

			tempStr = 'spiketrap';
			this.spikeTrapAudio.push(this.add.audio(tempStr + (i+1)));
		}
		
		// All this use of tempStr is to make it easier to extend later (like into arrays and such)
		tempStr = 'flagcap';
		this.flagCapAudio = this.add.audio(tempStr);

		tempStr = 'gameover';
		this.gameOverAudio = this.add.audio(tempStr);

		tempStr = 'gastrap';
		this.gasTrapAudio = this.add.audio(tempStr);

		tempStr = 'projshoot';
		
		for (var i = 0; i < this.nPlayers; i++)
		{
			this.playerProjShootAudioArr.push(this.add.audio(tempStr));
		}

		tempStr = 'projhit';
		this.projHitAudio = this.add.audio(tempStr);
	},

	CreateGameWorld: function ()
	{
		this.stage.backgroundColor = '#787878';
		this.bgImg = this.add.sprite(0,0 ,'background');

		this.map = this.add.tilemap('platform');
		this.map.addTilesetImage('desert_spritesheetSmaller2', 'tiles');
		this.layer = this.map.createLayer('Ground');
		
		this.collisionLayer = this.map.createLayer('Collision');
		this.map.setCollision(1,true, 'Collision');
		this.collisionLayer.visible = false;

		this.layer.resizeWorld();
		this.collisionLayer.resizeWorld();
	},

	CreateFlagCaptureAreas: function ()
	{
		for (var i = 0; i < this.nPlayers; i++)
		{
			this.CreateFlagCaptureArea(i);
		}
	},

	CreateFlagCaptureArea: function (i)
	{
		this.flagCapAreas.push(this.add.sprite(
			this.flagCapAreasPosScale[i][0],
			this.flagCapAreasPosScale[i][1],
			'capArea'));

		this.flagCapAreas[i].scale.set(
			this.flagCapAreasPosScale[i][2], 
			this.flagCapAreasPosScale[i][3]);

		this.physics.arcade.enable(this.flagCapAreas[i]);
		this.flagCapAreas[i].visible = false;
		this.flagCapAreas[i].id = i;
	},

	CreateNoTrapAreas: function ()
	{
		for (var i = 0; i < this.nPlayers; i++)
		{
			this.CreateNoTrapArea(i);
		}
	},

	CreateNoTrapArea: function (i)
	{
		this.noTrapAreas.push(this.add.sprite(
			this.noTrapAreasPosScale[i][0],
			this.noTrapAreasPosScale[i][1],
			'capArea'));

		this.noTrapAreas[i].scale.set(
			this.noTrapAreasPosScale[i][2], 
			this.noTrapAreasPosScale[i][3]);

		this.physics.arcade.enable(this.noTrapAreas[i]);
		this.noTrapAreas[i].visible = false;
		this.noTrapAreas[i].id = i;
	},

	CreateFlags: function ()
	{
		for(var i = 0; i < this.nPlayers; ++i)
		{
			this.CreateFlag(i);
		}
	},

	CreateFlag: function (i)
	{
		this.flags.push(this.add.sprite(this.flagsStartPos[i][0], this.flagsStartPos[i][1], this.playerFlagImageKeys[i]));
		this.flags[i].anchor.set(0);

		this.flags[i].scale.set(0.5, 0.5);

		this.physics.arcade.enable(this.flags[i]);
		this.flags[i].body.gravity.y =400;
		this.flags[i].body.bounce.y = 0.2;
		
		this.flags[i].body.collideWorldBounds = true;
		this.flags[i].id = i;
		this.flags[i].carriedBy = -1;
		this.flags[i].nextAutoResetAt = -1;
	},

	// Creates one group of this.traps per player
	CreateTraps: function ()
	{
		for (var i = 0; i < this.nPlayers; i++)
		{
			this.traps.push([]);
			for (var j = 0; j < this.nTrapTypes; j++)
			{
				 this.traps[i].push([]);
				 this.traps[i][j] = this.CreateTrapGroup(i, j);
			}
		}
	},

	// Creates one group of this.traps
	CreateTrapGroup: function (i, j)
	{
		var trapGroup = this.add.group();

		trapGroup.enableBody = true;
		trapGroup.physicsBodyType = Phaser.Physics.ARCADE;

		trapGroup.createMultiple(this.nTrapAmts[i][j], this.trapImageKeys[j]);


		trapGroup.setAll('anchor.x', 0);
		trapGroup.setAll('anchor.y', 1);
		trapGroup.setAll('checkWorldBounds', true);

		// Creating new members for elements of a group CANNOT be done through setAll()
		// And suddenly forEach doesn't want to work for some reason,
		// so we'll do it the old fashioned way
		for (var k = 0; k < trapGroup.length; k++)
		{
			var trap = trapGroup.getAt(k)

			trap.typeID = j;

			trap.effect = this.trapEffects[j];
			trap.coolDown = this.normalTrapTypeCooldowns[j];
			trap.lifetime = this.normalTrapTypeLifetimes[j];

			trap.nextTriggerAt = -1;
			trap.ready = false;
			trap.resetAt = -1;
			trap.nextFlickerAt = -1;
		}
		return trapGroup;
	},

	CreateFlagResetBars: function ()
	{
		for (var i = 0; i < this.nPlayers; i++)
		{
			this.CreateFlagResetBar(i);
		}
	},

	CreateFlagResetBar: function (i)
	{
		// Create health bar background
	    var bmd = this.add.bitmapData(this.flagResetBarLen, this.flagResetBarHeight);
	    bmd.ctx.beginPath();
	    bmd.ctx.rect(0, 0, this.flagResetBarLen, this.flagResetBarHeight);
	    bmd.ctx.fillStyle = this.flagResetBgColors[i];
	    bmd.ctx.fill();
	    
	    var flagResetBar = this.add.sprite(
	    	this.flags[i].body.position.x - this.flagResetBarLen / 2, 
	    	this.flags[i].body.position.y - this.flagResetBarHeight,
	    	bmd);
	    flagResetBar.anchor.set(0, 0.5);

	    // Create reset fill
	    bmd = this.add.bitmapData(this.flagResetBarLen,this.flagResetBarHeight);
	    bmd.ctx.beginPath();
	    bmd.ctx.rect(0, 0, this.flagResetBarLen, this.flagResetBarHeight);
	    bmd.ctx.fillStyle = this.flagResetFillColors[i];
	    bmd.ctx.fill();

	    var flagResetFill = this.add.sprite(
	    	flagResetBar.position.x,
	    	flagResetBar.position.y,
	    	bmd);
	    flagResetFill.anchor.set (0, 0.5);
	    flagResetFill.cropEnabled = true;

	    flagResetFill.rectCrop = new Phaser.Rectangle(0, 0, bmd.width, bmd.height);
	    flagResetFill.crop(flagResetFill.rectCrop);
	    flagResetFill.rectCrop.width = 0; // Start invisible
	    flagResetFill.updateCrop();

	    // Set flagResetFill as a member of flagResetBar because they are linked.
	    flagResetBar.fill = flagResetFill;

	    flagResetBar.visible = true;

	    this.flagResetBars.push(flagResetBar);
	},

	CreatePlayers: function ()
	{
		for(var i = 0; i < this.nPlayers; ++i)
		{
			this.players.push(this.add.sprite(this.playersStartPos[i][0], this.playersStartPos[i][1], this.playerImageKeys[i]));
			this.players[i].facingLeft = this.playersStartFacingLeft[i];
			this.ConfigurePlayer(this.players[i]);
			this.players[i].id = i;
		}
	},

	ConfigurePlayer: function (player)
	{
		this.physics.arcade.enable(player);
		
		player.anchor.set(0.5, 0.5);

		player.body.bounce.y = 0.2;
		player.body.gravity.y =1500;
		player.body.collideWorldBounds = true;
		player.body.width = 14;
		player.body.height = 28;

		player.health = this.startingHealth;
		player.alive = true;
		player.stunnedUntil = -1;
		player.walkSpeed = this.normalWalkSpeed;
		player.jumpPower = this.normalJumpPower;
		player.nextJumpAt = 0;
		player.attacksPerSec = this.normalAttacksPerSec;
		player.nextAttackAt = 0;
		player.projSpeed = this.normalProjSpeed;
		player.weapDmg = this.normalWeapDmg;
		player.respawnTime = this.normalPlayerRespawnTime;
		player.nextRespawnAt = 0;
		player.carryingFlag = -1;
		player.score = 0;

		player.animations.add('left',[33,34,35],10,true);
		player.animations.add('right',[30,31,32],10,true);
		player.animations.add('idleLeft',[9,10,11],5,true);
		player.animations.add('idleRight',[6,7,8],5,true);

		player.animations.add('dieFallRight',[23,22,21,20,19,18],12,false);
		player.animations.add('dieFallLeft',[12,13,14,15,16,17],12,false);
		player.animations.add('attackLeft',[5,4,3],this.nFramesPerAttack*this.normalAttacksPerSec,true);
		player.animations.add('attackRight',[0,1,2],this.nFramesPerAttack*this.normalAttacksPerSec,true);

		player.animations.add('stunnedFaceLeft',[27,28,29],5,false);
		player.animations.add('stunnedFaceRight',[24,25,26],5,false);

		this.nFramesPerAttack = player.animations.getAnimation('attackLeft').frameTotal;
		this.nFramesPerWalkCycle = player.animations.getAnimation('left').frameTotal
	},

	CreateControls: function ()
	{
		// Player 1
		this.lMoveKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.A));
		this.rMoveKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.D));
		this.jumpKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.W));
		this.attackKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR));
		this.useFlagKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.S));
		this.useFlagKeys[0].onDown.add(function(){this.UseFlag(this.players[0]);}, this);
		this.placeTrap1Keys.push(this.input.keyboard.addKey(Phaser.Keyboard.T));
		this.placeTrap1Keys[0].onDown.add(function(){this.PlaceTrap(this.players[0], 0);}, this);
		this.placeTrap2Keys.push(this.input.keyboard.addKey(Phaser.Keyboard.Y));
		this.placeTrap2Keys[0].onDown.add(function(){this.PlaceTrap(this.players[0], 1);}, this);

		// Player 2
		this.lMoveKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.LEFT));
		this.rMoveKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.RIGHT));
		this.jumpKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.UP));
		this.attackKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_7));
		this.useFlagKeys.push(this.input.keyboard.addKey(Phaser.Keyboard.DOWN));
		this.useFlagKeys[1].onDown.add(function(){this.UseFlag(this.players[1]);}, this);
		this.placeTrap1Keys.push(this.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_8));
		this.placeTrap1Keys[1].onDown.add(function(){this.PlaceTrap(this.players[1], 0);}, this);
		this.placeTrap2Keys.push(this.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_9));
		this.placeTrap2Keys[1].onDown.add(function(){this.PlaceTrap(this.players[1], 1);}, this);
		
		// this.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(function(){this.ClearDebug();}, this);
	},

	CreateHealthBars: function ()
	{
		for(var i = 0; i < this.nPlayers; ++i)
		{
			this.CreateHealthBar(i);
		}
	},

	CreateHealthBar: function (i)
	{
		// Create health bar background
	    var bmd = this.add.bitmapData(this.hpBarLen, this.hpBarHeight);
	    bmd.ctx.beginPath();
	    bmd.ctx.rect(0, 0, this.hpBarLen, this.hpBarHeight);
	    bmd.ctx.fillStyle = this.hpBarsBgColors[i];
	    bmd.ctx.fill();

	    var hpBar = this.add.sprite(
	    	this.players[i].body.position.x - this.hpBarLen / 2, 
	    	this.players[i].body.position.y - this.hpBarHeight,
	    	bmd);
	    hpBar.anchor.set(0, 0.5);
	    

	    // Create health bar fill
	    bmd = this.add.bitmapData(this.hpBarLen, this.hpBarHeight);
	    bmd.ctx.beginPath();
	    bmd.ctx.rect(0, 0, this.hpBarLen, this.hpBarHeight);
	    bmd.ctx.fillStyle = this.hpBarsFillColors[i];
	    bmd.ctx.fill();

	    var hpFill = this.add.sprite(
	    	hpBar.position.x,
	    	hpBar.position.y,
	    	bmd);
	    hpFill.anchor.set (0, 0.5);
	    hpFill.cropEnabled = true;
	    // Set up the fill cropping mechanism.
	    hpFill.rectCrop = new Phaser.Rectangle(0, 0, bmd.width, bmd.height);
	    hpFill.crop(hpFill.rectCrop);

	    // Create respawn fill
	    bmd = this.add.bitmapData(this.hpBarLen, this.hpBarHeight);
	    bmd.ctx.beginPath();
	    bmd.ctx.rect(0, 0, this.hpBarLen, this.hpBarHeight);
	    bmd.ctx.fillStyle = this.hpBarsRespawnFillColors[i];
	    bmd.ctx.fill();

	    var hpRespawnFill = this.add.sprite(
	    	hpBar.position.x,
	    	hpBar.position.y,
	    	bmd);
	    hpRespawnFill.anchor.set (0, 0.5);
	    hpRespawnFill.cropEnabled = true;

	    hpRespawnFill.rectCrop = new Phaser.Rectangle(0, 0, bmd.width, bmd.height);
	    hpRespawnFill.crop(hpRespawnFill.rectCrop);
	    hpRespawnFill.rectCrop.width = 0; // Start invisible
	    hpRespawnFill.updateCrop();

	    // Set hpFill as a member of hpBar because they are linked.
	    hpBar.fill = hpFill;
	    hpBar.respawnFill = hpRespawnFill;

	    this.hpBars.push(hpBar);
	},

	CreateProjectiles: function ()
	{
		for(var i = 0; i < this.nPlayers; ++i)
		{
			this.CreateProjectilePool(i);
		}
	},

	CreateProjectilePool: function (i)
	{
		// Add an empty sprite group into our game
		this.playerProjPools.push(this.add.group());

		// Enable physics to the whole sprite group
		this.playerProjPools[i].enableBody = true;
		this.playerProjPools[i].physicsBodyType = Phaser.Physics.arcade;

		// Add 100 'projectile' sprites in the group.
		// By default this uses the first frame of the spritesheet and
		// sets the initial state as non-existing (i.e. killed / dead)
		this.playerProjPools[i].createMultiple(this.projPoolSize, this.playerProjImageKeys[i]);

		// Sets the anchors of all sprites
		this.playerProjPools[i].setAll('anchor.x', 0.5);
		this.playerProjPools[i].setAll('anchor.y', 0.5);

		// Misc settings
		this.playerProjPools[i].setAll('outOfBoundsKill', true);
		this.playerProjPools[i].setAll('checkWorldBounds', true);

		for (var k = 0; k < this.playerProjPools[i].length; k++)
		{
			var projectile = this.playerProjPools[i].getAt(k);
			projectile.damage = 0;
			projectile.id = i;
			projectile.animations.add('projAnim', null, 6, true);
		}

		// Doesn't work suddenly, so it has been replaced with the for
		// loop above.
		this.playerProjPools[i].forEach(function (projectile)
		{
			projectile.damage = 0;
			projectile.id = i;
			projectile.animations.add('projAnim', null, 6, true);
		});
	},
	/**** ENDREGION: CREATE ****/


	/**** REGION: UPDATE ****/
	update: function ()
	{
		for (var i = 0; i < this.nPlayers; i++)
		{
			this.HandlePlayerPhysics(i);
			this.HandlePlayerInput(i);
			this.HandleFlagPhysics(i);

			if(this.players[i].alive && this.players[i].health <= 0)
			{
				this.KillPlayer(i);
				this.StartRespawnTimer(i);
			}

			if(!this.players[i].alive && this.time.now >= this.players[i].nextRespawnAt)
			{
				this.RevivePlayer(i);
			}
		}

		this.HandleProjPhysics();

		if(!this.gameOver)
		{
			this.CheckGameCollisions();
			this.CheckFlagAutoReset();
			this.CheckTrapTimers();
		}

	},

	HandlePlayerInput: function (i)
	{
		if(!this.players[i].alive) return;
		if(this.HandlePlayerStun(i))
		{
			this.StunnedAnim(this.players[i]);
			return;
		}

		if(this.gameOver) 
		{
			this.IdleAnim(this.players[i]);
			return;
		}

		// Attack logic and check if attack encumbrance effects should be applied
		var attacking = false;
		if(this.attackKeys[i].isDown)
		{
			attacking = true;
			this.AttackLogic(this.players[i])
		}

		// Check if flag encumbrance effects should be applied
		var hasFlag = this.players[i].carryingFlag != -1;

		if (this.lMoveKeys[i].isDown)
		{
			this.players[i].facingLeft = true;
			this.WalkLeftLogic(this.players[i],
				(attacking ? this.attackingWalkSpeedPerc : 1) *
				(hasFlag ? this.carryFlagWalkSpeedPerc : 1)
				);
		}
		else if(this.rMoveKeys[i].isDown)
		{
			this.players[i].facingLeft = false;
			this.WalkRightLogic(this.players[i],
				(attacking ? this.attackingWalkSpeedPerc : 1) *
				(hasFlag ? this.carryFlagWalkSpeedPerc : 1)
				);
		}

		if (this.jumpKeys[i].isDown && this.players[i].body.onFloor())
		{
		    this.JumpLogic(this.players[i]);
		}

		if (attacking)
		{
			this.AttackAnim(this.players[i]);
		}
		else if (this.lMoveKeys[i].isDown || this.rMoveKeys[i].isDown)
		{
			this.WalkAnim(this.players[i]);
		}
		else
		{
			this.IdleAnim(this.players[i]);
		}
	},

	HandlePlayerStun: function (i)
	{
		// Not stunned
		if(this.players[i].stunnedUntil == -1) 
			{return false;}
		else
		{
			if(this.players[i].stunnedUntil <= this.time.now)
			{
				// Stun worn off
				this.players[i].stunnedUntil = -1;
				return false;
			}
			else
			{
				// Stil stunned
				return true;
			}
		}
	},

	HandlePlayerPhysics: function (i)
	{
		this.players[i].body.velocity.x = 0;
		this.physics.arcade.collide(this.players[i], this.collisionLayer);
	},

	HandleFlagPhysics: function (i)
	{
		// Normally collide with the world and be subject to gravity if not carried.
		if(this.flags[i].carriedBy == -1) 
		{
			this.flags[i].body.gravity.y =400;
			this.physics.arcade.collide(this.flags[i], this.collisionLayer);
			return;
		}

		// Follow player if carried
		this.flags[i].body.gravity.y = 0;
		var cb = this.flags[i].carriedBy;
		this.flags[i].body.position.set(
			this.players[cb].body.position.x + this.flagCarryOffset[0], 
			this.players[cb].body.position.y - this.players[cb].height + this.flagCarryOffset[1]);
	},

	CheckGameCollisions: function ()
	{
		this.CheckPlayerCollisions();
		this.CheckFlagCollisions();
		this.CheckTrapCollisions();
	},

	HandleProjPhysics: function ()
	{
		for(var i = 0; i < this.playerProjPools.length; ++i)
		{
			// Projectiles hit terrain
			this.physics.arcade.overlap(
				this.playerProjPools[i], this.collisionLayer, this.ProjHitEnv, null, this);
		}
	},

	CheckPlayerCollisions: function ()
	{
		// Projectiles collision
		for(var i = 0; i < this.nPlayers; ++i)
		{
			if(!this.players[i].alive) {continue;}

			for(var j = 0; j < this.playerProjPools.length; ++j)
			{
				// If these are the not player's own projectiles
				// And the target player is alive
				if(i != j)
				{
					this.physics.arcade.overlap(
						this.playerProjPools[j], this.players[i], this.ProjHitPlayer, null, this);
				}
			}
		}
	},

	CheckFlagCollisions: function ()
	{
		for (var i = 0; i < this.flags.length; i++) 
		{
			for (var j = 0; j < this.flagCapAreas.length; j++) 
			{
				if(i == j)
				{
					// Flag not carried, not already on timer, and not in its own base
					if(this.flags[i].carriedBy == -1 && 
						this.flags[i].nextAutoResetAt == -1 &&
						!this.physics.arcade.overlap(this.flags[i], this.flagCapAreas[j]))
					{
	 					this.flags[i].nextAutoResetAt = this.time.now + this.flagAutoResetTime;
					}
				}
				else if(this.physics.arcade.overlap(this.flags[i], this.flagCapAreas[j]))
				{
					this.FlagCaptured(this.flags[i], this.flagCapAreas[j]);
				}
			}
		}
	},

	CheckTrapCollisions: function ()
	{
		for (var i = 0; i < this.traps.length; i++)
		{
			for (var j = 0; j < this.traps[i].length; j++)
			{
				this.physics.arcade.overlap(
					this.traps[i][j], this.players, this.PlayerTriggeredTrap, null, this);
			}
		}
	},

	PlayerTriggeredTrap: function (player, trap)
	{
		if(trap.ready && player.alive)
		{
			/* 
			This has to be hard-coded because
			after moving from one javascript script into these
			prototypes and different states, the function
			pointers in this.trapEffects stopped working.

			If you were to print trap.effect to the screen:

			this.Debug(trap.effect);

			you would see that the code of the correct function does 
			get printed, but for some reason it refuses to work
			as a real function anymore.

			1. trap.effect(player);
			2. trapEffects[trap.typeID](player);
			3. var a = trapEffects[trap.typeID];
				a(player);
			4. trapEffects[0](player);

			None of these work anymore. So, this hard-coding is
			an unfortunate necessity.
			*/
			if(trap.typeID == 0)
			{
				this.StunTrapEffect(player);
			}
			else if(trap.typeID == 1)
			{

				this.SpikeTrapEffect(player);
			}

			trap.ready = false;
			trap.alpha = this.disabledTrapOpacity;
			trap.nextTriggerAt = this.time.now + trap.coolDown;
		}
	},

	PlaceTrap: function (player, trapTypeIndex)
	{
		if(player.body.onFloor())
		{
			for(var i = 0; i < this.noTrapAreas.length; ++i)
			{
				if(this.physics.arcade.overlap(player, this.noTrapAreas[i]))
				{
					return;
				}
			}

			var trap = this.traps[player.id][trapTypeIndex].getFirstExists(false);
			trap.reset(
				player.body.position.x - player.body.width / 2,
				player.body.position.y + player.body.height
				);
			trap.ready = false;
			trap.alpha = this.disabledTrapOpacity;
			trap.tint = this.trapFlickerTints[0];
			trap.nextFlickerAt = -1;
			trap.nextTriggerAt = this.time.now + trap.coolDown;
			trap.resetAt = this.time.now + trap.lifetime;
		}
	},

	CheckTrapTimers: function ()
	{
		for (var i = 0; i < this.traps.length; i++) {
			for (var j = 0; j < this.traps[i].length; j++) {
				for (var k = 0; k < this.traps[i][j].length; k++) {
					var trap = this.traps[i][j].getAt(k);

					if(trap.resetAt != -1)
					{
						var trapTTL = trap.resetAt - this.time.now;
						if(trapTTL <= 0)
						{
							this.ResetTrap(trap);
						}
						else if(trapTTL <= this.trapResetWarningDurations[j] &&
							trap.nextFlickerAt <= this.time.now)
						{
							this.ToggleTrapTint(trap);
							trap.nextFlickerAt = this.time.now + this.trapFlickerInterval;
						}
					}

					if(!trap.ready &&
						trap.nextTriggerAt != -1 &&
					 	trap.nextTriggerAt <= this.time.now)
					{
						this.PrimeTrap(trap);
					}

				};
			};
		};
	},

	ToggleTrapTint: function (trap)
	{
		trap.tint = trap.tint == this.trapFlickerTints[0] ? this.trapFlickerTints[1] : this.trapFlickerTints[0];
	},

	ResetTrap: function (trap)
	{
		trap.nextTriggerAt = -1;
		trap.resetAt = -1;
		trap.ready = false;
		trap.nextFlickerAt = -1;
		trap.alpha = 1;
		trap.tint = this.trapFlickerTints[0];
		trap.kill();
	},

	PrimeTrap: function (trap)
	{
		trap.ready = true;
		trap.alpha = 1;
	},

	CheckFlagAutoReset: function ()
	{
		for (var i = 0; i < this.flags.length; i++) 
		{
			if(this.flags[i].nextAutoResetAt != -1)
			{
				if(this.flags[i].carriedBy != -1)
				{
					// If flag has been picked up, reset the auto-reset timer
					this.flags[i].nextAutoResetAt = -1;
				}
				else if(this.flags[i].nextAutoResetAt <= this.time.now)
				{
					this.ResetFlag(this.flags[i]);
				}
			}
		}
	},

	ProjHitPlayer: function (player, proj)
	{
		player.health -= proj.damage;
		proj.kill();
		this.projHitAudio.play();
	},

	ProjHitEnv: function (proj, env)
	{
		proj.kill();
	},

	UseFlag: function (player)
	{
		if(!player.alive || player.stunnedUntil != -1) 
			{return;}

		if(player.carryingFlag != -1)
		{
			this.DropFlag(player);
			return;
		}

		for(var i = 0; i < this.flags.length; ++i)
		{
			if(this.physics.arcade.overlap(player, this.flags[i]))
			{
				if(player.carryingFlag == -1)
				{
					this.PickupFlag(player, this.flags[i]);
				}
			}
		}
	},

	PickupFlag: function (player, flag)
	{
		if(flag.carriedBy != -1)
		{
			// Snatching flag
			this.SnatchFlag(player, this.players[flag.carriedBy], flag);
		}
		else
		{
			// Picking up flag
			flag.carriedBy = player.id;
			flag.nextAutoResetAt = -1;
			player.carryingFlag = flag.id;
		}

		// for (var i = 0; i < this.nPlayers; i++)
		// {
		// 	this.Debug("Player " + this.players[i].id + " is carrying the flag " + this.players[i].carryingFlag);
		// 	this.Debug("Flag " + this.flags[i].id + " is being carried by player " + this.flags[i].carriedBy);
		// }
	},

	SnatchFlag: function(snatcher, snatchee, flag)
	{
		if(snatcher.carryingFlag != -1)
		{
			this.Debug("Player " + snatcher.id + " is already carrying flag " + snatcher.carryingFlag + ".");
		}

		if(flag.carriedBy == -1)
		{
			this.Debug("Flag " + flag.id + " is not carried by anyone but is being snatched by player " + snatcher.id);
		}

		if(snatchee.carryingFlag == -1)
		{
			this.Debug("Player " + snatchee.id + " is not carrying a flag but it is being snatched somehow.");
		}

		flag.carriedBy = snatcher.id;
		snatcher.carryingFlag = flag.id;
		snatchee.carryingFlag = -1;
	},

	DropFlag: function (player)
	{
		// Check is here because player is told to drop flag upon death, and he may not be carrying a flag.
		if(player.carryingFlag == -1)
		{
			return;
		}

		// Teleport it to the player before dropping it so the player can't do anything funny with the flag.
		this.flags[player.carryingFlag].position.set(
			player.body.position.x + player.body.width / 2, 
			player.body.position.y + player.body.height / 2);

		this.flags[player.carryingFlag].carriedBy = -1;
		player.carryingFlag = -1;
	},

	KillPlayer: function (i)
	{
		this.players[i].alive = false;
		this.players[i].stunnedUntil = -1;

		this.DropFlag(this.players[i]);

		this.players[i].animations.play(
			this.players[i].facingLeft?
			'dieFallLeft' :
			'dieFallRight'
			);

		this.deathAudio[Math.floor(Math.random() * this.deathAudio.length)].play();
	},

	StartRespawnTimer: function (i)
	{
		this.players[i].nextRespawnAt = this.time.now + this.players[i].respawnTime;
	},

	RevivePlayer: function (i)
	{
		// Teleport to start
		/*
		Important to teleport to start first before marking as alive so that projectiles still flying over the player's corpse will not hurt him.
		*/
		this.players[i].position.set(this.playersStartPos[i][0], this.playersStartPos[i][1]);

		this.players[i].health = this.startingHealth;
		this.players[i].alive = true;
	},

	FlagCaptured: function (flag, capArea)
	{
		this.players[flag.carriedBy].carryingFlag = -1;
		this.ResetFlag(flag);

		this.players[capArea.id].score++;

		if(!this.CheckForWin(this.players[capArea.id]))
		{
			this.flagCapAudio.play();
		}
	},

	ResetFlag: function (flag)
	{
		flag.body.position.set(
			this.flagsStartPos[flag.id][0],
			this.flagsStartPos[flag.id][1]
			);
		flag.carriedBy = -1;
		flag.nextAutoResetAt = -1;
	},

	CheckForWin: function (player)
	{
		if(player.score >= this.captureGoal)
		{
			this.EndGame(player);
			return true;
		}
	},

	EndGame: function (winnerPlayer)
	{

		this.gameOver = true;
		for (var i = 0; i < this.useFlagKeys.length; i++)
		{
			this.useFlagKeys[i].onDown.removeAll(this);
		}

		this.gameOverAudio.play();

		if(winnerPlayer.id == 0)
		{
			this.gameOverText = this.add.text(this.world.width / 2, this.world.height / 2 - 100,
			        'Blue player has won!',
			        {font: '60px monospace', fill: '#00f', align: 'center'}
			        );
		}
		else
		{
			this.gameOverText = this.add.text(this.world.width / 2, this.world.height / 2 - 100,
			        'Red player has won!',
			        {font: '60px monospace', fill: '#f00', align: 'center'}
			        );
		}



		this.gameOverText.anchor.set(0.5);

		//this.MakeButton('Main Menu', this.world.width / 2, this.world.height / 2 + 100);
	},

	JumpLogic: function (player, optMultiplier)
	{
		if(player.nextJumpAt <= this.time.now)
		{
			if(optMultiplier == null) optMultiplier = 1;
			player.body.velocity.y = -(player.jumpPower * optMultiplier);
			player.nextJumpAt = this.time.now + this.normalJumpCooldown;
		}
	},

	WalkLeftLogic: function (player, optMultiplier)
	{
		// Reduction parameter is optional
		if(optMultiplier == null) optMultiplier = 1;
		player.body.velocity.x = -(player.walkSpeed * optMultiplier);
	},

	WalkRightLogic: function (player, optMultiplier)
	{
		if(optMultiplier == null) optMultiplier = 1;
		player.body.velocity.x = (player.walkSpeed * optMultiplier);
	},

	AttackLogic: function (player)
	{
		// Get a projectile
		if(this.time.now > player.nextAttackAt && this.playerProjPools[player.id].countDead() > 0)
		{
			var proj = this.playerProjPools[player.id].getFirstExists(false);
			proj.reset(
				player.body.position.x + (player.facingLeft ? -player.width/2 : player.width), 
				player.body.position.y + this.playerAttackYOffset);
			proj.play('projAnim');

			this.playerProjShootAudioArr[player.id].play();

			// Give it a damage
			proj.damage = player.weapDmg;

			// Fire it in the correct direction
			proj.body.velocity.x = player.facingLeft ? -player.projSpeed : player.projSpeed;

			// Set cooldown
			player.nextAttackAt = this.time.now + 1000 / player.attacksPerSec;
		}
	},
	AttackAnim: function (player)
	{
		var animSpeed = player.attacksPerSec * this.nFramesPerAttack;

		// Prevent animSpeed from going below 1FPS (causes problems)
		if(animSpeed < 1) {animSpeed = 1;}

		if (player.facingLeft)
		{
			player.animations.getAnimation('attackLeft').speed = animSpeed;
			player.animations.play('attackLeft');
		}
		else
		{
			player.animations.getAnimation('attackRight').speed = animSpeed;
			player.animations.play('attackRight');
		}
	},
	IdleAnim: function (player)
	{
		if (player.facingLeft)
			player.animations.play('idleLeft');
		else
			player.animations.play('idleRight');
	},
	WalkAnim: function (player)
	{
		var animSpeed = this.nFramesPerWalkCycle * (player.walkSpeed / 1000) * this.walkAnimSpeedCoeff;

		// Prevent animSpeed from going below 1FPS (causes problems)
		if(animSpeed < 1) {animSpeed = 1;}

		if(player.facingLeft)
		{
			player.animations.getAnimation('left').speed = animSpeed;
			player.animations.play('left');
		}
		else
		{
			player.animations.getAnimation('right').speed = animSpeed;
			player.animations.play('right');
		}
	},
	StunnedAnim: function (player)
	{
		if(player.facingLeft)
			player.animations.play('stunnedFaceLeft');
		else
			player.animations.play('stunnedFaceRight');
	},
	/**** ENDREGION: UPDATE ****/

	render: function () 
	{
		this.RenderHealthBars();
		if(!this.gameOver) {this.RenderFlagResetBars();}
	},

	RenderFlagResetBars: function ()
	{
		for (var i = 0; i < this.flagResetBars.length; i++) 
		{
				// Update bar position
			this.flagResetBars[i].position.set(
				this.flags[i].body.position.x - this.flagResetBars[i].width / 2 + this.flags[i].body.width / 2, // 4 because hpBar's anchor was changed after it was created.
				this.flags[i].body.position.y - this.flagResetBars[i].height);
			this.flagResetBars[i].fill.position = this.flagResetBars[i].position;

			if(this.flags[i].nextAutoResetAt == -1)
			{
				// Make invisible
				this.flagResetBars[i].visible = false;
				// Update the bar fill amount.
			    this.flagResetBars[i].fill.rectCrop.width = 0;
			}
			else
			{
				// Make visible
				this.flagResetBars[i].visible = true;
				// Update the bar fill amount.
			    this.flagResetBars[i].fill.rectCrop.width = this.flagResetBars[i].width - (((this.flags[i].nextAutoResetAt - this.time.now)/this.flagAutoResetTime) * this.flagResetBars[i].width);
			}

			this.flagResetBars[i].fill.updateCrop();
		}
	},

	RenderHealthBars: function ()
	{
		for (var i = 0; i < this.nPlayers; i++) 
		{
				// Update health bar position
			this.hpBars[i].position.set(
				this.players[i].body.position.x - this.hpBars[i].width / 2 + this.players[i].body.width / 2, // 4 because hpBar's anchor was changed after it was created.
				this.players[i].body.position.y - this.hpBars[i].height);
			this.hpBars[i].fill.position = this.hpBars[i].position;
			this.hpBars[i].respawnFill.position = this.hpBars[i].position;

			if(this.players[i].alive)
			{
				// Update the health bar fill amount.
			    this.hpBars[i].fill.rectCrop.width = this.players[i].health / this.startingHealth * this.hpBars[i].width;
			    // Respawn should be invisible
			    this.hpBars[i].respawnFill.rectCrop.width = 0;
			}
			else
			{
				// Update the respawn bar fill amount.
			    this.hpBars[i].respawnFill.rectCrop.width = this.hpBars[i].width - (((this.players[i].nextRespawnAt - this.time.now)/this.players[i].respawnTime) * this.hpBars[i].width);
			    // Health fill should be invisible
			    this.hpBars[i].fill.rectCrop.width = 0;
			}

			this.hpBars[i].fill.updateCrop();
			this.hpBars[i].respawnFill.updateCrop();
		}
	},


	Debug: function (msg)
	{
		if(this.debugText == null)
		{
			this.debugText = this.add.text(this.world.width / 2, this.world.height / 2 - 100,
		        msg,
		        {font: '20px monospace', fill: '#000', align: 'center'}
		        );
			this.debugText.anchor.set(0.5);
		}
		else
		{
			this.debugText.text += '\n' + msg;
		}
	},

	ClearDebug: function()
	{
		if(this.debugText != null)
		{
			this.debugText.text = "";
		}
	}
};






