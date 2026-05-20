(function() {
	function loadScript(src, callback) {
		var script = document.createElement('script');
		script.src = src;
		script.onload = callback;
		script.onerror = function() { console.error('Failed to load:', src); };
		document.head.appendChild(script);
	}

	if (typeof THREE === 'undefined') {
		loadScript('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js', initClock);
	} else {
		initClock();
	}

	function initClock() {
		var container = document.createElement('div');
		container.id = 'clock-background';
		container.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:88vmin;height:88vmin;z-index:-1;pointer-events:none;opacity:0.9;';
		document.body.appendChild(container);

		var scene = new THREE.Scene();
		scene.background = null;

		var size = Math.min(window.innerWidth, window.innerHeight) * 0.88;
		var camera = new THREE.PerspectiveCamera(50, size / size, 0.5, 60);
		camera.position.set(5.5, 3.8, 7.5);
		camera.lookAt(0, 0, 0);

		var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(size, size);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.4;
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		container.appendChild(renderer.domElement);

		var ambientLight = new THREE.AmbientLight(0x1a1530, 1.0);
		scene.add(ambientLight);

		var hemisphereLight = new THREE.HemisphereLight(0x4060a0, 0x0a0a14, 0.8);
		scene.add(hemisphereLight);

		var keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
		keyLight.position.set(5, 8, 5);
		keyLight.castShadow = true;
		keyLight.shadow.mapSize.width = 1024;
		keyLight.shadow.mapSize.height = 1024;
		scene.add(keyLight);

		function createGlowingGlassMaterial() {
			return new THREE.MeshPhysicalMaterial({
				color: new THREE.Color('#3366cc'),
				metalness: 0.0,
				roughness: 0.05,
				clearcoat: 0.8,
				clearcoatRoughness: 0.02,
				transparent: true,
				opacity: 0.45,
				specularIntensity: 3.0,
				specularColor: new THREE.Color('#ffffff'),
				reflectivity: 0.95,
				emissive: new THREE.Color('#2244aa'),
				emissiveIntensity: 0.8,
				sheen: 0.3,
				sheenRoughness: 0.2,
				sheenColor: new THREE.Color('#6699ff'),
				ior: 1.5,
				envMapIntensity: 0.3
			});
		}

		function createInnerGlowMaterial() {
			return new THREE.MeshBasicMaterial({
				color: new THREE.Color('#6699ff'),
				transparent: true,
				opacity: 0.6,
				blending: THREE.AdditiveBlending,
				depthWrite: false
			});
		}

		var mainGroup = new THREE.Group();
		scene.add(mainGroup);

		var TABLE_RADIUS = 2.7;
		var CYLINDER_HEIGHT = 2.0;
		var CYLINDER_RADIUS = 0.18;
		var CYLINDER_SEGMENTS = 32;
		var INNER_CYLINDER_RADIUS = 0.1;
		var glowingMaterials = [];

		for (var i = 0; i < 12; i++) {
			var angle = (i / 12) * Math.PI * 2;
			
			var x = 0;
			var y = Math.cos(angle) * TABLE_RADIUS;
			var z = Math.sin(angle) * TABLE_RADIUS;

			var cylinderGroup = new THREE.Group();
			cylinderGroup.position.set(x, y, z);

			var outerCylinderGeom = new THREE.CylinderGeometry(
				CYLINDER_RADIUS,
				CYLINDER_RADIUS,
				CYLINDER_HEIGHT,
				CYLINDER_SEGMENTS
			);
			var outerMaterial = createGlowingGlassMaterial();
			var outerCylinder = new THREE.Mesh(outerCylinderGeom, outerMaterial);
			cylinderGroup.add(outerCylinder);
			glowingMaterials.push(outerMaterial);

			var innerCylinderGeom = new THREE.CylinderGeometry(
				INNER_CYLINDER_RADIUS,
				INNER_CYLINDER_RADIUS,
				CYLINDER_HEIGHT * 0.9,
				CYLINDER_SEGMENTS
			);
			var innerMaterial = createInnerGlowMaterial();
			var innerCylinder = new THREE.Mesh(innerCylinderGeom, innerMaterial);
			cylinderGroup.add(innerCylinder);

			var radialDirection = new THREE.Vector3(x, y, z).normalize();
			var quaternion = new THREE.Quaternion();
			quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), radialDirection);
			cylinderGroup.quaternion.copy(quaternion);
			
			mainGroup.add(cylinderGroup);
		}

		function updateSize() {
			size = Math.min(window.innerWidth, window.innerHeight) * 0.88;
			renderer.setSize(size, size);
			camera.aspect = size / size;
			camera.updateProjectionMatrix();
		}

		window.addEventListener('resize', updateSize);

		function animate(timestamp) {
			requestAnimationFrame(animate);

			var elapsed = timestamp * 0.001;

			mainGroup.rotation.y = elapsed * 0.03;
			mainGroup.rotation.x = Math.sin(elapsed * 0.025) * 0.25;
			mainGroup.rotation.z = Math.cos(elapsed * 0.03) * 0.1;

			var pulseIntensity = 0.8 + Math.sin(elapsed * 0.4) * 0.18 + Math.sin(elapsed * 0.6) * 0.1;
			glowingMaterials.forEach(function(material) {
				material.emissiveIntensity = pulseIntensity;
			});

			renderer.render(scene, camera);
		}
		
		requestAnimationFrame(animate);
	}
})();
