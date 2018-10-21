;(function ( $, window, document, undefined ) {
 
	var pluginName = 'ik_treemenu',
		defaults = {
			'instructions': 'Use up or down arrows to move through menu items, and Enter or Spacebar to toggle submenus open and closed.',
			'menuTitle': 'Breakfast Menu',
			'expandAll': true
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} [options] - Configuration options.
	 * @param {number} [options.menuTitle] - Menu title appers above the tree.
	 * @param {number} [options.expandAll] - Expands all tree branches when true.
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, $elem, plugin;
		
		plugin = this;
		$elem = plugin.element;
		id = 'tree' + $('.ik_treemenu').length; // create unique id
				
		$elem
			.addClass('ik_treemenu').attr({
				'tabindex': 0,
				'arial-labelledby': id + '_instructions'
			});
			
		$('<div/>') // add div element to be used with aria-labelledby attribute of the menu
			.text(plugin.options.instructions) // get instruction text from plugin options
			.addClass('ik_readersonly') // hide element from visual display
			.attr({
				'id': id + '_instructions', 
				'aria-hidden': 'true' //hide ele from screen from screen reader duplication
			})
			.appendTo($elem);
		
		$('<div/>') // add menu title
			.addClass('title')
			.text( this.options.menuTitle )
			.attr({ 
				'id': id + '_title'
			})
			.prependTo($elem);
		
		$elem 
			.find('ul:first')  // set topmost ul element as a tree container
			.attr({
				'id': id,
				'role': 'tree', // ROLE Tree
				'aria-labelledby': id + '_title' //label with tree title
			});
		
		$elem // set all li elements as tree folders and items
			.find('li')
			.css({ 'list-style': 'none' })
			.each(function(i, el) {
				
				var $me;
				
				$me = $(el);
				
				$me.attr({
					'id': id + '_menuitem_' + i, //counter
					'role': 'treeitem',  // ROLE Tree Item
					'tabindex': -1, //remove from tab order
					'aria-level':$me.parents('ul').length, //addtree level
					'aria-setsize':$me.siblings().length + 1, //define num of tree items @ cur level
					'aria-posinset': $me.parent().children().index($me) + 1
					});
				
				$($me.contents()[0]).wrap('<span></span>'); // wrap text element of each treitem with span element
				
				if ($me.children('ul').length) {  // if the current treeitem has submenu
					
					if (plugin.options.expandAll) { // expand or collapse all tree levels based on configuration
						$me.attr({
							'aria-expanded': true
						});
						  // don't do anything
					} else {
						$me.attr({
							'aria-expanded':false
						})
						$me.addClass('collapsed');
					}
					
					$me
						.attr({
							'aria-label': $me.children('span:first').text()
							})
						.children('span')
						.addClass('folder')
						.attr({
							'role':'presentation'
							});
					} else {
						$me.attr({
							'aria-selected':false}); //aria-selected
					}
			})
			.on('click', {'plugin': plugin}, plugin.onClick)
			.on('keydown', {'plugin': plugin}, plugin.onKeyDown);
		
		$elem //make first tree item focus
		.find('li:first')
		.attr({
			'tabindex':0			
		});
	};
	
	/** 
	 * Selects treeitem.
	 * 
	 * @param {object} $item - jQuery object containing treeitem to select.
	 * @param {object} plugin - reference to plugin.
	 */
	Plugin.prototype.selectItem = function($item, plugin) {
		var $elem = plugin.element;
		
		$elem.find('[aria-selected=true]') //remove previous selection
			.attr({
				'tabindex': -1,
				'aria-selected': false
			});
					
		
		$elem.find('.focused') // remove highlight form previousely selected treeitem
			.removeClass('focused');
		
		$elem.find('li').attr({
			'tabindex': -1
			})
		
		$item.attr({  //select specified treeitem
			'tabindex':0, //add selected treeitem to tab order
			'aria-selected':true
			});
		
		
		if ($item.children('ul').length) { // highlight selected treeitem
			$item.children('span').addClass('focused');
		} else {
			$item.addClass('focused');
		}
		
		$item.focus();
	};
	
	/** 
	 * Toggles submenu.
	 * 
	 * @param {object} $item - jQuery object containing treeitem with submenu.
	 */
	Plugin.prototype.toggleSubmenu = function($item) {
		
		if($item.children('ul').length) { // check if the treeitem contains submenu
			
			if ($item.hasClass('collapsed')) {  // expand if collapsed
      
				$item
				.attr({'aria-expanded':true})
				.removeClass('collapsed');
        
			} else { 							// otherwise collapse
      
				$item
				.attr({'aria-expanded':false})
				.addClass('collapsed');
        
			}
      
		}
	}
	
	/** 
	 * Handles mouseover event on header button.
	 * 
	 * @param {Object} event - Event object.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onMouseOver = function (event) {
		
		var plugin = event.data.plugin,
			$me = $(event.currentTarget);
		
		event.stopPropagation();
		
		plugin.element // remove highlight form previous treeitem
			.find('.mouseover')
			.removeClass('mouseover');
		
		$me.children('span') // add highlight to currently selected treeitem
			.addClass('mouseover'); 
		
	}
	
	/** 
	 * Handles click event on header button.
	 * 
	 * @param {Object} event - Event object.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onClick = function (event) {
		
		var plugin = event.data.plugin,
			$me = $(event.currentTarget);
		
		event.preventDefault();
		event.stopPropagation();
		
		plugin.toggleSubmenu($me);
		plugin.selectItem($me, plugin);
	};
	
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
})( jQuery, window, document );
