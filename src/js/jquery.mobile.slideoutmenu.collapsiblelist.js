/**
 * Collapsible listviews and collapsed menu items
 * 
 * @author Heng Woon Ong <https://github.com/hengwoon>
 * @copyright Oodle Inc. 2012
 * @version 0.1
 * 
 * To make a listview in the slideout menu collapsible, add data-collapsible="true" to the listview ul element. There needs to be a list divider that will act as the list toggler / header:
 * 
 * 		<ul data-role="listview" data-collapsible="true">
 * 			<li data-role="list-divider">Links</li>
 * 			<li>item 1</li>
 * 			<li>item 2</li>
 * 		</ul>
 * 
 * Configurable options, via data-attributes:
 * -	data-icon-collapsed: 	icon to show when list is collapsed
 * -	data-icon-expanded: 	icon to show when list is expanded
 * -	data-show-selected:		Defaults to false. If set to true, the selected/active buttons' text will be added to the listheader. For example if item 1 is selected, the list header will show 'Links: item 1'
 * 
 * 
 * Collapsed menu items with toggler:
 * In addition to collapsible lists, to allow for individual list items to be collapsed, and toggled via a 'more..' link, create a list item link with data-role="collapsibler".
 * To hide list items by default, add class 'ui-collapsed' to the list items that will be hidden by default and toggled via the collapsibler link.
 * 
 * <ul data-role="listview">
 * 		<li>shown item 1</li>
 * 		<li>shown item 2</li>
 * 		<li data-role="collapsibler"><a>more....</a></li>
 * 		<li class="ui-collapsed">this is hidden and will be shown when the more link is clicked</li>
 * </ul>
 * 
 */


(function($, undefined) {
	var _refreshCollapsibleList = function(list)
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
	
	$(document).on('somenuinit', function(event) {
		
		SlideoutMenu.activeMenu.menu.find("ul:jqmData(collapsible='true')").each(function() {
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
				
				_refreshCollapsibleList(list);
				
				SlideoutMenu._resizeHandler();
			});
		});
		
		$("ul:jqmData(collapsible='true')", SlideoutMenu.activeMenu.menu).each(function()
		{		
			_refreshCollapsibleList($(this));
		});
		
		
		
		// collapsed menu items with 'more...' toggler
		SlideoutMenu.activeMenu.menuBtns.each(function() {
			var menuBtn = $(this);

			// hide collapsed items
			if (menuBtn.jqmData('collapsed')) menuBtn.addClass('ui-collapsed');
			
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
		
		SlideoutMenu.activeMenu.menu.find(".ui-btn." + $.mobile.activeBtnClass).each(function(i, btn) 
		{
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
		});
		
	});
}) (jQuery);