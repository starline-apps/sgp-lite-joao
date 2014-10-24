/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	// Add WIRIS to the plugin list
    //config.extraPlugins += (config.extraPlugins.length == 0 ? '' : ',') + 'ckeditor_wiris';
    
  //Add Embbed Image
    config.extraPlugins += (config.extraPlugins.length == 0 ? '' : ',') + 'doksoft_image_embed';
    
    
    // Add WIRIS buttons to the "Full toolbar"
	// Optionally, you can remove the following line and follow http://docs.cksource.com/CKEditor_3.x/Developers_Guide/Toolbar
	//config.toolbar_Full.push({name:'wiris', items:['ckeditor_wiris_formulaEditor']});
    
	config.toolbar_Full.push({name:'embimg', items:['doksoft_image_embed']});
    
    
	config.allowedContent = true;
	
};

CKEDITOR.on('instanceReady', function( ev ) {
	  var blockTags = ['div','h1','h2','h3','h4','h5','h6','p','pre','li','blockquote','ul','ol',
	  'table','thead','tbody','tfoot','td','th',];

	  for (var i = 0 , j = blockTags.length; i < j; i++)
	  {
	     ev.editor.dataProcessor.writer.setRules( blockTags[i], {
	        indent : false,
	        breakBeforeOpen : true,
	        breakAfterOpen : false,
	        breakBeforeClose : false,
	        breakAfterClose : true
	     });
	  }
	});
