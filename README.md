jqm-slideoutmenu
================

This creates a left slideout menu that is hidden initially and can be toggled open / close. <br />
The menu contents can also be updated depending on the page the user is on.

Requirements:
-------------
jQuery Mobile 1.1 <br />
jQuery 1.7+

Features:
---------
- Automatically update menu contents based on page the user is on
- Toggle menu via browser back/forward buttons
- Enable / disable slide animation
- Collapsible menu listviews
- automatically make any link a menu toggler via data attribute

Getting started:
----------------
See index.html <br />
To get started, include src/jquery.mobile.slideoutmenu.js after jQuery JS and before jQuery Mobile JS. <br/>
The structure of a menu's content is just like a jQueryMobile page, ie with header/content/footer data-role divs, except that the root element has a data-role of 'somenu' or 'somenu-default' instead of 'page'

Getting started - Creating a default menu with a toggler
--------------------------------------------------------
To create a default menu, simply create a div with data-role="somenu-default" outside of any jqm page element and wrap it around the menu contents. <br />
To make a button a toggler for the menu, just add data-role="somenutoggler" to the button.
```
<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" >
		<title>SlideoutMenu demo</title>
		<link rel="stylesheet" href="lib/jquerymobile/jquery.mobile.css" />
		<link rel="stylesheet"  href="css/jquery.mobile.slideoutmenu.css" />
		<script src="lib/jquery-1.7.1.js"></script>
		<script src="js/jquery.mobile.slideoutmenu.js"></script>
		<script type="text/javascript" src="lib/jquerymobile/jquery.mobile.js"></script>
	</head>
	<body>
		<div data-role="page" id="home">
			<div data-role="header" data-position="fixed">
				<!-- menu toggler -->
				<a data-role="somenutoggler">Menu</a>
				<h1>Slideoutmenu demo</h1>
			</div>
			<div data-role="content">
				<p>Click the menu button in the header to toggle the menu</p>
			</div>
		</div>
	
		<!-- This is the default menu -->
		<div data-role="somenu-default" class="ui-hidden">
			<div data-role="header">
				<h1>Default menu</h1>
			</div>
			<div data-role="content">
				<ul data-role="listview">
					<li> menu item 1 </li>
					<li> menu item 2 </li>
				</ul>
			</div>
		</div>
	</body>
</html>
```

Getting started - Updating the menu
-----------------------------------
To replace the menu with new content when user switches or loads a page, simply create a div with data-role="somenu" in the jQuery Mobile Page's content block.

```
<div data-role="page" id="home">
	<div data-role="header" data-position="fixed">
	<!-- menu toggler -->
		<a data-role="somenutoggler">Menu</a>
		<h1>Slideoutmenu demo</h1>
	</div>
	<div data-role="content">
		<p>Menu will be replaced when user switches to this page</p>

		<!-- menu contents to replace with -->
		<div data-role="somenu" class="ui-hidden">
			<div data-role="header">
				<h1>New menu</h1>
			</div>
			<div data-role="content">
				<ul data-role="listview">
					<li> Foo </li>
					<li> Bar </li>
				</ul>
			</div>
		</div>
	</div>
</div>
```

Options:
--------
To configure the SlideoutMenu's options, pass the options in when creating the SlideoutMenu object:
```new SlideoutMenu({enableAnimation: false})```

- **enableAnimation**: If set to false, disable animation when toggling menu. Note that if page has fixed headers or footers, animation will always be disabled

Events:
-------
These are some custom events that allow for hooks into menu actions, such as opening or closing menu, and initialization of menu. These events should be bound to the menu instance itself, which can be accessed via SlideoutMenu().activeMenu.

- **somenubeforeopen**: triggers before menu is opened
- **somenuopen**: triggers when menu is opened
- **somenubeforeclose**: triggers before menu is closed
- **somenuclose**: triggers when menu is closed
- **somenucreate**: triggers when menu is created for a page

Methods:
--------
- open: opens the menu ```SlideoutMenu().open()```
- close: closes the menu ```SlideoutMenu().close()```
- toggle: toggles the menu ```SlideoutMenu().toggle()```
- update: updates the menu with new content ```SlideoutMenu().update($('<div data-role="content"><ul data-role="listview"><li>new menu</li></ul></div>'))```


Additional plugins:
===================
Collapsible lists - jquery.mobile.slideoutmeu.collapsiblelist.js
----------------------------------------------------------------

To make a listview in the slideout menu collapsible, add data-collapsible="true" to the listview ul element. There needs to be a list divider that will act as the list toggler / header:
```
<ul data-role="listview" data-collapsible="true">
	<li data-role="list-divider">Links</li>
	<li>item 1</li>
	<li>item 2</li>
</ul>
```

Configurable options, via data-attributes:
- **data-icon-collapsed**: 	icon to show when list is collapsed
- **data-icon-expanded**: 	icon to show when list is expanded
- **data-show-selected**:	Defaults to false. If set to true, the selected/active buttons' text will be added to the listheader. For example if item 1 is selected, the list header will show 'Links: item 1'


**Collapsed menu items with toggler**:
In addition to collapsible lists, to allow for individual list items to be collapsed, and toggled via a 'more..' link, create a list item link with data-role="collapsibler". <br />
To hide list items by default, add class 'ui-collapsed' to the list items that will be hidden by default and toggled via the collapsibler link.

```<ul data-role="listview">
	<li>shown item 1</li>
	<li>shown item 2</li>
	<li data-role="collapsibler"><a>more....</a></li>
	<li class="ui-collapsed">this is hidden and will be shown when the more link is clicked</li>
</ul>```

