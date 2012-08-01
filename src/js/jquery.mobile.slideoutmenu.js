/**
 * jquerymobile fixed left slideout menu
 * 
 * @author Heng Woon Ong
 * @copyright Oodle Inc. 2012
 * @version 0.1
 * 
 * This creates a left slideout menu consisting of listviews that is hidden initially and can be toggled open / close. 
 * The menu contents can also be updated depending on the page the user is on.
 * 
 * slideoutmenu requires ClickBuster.js, which is used to prevent ghost clicks on mobile devices
 * 
 * To create a default menu, include the following in the dom, outside any jquerymobile page element:
 * 		<div data-role="somenu-default">
 * 				<div data-role="content">
 * 					<ul data-role="listview">
 * 						<li> menu item 1 </li>
 * 						<li> menu item 2 </li>
 * 					</ul>
 * 				</div>
 *		</div>
 *
 * To replace the menu whenever the user changes page, include the following in the target jquerymobile page's content div:
 * 		<div data-role="somenu-replace" style="display:none;">
 * 			<div data-role="content">
 * 				<ul data-role="listview">
 * 					<li> new menu item 1 </li>
 * 					<li> new menu item 2 </li>
 * 				</ul> 				
 *
 * Events:
 * 		somenubeforeopen: triggers before menu is opened
 * 		somenuonopen: triggers when menu is opened
 * 		somenubeforeclose: triggers before menu is closed
 * 		somenuonclose: triggers when menu is closed
 * 		somenuoninit: triggers when menu is initialized
 *
 * Options:
 * 		icon: the default button icon to be used for menu links
 * 		iconshadow: icon shadow to be applied to menu links
 *
 * Menu toggler:
 * Add attribute 'data-role="somenutoggler"' to the link that toggles menu
 *
 * Collapsed menu items:
 * 		In slideout menu, if any menu links in a listview are to be hidden, add 'data-collapsed="true"' to the <li> element.
 * 		Those menu items will be hidden by default, and will be shown when a 'more' link is clicked.
 * 		The 'more' link should be contained in an '<li>' element with data-role="collapsibler". Clicking on the more link will show all sibling <li>s in the containing listview.
 * 		
 * 		<ul data-role="listview">
 * 			<li>item 1</li>
 * 			<li>item 2</li>
 * 			<li data-collapsed="true">hidden</li>
 * 			<li data-role="collapsibler">more...</li>
 * 		</ul>
 * 
 * Selected menu items:
 * 		If a menu item is to be selected by default, use data-selected="true" and add class="ui-state-persist"
 * 		data-selected=true will automatically add the active button class to the list item, and ui-state-persist determines whether the active state persists when navigating other links.
 * 
 */

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
	this.menu.delegate("a", "vclick", function (event) {
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
		$.mobile.showPageLoadingMsg();
		this.close();
	});
};

SlideoutMenu.prototype.options = {
	hideClass: 'ui-somenu-hidden',
	icon: 'arrow-r',
	iconshadow: false,
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

SlideoutMenu.refreshCollapsibleList = function(list)
{
	var collapsedIcon = 'ui-icon-' + list.jqmData('icon-collapsed');
	var expandedIcon = 'ui-icon-' + list.jqmData('icon-expanded');
	var listHeader = list.find(":jqmData(role='list-divider')").addClass('ui-collapsibler ui-btn-icon-right');
	var iconEl = listHeader.find('.ui-icon');
	
	if (list.jqmData('collapsed'))
	{
		listHeader.find('.ui-icon').addClass(collapsedIcon).removeClass(expandedIcon);
		list.addClass('ui-collapsed');
	}
	else
	{
		list.removeClass('ui-collapsed');
		listHeader.find('.ui-icon').removeClass(collapsedIcon).addClass(expandedIcon);
	}
	
	if (list.jqmData('show-selected'))
	{
		var selectedTextEl = listHeader.find('.ui-selected-text');
		var listType = listHeader.jqmData('type');
		var selected = list.find("." + $.mobile.activeBtnClass + ' a');
		var selectedText = list.jqmData('selected-text');			
		
		if (!selected.length && !selectedText)
		{
			selectedTextEl.html('');
		}
		else
		{
			if (selected.length)
			{
				selectedText = '';
				selected.each(function(){
					selectedText += ' ' + $(this).text() + ',';
				});
			}				
			selectedText = ': ' + selectedText;
			
			selectedTextEl.text(selectedText.replace(/,$/,''));
		}
	}
};

SlideoutMenu.mainPage = null; // keep track of current active page, so we don't do unnecessary menu updates when transitioning to same page.
SlideoutMenu.toPageOnClose = null; // page to change to when menu is closed

SlideoutMenu.prototype.isOpen = false;
SlideoutMenu.prototype._initialMenuContents = null; // the initial menu contents

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

	if (this.options.enableAnimation)
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
	
	var menuOnOpen = new $.Event( "somenuonopen" );
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
	
	if (this.options.enableAnimation)
	{
		mainPage.addClass('animate');
		setTimeout(function() { $el.addClass(hideClass); mainPage.removeClass('ui-somenu-open'); }, 200);
	}
	else
	{
		$el.addClass(hideClass); mainPage.removeClass('ui-somenu-open');
	}
	
	var fixedH = $(":jqmData(role='header'):jqmData(position='fixed')", mainPage);
	var fixedF = $(":jqmData(role='footer'):jqmData(position='fixed')", mainPage);
	
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
	
	var menuOnClose = new $.Event( "somenuonclose" );
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
	
	$menu.find("li").each(function(i, row) {
		
		if ($(row).jqmData('role') != 'list-divider')
		{
			if ($(row).jqmData('icon') == undefined) 
			{
				$(row).jqmData('icon', o.icon);
			}
			
			$(row).jqmData('iconshadow', o.iconshadow);
		}
	});

	//$menu.trigger('create');
	
	// handle collapsible lists
	$menu.find("ul:jqmData(collapsible='true')").each(function() {
		if ($(this).hasClass('ui-ul-collapsible')) return;
		
		$(this).addClass(".ui-ul-collapsible");
		var listHeader = $(this).find(":jqmData(role='list-divider')").addClass('ui-collapsibler');
		listHeader.append('<span class="ui-selected-text"></span><span class="ui-icon"> </span>');

		listHeader.on('vclick', function(e){
			e.preventDefault();
			e.stopPropagation();
			
			ClickBuster.preventGhostClick(e);
			var list = $(this).closest(":jqmData(role='listview')");
			var collapsed = list.jqmData('collapsed');
			
			list.jqmData('collapsed', !collapsed);
			
			SlideoutMenu.refreshCollapsibleList(list);
			
			SlideoutMenu._resizeHandler();
		});
	});
	
	var menuBtns = $menu.find("li.ui-btn").not(".ui-li-divider");
	
	menuBtns.each(function() {
		var menuBtn = $(this);

		// hide collapsed items
		if (menuBtn.jqmData('collapsed')) menuBtn.addClass('ui-collapsed');
		
		// handle selected items
		if (menuBtn.jqmData('selected')) menuBtn.addClass( $.mobile.activeBtnClass );
		else if (!menuBtn.hasClass('ui-state-persist')) menuBtn.removeClass( $.mobile.activeBtnClass );
		
		// handle collapsibler toggler
		if (menuBtn.jqmData('role') == 'collapsibler')
		{
			menuBtn.on('vclick', function(e){
				ClickBuster.preventGhostClick(e);
				$(this).siblings(':jqmData(collapsed=true)').jqmData('collapsed', false).removeClass('ui-collapsed');
				$(this).remove();
				SlideoutMenu._resizeHandler();
			});
		}
	});
	
	var currentDataUrl = $.mobile.path.convertUrlToDataUrl($.mobile.urlHistory.getActive() ? $.mobile.urlHistory.getActive().pageUrl : location.href);
	
	// figure out what current page is, and set proper active btn
	$menu.find(".ui-btn a").each(function(i, link) 
	{
		var linkDataUrl = $.mobile.path.convertUrlToDataUrl($(link).attr('href'));
		if (currentDataUrl == linkDataUrl || linkDataUrl == $.mobile.activePage.jqmData('url'))
		{
			var btn = $(link).closest('.ui-btn');
			btn.addClass($.mobile.activeBtnClass);
			
			// move this btn before collapsible toggler if btn is collapsed/hidden
			if (btn.jqmData('collapsed'))
			{
				btn.removeClass('ui-collapsed');
				btn.jqmData('collapsed', false);
				var toggler = btn.siblings(":jqmData(role='collapsibler')");
				if (toggler.length)
				{
					btn.insertBefore(toggler);
				}
			}
			
			return false;
		}
	});
	
	$("ul:jqmData(collapsible='true')", $menu).each(function()
	{		
		SlideoutMenu.refreshCollapsibleList($(this));
	});
	
	var menuEvent = new $.Event( "somenuoninit" );
	
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
		
		$(document).one('pageinit', function() { new SlideoutMenu({icon: 'arrow-r'})});
	});
	//resizePoll();
})(jQuery);