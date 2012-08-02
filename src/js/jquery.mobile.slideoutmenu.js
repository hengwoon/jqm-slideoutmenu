/**
 * jquerymobile fixed left slideout menu
 * 
 * @author Heng Woon Ong <https://github.com/hengwoon>
 * @copyright Oodle Inc. 2012
 * @version 0.1
 * 
 * This creates a left slideout menu consisting of listviews that is hidden initially and can be toggled open / close. 
 * The menu contents can also be updated depending on the page the user is on.
 * 
 * slideoutmenu requires ClickBuster.js, which is used to prevent ghost clicks on mobile devices
 * 
 * To create a default menu, include the following in the dom, outside any jquerymobile page element:
 * 		<div data-role="somenu-default" class="ui-hidden">
 * 				<div data-role="content">
 * 					<ul data-role="listview">
 * 						<li> menu item 1 </li>
 * 						<li> menu item 2 </li>
 * 					</ul>
 * 				</div>
 *		</div>
 *
 * To replace the menu whenever the user changes page, include the following in the target jquerymobile page's content div:
 * 		<div data-role="somenu-replace"  class="ui-hidden">
 * 			<div data-role="content">
 * 				<ul data-role="listview">
 * 					<li> new menu item 1 </li>
 * 					<li> new menu item 2 </li>
 * 				</ul> 				
 *
 * Events:
 * 		somenubeforeopen: triggers before menu is opened
 * 		somenuopen: triggers when menu is opened
 * 		somenubeforeclose: triggers before menu is closed
 * 		somenuclose: triggers when menu is closed
 * 		somenuinit: triggers when menu is initialized
 *
 * Options:
 * 		enableAnimation: If set to false, disable animation when toggling menu. Note that if page has fixed headers or footers, animation will always be disabled
 *
 * Menu toggler:
 * Add attribute 'data-role="somenutoggler"' to the link that toggles menu
 * 
 * Selected menu items:
 * 		If a menu item is to be selected by default, use data-selected="true" and add class="ui-state-persist"
 * 		data-selected=true will automatically add the active button class to the list item, and ui-state-persist determines whether the active state persists when navigating other links.
 * 
 */



/**
 * bust additional click events that mobile browsers trigger. 
 * based on https://developers.google.com/mobile/articles/fast_buttons
 * 
 */

if (typeof(ClickBuster) == 'undefined')
{	
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
}


var SlideoutMenu = function (options) {
	if (!(this instanceof SlideoutMenu)) return new SlideoutMenu(options);
	
	if (typeof(options) == 'object')
	{
		this.options = $.extend(this.options, options);
	}
	
	this.container = $('<div id="somenu" class="ui-somenu ui-page-active"></div>');
	this.menu = $('<div data-role="page"><div data-role="content"></div></div>');
	this.menu.appendTo(this.container);
	this.menu.page();
	this.container.appendTo($('.ui-mobile-viewport'));
	this.container.addClass(this.options.hideClass);
	this.isOpen = false;
	
	var self = SlideoutMenu.activeMenu = this;
	
	if (location.hash == '#menu')
	{
		$.mobile.ignoreNextHashChange = true;
		location.hash = '';
	}
	
	// bind events
	this.menu.delegate("a", "click", function (event) {
		var liBtn = $(event.target).closest('li.ui-btn');
		if( !$(event.target).hasClass("ui-disabled") && (!liBtn.length || liBtn.not(".ui-disabled").jqmData("role") != 'collapsibler')) {
			self.close();
			self.menu.find("." + $.mobile.activeBtnClass).not(".ui-state-persist").not(":jqmData(selected=true)").removeClass( $.mobile.activeBtnClass );
			$( this ).closest('li.ui-btn').addClass( $.mobile.activeBtnClass );
			return true;
		}
	});
	
	$(document).on("pagechange", function(e, data) {
		// in some cases, we want to modify the slideout menu, or simply replace it
		// see if there's a menu to replace with:
		if (!SlideoutMenu.mainPage || SlideoutMenu.mainPage[0] !== data.toPage[0])
		{
			var replacementMenu = $(":jqmData(role='somenu-replace')", data.toPage).first();
			
			SlideoutMenu.mainPage = $.mobile.activePage;
		
			if (replacementMenu.length)
			{
				// clone the menu. This is so we can handle back/forward buttons or when switching between pages cached in the dom / multipage template
				var menuClone = replacementMenu.find(":jqmData(role='content')").clone(true);
				
				// now replace the current menu.
				SlideoutMenu.activeMenu.update(menuClone);
			}
			else if (!SlideoutMenu.activeMenu._initialMenuContents) // no replacement menu and menu not initialized. Check to see if there's default menu
			{
				// default menu ?
				var defaultMenu = $(":jqmData(role='somenu-default')").page().first();
				if (defaultMenu.length)
				{
					SlideoutMenu.activeMenu.update(defaultMenu.find(":jqmData(role='content')"));
				}
			}
		}
	}).on('pagebeforechange', function(e, data) {
		// navigate to menu
		if (typeof(data.toPage) == 'string' && data.toPage.search(/#menu$/) !== -1)
		{
			e.preventDefault();
			
			if (location.hash !== '#menu') return false; //sanity check
			
			SlideoutMenu.activeMenu.open();
		}
		else
		{
			if (location.hash == '#menu' && !SlideoutMenu.toPageOnClose) {
				e.preventDefault();
				
				SlideoutMenu.toPageOnClose = {
					toPage: data.toPage,
					options: data.options
				};
				
				SlideoutMenu.toPageOnClose.options.fromPage = null;

				SlideoutMenu.activeMenu.close();
				
				//setTimeout(function() { history.back(); }, 0);
				return false;
			}
			
			if (SlideoutMenu.toPageOnClose && typeof(SlideoutMenu.toPageOnClose) === 'object')
			{
				e.preventDefault();
				var toPage = SlideoutMenu.toPageOnClose.toPage,
					toPageOptions = SlideoutMenu.toPageOnClose.options;
				
				SlideoutMenu.toPageOnClose = false;

				$.mobile.showPageLoadingMsg();
				setTimeout(function() { $.mobile.changePage(toPage, toPageOptions); $.mobile.hidePageLoadingMsg(); }, 200);
			}
			
			SlideoutMenu.activeMenu.close();
		}
	});

	$(window).on("orientationchange", function() { if (SlideoutMenu.activeMenu.isOpen) SlideoutMenu._resizeHandler(); });
	
	this.menu.delegate( "form", "submit", function( event ) {
		SlideoutMenu.activeMenu.close();
		$.mobile.showPageLoadingMsg();
	});
};

SlideoutMenu.prototype.options = {
	hideClass: 'ui-somenu-hidden',
	enableAnimation: true
};

SlideoutMenu._resizeHandler = function(e)
{
	var menu = SlideoutMenu.activeMenu;
	
	if (!menu) return; // not yet init
	
	var mainPage = $.mobile.activePage;
	
	if (!mainPage) return;
	
	// sync heights
	var menuHeight = menu.menu.height();
	
	if (!menuHeight) 
	{
		mainPage.height('auto');
		return;
	}

	mainPage.height(menuHeight);
};

SlideoutMenu.mainPage = null; // keep track of current active page, so we don't do unnecessary menu updates when transitioning to same page.
SlideoutMenu.toPageOnClose = null; // page to change to when menu is closed

SlideoutMenu.prototype.isOpen = false;
SlideoutMenu.prototype._initialMenuContents = null; // the initial menu contents
SlideoutMenu.prototype.menuBtns = [];

SlideoutMenu.prototype.open = function()
{
	var hideClass = this.options.hideClass,
		$el = this.container,
		$menu = this.menu,
		self = this;
	
	if (this.isOpen) return;
	
	var menuBeforeOpen = new $.Event( "somenubeforeopen" );
	this.menu.trigger(menuBeforeOpen);	
	
	$.mobile.silentScroll(0);
	
	$el.removeClass(hideClass);
	
	$menu.css('display', 'block');
	
	this.isOpen = true;
	
	var mainPage = $.mobile.activePage;
	
	if (!mainPage) return;
	
	var fixedH = $(":jqmData(role='header'):jqmData(position='fixed')", mainPage);
	var fixedF = $(":jqmData(role='footer'):jqmData(position='fixed')", mainPage);
	var pagePadding = 0;

	if (this.options.enableAnimation && !fixedH.length && !fixedF.length)
	{
		mainPage.addClass('animate');
	}
	
	mainPage.css({left: this.container.width(), 'overflow-y':'hidden'}).addClass('ui-somenu-open');
	if (fixedH.length)
	{
		fixedH.css({'position':'fixed', 'left': this.container.width(), 'width': '100%'});
		pagePadding += parseInt(mainPage.css('padding-top'));
	}
	
	if (fixedF.length)
	{
		fixedF.css({'position':'fixed', 'left': this.container.width(), 'width': '100%'});
		pagePadding += parseInt(mainPage.css('padding-bottom'));
	}
	
	this.menu.css('padding-bottom', pagePadding + 'px');
	
	SlideoutMenu._resizeHandler();
	
	var menuOnOpen = new $.Event( "somenuopen" );
	this.menu.trigger(menuOnOpen);
	
	$.mobile.activePage.one('vclick', function(e) {
		e.preventDefault();
		e.stopPropagation();
		//history.back();
		SlideoutMenu.activeMenu.close();
		ClickBuster.preventGhostClick(e);
	});
};

SlideoutMenu.prototype.close = function()
{
	var hideClass = this.options.hideClass,
		$el = this.container,
		$menu = this.menu;
	
	if (!this.isOpen) return;
	
	if (location.hash == '#menu') {
		history.back();
		return;
	}
	
	var menuBeforeClose = new $.Event( "somenubeforeclose" );
	this.menu.trigger(menuBeforeClose);

	this.isOpen = false;
	
	var mainPage = $.mobile.activePage;
	
	if (!mainPage) return;
	
	var fixedH = $(":jqmData(role='header'):jqmData(position='fixed')", mainPage);
	var fixedF = $(":jqmData(role='footer'):jqmData(position='fixed')", mainPage);
	
	if (this.options.enableAnimation && !fixedH.length && !fixedF.length)
	{
		mainPage.addClass('animate');
		setTimeout(function() { $el.addClass(hideClass); mainPage.removeClass('ui-somenu-open'); }, 200);
	}
	else
	{
		$el.addClass(hideClass); mainPage.removeClass('ui-somenu-open');
	}
	
	mainPage.css({left:0, 'overflow-y': 'auto'})
	
	if (fixedH.length)
	{
		fixedH.css('left', 0)[0].style.position = '';
		fixedH.css('left', 0)[0].style.width = '';
	}
	
	if (fixedF.length)
	{
		fixedF.css('left', 0)[0].style.position = '';
		fixedF.css('left', 0)[0].style.width = '';
	}
	
	this.menu.css('padding-bottom', '0px');
	
	SlideoutMenu._resizeHandler();
	
	var menuOnClose = new $.Event( "somenuclose" );
	this.menu.trigger(menuOnClose);
};

SlideoutMenu.prototype.toggle = function()
{
	if (this.isOpen || location.hash == '#menu') {
		this.close();
		//setTimeout(function() { history.back(); }, 0);
	}
	else
	{
		location.hash = '#menu';
	}
};

SlideoutMenu.prototype.update = function(newMenuContent)
{	
	if (!this._initialMenuContents)
	{
		this._initialMenuContents = this.menu.children(":jqmData(role='content')").clone(true);
	}
	
	this.menu.children(":jqmData(role='content')").replaceWith(newMenuContent);
	
	this.init();
};

SlideoutMenu.prototype.init = function()
{	
	var $el = this.container,
		$menu = this.menu,
		o = this.options,
		self = this;

	//$menu.trigger('create');
	var currentDataUrl = $.mobile.path.convertUrlToDataUrl($.mobile.urlHistory.getActive() ? $.mobile.urlHistory.getActive().pageUrl : location.href);
	
	this.menuBtns = $menu.find("li.ui-btn").not(".ui-li-divider");
	
	this.menuBtns.each(function() {
		var menuBtn = $(this);

		// handle selected items
		if (menuBtn.jqmData('selected')) menuBtn.addClass( $.mobile.activeBtnClass );
		else if (!menuBtn.hasClass('ui-state-persist')) menuBtn.removeClass( $.mobile.activeBtnClass );
	});
	
	// figure out what current page is, and set proper active btn
	$menu.find(".ui-btn a").each(function(i, link) 
	{
		var linkDataUrl = $.mobile.path.convertUrlToDataUrl($(link).attr('href'));
		if (currentDataUrl == linkDataUrl || linkDataUrl == $.mobile.activePage.jqmData('url'))
		{
			var btn = $(link).closest('.ui-btn');
			btn.addClass($.mobile.activeBtnClass);
			return false;
		}
	});
	
	var menuEvent = new $.Event( "somenuinit" );
	
	this.menu.trigger(menuEvent);
	
	SlideoutMenu._resizeHandler();
};


(function($, undefined) {
	
	$(document).bind('mobileinit', function() {
		// toggler for slide out menu.
		$.widget("mobile.somenutoggler", $.mobile.widget, {
			options: {},
	
			_create: function()
			{
				var self = this,
					o = self.options,
					$el = self.element;
				$el.on('vclick', function(e) {
					ClickBuster.preventGhostClick(e);
					SlideoutMenu.activeMenu.toggle();
				});
			}
		});
		
		$(document).on('pageinit', function(e)
		{
			$(":jqmData(role='somenutoggler')", document).somenutoggler();
		});
		
		$(document).one('pageinit', function() { new SlideoutMenu(); });
	});
})(jQuery);