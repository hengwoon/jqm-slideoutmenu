/**
 * bust additional click events that mobile browsers trigger. 
 * based on https://developers.google.com/mobile/articles/fast_buttons
 * 
 */

ClickBuster = {
	coordinates: [],
	
	preventGhostClick: function(e)
	{
		ClickBuster.coordinates.push(e.clientX, e.clientY);
		window.setTimeout(ClickBuster.pop, 1000);
		e.preventDefault();
		e.stopPropagation();
	},

	pop: function() {
		ClickBuster.coordinates.splice(0,2);
	},

	onClick: function(event) {
		if (!ClickBuster.canClick(event.clientX, event.clientY))
		{
			event.stopPropagation();
			event.preventDefault();
		}
	},

	canClick: function(clickX, clickY) {
		for (var i = 0; i < ClickBuster.coordinates.length; i += 2) {
			var x = ClickBuster.coordinates[i];
			var y = ClickBuster.coordinates[i + 1];
			if (Math.abs(clickX - x) < 25 && Math.abs(clickY - y) < 25) {
				return false;
			}
		}

		return true;
	}
};

document.addEventListener("click", ClickBuster.onClick, true);