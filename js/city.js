// city.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};


app.city = {
    	// CONSTANT properties
    	
		// variable properties
		renderer: undefined,
		scene: undefined,
		camera: undefined,
		myobjects: [],
		paused: false,
		dt: 1/60,
		controls: undefined,
		// **added stuffs
		playerBox: undefined,
		playerBB: undefined,
		collisionBoxTest: undefined,
		fishBB: undefined,
		texture_placeholder : undefined,
		skyMesh : undefined,
		
		CURRENT_LEVEL : 0, 
		MAX_GOOD_FISH:  0, 
		MAX_BAD_FISH : 0, 
		NUM_GOOD_FISH : 0,
		NUM_BAD_FISH : 0,
		FISH_SPEED : 1,
		score: 5,
		
		zombieArray : undefined,
		
		fishArray : undefined,
		
    	init : function() {
			console.log('init called');
			this.controls = new THREE.FirstPersonControls(this.camera);
			// EWWW
			/*this.texture_placeholder = document.createElement( 'canvas' );
			this.texture_placeholder.width = 128;
			this.texture_placeholder.height = 128;*/
			this.MAX_BAD_FISH = 10;
			this.MAX_GOOD_FISH = 5;
			
			this.setupThreeJS();
			this.setupWorld();
			// Load models
			/*var loader = new THREE.JSONLoader();
			loader.load( "models/lamefish.js", modelToScene, this.scene );*/
			this.resetLevel();
			this.update();
    	},
		
		
    	    	
    update: function(){
    	// schedule next animation frame
    	app.animationID = requestAnimationFrame(this.update.bind(this));
    	
		// PAUSED?
		if (app.paused){
			this.drawPauseScreen();
			return;
		 }
	
	
		// UPDATE
		this.controls.update(this.dt);
		// **update playerBB
		var xOffset = this.camera.position.x - this.playerBox.position.x;
		var yOffset = this.camera.position.y - this.playerBox.position.y;
		var zOffset = this.camera.position.z - this.playerBox.position.z;
		this.playerBox.position.x = this.camera.position.x;
		this.playerBox.position.y = this.camera.position.y;
		this.playerBox.position.z = this.camera.position.z;
		var offsetVector = new THREE.Vector3(xOffset, yOffset, zOffset);
		this.playerBB.translate(offsetVector);
		if(this.playerBB.isIntersectionBox(this.fishBB)){
			// hurt the player and kill the fish
			//console.log("hit!");
			this.scene.remove(this.collisionBoxTest);
			this.scene.remove(this.fishBB);
		}
		
		// ********shoot code********
		if(app.keydown[app.KEYBOARD.KEY_SPACE]){
			console.log("shoot");
		}
	
	
		this.skyMesh.position = (this.camera.position);
		
		// update fishies
		this.updateFish();
		
		
		// DRAW	
		this.renderer.render(this.scene, this.camera);
		
		// Render HUD
		this.drawHUD();
	},
	
	drawHUD : function()
	{
		document.querySelector('#score').innerHTML = "Score: " + this.score;
	},
	
	updateFish : function()
	{
		// if all the zombies are dead, then time to reset the level
		if(this.zombieArray.length == 0){ resetLevel(); }
	
		for(var  i = 0; i < this.fishArray.length; i++)
		{
			var closestZombieLength;
			var closestZombieIndex;
			// Good fish: flee nearest zombiefish (within params)
			for(var j = 0; j < this.zombieArray.length; j++)
			{
				if(this.distToPoint(
				this.fishArray[i].mesh.position.x,
				this.fishArray[i].mesh.position.y,
				this.fishArray[i].mesh.position.z, 
				this.zombieArray[j].mesh.position.x,
				this.zombieArray[j].mesh.position.y ,
				this.zombieArray[j].mesh.position.y) < closestZombieLength)
				{
					// new closest zombie
					closestZombieIndex = j;
					closestZombieLength = this.distToPoint(
						this.fishArray[i].mesh.position.x,
						this.fishArray[i].mesh.position.y,
						this.fishArray[i].mesh.position.z, 
						this.zombieArray[j].mesh.position.x,
						this.zombieArray[j].mesh.position.y ,
						this.zombieArray[j].mesh.position.y);
				}
				
			}
			// we know which zombie this fish will try to avoid 
			// so get the vector 
			// TODO
		}
		
		for(var i =0; i< this.zombieArray.length; i++)
		{
		var closestFishLength;
			var closestFishIndex;
			// Good fish: chase nearest fish (within params)
			for(var j = 0; j < this.fishArray.length; j++)
			{
				if(this.distToPoint(
				this.zombieArray[i].mesh.position.x,
				this.zombieArray[i].mesh.position.y,
				this.zombieArray[i].mesh.position.z, 
				this.fishArray[j].mesh.position.x,
				this.fishArray[j].mesh.position.y ,
				this.fishArray[j].mesh.position.y) < closestFishLength)
				{
					// new closest zombie
					closestFishIndex = j;
					closestFishLength = this.distToPoint(
					this.zombieArray[i].mesh.position.x,
					this.zombieArray[i].mesh.position.y,
					this.zombieArray[i].mesh.position.z, 
					this.fishArray[j].mesh.position.x,
					this.fishArray[j].mesh.position.y ,
					this.fishArray[j].mesh.position.y);
				}
				
			}
			
			// TODO: do something with our newfound knowledge of the closest fish
		
		}
	},
	
	distToPoint : function(object1X,object1Y,object1Z, object2X,object2Y,object2Z)
	{
		var objectDistance = Math.sqrt((object2X-object1X)*(object2X-object1X) + 
                      (object2Y-object1Y)*(object2Y-object1Y) + 
                      (object2Z-object1Z)*(object2Z-object1Z));
					  
		return objectDistance;
	},
	
	// Get the vector oppo
	getOpposingVector : function (x,y,z, x2, y2, z2)
	{
		var xDist = x2 - x;
		var yDist = y2 - y; 
		var zDist = z2 - z;
	},
	
	
	loadTexture:function( path ) 
	{
		
		var texture = new THREE.Texture( this.texture_placeholder );
		var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 });
		var image = new Image();
		image.onload = function () {

			texture.image = this;
			texture.needsUpdate = true;

		};
		image.src = path;
		console.log("Loaded texture: " + image.src);
		
		
		return material;
	},
	
	setupThreeJS: function() {
				this.scene = new THREE.Scene();
				//this.scene.fog = new THREE.Fog(0x000000, 0.004);

				this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
				this.camera.position.y = 200;
				//this.camera.position.z = 400;
				this.camera.rotation.x = -45 * Math.PI / 180;
				
				// **player Bounding Box
				var bBGeometry = new THREE.CubeGeometry(10, 10, 10);
				var bBMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
				this.playerBox = new THREE.Mesh(bBGeometry, bBMaterial);				
				this.playerBox.position.x = this.camera.position.x;
				this.playerBox.position.y = this.camera.position.y;
				this.playerBox.position.z = this.camera.position.z;
				this.scene.add(this.playerBox);
				/*var maxX = this.playerBox.position.x + 5;
				var maxY = this.playerBox.position.y + 5;
				var maxZ = this.playerBox.position.z + 5;
				var minX = this.playerBox.position.x - 5;
				var minY = this.playerBox.position.y - 5;
				var minZ = this.playerBox.position.z - 5;
				var maxBB = new THREE.Vector3(maxX, maxY, maxZ);
				var minBB = new THREE,Vector3(minX, minY, minZ);*/
				this.playerBB = new THREE.Box3();
				this.playerBB.setFromObject(this.playerBox);
				this.scene.add(this.playerBB);
				//console.log("player x-val: " + this.playerBox.position.x + " | BB x-val: " + this.playerBB.min.x);
				//console.log("player y-val: " + this.playerBox.position.y + " | BB y-val: " + this.playerBB.min.y);
				//console.log("player z-val: " + this.playerBox.position.z + " | BB z-val: " + this.playerBB.min.z);

				// ???? skybox stuff
				this.texture_placeholder = document.createElement( 'canvas' );
				this.texture_placeholder.width = 128;
				this.texture_placeholder.height = 128;
				
				// Set up skybox
				var materials = [

					this.loadTexture( 'textures/cube/skybox/px.jpg' ), // right
					this.loadTexture( 'textures/cube/skybox/nx.jpg' ), // left
					this.loadTexture( 'textures/cube/skybox/py.jpg' ), // top
					this.loadTexture( 'textures/cube/skybox/ny.jpg' ), // bottom
					this.loadTexture( 'textures/cube/skybox/pz.jpg' ), // back
					this.loadTexture( 'textures/cube/skybox/nz.jpg' )  // front

				];
				
				// Add the box mesh and stuff
				this.skyMesh = new THREE.Mesh( new THREE.CubeGeometry( 1000, 1000, 1000, 100, 100, 100 ), new THREE.MeshFaceMaterial( materials ) );
				this.skyMesh.scale.x = - 1; // necessary
				this.scene.add( this.skyMesh );
				
				this.renderer = new THREE.WebGLRenderer({antialias: true});
				this.renderer.setSize( window.innerWidth, window.innerHeight );
				this.renderer.shadowMapEnabled = true;
				document.body.appendChild(this.renderer.domElement );

				this.controls = new THREE.FirstPersonControls(this.camera);
				this.controls.movementSpeed = 100;
				this.controls.lookSpeed = 0.15;
				this.controls.autoForward = false;
	},
	
	
	// Takes a position and makes a fish.
	makeZombieFish : function(fx, fy, fz)
	{
		var mat = new THREE.MeshPhongMaterial({color: 0xde1f29, overdraw: true});
		var geom = new THREE.CubeGeometry(10,10,10);
		var fish = new THREE.Mesh(geom, mat);
		fish.castShadow = true;
		/*var boundingbox = new THREE.Box3();
		boundingBox.setFromObject(fish);*/
		
		fish.position.x = fx; fish.position.y = fy; fish.position.z = fz;
		
		this.scene.add(fish);
		
		var returnable = {"mesh": fish};
		console.log("Zombie fish made: " + returnable);
		return returnable;
		
	},
	
	// Takes a position and makes a fish.
	makeFish : function(fx, fy, fz)
	{
		var mat = new THREE.MeshPhongMaterial({color: 0xc4dcf5, overdraw: true});
		var geom = new THREE.CubeGeometry(10,10,10);
		var fish = new THREE.Mesh(geom, mat);
		fish.castShadow = true;
		/*var boundingbox = new THREE.Box3();
		boundingBox.setFromObject(fish);*/
		
		fish.position.x = fx; fish.position.y = fy; fish.position.z = fz;
		
		this.scene.add(fish);
		
		var returnable = {"mesh": fish};
		console.log("Fish made: " + returnable);
		return returnable;
		
	},
	
	// Reset the level and the number of fish.
	resetLevel : function()
	{
		// Increase the amount of stuff that's going on
		this.MAX_BAD_FISH = this.MAX_BAD_FISH*1.2;
		this.MAX_GOOD_FISH = this.MAX_GOOD_FISH*1.2;
		
		// Update numbers
		this.NUM_BAD_FISH = this.MAX_BAD_FISH;
		this.NUM_GOOD_FISH = this.MAX_BAD_FISH; 
		
		// Obliterate remaining fish
		this.fishArray = [];
		this.zombieArray = [];
		
		for(var  i = 0; i < this.MAX_BAD_FISH; i++)
		{
			this.zombieArray.push(this.makeZombieFish( app.utilities.getRandom(-300,300), app.utilities.getRandom(-300,300), app.utilities.getRandom(-300,300) ));
		}
		
		for(var  i = 0; i < this.MAX_GOOD_FISH; i++)
		{
			this.fishArray.push(this.makeFish( app.utilities.getRandom(-300,300), app.utilities.getRandom(-300,300), app.utilities.getRandom(-300,300) ));
		}
		
		
	},
	
	
	
	setupWorld: function() {

				var geo = new THREE.PlaneGeometry(2000, 2000, 40, 40);
				var mat = new THREE.MeshPhongMaterial({color: 0x116130, overdraw: true, transparent: true, opacity: .2});
				var floor = new THREE.Mesh(geo, mat);
				floor.rotation.x = -0.5 * Math.PI;
				floor.translate(0,-900,0);
				floor.receiveShadow = true;
				this.scene.add(floor);
				
				// **collision box for texting
				var boxGeometry = new THREE.CubeGeometry( 10, 10, 10);
				var boxMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
				this.collisionBoxTest = new THREE.Mesh(boxGeometry, boxMaterial);
				this.collisionBoxTest.position.x = 100;
				this.collisionBoxTest.position.y = 100;
				this.collisionBoxTest.castShadow = true;
				this.scene.add(this.collisionBoxTest);
				this.fishBB = new THREE.Box3();
				this.fishBB.setFromObject(this.collisionBoxTest);
				console.log("fish x-val: " + this.collisionBoxTest.position.x + " | BB x-val: " + this.fishBB.min.x);
				console.log("fish y-val: " + this.collisionBoxTest.position.y + " | BB y-val: " + this.fishBB.min.y);
				console.log("fish z-val: " + this.collisionBoxTest.position.z + " | BB z-val: " + this.fishBB.min.z);
				this.scene.add(this.fishBB);
			
				// build city and add to scene
				var geometry = new THREE.CubeGeometry( 1, 1, 1 );
				geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );

				// add directional light and enable shadows
				var light = new THREE.DirectionalLight(0xf9f1c2, 1);
				light.position.set(400, 400, 400);
				light.castShadow = true;
				light.shadowMapWidth = 2048;
				light.shadowMapHeight = 2048;
				
				var d = 1000;
				light.shadowCameraLeft = d;
				light.shadowCameraRight = -d;
				light.shadowCameraTop = d;
				light.shadowCameraBottom = -d;
				light.shadowCameraFar = 2500;
				this.scene.add(light);
				// light 2
				var light = new THREE.DirectionalLight(0xf9f1c2, 1);
				light.position.set(-400, 400, -400);
				light.castShadow = true;
				light.shadowMapWidth = 2048;
				light.shadowMapHeight = 2048;
				
				var d = 1000;
				light.shadowCameraLeft = d;
				light.shadowCameraRight = -d;
				light.shadowCameraTop = d;
				light.shadowCameraBottom = -d;
				light.shadowCameraFar = 2500;
				this.scene.add(light);
	},

	
	drawPauseScreen: function(){
		// do something pause-like if you want
	},
	
	// ********shoot code********
	shoot: function(){
		
	}
};