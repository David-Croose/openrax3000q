(function() {
	if (typeof THREE === 'undefined') {
		var script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
		script.onload = initFog;
		document.head.appendChild(script);
	} else {
		initFog();
	}

	function initFog() {
		var container = document.createElement('div');
		container.id = 'fog-background';
		container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
		document.body.insertBefore(container, document.body.firstChild);

		var scene = new THREE.Scene();
		var camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0, 1);
		var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x0a0a1a, 1);
		container.appendChild(renderer.domElement);

		var vertexShader = [
			'varying vec2 vUv;',
			'void main() {',
			'	vUv = uv;',
			'	gl_Position = vec4(position, 1.0);',
			'}'
		].join('\n');

		var fragmentShader = [
			'uniform float uTime;',
			'varying vec2 vUv;',

			'float random(vec2 st) {',
			'	return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);',
			'}',

			'float noise(vec2 st) {',
			'	vec2 i = floor(st);',
			'	vec2 f = fract(st);',
			'	float a = random(i);',
			'	float b = random(i + vec2(1.0, 0.0));',
			'	float c = random(i + vec2(0.0, 1.0));',
			'	float d = random(i + vec2(1.0, 1.0));',
			'	vec2 u = f * f * (3.0 - 2.0 * f);',
			'	return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;',
			'}',

			'float fbm(vec2 st) {',
			'	float value = 0.0;',
			'	float amplitude = 0.5;',
			'	for (int i = 0; i < 6; i++) {',
			'		value += amplitude * noise(st);',
			'		st *= 2.0;',
			'		amplitude *= 0.5;',
			'	}',
			'	return value;',
			'}',

			'void main() {',
			'	vec2 st = vUv;',
			'	vec2 uv = (st - 0.5) * 2.0;',
			
			'	vec2 center1 = vec2(sin(uTime * 0.02) * 0.25, cos(uTime * 0.03) * 0.25);',
			'	vec2 center2 = vec2(cos(uTime * 0.01) * 0.35, sin(uTime * 0.02) * 0.35);',
			'	vec2 center3 = vec2(sin(uTime * 0.015) * 0.2, cos(uTime * 0.025) * 0.2);',
			
			'	float dist1 = length(uv - center1);',
			'	float dist2 = length(uv - center2);',
			'	float dist3 = length(uv - center3);',
			
			'	float expandSpeed = 0.28;',
			'	float explode1 = 1.0 - smoothstep(0.0, uTime * expandSpeed + 1.6, dist1 + fbm(uv * 2.5 + uTime * 0.08) * 0.4);',
			'	float explode2 = 1.0 - smoothstep(0.0, uTime * expandSpeed + 1.4, dist2 + fbm(uv * 2.5 - uTime * 0.06) * 0.4);',
			'	float explode3 = 1.0 - smoothstep(0.0, uTime * expandSpeed + 1.5, dist3 + fbm(uv * 2.5 + uTime * 0.07) * 0.4);',
			
			'	float explode = explode1 * 0.38 + explode2 * 0.34 + explode3 * 0.28;',
			'	explode *= fbm(uv * 4.0 + uTime * 0.18) * 2.2;',

			'	float avgDist = (dist1 + dist2 + dist3) / 3.0;',
			'	float edgeAttenuation = 1.0 - smoothstep(0.0, 1.8, length(uv));',
			'	float distanceAttenuation = smoothstep(-0.2, 1.0, 1.0 - avgDist * 0.7) * edgeAttenuation;',
			'	explode *= distanceAttenuation;',
			
			'	explode = clamp(explode, 0.0, 1.2);',
			'	explode = pow(explode, 0.85);',
			
			'	vec3 color1 = vec3(0.02, 0.03, 0.10);',
			'	vec3 color2 = vec3(0.03, 0.08, 0.24);',
			'	vec3 color3 = vec3(0.07, 0.18, 0.38);',
			'	vec3 color4 = vec3(0.15, 0.28, 0.52);',
			
			'	vec3 color = mix(color1, color2, explode);',
			'	color = mix(color, color3, pow(explode, 1.5));',
			'	color = mix(color, color4, pow(explode, 2.5));',
			
			'	color += vec3(0.01, 0.02, 0.05) * fbm(uv * 3.0 + uTime * 0.05);',
			
			'	float flicker = sin(uTime * 1.8 + fbm(uv * 10.0)) * 0.02 + 0.98;',
			'	color *= flicker;',
			
			'	gl_FragColor = vec4(color, 1.0);',
			'}'
		].join('\n');

		var uniforms = { uTime: { value: 0 } };

		var nebulaMat = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		});

		var plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), nebulaMat);
		scene.add(plane);

		function animate() {
			requestAnimationFrame(animate);
			uniforms.uTime.value += 0.008;
			renderer.render(scene, camera);
		}
		animate();

		window.addEventListener('resize', function() {
			renderer.setSize(window.innerWidth, window.innerHeight);
		});
	}
})();
