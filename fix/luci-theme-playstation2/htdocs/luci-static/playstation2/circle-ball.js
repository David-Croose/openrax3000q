(function() {
	console.log('[CircleBall] Script loaded - v2.0');

	var MAX_ATTEMPTS = 30;
	var attempts = 0;
	var injectedElements = new Set();
	var htmlCache = null;

	function loadCircleBallHTML(callback) {
		console.log('[CircleBall] Loading HTML...');

		if (htmlCache) {
			callback(htmlCache);
			return;
		}

		fetch('/luci-static/playstation2/circle_ball.html')
			.then(function(response) {
				if (!response.ok) {
					throw new Error('HTTP ' + response.status);
				}
				return response.text();
			})
			.then(function(html) {
				htmlCache = html;
				console.log('[CircleBall] HTML loaded, length:', html.length);
				callback(html);
			})
			.catch(function(error) {
				console.error('[CircleBall] Load error:', error.message);
				callback(null);
			});
	}

	function createCircleBallContainer(el, htmlContent) {
		if (!htmlContent) return null;

		try {
			console.log('[CircleBall] Creating container for:', el.className);

			var wrapper = document.createElement('div');
			wrapper.className = 'circle-ball-wrapper';
			Object.assign(wrapper.style, {
				position: 'absolute',
				top: '50%',
				left: '12px',
				width: '64px',
				height: '64px',
				marginTop: '-32px',
				overflow: 'hidden',
				zIndex: '10000',
				pointerEvents: 'none'
			});

			var parser = new DOMParser();
			var doc = parser.parseFromString(htmlContent, 'text/html');
			var bodyContent = doc.body;

			if (!bodyContent || !bodyContent.childNodes.length) {
				console.error('[CircleBall] Empty body content');
				return null;
			}

			var fragment = document.createDocumentFragment();
			Array.from(bodyContent.childNodes).forEach(function(node) {
				fragment.appendChild(node.cloneNode(true));
			});

			wrapper.appendChild(fragment);

			var scripts = wrapper.querySelectorAll('script');
			console.log('[CircleBall] Processing', scripts.length, 'scripts');

			scripts.forEach(function(script, i) {
				var newScript = document.createElement('script');
				if (script.src) {
					newScript.src = script.src;
				} else {
					var code = script.textContent;

					code = code.replace(
						/renderer\.setSize\(window\.innerWidth,\s*window\.innerHeight\)/g,
						'renderer.setSize(64, 64)'
					);

					code = code.replace(
						/camera\s*=\s*new THREE\.PerspectiveCamera\([^)]+\)/g,
						'camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)'
					);

					code = code.replace(
						/document\.body\.appendChild\(renderer\.domElement\)/g,
						'var container = document.getElementById("' + ('circle-ball-' + Date.now()) + '"); if(container){container.appendChild(renderer.domElement);}'
					);

					newScript.textContent = code;
				}
				script.parentNode.replaceChild(newScript, script);
			});

			wrapper.id = 'circle-ball-' + Date.now();

			var canvas = wrapper.querySelector('canvas');
			if (canvas) {
				canvas.width = 64;
				canvas.height = 64;
				canvas.style.cssText = 'width:64px;height:64px;display:block;';
			}

			var style = wrapper.querySelector('style');
			if (style) {
				style.textContent = style.textContent.replace(/body\s*\{[^}]*\}/g, '');
			}

			el.appendChild(wrapper);

			console.log('[CircleBall] ✅ Container injected successfully!');
			return wrapper;

		} catch(e) {
			console.error('[CircleBall] Container error:', e.message);
			return null;
		}
	}

	function injectCircleBall(el) {
		if (!el || injectedElements.has(el)) return false;

		injectedElements.add(el);
		el.style.position = 'relative';
		el.style.paddingLeft = '48px';
		el.style.overflow = 'visible';

		loadCircleBallHTML(function(html) {
			createCircleBallContainer(el, html);
		});

		return true;
	}

	function run() {
		attempts++;
		console.log('[CircleBall] Attempt:', attempts);

		document.querySelectorAll(
			'.modal.alert-message.notice.spinning,' +
			'.spinning,' +
			'.notice,' +
			'.alert-message,' +
			'.modal,' +
			'.cbi-modal,' +
			'[class*="spinning"],' +
			'[class*="notice"]'
		).forEach(injectCircleBall);

		if (attempts < MAX_ATTEMPTS) {
			setTimeout(run, 500);
		} else {
			console.log('[CircleBall] Max attempts reached');
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run);
	} else {
		setTimeout(run, 100);
	}
})();