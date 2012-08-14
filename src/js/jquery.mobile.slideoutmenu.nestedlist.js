/**
 * jquerymobile nested lists for slideout menu
 * 
 * @author Heng Woon Ong <https://github.com/hengwoon>
 * @copyright Oodle Inc. 2012
 * @version 0.2
 * 
 * This handles nested lists in the slideoutmenu
 * 
 * To create a nested list for the menu is similar to how nested lists are created in jQuery Mobile except that the nested ul and ol should be wrapped in a div element with data-role="somenu-nested-list",
 * to prevent jQuery Mobile from handling the nested list.
 * 
 * 
 * Example:
 * 
 * <ul data-role="listview">
 * 		<li>Animals
 * 			<div data-role="somenu-nested-list">
 * 				<ul>
 * 					<li>Pets</li>
 * 				</ul>
 *			</div>
 *		</li>
 *	</ul>
 * 
 */



(function($, undefined) {
	
	$(document).on('somenucreate', function(event) {
		var somenu = SlideoutMenu(),
			menu = $(event.target),
			persistentFooterID = menu.find( ":jqmData(role='footer')" ).jqmData( "id" ),
			menuID = menu.jqmData('somenu-id');
		
		$("ul:jqmData(role='listview')", menu).each(function() {
			var parentList = $(this),
				o =  {
					theme: null || $(this).jqmData('theme'),
					countTheme: "c" || $(this).jqmData('countTheme'),
					headerTheme: "b" || $(this).jqmData('headerTheme'),
				};
			
			parentList.find( "li > :jqmData(role='somenu-nested-list')" ).each(function(i) {
				var list = $(this).children('ul'),
					dns = "data-" + $.mobile.ns,
					id = menuID + '-' + i,
					theme = list.jqmData( "theme" ) || o.theme,
					countTheme = list.jqmData( "counttheme" ) || parentList.jqmData( "counttheme" ) || o.countTheme,
					listSiblings = $(this).siblings(),
					title = listSiblings.length ? listSiblings.first().getEncodedText() : $(this).parent().contents().first().getEncodedText(),
					li = $(this).closest('li'),
					newPage, headerEl;
					
					var headerEl = $("<div " + dns + "role='header' " + dns + "theme='" + o.headerTheme + "'><div class='ui-title'>" + title + "</div></div>")
						.prepend($("<a data-role='button' data-icon='arrow-l' data-iconpos='notext'> </a>").on('vclick', function(e) {
							ClickBuster.preventGhostClick(e);
							e.preventDefault();
							e.stopPropagation();
							somenu.switchToMenu(menu.jqmData('somenu-id'));
						}));
					
				newPage = list.detach()
					.wrap( "<div " + dns + "role='page' " + dns + "somenu-id='" + id + "' " + dns + "theme='" + theme + "' " + dns + "count-theme='" + countTheme + "'><div " + dns + "role='content'></div></div>" )
					.parent()
						.before( headerEl )
						.after( persistentFooterID ? $( "<div " + dns + "role='footer' " + dns + "id='"+ persistentFooterID +"'>") : "" )
						.parent()
							.appendTo( somenu.container ).page();

				list.attr('data-role', 'listview').listview();
				
				newPage = somenu.createMenuForPage(newPage);
				
				menu.on('pageremove', function() {
					var ev = new $.Event('pageremove');
					newPage.trigger(ev);
					newPage.remove();
					delete newPage;
				})
				
				li.on('click', function(e) {
					somenu.switchToMenu(id);
				});
			});
		});
		
	});
}) (jQuery);