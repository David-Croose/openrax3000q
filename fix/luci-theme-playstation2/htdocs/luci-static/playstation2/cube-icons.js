(function() {
	var MAX_ATTEMPTS = 20;
	var attempts = 0;

	function buildCube() {
		var wrap = document.createElement('div');
		wrap.className = 'cube-icon-wrap';
		
		var cube = document.createElement('div');
		cube.className = 'cube-3d';
		
		var sides = ['front', 'back', 'right', 'left', 'top', 'bottom'];
		sides.forEach(function(name) {
			var side = document.createElement('div');
			side.className = 'cube-side ' + name;
			cube.appendChild(side);
		});
		
		wrap.appendChild(cube);
		return wrap;
	}

	function injectCube(el) {
		if (!el || el._hasCubeIcon) return false;
		
		try {
			el._hasCubeIcon = true;
			var cube = buildCube();
			
			if (el.firstChild) {
				el.insertBefore(cube, el.firstChild);
			} else {
				el.appendChild(cube);
			}
			return true;
		} catch(e) {
			return false;
		}
	}

	function run() {
		attempts++;
		var n = 0;
		
		document.querySelectorAll('.main-left .nav > .slide > .menu').forEach(function(m) {
			if (injectCube(m)) n++;
		});
		
		var logoutBtn = document.querySelector('.main-left .nav > li:last-child');
		if (logoutBtn && !logoutBtn.querySelector('.cube-icon-wrap')) {
			logoutBtn.style.position = 'relative';
			if (injectCube(logoutBtn)) n++;
		}

		if (n > 0) {
			console.log('[CubeIcons] Added', n, 'glass cubes');
		} else if (attempts < MAX_ATTEMPTS) {
			setTimeout(run, 250);
		}
	}

	function start() {
		setTimeout(run, 100);
		setTimeout(run, 600);
		setTimeout(run, 1500);

		new MutationObserver(function(mutations, obs) {
			for (var i = 0; i < mutations.length; i++) {
				if (mutations[i].addedNodes.length > 0) {
					setTimeout(run, 80);
					break;
				}
			}
		});

		setTimeout(function() {
			var nav = document.querySelector('.main-left .nav');
			if (nav) {
				new MutationObserver(function() { setTimeout(run, 50); })
					.observe(nav, { childList: true, subtree: true });
			}
		}, 400);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
