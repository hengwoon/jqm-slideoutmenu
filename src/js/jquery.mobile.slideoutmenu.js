/**
 * jquerymobile fixed left slideout menu
 * 
 * @author Heng Woon Ong <https://github.com/hengwoon>
 * @copyright Oodle Inc. 2012
 * @version 0.2
 * 
 * This creates a left slideout menu consisting of listviews that is hidden initially and can be toggled open / close. 
 * The menu contents can also be updated depending on the page the user is on.
 * 
 * slideoutmenu requires ClickBuster.js, which is used to prevent ghost clicks on mobile devices
 * 
 * Menu contents have a structure similar to the jqueryMobile page structure, except that the page data-role attribute is set to 'somenu' instead of 'page'
 * 
 * To create a default menu, include the following in the dom, outside any jquerymobile page element:
 * 		<div data-role="somenu-default" class="ui-hidden">
 * 				<div data-role="header">
 * 					<h1>Menu #1 </h1>
 * 				</div>
 * 				<div data-role="content">
 * 					<ul data-role="listview">
 * 						<li> menu item 1 </li>
 * 						<li> menu item 2 </li>
 * 					</ul>
 * 				</div>
 *		</div>
 *
 * To replace the menu whenever the user changes page, include the following in the target jquerymobile page's content div:
 * 		<div data-role="somenu"  class="ui-hidden">
 * 			<div data-role="content">
 * 				<ul data-role="listview">
 * 					<li> new menu item 1 </li>
 * 					<li> new menu item 2 </li>
 * 				</ul>
 * 			</div>
 * 		</div>
 *
 * Events:
 * 		somenubeforeopen: triggers before menu is opened
 * 		somenuopen: triggers when menu is opened
 * 		somenubeforeclose: triggers before menu is closed
 * 		somenuclose: triggers when menu is closed
 * 		somenucreate: triggers when menu is created for a page
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
};

var SlideoutMenu = function(options)
{
	var _instance;
	
	if (!(this instanceof SlideoutMenu)) return new SlideoutMenu(options);
	
	SlideoutMenu = function() {
		return _instance;
	};
	
	var self =_instance = this;
	
	this.options = $.extend(this.options, options);
	this.container = $('<div id="somenu" class="ui-somenu ui-page-active"></div>');
	
	this.container.appendTo($('.ui-mobile-viewport'));
	this.container.addClass(this.options.hideClass);
	this.isOpen = false;
	
	if (location.hash == '#menu')
	{
		$.mobile.ignoreNextHashChange = true;
		location.hash = '';
	}
	
	// bind events
	this.container.delegate(":jqmData(role='content') a", "click", function (event) {
		var liBtn = $(event.target).closest('li.ui-btn');
		if( !$(event.target).hasClass("ui-disabled") && (!liBtn.length || liBtn.not(".ui-disabled").jqmData("role") != 'collapsibler')) {
			self.close();
			self.activeMenu.find("." + $.mobile.activeBtnClass).not(".ui-state-persist").not(":jqmData(selected=true)").removeClass( $.mobile.activeBtnClass );
			$( this ).closest('li.ui-btn').addClass( $.mobile.activeBtnClass );
			return true;
		}
	});
	
	$(document).on("pagechange", function(e, data) {
		// in some cases, we want to modify the slideout menu, or simply replace it
		// see if there's a menu to replace with:
		if (!self.mainPage || self.mainPage[0] !== data.toPage[0])
		{
			self.mainPage = $.mobile.activePage;
			
			// check to see if there's already a menu created for this page
			if (!self.getMenuForPage(data.toPage))
			{
				// no menu yet for this page. Check page to see if we need to create one.
				var menuForPage = $(":jqmData(role='somenu')", data.toPage).first();
				
				if (menuForPage.length)
				{
					self.createMenuForPage(menuForPage, data.toPage);
				}
			}
		}
	}).on('pagebeforechange', function(e, data) {
		// navigate to menu
		if (typeof(data.toPage) == 'string' && data.toPage.search(/#menu$/) !== -1)
		{
			e.preventDefault();
			
			if (location.hash !== '#menu') return false; //sanity check
			
			self.open();
		}
		else
		{
			if (location.hash == '#menu' && !self.toPageOnClose) {
				e.preventDefault();
				
				self.toPageOnClose = {
					toPage: data.toPage,
					options: data.options
				};
				
				self.toPageOnClose.options.fromPage = null;

				self.close();
				
				//setTimeout(function() { history.back(); }, 0);
				return false;
			}
			
			if (self.toPageOnClose && typeof(self.toPageOnClose) === 'object')
			{
				e.preventDefault();
				var toPage = self.toPageOnClose.toPage,
					toPageOptions = self.toPageOnClose.options;
				
				self.toPageOnClose = false;

				$.mobile.showPageLoadingMsg();
				setTimeout(function() { $.mobile.changePage(toPage, toPageOptions); $.mobile.hidePageLoadingMsg(); }, 200);
			}
			
			self.close();
		}
	});

	$(window).on("orientationchange", function() { if (self.isOpen) self._resizeHandler(); });
	
	self.container.delegate( "form", "submit", function( event ) {
		self.close();
		$.mobile.showPageLoadingMsg();
	});
	
	
	// default menu?
	var defaultMenu = $(":jqmData(role='somenu-default')");
	
	if (defaultMenu.length)
	{
		this.createMenuForPage(defaultMenu);
	}
};

SlideoutMenu.prototype = {
	_id: 1,
	isOpen: false,
	options: {
		hideClass: 'ui-somenu-hidden',
		enableAnimation: true
	},
	

	toPageOnClose: null,
	container: null,
	menus: {},
	activeMenu: null,
	mainPage: null,
	
	
	getMenuForPage: function(page)
	{
		var menuIDForPage = page.data('somenu.id');
		
		if (menuIDForPage && this.menus[menuIDForPage])
			return this.menus[menuIDForPage];
		
		return null;
	},
	
	createMenuForPage: function(menu, page)
	{
		var newMenuID = menu.jqmData('somenu-id') || this._id,
			newMenu = $('<div data-somenu-id="' + newMenuID + '" data-role="page"></div>').append(menu.children()).css('display', 'none');

		this._id++;
		
		if (page)
		{
			page.data('somenu.id', newMenuID);
		}
		
		newMenu.appendTo(this.container);
		newMenu.page().trigger('create');
		this.menus[newMenuID] = newMenu;
		
		menu.remove();
		
		if (!this.activeMenu)
		{
			this.activeMenu = newMenu;
		}
		
		var menuEvent = new $.Event( "somenucreate" );
		
		newMenu.trigger(menuEvent);
		
		if (page)
		{
			var self = this;
			page.on('pageremove', function(e) {
				if (self.menus[newMenuID])
				{
					var ev = $.Event('pageremove');
					self.menus[newMenuID].trigger(ev);
					console.log(self.menus[newMenuID]);
					self.menus[newMenuID].remove();
					delete self.menus[newMenuID];
					
					if (self.activeMenu && self.activeMenu.jqmData('somenu-id') == newMenuID)
					{
						for (i in self.menus)
						{
							if (typeof(self.menus[i]) == 'object')
							{
								self.activeMenu = self.menus[i];
								break;
							}
						}
					}
				}
			});
		}
		
		return newMenu;
	},
	
	refresh: function()
	{
		//initialize new menu
		var $container = this.container,
			$menu = this.activeMenu,
			o = this.options,
			self = this;

		var currentDataUrl = $.mobile.path.convertUrlToDataUrl($.mobile.urlHistory.getActive() ? $.mobile.urlHistory.getActive().pageUrl : location.href);
		
		var menuBtns = $menu.find("li.ui-btn").not(".ui-li-divider");
		
		menuBtns.each(function() {
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
	},
	
	_resizeHandler: function(e)
	{
		var menu = this.activeMenu;
		
		if (!menu) return; // not yet init
		
		var mainPage = $.mobile.activePage;
		
		if (!mainPage) return;
		
		// sync heights
		var menuHeight = menu.height();
		
		if (!menuHeight) 
		{
			mainPage.height('auto');
			return;
		}

		mainPage.height(menuHeight);
	},
	
	switchToMenu: function(id)
	{
		if (!this.menus[id]) return false;
		
		this.activeMenu.css('display', 'none');
		this.activeMenu = this.menus[id];
		
		$.mobile.silentScroll(0);
		
		this.activeMenu.css('display', 'block');
	
		var mainPage = $.mobile.activePage;
	
		if (!mainPage) return;
	
		var fixedH = $(":jqmData(role='header'):jqmData(position='fixed')", mainPage);
		var fixedF = $(":jqmData(role='footer'):jqmData(position='fixed')", mainPage);
		var pagePadding = 0;
		
		if (fixedH.length)
		{
			pagePadding += parseInt(mainPage.css('padding-top'));
		}
	
		if (fixedF.length)
		{
			pagePadding += parseInt(mainPage.css('padding-bottom'));
		}
	
		this.activeMenu.css('padding-bottom', pagePadding + 'px');
		
		this.refresh();
	
		this._resizeHandler();
	},
	
	open: function()
	{
		var hideClass = this.options.hideClass,
			$container = this.container,
			self = this;
	
		if (this.isOpen) return;
	
		// is current menu ok for active page?
		var activePageMenuID =  $.mobile.activePage.data('somenu.id'),
			currentMenuID = this.activeMenu.jqmData('somenu-id');
		
		if (activePageMenuID && this.menus[activePageMenuID] && currentMenuID != activePageMenuID)
		{
			this.activeMenu.css('display', 'none');
			this.activeMenu = this.menus[activePageMenuID];
		}
		
		var $menu = this.activeMenu;
		
		var menuBeforeOpen = new $.Event( "somenubeforeopen" );
		$menu.trigger(menuBeforeOpen);	
	
		$.mobile.silentScroll(0);
	
		$menu.css('display', 'block');
	
		$container.removeClass(hideClass);
	
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
	
		mainPage.css({left: $container.width(), 'overflow-y':'hidden'}).addClass('ui-somenu-open');
		if (fixedH.length)
		{
			fixedH.css({'position':'fixed', 'left': $container.width(), 'width': '100%'});
			pagePadding += parseInt(mainPage.css('padding-top'));
		}
	
		if (fixedF.length)
		{
			fixedF.css({'position':'fixed', 'left': $container.width(), 'width': '100%'});
			pagePadding += parseInt(mainPage.css('padding-bottom'));
		}
	
		$menu.css('padding-bottom', pagePadding + 'px');
		
		this.refresh();
	
		this._resizeHandler();
	
		var menuOnOpen = new $.Event( "somenuopen" );
		$menu.trigger(menuOnOpen);
		
		$.mobile.activePage.one('vclick', function(e) {
			e.preventDefault();
			e.stopPropagation();
			//history.back();
			self.close();
			ClickBuster.preventGhostClick(e);
		});
	},
	
	close: function()
	{
		var hideClass = this.options.hideClass,
			$container = this.container,
			$menu = this.activeMenu;
		
		if (!this.isOpen) return;
		
		if (location.hash == '#menu') {
			history.back();
			return;
		}
		
		var menuBeforeClose = new $.Event( "somenubeforeclose" );
		$menu.trigger(menuBeforeClose);

		this.isOpen = false;
		
		var mainPage = $.mobile.activePage;
		
		if (!mainPage) return;
		
		var fixedH = $(":jqmData(role='header'):jqmData(position='fixed')", mainPage);
		var fixedF = $(":jqmData(role='footer'):jqmData(position='fixed')", mainPage);
		
		if (this.options.enableAnimation && !fixedH.length && !fixedF.length)
		{
			mainPage.addClass('animate');
			setTimeout(function() { $container.addClass(hideClass); mainPage.removeClass('ui-somenu-open'); }, 200);
		}
		else
		{
			$container.addClass(hideClass); mainPage.removeClass('ui-somenu-open');
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
		
		$menu.css('padding-bottom', '0px');
		
		this._resizeHandler();
		
		var menuOnClose = new $.Event( "somenuclose" );
		$menu.trigger(menuOnClose);
	},
	
	toggle: function()
	{
		if (this.isOpen || location.hash == '#menu') {
			this.close();
			//setTimeout(function() { history.back(); }, 0);
		}
		else
		{
			location.hash = '#menu';
		}
	}
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
					SlideoutMenu().toggle();
				});
			}
		});
		
		$(document).on('pageinit', function(e)
		{
			$(":jqmData(role='somenutoggler')", document).somenutoggler();
		});
		
		// instantiate slideoutmenu. pass options here...
		$(document).one('pageinit', function() { new SlideoutMenu(); });
	});
})(jQuery);
