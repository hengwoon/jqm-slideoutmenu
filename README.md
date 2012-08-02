jqm-slideoutmenu
================

This creates a left slideout menu that is hidden initially and can be toggled open / close. <br />
The menu contents can also be updated depending on the page the user is on.

Requirements:
-------------
jQuery Mobile 1.1+ <br />
jQuery 1.7+

Features:
---------
- Automatically update menu contents based on page the user is on
- Toggle menu via back/forward buttons
- Enable / disable slide animation
- Collapsible menu listviews
- automatically make any link a menu toggler via data attribute

Getting started:
----------------
See index.html <br />
To get started, include src/jquery.mobile.slideoutmenu.js after jQuery JS and before jQuery Mobile JS. <br/>
Menu content should always take the form of a jqm page, but without the header/footers, ie wrapped in a div with data-role="content"

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
To replace the menu with new content when user switches or loads a page, simply create a div with data-role="somenu-replace" in the jQuery Mobile Page's content block.

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
      <div data-role="somenu-default" class="ui-hidden">
        <div data-role="content">
          <ul data-role="listview">
            <li data-role="list-divider">This is the new menu</li>
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
```new SlideoutMenu({icon: 'arrow-r'})```

- **icon**: the default icon for the listview items in the SlideoutMenu. Defaults to 'arrow-r'.
- **iconshadow**: default iconshadow for the listview items in SlideoutMenu. Defaults to true.
- **enableAnimation**: Enable animation when toggling the menu. Defaults to true. Setting to false will improve performance.

Events:
-------
These are some custom events that allow for hooks into menu actions, such as opening or closing menu, and initialization of menu. These events should be bound to the menu instance itself, which can be accessed via SlideoutMenu.activeMenu.

- **somenubeforeopen**: triggers before menu is opened
- **somenuonopen**: triggers when menu is opened
- **somenubeforeclose**: triggers before menu is closed
- **somenuonclose**: triggers when menu is closed
- **somenuoninit**: triggers when menu is initialized

Methods:
--------
- open: opens the menu ```SlideoutMenu.activeMenu.open()```
- close: closes the menu ```SlideoutMenu.activeMenu.close()```
- toggle: toggles the menu ```SlideoutMenu.activeMenu.toggle()```
- update: updates the menu with new content ```SlideoutMenu.activeMenu.update($('<div data-role="content"><ul data-role="listview"><li>new menu</li></ul></div>'))```
